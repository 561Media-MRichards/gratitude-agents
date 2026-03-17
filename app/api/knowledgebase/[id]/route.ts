import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { knowledgebaseEntries } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [entry] = await db
    .select()
    .from(knowledgebaseEntries)
    .where(eq(knowledgebaseEntries.id, id));

  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(entry);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { agentId, category, title, content, tags } = body;

  const [updated] = await db
    .update(knowledgebaseEntries)
    .set({
      ...(agentId && { agentId }),
      ...(category && { category }),
      ...(title && { title }),
      ...(content && { content }),
      ...(tags && { tags }),
    })
    .where(eq(knowledgebaseEntries.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db
    .delete(knowledgebaseEntries)
    .where(eq(knowledgebaseEntries.id, id));
  return NextResponse.json({ success: true });
}
