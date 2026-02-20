---
name: brand-asset-design
description: Create general brand assets — presentation slides, email headers, OG images, infographics, and other visual collateral
argument-hint: "[asset type + purpose + key content]"
---

# Brand Asset Design Skill

## Purpose
Create general-purpose branded visual assets for Gratitude.com. This is the catch-all
design skill for anything that doesn't fit social-creative, deliverable-design,
web-mockup, or canvas-art.

## Load Context
Read ALL of the following before creating any asset:
- `.claude/brand-memory.md`
- `brand-kit/visual-system.json` (colors, gradients, shadows)
- `design-kit/platform-specs.yaml` (dimensions for each asset type)
- `design-kit/typography-guide.md` (font rules)
- `design-kit/illustration-style.md` (art direction)
- `design-kit/template-registry.yaml` (asset templates)

## Asset Types

### Presentation Slides
- Dimensions: 1920x1080 (16:9)
- Cover slide: Black background with glow effects, Anton title (UPPERCASE), Gratitude logo, date
- Content slides: Clean dark layout, one idea per slide, generous margins (80px)
- Data slides: Stat callouts in Anton, pink/orange accent colors, dark card containers
- Section divider slides: Black with Anton title, gradient accent line
- Final slide: CTA or contact info, gradient button element, Gratitude logo prominent

### Email Headers
- Dimensions: 600x200 (standard) or 600x250 (hero)
- Max file size: 100-150KB (optimize for email delivery)
- Black background default. Pink/orange gradient accents.
- Gratitude logo (white variant), left or centered
- Headline text in Anton, UPPERCASE, white, 24-32px
- Simple compositions that communicate with images off

### Infographics
- Dimensions: 1080x1350 (Instagram portrait) or 1080x1920 (story/tall)
- Black background with structured data layout
- Title at top in Anton (UPPERCASE)
- Data points organized in clear rows or grid
- Gradient accent lines between sections
- Icons: Thin line style, pink
- Gratitude logo bottom center
- Stat callouts: Large pink/gradient numbers, small white labels

### OG Images (Open Graph)
- Dimensions: 1200x630
- Purpose: Link preview images for blog posts, pages, social shares
- Black background with pink/orange glow
- Page/article title in Anton, UPPERCASE, white, 36-48px
- Gratitude logo, bottom-right or bottom-center
- Optional: Subtle grid pattern or glow background
- Text must be legible at small preview sizes

### Miscellaneous Assets
- Zoom/meeting backgrounds (black with subtle glow)
- Website favicons
- Social media profile images
- Event banners

## Process

### Step 1: Identify the Asset
1. What type of asset?
2. What dimensions? (Check platform-specs.yaml)
3. What content goes on it?
4. Where will it be used?

### Step 2: Design

**BRAND RULES (non-negotiable):**
- Colors: Brand palette only from visual-system.json. Black backgrounds, pink/coral/orange accents.
- Fonts: Anton for display (UPPERCASE), Inter for body. From `canvas-fonts/`.
- Logo: Include Gratitude logo in appropriate variant.
- Style: Dark, luminous, warm-glow aesthetic. Never cluttered.

**COMPOSITION:**
- One focal point per asset
- Clear visual hierarchy: primary → secondary → tertiary
- Generous negative space (dark space is a design tool)
- Pink used as primary accent, orange as secondary warmth
- Black as primary background color

### Step 3: Output
- Save to `output/` directory
- Format: .png for most assets, .pdf for multi-page presentations
- Optimize file size for email assets
- Name descriptively: `email-header-activation.png`, `og-image-impact-report.png`

### Step 4: Quality Check
- [ ] Correct dimensions for the intended platform
- [ ] Brand colors and fonts only (black bg, pink/orange accents — NO navy)
- [ ] Logo present and properly positioned
- [ ] Anton text is UPPERCASE
- [ ] Text legible at display size
- [ ] Professional quality
- [ ] File size optimized for use case

## When to Use This Skill vs Others
- Social media graphics → use `/social-creative`
- Multi-page PDFs → use `/deliverable-design`
- Landing page mockups → use `/web-mockup`
- Abstract art / hero backgrounds → use `/canvas-art`
- Everything else → use this skill
