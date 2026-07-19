import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { embedText, toVectorLiteral } from "@/lib/embeddings";
import type { SessionUser } from "@/lib/auth";
import { isPrivilegedUser } from "@/lib/permissions";

export interface KbHit {
  id: string;
  title: string;
  category: string;
  content: string;
}

// Semantic knowledge retrieval: top-K most RELEVANT entries for the request,
// not the newest 20. Applies ACL, skips expired entries, gives fresh
// campaign learnings a small boost, and records usage signals on the
// entries it returns. Falls back to recency ordering if embeddings are
// unavailable (e.g. embedding API down, or entries not yet backfilled).
export async function searchKnowledge(options: {
  queryText: string;
  session: SessionUser;
  agentId?: string | null;
  limit?: number;
}): Promise<KbHit[]> {
  const limit = options.limit ?? 12;
  const privileged = isPrivilegedUser(options.session);

  // ACL fragment shared by both paths
  const acl = privileged
    ? sql`status = 'approved'`
    : sql`(owner_id = ${options.session.userId} OR (visibility = 'partner' AND status = 'approved'))`;

  const agentFilter = options.agentId
    ? sql`AND agent_id = ${options.agentId}`
    : sql``;

  let rows: KbHit[] = [];

  try {
    const queryEmbedding = await embedText(options.queryText.slice(0, 2000));
    const vec = toVectorLiteral(queryEmbedding);

    const result = await db.execute(sql`
      SELECT id, title, category, content,
             (embedding <=> ${vec}::vector) AS distance
      FROM knowledgebase_entries
      WHERE ${acl}
        ${agentFilter}
        AND embedding IS NOT NULL
        AND (expires_at IS NULL OR expires_at > now())
      ORDER BY (embedding <=> ${vec}::vector)
        - (CASE WHEN created_at > now() - interval '14 days'
                 AND category IN ('campaign_result', 'content_insight')
            THEN 0.05 ELSE 0 END) ASC
      LIMIT ${limit}
    `);

    rows = (result.rows as unknown as (KbHit & { distance: number })[])
      // Relevance floor - do not stuff barely-related entries into the prompt
      .filter((r) => r.distance <= 0.62)
      .map(({ id, title, category, content }) => ({ id, title, category, content }));
  } catch (e) {
    console.error("Semantic KB search failed, falling back to recency:", e);
  }

  if (rows.length === 0) {
    const result = await db.execute(sql`
      SELECT id, title, category, content
      FROM knowledgebase_entries
      WHERE ${acl}
        ${agentFilter}
        AND (expires_at IS NULL OR expires_at > now())
      ORDER BY created_at DESC
      LIMIT ${limit}
    `);
    rows = result.rows as unknown as KbHit[];
  }

  // Usage signals: these entries are about to shape a real prompt
  if (rows.length > 0) {
    const ids = rows.map((r) => r.id);
    try {
      await db.execute(sql`
        UPDATE knowledgebase_entries
        SET usage_count = usage_count + 1, last_used_at = now()
        WHERE id = ANY(ARRAY[${sql.join(
          ids.map((id) => sql`${id}::uuid`),
          sql`, `
        )}])
      `);
    } catch (e) {
      console.error("KB usage tracking failed:", e);
    }
  }

  return rows;
}

// Freshness policy: how long each category of learning stays in circulation.
// Evergreen categories return null (never expire).
export function expiryForCategory(category: string): Date | null {
  const DAYS: Record<string, number> = {
    campaign_result: 90,
    sponsor_info: 180,
    content_insight: 180,
  };
  const days = DAYS[category];
  if (!days) return null;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
