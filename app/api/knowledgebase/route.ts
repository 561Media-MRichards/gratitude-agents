import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { knowledgebaseEntries } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const entries = await db
    .select()
    .from(knowledgebaseEntries)
    .orderBy(desc(knowledgebaseEntries.createdAt))
    .limit(100);

  return NextResponse.json(entries);
}
