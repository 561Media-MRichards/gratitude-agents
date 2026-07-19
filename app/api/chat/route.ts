import { after } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { conversations, messages, knowledgebaseEntries } from "@/db/schema";
import { and, desc, eq, or } from "drizzle-orm";
import { getAgent } from "@/lib/agents";
import { getBrandContext } from "@/lib/brand-context";
import { enrichConversation } from "@/lib/enrich";
import { getSession } from "@/lib/auth";
import {
  canWriteConversation,
  defaultVisibilityForRole,
  isPrivilegedUser,
} from "@/lib/permissions";
import { detectSpecialistDomain } from "@/lib/detect-domain";
import { generateImage, type ImageAspectRatio } from "@/lib/image-gen";

// Image generation adds ~15s per image on top of model turns
export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    const { message, conversationId } = body as {
      message: string;
      agentId?: string;
      conversationId?: string;
    };

    // Accept agentId for backward compat but default to "gratitude"
    const agentId = body.agentId || "gratitude";

    if (!message) {
      return new Response(JSON.stringify({ error: "Missing message" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // For the unified "gratitude" agent, use orchestrator as the base
    const resolvedAgentId = agentId === "gratitude" ? "orchestrator" : agentId;
    const agent = getAgent(resolvedAgentId);
    if (!agent) {
      return new Response(JSON.stringify({ error: "Agent not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create or load conversation
    let convId = conversationId;
    if (!convId) {
      const title = message.slice(0, 100) + (message.length > 100 ? "..." : "");
      const [conv] = await db
        .insert(conversations)
        .values({
          ownerId: session.userId,
          agentId,
          title,
          visibility: defaultVisibilityForRole(session),
        })
        .returning();
      convId = conv.id;
    } else {
      const [conv] = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, convId))
        .limit(1);

      if (!conv) {
        return new Response(JSON.stringify({ error: "Conversation not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Write check: appending a message mutates the conversation, so this is
      // stricter than the view permission used elsewhere
      if (!canWriteConversation(session, conv)) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Save user message
    await db.insert(messages).values({
      conversationId: convId,
      role: "user",
      content: message,
    });

    // Load conversation history - most recent messages only, so long
    // conversations don't grow the context (and the bill) without bound
    const HISTORY_LIMIT = 40;
    const history = (
      await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, convId))
        .orderBy(desc(messages.createdAt))
        .limit(HISTORY_LIMIT)
    ).reverse();

    const apiMessages = history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // For the unified agent, detect which specialist domain applies
    // and inject that specialist's knowledge into the prompt
    let specialistBody = "";
    let detectedDomain: string | null = null;
    let brandContextAgentId = agentId;

    if (agentId === "gratitude") {
      detectedDomain = detectSpecialistDomain(apiMessages);
      if (detectedDomain) {
        const specialist = getAgent(detectedDomain);
        if (specialist) {
          specialistBody =
            `\n\n## Specialist Knowledge: ${specialist.name}\n` +
            `Use this expertise to handle the current request. ` +
            `Do not mention this specialist by name to the user.\n\n` +
            specialist.body;
          // Use the specialist's brand context profile for richer context
          brandContextAgentId = detectedDomain;
        }
      }
    }

    // Build system prompt
    const brandContext = getBrandContext(brandContextAgentId);

    // Get KB entries - for unified agent, fetch across all domains
    let kbEntries;
    // Only approved entries reach privileged prompts - enrichment output is
    // draft until a human reviews it (prevents junk/injected learnings from
    // flowing straight into everyone's context)
    if (agentId === "gratitude") {
      kbEntries = isPrivilegedUser(session)
        ? await db
            .select()
            .from(knowledgebaseEntries)
            .where(eq(knowledgebaseEntries.status, "approved"))
            .orderBy(desc(knowledgebaseEntries.createdAt))
            .limit(20)
        : await db
            .select()
            .from(knowledgebaseEntries)
            .where(
              or(
                eq(knowledgebaseEntries.ownerId, session.userId),
                and(
                  eq(knowledgebaseEntries.visibility, "partner"),
                  eq(knowledgebaseEntries.status, "approved")
                )
              )
            )
            .orderBy(desc(knowledgebaseEntries.createdAt))
            .limit(20);
    } else {
      // Legacy: filter by specific agentId
      kbEntries = isPrivilegedUser(session)
        ? await db
            .select()
            .from(knowledgebaseEntries)
            .where(
              and(
                eq(knowledgebaseEntries.agentId, agentId),
                eq(knowledgebaseEntries.status, "approved")
              )
            )
            .orderBy(desc(knowledgebaseEntries.createdAt))
            .limit(20)
        : await db
            .select()
            .from(knowledgebaseEntries)
            .where(
              and(
                eq(knowledgebaseEntries.agentId, agentId),
                or(
                  eq(knowledgebaseEntries.ownerId, session.userId),
                  and(
                    eq(knowledgebaseEntries.visibility, "partner"),
                    eq(knowledgebaseEntries.status, "approved")
                  )
                )
              )
            )
            .orderBy(desc(knowledgebaseEntries.createdAt))
            .limit(20);
    }

    let kbSection = "";
    if (kbEntries.length > 0) {
      kbSection =
        "\n\n## Knowledge from Past Work\n" +
        kbEntries
          .map((e) => `- **${e.title}** (${e.category}): ${e.content}`)
          .join("\n");
    }

    const endUserBehaviorNote =
      "\n\n## End-User Experience Rules\nYou are speaking to a non-technical Gratitude user. Be warm, clear, and direct. Do not mention slash commands, skill files, internal routing mechanics, technical implementation details, or tool names unless the user explicitly asks. Present yourself as Gratitude's assistant with the right expertise behind the scenes. Prefer natural language like 'I can help draft that' or 'Here's what I need from you next.' Ask only for the minimum missing information and avoid jargon, menus, and option overload.";

    const conciergeNote =
      "\n\n## Conversational Routing Rules\nAct like a dedicated Gratitude concierge. Do not tell the user to choose between internal workflows. Decide for them and guide the conversation forward. If a specialist is needed, translate that into plain-language next steps instead of naming internal commands. Do not include optional follow-ups, multiple branches, or extra possibilities unless the user asks for them. If information is missing, ask only for the smallest set of missing details needed to proceed. When you have enough context, do the work directly rather than describing what you would do.";

    const presentationNote =
      '\n\n## Presentation Output\nWhen a user asks you to create a presentation, deck, or slides, structure your output so it can be converted to a branded PPTX file. Output a JSON code block containing an array of slide objects. Each slide has a `type` and content fields:\n\nSlide types:\n- `title`: Opening slide. Fields: `title`, `subtitle`\n- `content`: Standard slide with heading and bullets or body text. Fields: `title`, `bullets` (array of strings) OR `body` (paragraph text)\n- `two-column`: Side-by-side layout. Fields: `title`, `left` ({heading, bullets}), `right` ({heading, bullets})\n- `quote`: Featured quote. Fields: `quote`, `attribution`\n- `stats`: Key metrics in cards. Fields: `title`, `stats` (array of {value, label})\n- `closing`: Final slide. Fields: `title`, `subtitle`, `body`\n\nAlways include speaker notes in a `notes` field per slide.\n\nExample:\n```json\n[\n  {"type": "title", "title": "Campaign Results Q1", "subtitle": "Gratitude.com Activation Report"},\n  {"type": "stats", "title": "Key Metrics", "stats": [{"value": "2.4M", "label": "Activations"}, {"value": "89%", "label": "Completion Rate"}]},\n  {"type": "content", "title": "What Worked", "bullets": ["Direct sponsor outreach drove 40% of sign-ups", "Email sequences had 3x industry open rates"]},\n  {"type": "closing", "title": "Next Steps", "subtitle": "Q2 Planning", "body": "gratitude.com"}\n]\n```\n\nAfter the JSON block, add a brief plain-language summary of the deck so the user can review the content before downloading. Tell them they can click the PPTX button to download it as a branded PowerPoint file.';

    const webSearchNote =
      "\n\n## Web Search\nYou have access to web search. Use it when the user asks about current events, recent data, live information, competitor research, industry stats, or anything that benefits from up-to-date information. Do not tell the user you are searching - just do it and incorporate the results naturally. When you cite information from search results, mention the source naturally in your response (e.g., 'According to Forbes...' or 'A recent report from Nonprofit Quarterly found...').";

    const imageGenNote =
      "\n\n## Image Generation\nYou can generate real images with the generate_image tool. Use it when the user asks for a graphic, social media visual, hero image, background art, illustration, or any other image. Write a detailed, art-directed prompt that follows the Gratitude visual system (dark backgrounds, pink #FE3184 to orange #ec7211 gradient glow accents, premium and modern - never navy). Pick the aspect ratio that fits the use: 1:1 for Instagram posts, 16:9 for banners/YouTube/presentations, 9:16 for stories/reels, 4:3 or 3:4 for general use. After the tool returns, embed the image in your reply using the exact markdown the tool result gives you, then briefly describe what you created. If the user wants changes, call the tool again with a revised prompt. Note: image models cannot render text reliably - avoid asking for words inside the image; recommend text overlays be added in design tools instead.";

    const systemPrompt = `${brandContext}${kbSection}\n\n---\n\n${agent.body}${specialistBody}${endUserBehaviorNote}${conciergeNote}${presentationNote}${webSearchNote}${imageGenNote}`;

    // Stream response with web search + image generation enabled.
    // Image generation is a client tool, so the model can stop with
    // stop_reason "tool_use" - we run the tool, feed back the result, and
    // continue the loop until it produces a final text response.
    const anthropic = new Anthropic();
    const tools = [
      {
        type: "web_search_20250305" as const,
        name: "web_search" as const,
        max_uses: 3,
      },
      {
        name: "generate_image",
        description:
          "Generate a real image (PNG) from a detailed art-direction prompt. Returns markdown to embed the image in your reply. Use for social graphics, hero images, backgrounds, illustrations, and campaign art.",
        input_schema: {
          type: "object" as const,
          properties: {
            prompt: {
              type: "string",
              description:
                "Detailed art-direction prompt: subject, composition, lighting, color palette, style. Follow the Gratitude visual system.",
            },
            aspect_ratio: {
              type: "string",
              enum: ["1:1", "16:9", "9:16", "4:3", "3:4"],
              description: "Aspect ratio for the intended placement",
            },
          },
          required: ["prompt"],
        },
      },
    ] as Anthropic.Messages.ToolUnion[];

    let fullResponse = "";
    const citations: { url: string; title: string }[] = [];
    const MAX_TOOL_TURNS = 4;

    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const send = (payload: Record<string, unknown>) =>
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ ...payload, conversationId: convId })}\n\n`)
          );

        try {
          let loopMessages: Anthropic.Messages.MessageParam[] = [...apiMessages];

          for (let turn = 0; turn < MAX_TOOL_TURNS; turn++) {
            const stream = anthropic.messages.stream({
              model: "claude-sonnet-4-20250514",
              max_tokens: 8192,
              system: systemPrompt,
              messages: loopMessages,
              tools,
            });

            let searchQueryBuffer = "";
            let inServerToolUse = false;

            for await (const event of stream) {
              if (event.type === "content_block_start") {
                const block = event.content_block as { type: string };
                if (block.type === "server_tool_use") {
                  inServerToolUse = true;
                  searchQueryBuffer = "";
                  send({ searching: true });
                } else {
                  inServerToolUse = false;
                }
              }

              if (event.type === "content_block_delta") {
                const delta = event.delta as { type: string; text?: string; partial_json?: string };

                // Capture search query from input_json_delta
                if (delta.type === "input_json_delta" && inServerToolUse && delta.partial_json) {
                  searchQueryBuffer += delta.partial_json;
                  const qMatch = searchQueryBuffer.match(/"query"\s*:\s*"([^"]+)/);
                  if (qMatch) {
                    send({ searchQuery: qMatch[1] });
                  }
                }

                if (delta.type === "text_delta" && delta.text) {
                  fullResponse += delta.text;
                  send({ text: delta.text });
                }
              }
            }

            const finalMessage = await stream.finalMessage();

            // Collect citations from this turn's text blocks
            for (const block of finalMessage.content) {
              if (block.type === "text" && "citations" in block && Array.isArray(block.citations)) {
                for (const cite of block.citations) {
                  if ("url" in cite && "title" in cite) {
                    const url = cite.url as string;
                    const title = cite.title as string;
                    if (!citations.some((c) => c.url === url)) {
                      citations.push({ url, title });
                    }
                  }
                }
              }
            }

            if (finalMessage.stop_reason !== "tool_use") {
              break;
            }

            // Run requested client tools, feed results back, continue the loop
            const toolUses = finalMessage.content.filter(
              (b): b is Anthropic.Messages.ToolUseBlock => b.type === "tool_use"
            );
            const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];

            for (const toolUse of toolUses) {
              if (toolUse.name === "generate_image") {
                const input = toolUse.input as { prompt?: string; aspect_ratio?: string };
                const validRatios = ["1:1", "16:9", "9:16", "4:3", "3:4"];
                send({ generatingImage: true });
                try {
                  const image = await generateImage({
                    prompt: input.prompt || "",
                    aspectRatio: validRatios.includes(input.aspect_ratio || "")
                      ? (input.aspect_ratio as ImageAspectRatio)
                      : "1:1",
                    ownerId: session.userId,
                    conversationId: convId,
                  });
                  toolResults.push({
                    type: "tool_result",
                    tool_use_id: toolUse.id,
                    content: `Image generated successfully. Embed it in your reply using exactly this markdown: ![${image.title}](/api/resources/${image.resourceId}/download?inline=1)`,
                  });
                } catch (imageErr) {
                  console.error("Image generation failed:", imageErr);
                  toolResults.push({
                    type: "tool_result",
                    tool_use_id: toolUse.id,
                    is_error: true,
                    content:
                      "Image generation failed. Briefly let the user know the image could not be created right now and continue helping with the rest of their request.",
                  });
                }
              } else {
                toolResults.push({
                  type: "tool_result",
                  tool_use_id: toolUse.id,
                  is_error: true,
                  content: `Unknown tool: ${toolUse.name}`,
                });
              }
            }

            loopMessages = [
              ...loopMessages,
              { role: "assistant", content: finalMessage.content },
              { role: "user", content: toolResults },
            ];
          }

          // Send citations if any were collected
          if (citations.length > 0) {
            send({ citations });
            // Append citation links to the saved response
            fullResponse +=
              "\n\n---\n**Sources:** " +
              citations.map((c) => `[${c.title}](${c.url})`).join(" | ");
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    // After stream completes, save assistant message and maybe enrich
    after(async () => {
      if (fullResponse) {
        await db.insert(messages).values({
          conversationId: convId!,
          role: "assistant",
          content: fullResponse,
        });

        await db
          .update(conversations)
          .set({ updatedAt: new Date() })
          .where(eq(conversations.id, convId!));

        // Check if we should enrich
        const msgCount = await db
          .select()
          .from(messages)
          .where(eq(messages.conversationId, convId!));

        const [conv] = await db
          .select()
          .from(conversations)
          .where(eq(conversations.id, convId!));

        if (msgCount.length >= 4 && !conv.enriched) {
          // Use detected domain for KB tagging so entries get meaningful labels
          const enrichAgentId = detectedDomain || resolvedAgentId;
          await enrichConversation(convId!, enrichAgentId, {
            ownerId: session.userId,
            role: session.role,
          });
        }
      }
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("Chat error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
