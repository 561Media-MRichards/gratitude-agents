import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getSession } from "@/lib/auth";

// Token exchange for client-side blob uploads. Files go browser -> Vercel Blob
// directly, so uploads are not subject to the ~4.5MB serverless request cap.
// The client then POSTs the resulting blob URL + metadata to /api/resources.
export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        maximumSizeInBytes: 100 * 1024 * 1024, // 100MB
        addRandomSuffix: true,
      }),
      // Metadata rows are created by the client via POST /api/resources after
      // upload (this callback does not fire on localhost anyway)
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Blob upload token error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 400 });
  }
}
