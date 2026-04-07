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
  canAccessConversation,
  defaultVisibilityForRole,
  isPrivilegedUser,
} from "@/lib/permissions";
import { detectSpecialistDomain } from "@/lib/detect-domain";

export const maxDuration = 60;

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

      if (!canAccessConversation(session, conv)) {
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

    // Load conversation history
    const history = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, convId))
      .orderBy(messages.createdAt);

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
    if (agentId === "gratitude") {
      kbEntries = isPrivilegedUser(session)
        ? await db
            .select()
            .from(knowledgebaseEntries)
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
            .where(eq(knowledgebaseEntries.agentId, agentId))
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

    const systemPrompt = `${brandContext}${kbSection}\n\n---\n\n${agent.body}${specialistBody}${endUserBehaviorNote}${conciergeNote}${presentationNote}${webSearchNote}`;

    // Stream response with web search enabled
    const anthropic = new Anthropic();
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      system: systemPrompt,
      messages: apiMessages,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 3,
        },
      ],
    });

    let fullResponse = "";
    const citations: { url: string; title: string }[] = [];
    let searchQueryBuffer = "";
    let inServerToolUse = false;

    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const event of stream) {
            if (event.type === "content_block_start") {
              const block = event.content_block as { type: string };
              if (block.type === "server_tool_use") {
                inServerToolUse = true;
                searchQueryBuffer = "";
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ searching: true, conversationId: convId })}\n\n`
                  )
                );
              } else {
                inServerToolUse = false;
              }
            }

            if (event.type === "content_block_delta") {
              const delta = event.delta as { type: string; text?: string; partial_json?: string };

              // Capture search query from input_json_delta
              if (delta.type === "input_json_delta" && inServerToolUse && delta.partial_json) {
                searchQueryBuffer += delta.partial_json;
                // Try to extract the query as it streams in
                const qMatch = searchQueryBuffer.match(/"query"\s*:\s*"([^"]+)/);
                if (qMatch) {
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ searchQuery: qMatch[1], conversationId: convId })}\n\n`
                    )
                  );
                }
              }

              if (delta.type === "text_delta" && delta.text) {
                fullResponse += delta.text;
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ text: delta.text, conversationId: convId })}\n\n`
                  )
                );
              }
            }

            // Collect citations from text blocks when they finish
            if (event.type === "content_block_stop") {
              // Access the final message to extract citations after stream ends
            }
          }

          // After stream completes, extract citations from the final message
          const finalMessage = await stream.finalMessage();
          for (const block of finalMessage.content) {
            if (block.type === "text" && "citations" in block && Array.isArray(block.citations)) {
              for (const cite of block.citations) {
                if ("url" in cite && "title" in cite) {
                  const url = cite.url as string;
                  const title = cite.title as string;
                  // Deduplicate
                  if (!citations.some((c) => c.url === url)) {
                    citations.push({ url, title });
                  }
                }
              }
            }
          }

          // Send citations if any were collected
          if (citations.length > 0) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ citations, conversationId: convId })}\n\n`
              )
            );
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
