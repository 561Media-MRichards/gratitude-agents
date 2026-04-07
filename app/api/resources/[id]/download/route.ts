import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { resources } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { canViewResource } from "@/lib/permissions";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const [resource] = await db.select().from(resources).where(eq(resources.id, id));

  if (!resource) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!canViewResource(session, resource)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (resource.externalUrl) {
    return NextResponse.redirect(resource.externalUrl);
  }

  const body = resource.binaryContentBase64
    ? Buffer.from(resource.binaryContentBase64, "base64")
    : resource.textContent || "";

  return new NextResponse(body, {
    headers: {
      "Content-Type": resource.mimeType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${resource.fileName || resource.title}"`,
    },
  });
}
