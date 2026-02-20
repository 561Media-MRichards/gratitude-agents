---
name: canvas-art
description: Create abstract/artistic visual compositions for hero backgrounds, campaign key art, and creative visual pieces using Gratitude.com's glow aesthetic
argument-hint: "[describe the concept, mood, or purpose of the visual]"
---

# Canvas Art Skill

Create beautiful visual art in .png and .pdf documents using design philosophy.
Use this skill when creating hero backgrounds, campaign key visuals, abstract
compositions, or any artistic visual piece for Gratitude.com.

Output only .md files, .pdf files, and .png files.

Complete this in two steps:
1. Design Philosophy Creation (.md file)
2. Express by creating it on a canvas (.pdf file or .png file)

## Load Context
Read the following before starting:
- `.claude/brand-memory.md`
- `brand-kit/visual-system.json` (colors, gradients, fonts, glow system)
- `design-kit/canvas-philosophy-library.md` (pre-built philosophies)
- `design-kit/illustration-style.md` (art direction rules)
- `design-kit/typography-guide.md` (font pairing rules)

## DESIGN PHILOSOPHY CREATION

To begin, create a VISUAL PHILOSOPHY (not layouts or templates) that will be interpreted through:
- Form, space, color, composition
- Light, glow, energy, warmth
- Minimal text as visual accent

### THE CRITICAL UNDERSTANDING
- What is received: Input from the user about the concept, mood, or purpose.
- What is created: A design philosophy/aesthetic movement grounded in Gratitude.com's visual identity.
- What happens next: The philosophy is EXPRESSED VISUALLY, creating artifacts that are 90% visual design, 10% essential text.

### BRAND INTEGRATION
The philosophy MUST incorporate Gratitude.com's visual system:
- **Color palette**: Pink (#FE3184), Coral (#FF6B35), Orange (#ec7211). Backgrounds: pure black (#000000) to #2a2a2a.
- **Typography**: Anton for display (ALWAYS UPPERCASE), Inter for body (from `canvas-fonts/`)
- **Aesthetic**: Dark, luminous, warm-glow. Not cold neon. Not navy. Pure black with pink/orange energy.
- **Gradients**: Signature 3-stop gradient (pink→coral→orange), glow radials, card gradients
- **Glow system**: Pink glows (rgba(254,49,132,0.15-0.40)), orange secondary (rgba(236,114,17,0.10-0.30))

You may select a pre-built philosophy from `design-kit/canvas-philosophy-library.md`
and customize it, or create an entirely new philosophy. Either way, it must feel
like Gratitude.com while serving the specific creative brief.

### HOW TO GENERATE A VISUAL PHILOSOPHY

**Name the movement** (1-2 words): e.g., "Radiant Warmth" / "Luminous Silence"

**Articulate the philosophy** (4-6 paragraphs - concise but complete):

Express how the philosophy manifests through:
- Space and form (black void, luminous focal points)
- Color and light (pink/orange glow fields, gradient energy)
- Scale and rhythm
- Composition and balance
- Visual hierarchy

**CRITICAL GUIDELINES:**
- **Avoid redundancy**: Each design aspect mentioned once.
- **Emphasize craftsmanship REPEATEDLY**: The final work must appear meticulously crafted, labored over with care, the product of deep expertise.
- **Leave creative space**: Specific about direction, concise enough for interpretive choices.
- **Brand-anchored**: The Gratitude.com palette and glow aesthetic must be the foundation.

Output the design philosophy as a .md file.

## DEDUCING THE SUBTLE REFERENCE

Before creating the canvas, identify the conceptual thread from the original request.
The topic is a subtle, niche reference embedded within the art itself. Someone familiar
with the subject should feel it intuitively, while others experience a masterful composition.

## CANVAS CREATION

With the philosophy and conceptual framework established, express it on a canvas.

**BRAND REQUIREMENTS:**
- Use brand colors from `brand-kit/visual-system.json`. Black backgrounds, pink/coral/orange energy.
- Use fonts from `canvas-fonts/` directory. Brand fonts (Anton for UPPERCASE display, Inter for body).
- Logo placement: Include Gratitude logo from `logos/` when appropriate (bottom-right, subtle).
- Output dimensions: Default 1920x1080 for hero art, or per the brief.

**CANVAS PRINCIPLES:**
- Create museum or magazine quality work using the design philosophy as foundation.
- The black void is the canvas. Light (pink/orange glow) emerges from within.
- Generally use repeating patterns and perfect shapes.
- Treat the design as systematic observation: dense accumulation of marks, repeated elements, layered glow patterns.
- Add sparse, clinical typography and systematic reference markers.
- Anchor with simple phrases positioned subtly, using brand colors.
- Text is always minimal, UPPERCASE when in Anton, and visual-first.
- Nothing falls off the page. Nothing overlaps unintentionally. Every element within canvas boundaries with proper margins.

**CRITICAL**: Create work that looks like it took countless hours. Master-level execution. Double-check that nothing overlaps, formatting is flawless, every detail perfect.

Output as .pdf or .png file to the `output/` directory.

## FINAL STEP

Take a second pass. Refine and polish. Do not add more graphics; instead make what
exists extremely crisp and cohesive. Ask: "How can I make what's already here more
of a piece of art?"

## MULTI-PAGE OPTION

For additional pages: create more creative pages along the same philosophy but
distinctly different. Bundle in the same .pdf or many .pngs in `output/`.
