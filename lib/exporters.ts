import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

function sanitizeFileName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "gratitude-output";
}

function buildWordHtml(title: string, content: string) {
  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const paragraphs = content
    .split(/\n{2,}/)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br/>")}</p>`)
    .join("");

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.55; padding: 40px; color: #111; }
      h1 { font-size: 24px; margin-bottom: 8px; }
      p { margin: 0 0 14px; }
    </style>
  </head>
  <body>
    <h1>${title}</h1>
    ${paragraphs}
  </body>
</html>`;
}

async function buildPdf(title: string, content: string) {
  const pdf = await PDFDocument.create();
  let page = pdf.addPage([612, 792]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fontSize = 11;
  const lineHeight = 16;
  const margin = 50;
  const maxWidth = page.getWidth() - margin * 2;
  let cursorY = page.getHeight() - margin;

  const drawWrappedText = (
    text: string,
    activeFont: typeof font,
    activeFontSize: number
  ) => {
    const words = text.split(/\s+/);
    let line = "";

    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      const width = activeFont.widthOfTextAtSize(candidate, activeFontSize);

      if (width <= maxWidth) {
        line = candidate;
        continue;
      }

      if (cursorY < margin + lineHeight * 2) {
        page = pdf.addPage([612, 792]);
        cursorY = page.getHeight() - margin;
      }

      page.drawText(line, {
        x: margin,
        y: cursorY,
        size: activeFontSize,
        font: activeFont,
        color: rgb(0.08, 0.08, 0.08),
      });
      cursorY -= lineHeight;
      line = word;
    }

    if (line) {
      if (cursorY < margin + lineHeight * 2) {
        page = pdf.addPage([612, 792]);
        cursorY = page.getHeight() - margin;
      }

      page.drawText(line, {
        x: margin,
        y: cursorY,
        size: activeFontSize,
        font: activeFont,
        color: rgb(0.08, 0.08, 0.08),
      });
      cursorY -= lineHeight;
    }
  };

  drawWrappedText(title, bold, 18);
  cursorY -= 8;

  for (const paragraph of content.split(/\n{2,}/)) {
    drawWrappedText(paragraph.replace(/\n/g, " "), font, fontSize);
    cursorY -= 6;
  }

  return Buffer.from(await pdf.save());
}

export async function buildExportPayload(
  format: "md" | "doc" | "pdf",
  title: string,
  content: string
) {
  const safeFileName = sanitizeFileName(title);

  if (format === "md") {
    return {
      fileName: `${safeFileName}.md`,
      mimeType: "text/markdown; charset=utf-8",
      body: `# ${title}\n\n${content}`,
    };
  }

  if (format === "doc") {
    return {
      fileName: `${safeFileName}.doc`,
      mimeType: "application/msword",
      body: buildWordHtml(title, content),
    };
  }

  return {
    fileName: `${safeFileName}.pdf`,
    mimeType: "application/pdf",
    body: await buildPdf(title, content),
  };
}
