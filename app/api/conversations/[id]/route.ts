import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { conversations, messages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import {
  canAccessConversation,
  canDeleteConversation,
} from "@/lib/permissions";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [conv] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id));

  if (!conv) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!canAccessConversation(session, conv)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(messages.createdAt);

  return NextResponse.json({ ...conv, messages: msgs });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [conv] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id));

  if (!conv) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!canDeleteConversation(session, conv)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(conversations).where(eq(conversations.id, id));
  return NextResponse.json({ success: true });
}
