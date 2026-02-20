---
name: social-creative
description: Create platform-specific social media graphics with Gratitude.com's dark glow aesthetic — Instagram posts, stories, LinkedIn banners, carousels, ad creatives
argument-hint: "[platform + post type + content/copy to visualize]"
---

# Social Creative Skill

## Purpose
Create production-ready social media graphics that are on-brand, platform-native,
and optimized for engagement. Every output must use Gratitude.com's exact brand system.

## Load Context
Read ALL of the following before creating any visual:
- `.claude/brand-memory.md`
- `brand-kit/visual-system.json` (colors, gradients, shadows, radii, hover system)
- `design-kit/platform-specs.yaml` (exact dimensions and safe zones)
- `design-kit/typography-guide.md` (font rules and scale)
- `design-kit/illustration-style.md` (art direction)
- `design-kit/template-registry.yaml` (deliverable templates)

## Process

### Step 1: Identify the Deliverable
Determine from the user's input:
1. **Platform**: Instagram, LinkedIn, Facebook, X, YouTube
2. **Format**: Post (square/portrait), story, carousel, banner, ad creative
3. **Content type**: Stat callout, impact story, activation highlight, CTA, infographic
4. **Copy/text**: The headline, body, and CTA to include

If the user ran `/content-atomizer` first, use the atomized platform content
as the text source.

### Step 2: Select Dimensions and Template
Look up the exact specs from `design-kit/platform-specs.yaml`:

| Platform + Type | Dimensions | Key Notes |
|----------------|------------|-----------|
| Instagram post (square) | 1080x1080 | Default. Logo bottom-right. |
| Instagram post (portrait) | 1080x1350 | Better engagement. Extra bottom space. |
| Instagram story | 1080x1920 | Top 200px and bottom 280px are UI zones. |
| Instagram carousel | 1080x1080 per slide | Slide 1 = hook. Last = CTA. |
| LinkedIn landscape | 1200x627 | Professional, data-forward. |
| LinkedIn square | 1080x1080 | Also works on LinkedIn. |
| Facebook post | 1200x630 | Similar to LinkedIn landscape. |
| X/Twitter post | 1200x675 | 16:9 ratio. |
| YouTube thumbnail | 1280x720 | Bottom-right has timestamp. High contrast. |

### Step 3: Design the Graphic

**BRAND RULES (non-negotiable):**
- Colors: ONLY from `brand-kit/visual-system.json`. Pink (#FE3184), Coral (#FF6B35), Orange (#ec7211). Backgrounds: #000000 to #2a2a2a. NOT navy.
- Fonts: Anton for headlines (ALWAYS uppercase, weight 400 only), Inter for body/labels. From `canvas-fonts/`.
- Logo: Include Gratitude logo from `logos/`. Use `gratitude-logo-white.png` for social. Position bottom-right with 40px margin, max 120px wide.
- Corners: 0px for social media (platforms crop to their own shapes).
- Gradient: 3-stop pink→coral→orange for CTAs and accent elements.

**COMPOSITION RULES:**
- All text within safe zones per platform spec.
- No text touching edges. Minimum margins per safe zone definition.
- No text overlapping other text. Clear visual separation.
- One hero element per graphic (what the viewer sees first).
- Maximum 3 levels of visual hierarchy: headline → supporting text → CTA/logo.
- Black backgrounds (#000000) for most posts. Add pink/orange glow orbs for depth.

**TYPOGRAPHY ON CANVAS:**
- Headlines: Anton Regular (400), 36-64px depending on text length. ALWAYS UPPERCASE.
- Supporting text: Inter Regular, 16-24px.
- Stats/numbers: Anton Regular, 72-120px. ALWAYS UPPERCASE if text included.
- CTA text: Inter SemiBold (600), 16-20px.
- Labels: Inter SemiBold, 12px, uppercase, 0.1em letter-spacing, pink color.

### Step 4: Carousel-Specific Rules
If creating a carousel:
- **Slide 1 (Cover):** Black background. Bold white Anton headline (hook/question). Pink→orange gradient accent bar. Logo top-right.
- **Slides 2-N (Content):** Black background. Pink slide number (top-left): "01", "02". Main point in Anton, large. Supporting detail in Inter, smaller.
- **Final Slide (CTA):** Full gradient background (pink→coral→orange). White centered CTA text. Logo centered bottom.

### Step 5: Output
- Save to `output/` directory.
- File format: .png for individual images, .pdf for LinkedIn carousel documents.
- Name files descriptively: `ig-post-activation-stats.png`, `li-carousel-impact-report.pdf`
- For carousels, output each slide as a separate numbered PNG.

### Step 6: Quality Check
Before delivering, verify:
- [ ] Dimensions match platform spec exactly
- [ ] All text within safe zones
- [ ] Brand colors only (pink/coral/orange accents, black backgrounds — NO navy)
- [ ] Logo present and correctly positioned
- [ ] Fonts are Anton (headlines, UPPERCASE) + Inter (body) only
- [ ] No text overlapping
- [ ] Professional, not cluttered
- [ ] Would stop someone's scroll

## Chain From
This skill works best when fed content from `/content-atomizer` or `/direct-response-copy`.
