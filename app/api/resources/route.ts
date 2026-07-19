import { NextResponse } from "next/server";
import { and, desc, eq, or } from "drizzle-orm";
import { put } from "@vercel/blob";
import { db } from "@/lib/db";
import { resources } from "@/db/schema";
import { getSession } from "@/lib/auth";
import {
  canPublishResource,
  defaultVisibilityForRole,
  isPrivilegedUser,
} from "@/lib/permissions";

async function createResourceFromFormData(formData: FormData, userId: string) {
  const file = formData.get("file");
  const title = String(formData.get("title") || "");
  const description = String(formData.get("description") || "");
  const visibility = String(formData.get("visibility") || "internal");
  const tags = String(formData.get("tags") || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const externalUrl = String(formData.get("externalUrl") || "");
  const conversationId = String(formData.get("conversationId") || "") || null;

  if (file instanceof File) {
    const bytes = Buffer.from(await file.arrayBuffer());

    // Store the file in Vercel Blob, not Postgres. Keep small text files
    // inline too so agents can read them without a fetch.
    const blob = await put(`uploads/${file.name}`, bytes, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type || "application/octet-stream",
    });

    const [resource] = await db
      .insert(resources)
      .values({
        ownerId: userId,
        conversationId,
        title: title || file.name,
        description: description || null,
        type: "upload",
        visibility: visibility as "private" | "internal" | "partner",
        status: "draft",
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        extension: file.name.split(".").pop() || null,
        sizeBytes: bytes.byteLength,
        textContent: file.type.startsWith("text/") ? bytes.toString("utf-8") : null,
        blobUrl: blob.url,
        tags,
      })
      .returning();

    return resource;
  }

  const [resource] = await db
    .insert(resources)
    .values({
      ownerId: userId,
      conversationId,
      title,
      description: description || null,
      type: externalUrl ? "link" : "generated",
      visibility: visibility as "private" | "internal" | "partner",
      status: "draft",
      externalUrl: externalUrl || null,
      textContent: String(formData.get("textContent") || "") || null,
      fileName: String(formData.get("fileName") || "") || null,
      mimeType: String(formData.get("mimeType") || "") || null,
      extension: String(formData.get("extension") || "") || null,
      tags,
    })
    .returning();

  return resource;
}

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Each user only sees their own files.
  // Project columns explicitly: binaryContentBase64/textContent can be many MB
  // per row - listing must never haul file bodies out of the database.
  const rows = await db
    .select({
      id: resources.id,
      ownerId: resources.ownerId,
      conversationId: resources.conversationId,
      title: resources.title,
      description: resources.description,
      type: resources.type,
      status: resources.status,
      visibility: resources.visibility,
      fileName: resources.fileName,
      mimeType: resources.mimeType,
      extension: resources.extension,
      sizeBytes: resources.sizeBytes,
      externalUrl: resources.externalUrl,
      tags: resources.tags,
      createdAt: resources.createdAt,
      updatedAt: resources.updatedAt,
    })
    .from(resources)
    .where(eq(resources.ownerId, session.userId))
    .orderBy(desc(resources.updatedAt))
    .limit(200);

  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") || "";

  try {
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      if (!canPublishResource(session)) {
        formData.set("visibility", "private");
      }
      const resource = await createResourceFromFormData(formData, session.userId);
      return NextResponse.json(resource);
    }

    const body = await request.json();
    const [resource] = await db
      .insert(resources)
      .values({
        ownerId: session.userId,
        conversationId: body.conversationId || null,
        title: body.title,
        description: body.description || null,
        type: body.type || "generated",
        visibility: canPublishResource(session)
          ? body.visibility || defaultVisibilityForRole(session)
          : "private",
        status:
          body.status && canPublishResource(session) ? body.status : "draft",
        fileName: body.fileName || null,
        mimeType: body.mimeType || "text/markdown; charset=utf-8",
        extension: body.extension || null,
        externalUrl: body.externalUrl || null,
        textContent: body.textContent || null,
        binaryContentBase64: body.binaryContentBase64 || null,
        // Client-side blob uploads pass the resulting URL here
        blobUrl: body.blobUrl || null,
        sizeBytes: body.sizeBytes || null,
        tags: body.tags || [],
      })
      .returning();

    return NextResponse.json(resource);
  } catch (error) {
    console.error("Failed to create resource", error);
    return NextResponse.json(
      { error: "Failed to create resource" },
      { status: 500 }
    );
  }
}
