import PptxGenJS from "pptxgenjs";
import fs from "fs";
import path from "path";

/**
 * Gratitude-branded PPTX slide generator.
 *
 * Brand specs from brand-kit/visual-system.json:
 * - Background: #0a0a0a (near black)
 * - Pink: #FE3184, Coral: #FF6B35, Orange: #ec7211
 * - Display font: Anton (mapped to Impact as closest system font)
 * - Body font: Inter (mapped to Calibri as closest system font)
 * - All display text UPPERCASE
 */

// Brand colors
const PINK = "FE3184";
const CORAL = "FF6B35";
const ORANGE = "ec7211";
const BG_DARK = "0A0A0A";
const BG_CARD = "111111";
const TEXT_PRIMARY = "FFFFFF";
const TEXT_BODY = "B3B3B3"; // ~70% white
const TEXT_MUTED = "808080"; // ~50% white
const BORDER = "1A1A1A";

// Fonts - closest system matches for Anton + Inter
const FONT_DISPLAY = "Impact"; // closest to Anton
const FONT_BODY = "Calibri"; // closest to Inter

export interface SlideData {
  type: "title" | "content" | "two-column" | "quote" | "stats" | "closing";
  title?: string;
  subtitle?: string;
  body?: string;
  bullets?: string[];
  left?: { heading?: string; bullets?: string[] };
  right?: { heading?: string; bullets?: string[] };
  quote?: string;
  attribution?: string;
  stats?: { value: string; label: string }[];
  notes?: string;
}

export interface PresentationData {
  title: string;
  slides: SlideData[];
}

function addGradientBar(slide: PptxGenJS.Slide) {
  // Thin gradient accent bar at top of slide
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: "100%",
    h: 0.06,
    fill: { color: PINK },
  });
  // Overlay second half with orange for gradient effect
  slide.addShape("rect", {
    x: "50%",
    y: 0,
    w: "50%",
    h: 0.06,
    fill: { color: ORANGE },
  });
}

function addSlideNumber(slide: PptxGenJS.Slide, num: number, total: number) {
  slide.addText(`${num} / ${total}`, {
    x: 8.8,
    y: 7.0,
    w: 1.2,
    h: 0.4,
    fontSize: 9,
    fontFace: FONT_BODY,
    color: TEXT_MUTED,
    align: "right",
  });
}

function addLogo(slide: PptxGenJS.Slide) {
  // Try to embed the PNG logo
  const logoPath = path.join(process.cwd(), "logos", "gratitude-logo-white.png");
  if (fs.existsSync(logoPath)) {
    const logoData = fs.readFileSync(logoPath).toString("base64");
    slide.addImage({
      data: `image/png;base64,${logoData}`,
      x: 0.5,
      y: 6.85,
      h: 0.35,
      w: 1.5,
      sizing: { type: "contain", w: 1.5, h: 0.35 },
    });
  } else {
    // Fallback: text logo
    slide.addText("GRATITUDE", {
      x: 0.5,
      y: 6.9,
      w: 2,
      h: 0.35,
      fontSize: 14,
      fontFace: FONT_DISPLAY,
      color: PINK,
      bold: true,
    });
  }
}

function buildTitleSlide(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  data: SlideData
) {
  slide.background = { color: BG_DARK };

  // Subtle glow circle (simulated with a faded shape)
  slide.addShape("ellipse", {
    x: 2.5,
    y: 1.0,
    w: 5,
    h: 5,
    fill: { color: PINK, transparency: 92 },
  });

  // Title
  slide.addText((data.title || "").toUpperCase(), {
    x: 0.8,
    y: 2.2,
    w: 8.4,
    h: 1.6,
    fontSize: 44,
    fontFace: FONT_DISPLAY,
    color: TEXT_PRIMARY,
    bold: true,
    align: "center",
    lineSpacingMultiple: 0.95,
  });

  // Subtitle
  if (data.subtitle) {
    slide.addText(data.subtitle, {
      x: 1.5,
      y: 3.9,
      w: 7,
      h: 0.8,
      fontSize: 16,
      fontFace: FONT_BODY,
      color: TEXT_BODY,
      align: "center",
      lineSpacingMultiple: 1.4,
    });
  }

  // Gradient bar at bottom
  slide.addShape("rect", {
    x: 3.5,
    y: 5.0,
    w: 3,
    h: 0.05,
    fill: { color: PINK },
  });

  addLogo(slide);
}

function buildContentSlide(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  data: SlideData,
  num: number,
  total: number
) {
  slide.background = { color: BG_DARK };
  addGradientBar(slide);

  // Title
  if (data.title) {
    slide.addText(data.title.toUpperCase(), {
      x: 0.7,
      y: 0.4,
      w: 8.6,
      h: 0.7,
      fontSize: 26,
      fontFace: FONT_DISPLAY,
      color: TEXT_PRIMARY,
      bold: true,
    });
  }

  // Body text or bullets
  const topY = data.title ? 1.3 : 0.6;

  if (data.bullets && data.bullets.length > 0) {
    // Scale font size down for many or long bullets
    const totalChars = data.bullets.reduce((sum, b) => sum + b.length, 0);
    const fontSize = totalChars > 400 || data.bullets.length > 5 ? 12 : 14;
    const spacing = fontSize <= 12 ? 1.4 : 1.5;

    const bulletText = data.bullets.map((b) => ({
      text: b,
      options: {
        fontSize,
        fontFace: FONT_BODY,
        color: TEXT_BODY,
        bullet: { code: "2022", color: PINK },
        lineSpacingMultiple: spacing,
        paraSpaceAfter: 6,
      },
    }));

    slide.addText(bulletText, {
      x: 0.7,
      y: topY,
      w: 8.6,
      h: 5.5,
      valign: "top",
      shrinkText: true,
    });
  } else if (data.body) {
    slide.addText(data.body, {
      x: 0.7,
      y: topY,
      w: 8.6,
      h: 5.5,
      fontSize: 14,
      fontFace: FONT_BODY,
      color: TEXT_BODY,
      lineSpacingMultiple: 1.5,
      valign: "top",
      shrinkText: true,
    });
  }

  addLogo(slide);
  addSlideNumber(slide, num, total);
}

function buildTwoColumnSlide(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  data: SlideData,
  num: number,
  total: number
) {
  slide.background = { color: BG_DARK };
  addGradientBar(slide);

  if (data.title) {
    slide.addText(data.title.toUpperCase(), {
      x: 0.7,
      y: 0.4,
      w: 8.6,
      h: 0.7,
      fontSize: 26,
      fontFace: FONT_DISPLAY,
      color: TEXT_PRIMARY,
      bold: true,
    });
  }

  // Divider line
  slide.addShape("rect", {
    x: 4.95,
    y: 1.5,
    w: 0.01,
    h: 4.5,
    fill: { color: BORDER },
  });

  // Left column
  const leftY = 1.4;
  if (data.left?.heading) {
    slide.addText(data.left.heading.toUpperCase(), {
      x: 0.7,
      y: leftY,
      w: 4,
      h: 0.5,
      fontSize: 14,
      fontFace: FONT_DISPLAY,
      color: PINK,
      bold: true,
    });
  }

  if (data.left?.bullets) {
    const totalChars = data.left.bullets.reduce((s, b) => s + b.length, 0);
    const fs = totalChars > 250 || data.left.bullets.length > 4 ? 11 : 12;
    const bullets = data.left.bullets.map((b) => ({
      text: b,
      options: {
        fontSize: fs,
        fontFace: FONT_BODY,
        color: TEXT_BODY,
        bullet: { code: "2022", color: PINK },
        lineSpacingMultiple: 1.4,
        paraSpaceAfter: 4,
      },
    }));
    slide.addText(bullets, {
      x: 0.7,
      y: leftY + 0.6,
      w: 4,
      h: 4.8,
      valign: "top",
      shrinkText: true,
    });
  }

  // Right column
  if (data.right?.heading) {
    slide.addText(data.right.heading.toUpperCase(), {
      x: 5.3,
      y: leftY,
      w: 4,
      h: 0.5,
      fontSize: 14,
      fontFace: FONT_DISPLAY,
      color: PINK,
      bold: true,
    });
  }

  if (data.right?.bullets) {
    const totalChars = data.right.bullets.reduce((s, b) => s + b.length, 0);
    const fs = totalChars > 250 || data.right.bullets.length > 4 ? 11 : 12;
    const bullets = data.right.bullets.map((b) => ({
      text: b,
      options: {
        fontSize: fs,
        fontFace: FONT_BODY,
        color: TEXT_BODY,
        bullet: { code: "2022", color: PINK },
        lineSpacingMultiple: 1.4,
        paraSpaceAfter: 4,
      },
    }));
    slide.addText(bullets, {
      x: 5.3,
      y: leftY + 0.6,
      w: 4,
      h: 4.8,
      valign: "top",
      shrinkText: true,
    });
  }

  addLogo(slide);
  addSlideNumber(slide, num, total);
}

function buildQuoteSlide(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  data: SlideData,
  num: number,
  total: number
) {
  slide.background = { color: BG_DARK };

  // Large opening quote mark
  slide.addText("\u201C", {
    x: 0.7,
    y: 1.5,
    w: 1,
    h: 1,
    fontSize: 72,
    fontFace: FONT_DISPLAY,
    color: PINK,
    bold: true,
  });

  // Quote text
  slide.addText(data.quote || "", {
    x: 1.2,
    y: 2.3,
    w: 7.6,
    h: 2.5,
    fontSize: 22,
    fontFace: FONT_BODY,
    color: TEXT_PRIMARY,
    italic: true,
    lineSpacingMultiple: 1.5,
    valign: "top",
  });

  // Attribution
  if (data.attribution) {
    slide.addText(`\u2014 ${data.attribution}`, {
      x: 1.2,
      y: 5.0,
      w: 7.6,
      h: 0.5,
      fontSize: 14,
      fontFace: FONT_BODY,
      color: PINK,
    });
  }

  addLogo(slide);
  addSlideNumber(slide, num, total);
}

function buildStatsSlide(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  data: SlideData,
  num: number,
  total: number
) {
  slide.background = { color: BG_DARK };
  addGradientBar(slide);

  if (data.title) {
    slide.addText(data.title.toUpperCase(), {
      x: 0.7,
      y: 0.4,
      w: 8.6,
      h: 0.7,
      fontSize: 26,
      fontFace: FONT_DISPLAY,
      color: TEXT_PRIMARY,
      bold: true,
    });
  }

  const stats = data.stats || [];
  const count = Math.min(stats.length, 4);
  const cardWidth = count <= 2 ? 3.8 : 2.0;
  const gap = 0.3;
  const totalWidth = count * cardWidth + (count - 1) * gap;
  let startX = (10 - totalWidth) / 2;

  for (let i = 0; i < count; i++) {
    const stat = stats[i];
    const x = startX + i * (cardWidth + gap);

    // Card background
    slide.addShape("roundRect", {
      x,
      y: 2.0,
      w: cardWidth,
      h: 3.2,
      rectRadius: 0.15,
      fill: { color: BG_CARD },
      line: { color: BORDER, width: 1 },
    });

    // Stat value
    slide.addText(stat.value, {
      x,
      y: 2.4,
      w: cardWidth,
      h: 1.2,
      fontSize: 36,
      fontFace: FONT_DISPLAY,
      color: PINK,
      bold: true,
      align: "center",
    });

    // Stat label
    slide.addText(stat.label, {
      x: x + 0.2,
      y: 3.8,
      w: cardWidth - 0.4,
      h: 1.0,
      fontSize: 12,
      fontFace: FONT_BODY,
      color: TEXT_BODY,
      align: "center",
      lineSpacingMultiple: 1.4,
    });
  }

  addLogo(slide);
  addSlideNumber(slide, num, total);
}

function buildClosingSlide(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  data: SlideData
) {
  slide.background = { color: BG_DARK };

  // Glow
  slide.addShape("ellipse", {
    x: 2.5,
    y: 1.5,
    w: 5,
    h: 4,
    fill: { color: PINK, transparency: 93 },
  });

  // Title / closing message
  slide.addText((data.title || "THANK YOU").toUpperCase(), {
    x: 0.8,
    y: 2.5,
    w: 8.4,
    h: 1.2,
    fontSize: 40,
    fontFace: FONT_DISPLAY,
    color: TEXT_PRIMARY,
    bold: true,
    align: "center",
  });

  if (data.subtitle) {
    slide.addText(data.subtitle, {
      x: 1.5,
      y: 3.8,
      w: 7,
      h: 0.8,
      fontSize: 16,
      fontFace: FONT_BODY,
      color: TEXT_BODY,
      align: "center",
    });
  }

  if (data.body) {
    slide.addText(data.body, {
      x: 2,
      y: 4.6,
      w: 6,
      h: 0.6,
      fontSize: 13,
      fontFace: FONT_BODY,
      color: TEXT_MUTED,
      align: "center",
    });
  }

  // Gradient bar
  slide.addShape("rect", {
    x: 3.5,
    y: 5.5,
    w: 3,
    h: 0.05,
    fill: { color: PINK },
  });

  addLogo(slide);
}

export async function generatePptx(data: PresentationData): Promise<Buffer> {
  const pptx = new PptxGenJS();

  pptx.layout = "LAYOUT_WIDE"; // 13.33" x 7.5" (16:9)
  pptx.author = "Gratitude";
  pptx.company = "Gratitude.com";
  pptx.title = data.title;

  const total = data.slides.length;

  for (let i = 0; i < data.slides.length; i++) {
    const slideData = data.slides[i];
    const slide = pptx.addSlide();

    if (slideData.notes) {
      slide.addNotes(slideData.notes);
    }

    switch (slideData.type) {
      case "title":
        buildTitleSlide(pptx, slide, slideData);
        break;
      case "content":
        buildContentSlide(pptx, slide, slideData, i + 1, total);
        break;
      case "two-column":
        buildTwoColumnSlide(pptx, slide, slideData, i + 1, total);
        break;
      case "quote":
        buildQuoteSlide(pptx, slide, slideData, i + 1, total);
        break;
      case "stats":
        buildStatsSlide(pptx, slide, slideData, i + 1, total);
        break;
      case "closing":
        buildClosingSlide(pptx, slide, slideData);
        break;
      default:
        buildContentSlide(pptx, slide, slideData, i + 1, total);
    }
  }

  const output = await pptx.write({ outputType: "nodebuffer" });
  return output as Buffer;
}

/**
 * Parse markdown content from a chat message into structured slide data.
 * Looks for a JSON code block with slide definitions. Falls back to
 * converting the markdown content into simple content slides.
 */
export function parseSlideContent(content: string, title: string): PresentationData {
  // Try to find a JSON block with slide data (in code fence)
  const jsonMatch = content.match(/```(?:json)?\s*\n(\[[\s\S]*?\])\s*\n```/);

  if (jsonMatch) {
    try {
      const slides = JSON.parse(jsonMatch[1]) as SlideData[];
      if (Array.isArray(slides) && slides.length > 0 && slides[0].type) {
        return { title, slides };
      }
    } catch {
      // Fall through
    }
  }

  // Try raw JSON array (not in a code block) - greedy match for large arrays
  const rawJsonMatch = content.match(/\[\s*\{[\s\S]*"type"\s*:\s*"(?:title|content|two-column|quote|stats|closing)"[\s\S]*\}\s*\]/);
  if (rawJsonMatch) {
    try {
      const slides = JSON.parse(rawJsonMatch[0]) as SlideData[];
      if (Array.isArray(slides) && slides.length > 0 && slides[0].type) {
        return { title, slides };
      }
    } catch {
      // Fall through
    }
  }

  // Fallback: split markdown content into slides by ## headings
  const slides: SlideData[] = [];

  // Title slide from the overall title
  slides.push({
    type: "title",
    title,
    subtitle: "Prepared by Gratitude",
  });

  // Split by H2 headings
  const sections = content.split(/^## /m).filter(Boolean);

  for (const section of sections) {
    const lines = section.trim().split("\n");
    const heading = lines[0]?.replace(/^#+\s*/, "").trim();
    const bodyLines = lines.slice(1).filter((l) => l.trim());

    // Check if all body lines are bullet points
    const bullets = bodyLines
      .filter((l) => /^[-*]\s/.test(l.trim()))
      .map((l) => l.trim().replace(/^[-*]\s+/, ""));

    if (bullets.length > 0) {
      slides.push({
        type: "content",
        title: heading,
        bullets,
      });
    } else if (bodyLines.length > 0) {
      slides.push({
        type: "content",
        title: heading,
        body: bodyLines.join("\n"),
      });
    }
  }

  // If we only have the title slide, convert the whole content into one slide
  if (slides.length === 1) {
    const bullets = content
      .split("\n")
      .filter((l) => l.trim())
      .slice(0, 8)
      .map((l) => l.replace(/^[-*#]\s*/, "").trim());

    slides.push({
      type: "content",
      title: "Overview",
      bullets,
    });
  }

  // Closing slide
  slides.push({
    type: "closing",
    title: "Thank You",
    subtitle: "gratitude.com",
  });

  return { title, slides };
}
