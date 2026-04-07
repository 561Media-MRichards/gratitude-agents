import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { conversations } from "@/db/schema";
import { and, desc, eq, or } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { isPrivilegedUser } from "@/lib/permissions";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Each user only sees their own conversations
  const rows = await db
    .select()
    .from(conversations)
    .where(eq(conversations.ownerId, session.userId))
    .orderBy(desc(conversations.updatedAt))
    .limit(100);

  return NextResponse.json(rows);
}
