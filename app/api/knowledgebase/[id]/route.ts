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
