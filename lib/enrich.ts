import Anthropic from "@anthropic-ai/sdk";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { knowledgebaseEntries, messages, conversations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { embedText, toVectorLiteral } from "@/lib/embeddings";
import { expiryForCategory } from "@/lib/kb";

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

// How many new messages accumulate before we distill again. The watermark
// (conversations.enriched_through) tracks how far we've processed, so long
// conversations keep contributing instead of being read once at message 4.
export const ENRICH_EVERY_N_MESSAGES = 10;
export const ENRICH_MIN_MESSAGES = 4;

export async function enrichConversation(
  conversationId: string,
  agentId: string,
  options: {
    ownerId: string;
    role: "admin" | "employee" | "partner";
  }
) {
  try {
    const [conv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);
    if (!conv) return;

    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);

    if (msgs.length < ENRICH_MIN_MESSAGES) return;

    // Only distill the messages we have not processed yet, with a little
    // trailing context from before the watermark
    const watermark = conv.enrichedThrough || 0;
    const contextStart = Math.max(0, watermark - 4);
    const fresh = msgs.slice(contextStart);
    if (msgs.length - watermark < 2) return; // nothing meaningful new

    const transcript = fresh
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

    const VALID_CATEGORIES = [
      "campaign_result",
      "sponsor_info",
      "content_insight",
      "strategy_learning",
      "design_pattern",
      "general",
    ];

    if (Array.isArray(learnings)) {
      for (const learning of learnings) {
        const category = VALID_CATEGORIES.includes(learning.category)
          ? learning.category
          : "general";
        const title = String(learning.title || "").slice(0, 200) || "Untitled learning";
        const content = String(learning.content || "");

        // Embed for semantic retrieval; if embedding fails, store without it
        // (recency fallback still finds the entry)
        let embedding: number[] | null = null;
        try {
          embedding = await embedText(`${title}\n${content}`);
        } catch (e) {
          console.error("Embedding failed for learning, storing without:", e);
        }

        // Dedup: skip if a near-identical entry already exists (cosine
        // similarity > 0.92). Duplicates compound faster than knowledge.
        if (embedding) {
          try {
            const dup = await db.execute(sql`
              SELECT 1 FROM knowledgebase_entries
              WHERE embedding IS NOT NULL
                AND (embedding <=> ${toVectorLiteral(embedding)}::vector) < 0.08
              LIMIT 1
            `);
            if (dup.rows.length > 0) continue;
          } catch (e) {
            console.error("Dedup check failed, inserting anyway:", e);
          }
        }

        await db.insert(knowledgebaseEntries).values({
          conversationId,
          ownerId: options.ownerId,
          agentId,
          category,
          // All enriched entries start as drafts - a human approves before they
          // enter anyone else's context (no auto-approved model output in prompts)
          status: "draft",
          visibility: options.role === "partner" ? "private" : "internal",
          title,
          content,
          tags: Array.isArray(learning.tags) ? learning.tags : [],
          sourceType: "conversation_enrichment",
          embedding,
          expiresAt: expiryForCategory(category),
        });
      }
    }

    // Advance the watermark even when extraction returned nothing or threw
    // below - never re-bill the same transcript slice
    await db
      .update(conversations)
      .set({ enrichedThrough: msgs.length, enriched: true })
      .where(eq(conversations.id, conversationId));
  } catch (e) {
    console.error("Enrichment failed:", e);
    // Advance the watermark on failure too - otherwise every subsequent
    // message re-fires a failing (paid) model call forever
    try {
      const msgs = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conversationId));
      await db
        .update(conversations)
        .set({ enrichedThrough: msgs.length, enriched: true })
        .where(eq(conversations.id, conversationId));
    } catch (markErr) {
      console.error("Failed to advance enrichment watermark:", markErr);
    }
  }
}
