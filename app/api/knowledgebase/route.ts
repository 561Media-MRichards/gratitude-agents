import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { knowledgebaseEntries } from "@/db/schema";
import { and, desc, eq, or } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import {
  canPublishKnowledgeEntry,
  defaultVisibilityForRole,
  isPrivilegedUser,
} from "@/lib/permissions";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const baseQuery = db.select().from(knowledgebaseEntries);
  const entries = isPrivilegedUser(session)
    ? await baseQuery
        .orderBy(desc(knowledgebaseEntries.createdAt))
        .limit(250)
    : await baseQuery
        .where(
          and(
            or(
              eq(knowledgebaseEntries.ownerId, session.userId),
              and(
                eq(knowledgebaseEntries.visibility, "partner"),
                eq(knowledgebaseEntries.status, "approved")
              )
            )
          )
        )
        .orderBy(desc(knowledgebaseEntries.createdAt))
        .limit(250);

  return NextResponse.json(entries);
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { agentId, category, title, content, tags, visibility, status } = body;

    if (!agentId || !category || !title || !content) {
      return NextResponse.json(
        { error: "agentId, category, title, and content are required" },
        { status: 400 }
      );
    }

    const [entry] = await db
      .insert(knowledgebaseEntries)
      .values({
        ownerId: session.userId,
        agentId,
        category,
        status:
          status && canPublishKnowledgeEntry(session) ? status : "draft",
        visibility: canPublishKnowledgeEntry(session)
          ? visibility || defaultVisibilityForRole(session)
          : "private",
        title,
        content,
        tags: tags || [],
        sourceType: "manual",
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
