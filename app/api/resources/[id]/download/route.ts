import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { resources } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { canViewResource } from "@/lib/permissions";

export async function GET(
  request: Request,
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

  // Blob-backed files redirect to the CDN URL (unguessable random suffix).
  // This route stays the permission gate; the blob URL itself is not listed
  // anywhere unauthenticated.
  if (resource.blobUrl) {
    return NextResponse.redirect(resource.blobUrl);
  }

  const body = resource.binaryContentBase64
    ? Buffer.from(resource.binaryContentBase64, "base64")
    : resource.textContent || "";

  // ?inline=1 serves the file for in-page rendering (e.g. generated images
  // embedded in chat) instead of forcing a download. Sanitize the filename -
  // it is user-controlled and must not break the header.
  const inline = new URL(request.url).searchParams.get("inline") === "1";
  const safeName = (resource.fileName || resource.title || "download").replace(
    /[^\w.\- ]/g,
    "_"
  );

  return new NextResponse(body, {
    headers: {
      "Content-Type": resource.mimeType || "application/octet-stream",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${safeName}"`,
      ...(inline ? { "Cache-Control": "private, max-age=31536000, immutable" } : {}),
    },
  });
}
