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

  const baseQuery = db.select().from(conversations);
  const rows = isPrivilegedUser(session)
    ? await baseQuery.orderBy(desc(conversations.updatedAt)).limit(100)
    : await baseQuery
        .where(
          and(
            or(
              eq(conversations.ownerId, session.userId),
              eq(conversations.visibility, "partner")
            )
          )
        )
        .orderBy(desc(conversations.updatedAt))
        .limit(100);

  return NextResponse.json(rows);
}
