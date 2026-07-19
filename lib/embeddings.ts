// Text embeddings via Gemini (same API key the image pipeline uses).
// 768-dim vectors, matching the pgvector column on knowledgebase_entries.
// gemini-embedding-2 natively outputs larger vectors; we request 768 and
// L2-normalize (required after dimension truncation for cosine math).

const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "gemini-embedding-2";

export const EMBEDDING_DIMENSIONS = 768;

function l2Normalize(values: number[]): number[] {
  const norm = Math.sqrt(values.reduce((acc, v) => acc + v * v, 0)) || 1;
  return values.map((v) => v / norm);
}

export async function embedText(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Embeddings not configured (missing GEMINI_API_KEY)");
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        content: { parts: [{ text: text.slice(0, 8000) }] },
        outputDimensionality: EMBEDDING_DIMENSIONS,
      }),
    }
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Embedding failed (${res.status}): ${detail.slice(0, 200)}`);
  }

  const data = (await res.json()) as { embedding?: { values?: number[] } };
  const values = data.embedding?.values;
  if (!values || values.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Embedding returned ${values?.length ?? 0} dims, expected ${EMBEDDING_DIMENSIONS}`
    );
  }
  return l2Normalize(values);
}

// Postgres vector literal for raw SQL queries: '[0.1,0.2,...]'
export function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}
