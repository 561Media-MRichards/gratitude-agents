import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";

/**
 * Gratitude-branded Excel spreadsheet generator.
 *
 * Brand specs:
 * - Pink: #FE3184, Coral: #FF6B35, Orange: #ec7211
 * - Background dark: #0A0A0A
 * - Body font: Inter (Calibri as closest system match in Excel)
 */

const PINK = "FE3184";
const DARK = "0A0A0A";
const ROW_ALT = "1A1A1A";
const TEXT_LIGHT = "FFFFFF";
const TEXT_BODY = "B3B3B3";
const BORDER_COLOR = "2A2A2A";

/**
 * Parse CSV string into rows of cells.
 */
function parseCsv(csv: string): string[][] {
  const rows: string[][] = [];
  const lines = csv.trim().split("\n");

  for (const line of lines) {
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' && (i === 0 || line[i - 1] !== "\\")) {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        cells.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    cells.push(current.trim());
    rows.push(cells);
  }

  return rows;
}

/**
 * Extract CSV content from a message that may contain markdown code blocks.
 */
function extractCsv(content: string): string {
  const match = content.match(/```(?:csv)?\s*\n([\s\S]*?)\n```/);
  return match ? match[1] : content;
}

/**
 * Generate a branded Excel file from CSV content.
 */
export async function generateXlsx(
  content: string,
  title: string
): Promise<Buffer> {
  const csv = extractCsv(content);
  const rows = parseCsv(csv);

  if (rows.length === 0) {
    throw new Error("No data to export");
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Gratitude";
  workbook.created = new Date();

  // Sheet name from title, max 31 chars (Excel limit)
  const sheetName =
    title
      .replace(/[*?:/\\[\]]/g, "")
      .slice(0, 31) || "Data";

  const sheet = workbook.addWorksheet(sheetName, {
    properties: { defaultColWidth: 18 },
    views: [{ state: "frozen", ySplit: 3 }], // Freeze header rows
  });

  // Row 1: Logo / brand bar
  const brandRow = sheet.addRow([""]);
  brandRow.height = 36;
  brandRow.getCell(1).value = "GRATITUDE";
  brandRow.getCell(1).font = {
    name: "Calibri",
    size: 16,
    bold: true,
    color: { argb: `FF${PINK}` },
  };
  brandRow.getCell(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: `FF${DARK}` },
  };
  // Fill brand row across all columns
  const colCount = rows[0]?.length || 1;
  for (let i = 2; i <= colCount; i++) {
    brandRow.getCell(i).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: `FF${DARK}` },
    };
  }

  // Row 2: Title / subtitle row
  const titleRow = sheet.addRow([title]);
  titleRow.height = 24;
  titleRow.getCell(1).font = {
    name: "Calibri",
    size: 10,
    color: { argb: `FF${TEXT_BODY}` },
  };
  titleRow.getCell(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: `FF${DARK}` },
  };
  for (let i = 2; i <= colCount; i++) {
    titleRow.getCell(i).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: `FF${DARK}` },
    };
  }

  // Row 3: Column headers (first row of CSV data)
  const headers = rows[0];
  const headerRow = sheet.addRow(headers);
  headerRow.height = 28;

  headerRow.eachCell((cell, colNumber) => {
    cell.font = {
      name: "Calibri",
      size: 10,
      bold: true,
      color: { argb: `FF${TEXT_LIGHT}` },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: `FF${PINK}` },
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: "left",
      wrapText: true,
    };
    cell.border = {
      bottom: { style: "thin", color: { argb: `FF${PINK}` } },
    };
  });

  // Data rows
  for (let i = 1; i < rows.length; i++) {
    const dataRow = sheet.addRow(rows[i]);
    const isAlt = i % 2 === 0;

    dataRow.eachCell((cell) => {
      cell.font = {
        name: "Calibri",
        size: 10,
        color: { argb: `FF${TEXT_BODY}` },
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: isAlt ? `FF${ROW_ALT}` : `FF${DARK}` },
      };
      cell.alignment = {
        vertical: "top",
        wrapText: true,
      };
      cell.border = {
        bottom: {
          style: "hair",
          color: { argb: `FF${BORDER_COLOR}` },
        },
      };
    });
  }

  // Auto-size columns based on content
  sheet.columns.forEach((column) => {
    let maxLength = 12;
    column.eachCell?.({ includeEmpty: false }, (cell) => {
      const len = String(cell.value || "").length;
      if (len > maxLength) maxLength = len;
    });
    column.width = Math.min(Math.max(maxLength + 4, 12), 45);
  });

  // Try to embed logo image
  const logoPath = path.join(process.cwd(), "logos", "gratitude-logo-white.png");
  if (fs.existsSync(logoPath)) {
    try {
      const logoId = workbook.addImage({
        filename: logoPath,
        extension: "png",
      });
      sheet.addImage(logoId, {
        tl: { col: 0, row: 0 },
        ext: { width: 120, height: 28 },
        editAs: "oneCell",
      });
      // Clear text since we have the image
      brandRow.getCell(1).value = "";
    } catch {
      // Keep text fallback if image fails
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
