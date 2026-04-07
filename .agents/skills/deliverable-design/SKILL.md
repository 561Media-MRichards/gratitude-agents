---
name: deliverable-design
description: Create multi-page branded PDFs — impact reports, sponsor kits, partner decks, case studies, lead magnet designs
argument-hint: "[deliverable type + content to design]"
---

# Deliverable Design Skill

## Purpose
Create professional, multi-page branded PDF documents for Gratitude.com. Impact
reports, sponsor kits, partner decks, case studies, lead magnets, and any
document that needs to look polished and on-brand.

## Load Context
Read ALL of the following before creating any document:
- `.Codex/brand-memory.md`
- `brand-kit/visual-system.json` (colors, gradients, shadows, radii)
- `brand-kit/voice-core.md` (for any text creation)
- `design-kit/template-registry.yaml` (document templates)
- `design-kit/typography-guide.md` (font rules and scale)
- `design-kit/illustration-style.md` (art direction)
- `design-kit/platform-specs.yaml` (PDF dimensions: letter 612x792pt)

## Process

### Step 1: Identify the Document Type
Determine from the user's input:
1. **Type**: Impact report, sponsor kit, partner deck, case study, lead magnet PDF, one-pager
2. **Page count**: Estimate based on content volume
3. **Content source**: User-provided text, output from another skill, or to be written

If the user ran `/lead-magnet` or `/direct-response-copy` first, use that content.

### Step 2: Document Structure

**Impact Report (4-8 pages)**
1. Cover page: Report title, period, Gratitude logo, glow design
2. Executive summary / key metrics at a glance
3. Activation data (detailed metrics, charts)
4. Impact stories (2-3 featured activations)
5. Sponsor acknowledgment
6. Next period goals + contact

**Sponsor Kit (5-10 pages)**
1. Cover page: "Sponsor Kit", Gratitude logo, tagline
2. Platform overview: How Gratitude.com works (3-sided model)
3. Why sponsor: Benefits, ROI, employee engagement
4. Sponsorship tiers and options
5. Activation examples and case studies
6. Impact metrics and reporting
7. Next steps + contact info

**Partner Deck (4-6 pages)**
1. Cover page: "Partner Program", Gratitude logo
2. Partnership model: How nonprofits benefit
3. Activation flow: How it works for partners
4. Impact potential: Projected outcomes
5. Onboarding process
6. Next steps + contact

**Case Study (3-5 pages)**
1. Cover page: Sponsor/partner name, result headline, Gratitude logo
2. The challenge (half page) + the approach (half page)
3. The activation (1-2 pages with detail)
4. Results page: Stat callouts, before/after, key metrics
5. CTA: "Sponsor impact like this" + contact info

**Lead Magnet PDF (5-12 pages)**
1. Cover page: Title, subtitle, Gratitude logo
2. Introduction (1 page)
3. Content pages (3-8 pages)
4. Summary / action items (1 page)
5. CTA page: Next step + Gratitude.com info

### Step 3: Design the Document

**BRAND RULES (non-negotiable):**
- Colors: Brand palette only from `brand-kit/visual-system.json`. Black backgrounds, pink/coral/orange accents.
- Fonts: Anton for headings (ALWAYS uppercase), Inter for body. From `canvas-fonts/`.
- Logo: Gratitude logo on cover page and in footer of interior pages.
- Page size: US Letter (8.5 x 11 inches / 612 x 792 points).

**COVER PAGE DESIGN:**
- Full visual impact. This is the first impression.
- Black background with pink/orange glow effects.
- Title in Anton, UPPERCASE, large (36-48pt).
- Subtitle in Inter Regular (16-20pt), white/60 opacity.
- Gratitude logo prominent (bottom or top of page).
- Date and context in Inter, white/40 opacity.
- Gradient accent line or glow orb for visual energy.

**INTERIOR PAGE DESIGN:**
- Margins: 1 inch (72pt) on all sides. 0.75 inch acceptable for data-heavy pages.
- Header: Thin gradient accent line across top. Section label (Inter, 10pt, uppercase, pink #FE3184).
- Footer: Page number (Inter, 10pt, centered or right). Optional: Gratitude logo small, left.
- Body text: Inter Regular, 11-12pt, 1.6 line height.
- Section headers: Anton, 24-32pt, UPPERCASE, white.
- Subsection headers: Inter SemiBold, 16-18pt, white/80.
- Stat callouts: Anton, 36-48pt, UPPERCASE. Pink or gradient text.
- Pull quotes: Inter, 20pt, italic, white/70. Thin pink left border.

**DATA & STAT ELEMENTS:**
- Stat boxes: Dark gradient background (#1a1a1a→#0d0d0d), rounded corners (8px). Large number in pink/gradient.
- Charts: Pink, coral, orange color coding. Clean gridlines on dark background.
- Tables: Alternating dark rows. Gradient header row with white text.

**CTA PAGES:**
- Black background with glow effects.
- Clear headline in Anton, UPPERCASE.
- Contact info: email, website.
- Gradient CTA button element.
- Gratitude logo prominent.

### Step 4: Output
- Save to `output/` directory as .pdf.
- Name files descriptively: `impact-report-q1-2026.pdf`, `sponsor-kit-feb-2026.pdf`
- Multi-page documents bundled as a single PDF.

### Step 5: Quality Check
Before delivering, verify:
- [ ] Cover page is visually impactful with glow design
- [ ] All pages use consistent header/footer treatment
- [ ] Brand colors only (black bg, pink/coral/orange accents — NO navy)
- [ ] Fonts are Anton (UPPERCASE headings) + Inter (body) only
- [ ] Margins are consistent
- [ ] No orphan lines or awkward page breaks
- [ ] Stat callouts are properly sized and styled
- [ ] Logo present on cover and footers
- [ ] Professional enough to send to a Fortune 500 CSR director

## Chain From
Works best when fed content from `/lead-magnet`, `/direct-response-copy`,
or `/gratitude-content-strategy`.
