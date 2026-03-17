import { after } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { conversations, messages, knowledgebaseEntries } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAgent } from "@/lib/agents";
import { getBrandContext } from "@/lib/brand-context";
import { enrichConversation } from "@/lib/enrich";

const DESIGN_AGENTS = new Set([
  "social-creative",
  "deliverable-design",
  "web-mockup",
  "brand-asset-design",
  "canvas-art",
]);

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, agentId, conversationId } = body as {
      message: string;
      agentId: string;
      conversationId?: string;
    };

    if (!message || !agentId) {
      return new Response(JSON.stringify({ error: "Missing message or agentId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const agent = getAgent(agentId);
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
        .values({ agentId, title })
        .returning();
      convId = conv.id;
    }

    // Save user message
    await db.insert(messages).values({
      conversationId: convId,
      role: "user",
      content: message,
    });

    // Build system prompt
    const brandContext = getBrandContext(agentId);

    // Get recent knowledgebase entries for this agent's domain
    const kbEntries = await db
      .select()
      .from(knowledgebaseEntries)
      .where(eq(knowledgebaseEntries.agentId, agentId))
      .orderBy(desc(knowledgebaseEntries.createdAt))
      .limit(20);

    let kbSection = "";
    if (kbEntries.length > 0) {
      kbSection =
        "\n\n## Knowledge from Past Work\n" +
        kbEntries
          .map((e) => `- **${e.title}** (${e.category}): ${e.content}`)
          .join("\n");
    }

    let designWebModeNote = "";
    if (DESIGN_AGENTS.has(agentId)) {
      designWebModeNote =
        "\n\n## Web Mode\nYou are running in web mode. You cannot render images, create canvases, or write files. Instead, provide detailed design specifications, copy, creative direction, color values, typography specs, and layout descriptions. For rendered PNG/PDF output, the user should run locally via Claude Code.";
    }

    const systemPrompt = `${brandContext}${kbSection}\n\n---\n\n${agent.body}${designWebModeNote}`;

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
          await enrichConversation(convId!, agentId);
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
