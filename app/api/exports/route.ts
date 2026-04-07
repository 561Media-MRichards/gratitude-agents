import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { buildExportPayload } from "@/lib/exporters";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const format = body.format as "md" | "doc" | "pdf";
    const title = String(body.title || "Gratitude Output");
    const content = String(body.content || "");

    if (!format || !["md", "doc", "pdf"].includes(format)) {
      return NextResponse.json({ error: "Invalid format" }, { status: 400 });
    }

    const payload = await buildExportPayload(format, title, content);

    return new NextResponse(payload.body, {
      headers: {
        "Content-Type": payload.mimeType,
        "Content-Disposition": `attachment; filename="${payload.fileName}"`,
      },
    });
  } catch (error) {
    console.error("Export failed", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
