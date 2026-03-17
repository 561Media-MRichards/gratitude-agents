import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { knowledgebaseEntries } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const entries = await db
    .select()
    .from(knowledgebaseEntries)
    .orderBy(desc(knowledgebaseEntries.createdAt))
    .limit(200);

  return NextResponse.json(entries);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agentId, category, title, content, tags } = body;

    if (!agentId || !category || !title || !content) {
      return NextResponse.json(
        { error: "agentId, category, title, and content are required" },
        { status: 400 }
      );
    }

    const [entry] = await db
      .insert(knowledgebaseEntries)
      .values({
        agentId,
        category,
        title,
        content,
        tags: tags || [],
      })
      .returning();

    return NextResponse.json(entry);
  } catch {
    return NextResponse.json(
      { error: "Failed to create entry" },
      { status: 500 }
    );
  }
}
