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

    const systemPrompt = `${brandContext}${kbSection}\n\n---\n\n${agent.body}${specialistBody}${endUserBehaviorNote}${conciergeNote}`;

    // Stream response
    const anthropic = new Anthropic();
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      system: systemPrompt,
      messages: apiMessages,
    });

    let fullResponse = "";

    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              fullResponse += event.delta.text;
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ text: event.delta.text, conversationId: convId })}\n\n`
                )
              );
            }
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
