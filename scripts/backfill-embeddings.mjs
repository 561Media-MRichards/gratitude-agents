// One-time backfill: embed every knowledgebase entry that has no embedding,
// and apply the freshness policy to existing rows.
// Run: node scripts/backfill-embeddings.mjs
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local", quiet: true });

const sql = neon(process.env.DATABASE_URL);
const MODEL = process.env.EMBEDDING_MODEL || "gemini-embedding-2";

const EXPIRY_DAYS = {
  campaign_result: 90,
  sponsor_info: 180,
  content_insight: 180,
};

async function embed(text) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:embedContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        content: { parts: [{ text: text.slice(0, 8000) }] },
        outputDimensionality: 768,
      }),
    }
  );
  if (!res.ok) throw new Error(`embed ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const values = data.embedding.values;
  // L2-normalize (required after dimension truncation for cosine math)
  const norm = Math.sqrt(values.reduce((a, v) => a + v * v, 0)) || 1;
  return values.map((v) => v / norm);
}

const rows = await sql`
  SELECT id, title, content, category FROM knowledgebase_entries
  WHERE embedding IS NULL
`;
console.log(`${rows.length} entries need embeddings`);

let done = 0;
for (const row of rows) {
  const vec = await embed(`${row.title}\n${row.content}`);
  const literal = `[${vec.join(",")}]`;
  const days = EXPIRY_DAYS[row.category];
  if (days) {
    await sql`
      UPDATE knowledgebase_entries
      SET embedding = ${literal}::vector,
          expires_at = now() + make_interval(days => ${days})
      WHERE id = ${row.id}
    `;
  } else {
    await sql`
      UPDATE knowledgebase_entries
      SET embedding = ${literal}::vector
      WHERE id = ${row.id}
    `;
  }
  done++;
  if (done % 10 === 0) console.log(`${done}/${rows.length}`);
  await new Promise((r) => setTimeout(r, 100));
}

const [counts] = await sql`
  SELECT count(*)::int AS total, count(embedding)::int AS embedded
  FROM knowledgebase_entries
`;
console.log(`Done. Total: ${counts.total}, embedded: ${counts.embedded}`);
process.exit(0);
