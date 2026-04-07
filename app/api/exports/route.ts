import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { buildExportPayload } from "@/lib/exporters";
import { generatePptx, parseSlideContent } from "@/lib/slides";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const format = body.format as "md" | "doc" | "pdf" | "pptx" | "csv";
    const title = String(body.title || "Gratitude Output");
    const content = String(body.content || "");

    if (!format || !["md", "doc", "pdf", "pptx", "csv"].includes(format)) {
      return NextResponse.json({ error: "Invalid format" }, { status: 400 });
    }

    // CSV export - extract CSV from code blocks or use raw content
    if (format === "csv") {
      // Try to extract CSV from a code block
      const csvMatch = content.match(/```(?:csv)?\s*\n([\s\S]*?)\n```/);
      const csvContent = csvMatch ? csvMatch[1] : content;
      const safeFileName =
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") || "gratitude-export";

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${safeFileName}.csv"`,
        },
      });
    }

    // PPTX generation
    if (format === "pptx") {
      // If slides JSON is provided directly, use it; otherwise parse from content
      const presentationData = body.slides
        ? { title, slides: body.slides }
        : parseSlideContent(content, title);

      const buffer = await generatePptx(presentationData);
      const safeFileName =
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") || "gratitude-presentation";

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "Content-Disposition": `attachment; filename="${safeFileName}.pptx"`,
        },
      });
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
