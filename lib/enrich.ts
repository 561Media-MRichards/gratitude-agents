import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { knowledgebaseEntries, messages, conversations } from "@/db/schema";
import { eq } from "drizzle-orm";

const EXTRACTION_PROMPT = `You are a knowledge extraction system for Gratitude.com's marketing and design team.

Analyze this conversation and extract actionable learnings that would be valuable for future work. Focus on:
- Campaign results or performance data
- Sponsor information or preferences
- Content insights (what works, what doesn't)
- Strategy decisions or learnings
- Design patterns or creative direction decisions

Return a JSON array of learnings. Each learning should have:
- "category": one of "campaign_result", "sponsor_info", "content_insight", "strategy_learning", "design_pattern", "general"
- "title": concise title (under 80 chars)
- "content": detailed description of the learning (2-4 sentences)
- "tags": array of 2-5 relevant tags

Only extract genuinely useful, specific learnings. If the conversation is too generic or short, return an empty array [].

Return ONLY valid JSON, no markdown fences.`;

export async function enrichConversation(
  conversationId: string,
  agentId: string,
  options: {
    ownerId: string;
    role: "admin" | "employee" | "partner";
  }
) {
  try {
    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);

    if (msgs.length < 4) return;

    const transcript = msgs
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");

    const anthropic = new Anthropic();
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: EXTRACTION_PROMPT,
      messages: [
        {
          role: "user",
          content: `Extract learnings from this conversation with the "${agentId}" agent:\n\n${transcript}`,
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const learnings = JSON.parse(text);

    if (!Array.isArray(learnings) || learnings.length === 0) {
      await db
        .update(conversations)
        .set({ enriched: true })
        .where(eq(conversations.id, conversationId));
      return;
    }

    for (const learning of learnings) {
      await db.insert(knowledgebaseEntries).values({
        conversationId,
        ownerId: options.ownerId,
        agentId,
        category: learning.category,
        status: options.role === "partner" ? "draft" : "approved",
        visibility: options.role === "partner" ? "private" : "internal",
        title: learning.title,
        content: learning.content,
        tags: learning.tags || [],
        sourceType: "conversation_enrichment",
      });
    }

    await db
      .update(conversations)
      .set({ enriched: true })
      .where(eq(conversations.id, conversationId));
  } catch (e) {
    console.error("Enrichment failed:", e);
  }
}
