import { put } from "@vercel/blob";
import { db } from "@/lib/db";
import { resources } from "@/db/schema";

// Gemini Imagen image generation for the design agents.
// The PNG is stored in Vercel Blob; a `resources` row records metadata so chat
// responses can embed it via /api/resources/{id}/download?inline=1 (which
// permission-gates then redirects to the blob CDN URL).

const IMAGE_MODEL = process.env.IMAGE_MODEL || "imagen-4.0-generate-001";

export type ImageAspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

export interface GeneratedImage {
  resourceId: string;
  title: string;
}

export async function generateImage(options: {
  prompt: string;
  aspectRatio?: ImageAspectRatio;
  ownerId: string;
  conversationId?: string | null;
  title?: string;
}): Promise<GeneratedImage> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Image generation is not configured (missing GEMINI_API_KEY)");
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:predict`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        instances: [{ prompt: options.prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: options.aspectRatio || "1:1",
        },
      }),
    }
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Image generation failed (${res.status}): ${detail.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    predictions?: { bytesBase64Encoded?: string; mimeType?: string }[];
  };

  const prediction = data.predictions?.[0];
  if (!prediction?.bytesBase64Encoded) {
    throw new Error("Image generation returned no image (possibly blocked by safety filters)");
  }

  const title =
    options.title || options.prompt.slice(0, 80).trim() || "Generated image";
  const mimeType = prediction.mimeType || "image/png";
  const extension = mimeType.includes("jpeg") ? "jpg" : "png";
  const fileName = `${title.replace(/[^\w\- ]/g, "").replace(/\s+/g, "-").toLowerCase() || "image"}.${extension}`;

  const bytes = Buffer.from(prediction.bytesBase64Encoded, "base64");
  const blob = await put(`generated/${fileName}`, bytes, {
    access: "public",
    addRandomSuffix: true,
    contentType: mimeType,
  });

  const [resource] = await db
    .insert(resources)
    .values({
      ownerId: options.ownerId,
      conversationId: options.conversationId || null,
      title,
      description: `AI-generated image. Prompt: ${options.prompt.slice(0, 500)}`,
      type: "generated",
      visibility: "private",
      status: "draft",
      fileName,
      mimeType,
      extension,
      sizeBytes: bytes.byteLength,
      blobUrl: blob.url,
      tags: ["generated-image"],
    })
    .returning({ id: resources.id });

  return { resourceId: resource.id, title };
}
