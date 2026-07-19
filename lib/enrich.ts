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
      model: process.env.ENRICH_MODEL || "claude-haiku-4-5-20251001",
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
    // Models sometimes wrap JSON in markdown fences despite instructions - strip them
    const cleaned = text
      .replace(/^\s*```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/, "")
      .trim();
    const learnings = JSON.parse(cleaned);

    if (!Array.isArray(learnings) || learnings.length === 0) {
      await db
        .update(conversations)
        .set({ enriched: true })
        .where(eq(conversations.id, conversationId));
      return;
    }

    const VALID_CATEGORIES = [
      "campaign_result",
      "sponsor_info",
      "content_insight",
      "strategy_learning",
      "design_pattern",
      "general",
    ];

    for (const learning of learnings) {
      await db.insert(knowledgebaseEntries).values({
        conversationId,
        ownerId: options.ownerId,
        agentId,
        // Guard against out-of-enum categories from the model (pg enum insert would throw)
        category: VALID_CATEGORIES.includes(learning.category)
          ? learning.category
          : "general",
        // All enriched entries start as drafts - a human approves before they
        // enter anyone else's context (no auto-approved model output in prompts)
        status: "draft",
        visibility: options.role === "partner" ? "private" : "internal",
        title: String(learning.title || "").slice(0, 200) || "Untitled learning",
        content: String(learning.content || ""),
        tags: Array.isArray(learning.tags) ? learning.tags : [],
        sourceType: "conversation_enrichment",
      });
    }

    await db
      .update(conversations)
      .set({ enriched: true })
      .where(eq(conversations.id, conversationId));
  } catch (e) {
    console.error("Enrichment failed:", e);
    // Mark enriched even on failure - otherwise every subsequent message in this
    // conversation re-fires a failing (paid) model call forever
    try {
      await db
        .update(conversations)
        .set({ enriched: true })
        .where(eq(conversations.id, conversationId));
    } catch (markErr) {
      console.error("Failed to mark conversation enriched:", markErr);
    }
  }
}
