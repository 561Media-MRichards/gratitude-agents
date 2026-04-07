import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { buildExportPayload } from "@/lib/exporters";
import { generatePptx, parseSlideContent } from "@/lib/slides";
import { generateXlsx } from "@/lib/spreadsheet";

const VALID_FORMATS = ["md", "doc", "pdf", "pptx", "csv", "xlsx"];

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const format = body.format as string;
    const title = String(body.title || "Gratitude Output");
    const content = String(body.content || "");

    if (!format || !VALID_FORMATS.includes(format)) {
      return NextResponse.json({ error: "Invalid format" }, { status: 400 });
    }

    const safeFileName =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "gratitude-export";

    // CSV export - raw data
    if (format === "csv") {
      const csvMatch = content.match(/```(?:csv)?\s*\n([\s\S]*?)\n```/);
      const csvContent = csvMatch ? csvMatch[1] : content;

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${safeFileName}.csv"`,
        },
      });
    }

    // XLSX export - branded Excel
    if (format === "xlsx") {
      const buffer = await generateXlsx(content, title);

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${safeFileName}.xlsx"`,
        },
      });
    }

    // PPTX export
    if (format === "pptx") {
      const presentationData = body.slides
        ? { title, slides: body.slides }
        : parseSlideContent(content, title);

      const buffer = await generatePptx(presentationData);

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "Content-Disposition": `attachment; filename="${safeFileName}.pptx"`,
        },
      });
    }

    // MD, DOC, PDF
    const payload = await buildExportPayload(
      format as "md" | "doc" | "pdf",
      title,
      content
    );

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
