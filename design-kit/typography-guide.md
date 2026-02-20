# Gratitude.com — Typography Guide

## Brand Type System

### Primary Fonts

**Anton** — Display / Headlines
- Role: Headlines, hero text, display numbers, section titles
- Weight: Regular (400) ONLY. No other weights exist.
- Character: Bold, dramatic, high-impact condensed sans-serif
- Usage: ALWAYS uppercase. No exceptions. Never use title case or sentence case.
- Letter-spacing: -0.02em for display sizes, -0.01em for heading sizes
- Files: `canvas-fonts/Anton-Regular.ttf`

**Inter** — Body / UI
- Role: Body text, UI elements, captions, supporting text, buttons, data labels
- Weights: Regular (400), Medium (500), SemiBold (600), Bold (700)
- Character: Clean, highly legible, excellent for both screen and print
- Usage: Sentence case for body. Uppercase with 0.1em spacing for section labels.
- Files: `canvas-fonts/Inter-*.ttf`

### Font Pairing Rules

1. **Never use more than 2 fonts** in a single deliverable. Anton + Inter covers everything.
2. **Headlines in Anton, body in Inter.** No exceptions for brand materials.
3. **Stat callouts** use Anton at oversized scale (48-120px depending on canvas).
4. **Section labels** use Inter, uppercase, 0.1em letter-spacing, pink (#FE3184) color, 14px.
5. **CTA buttons** use Inter SemiBold (600). Not Anton.
6. **Anton is ALWAYS uppercase.** If text shouldn't be uppercase, use Inter instead.

### Type Scale (for design output)

| Level | Font | Weight | Size Range | Usage |
|-------|------|--------|------------|-------|
| Display-2xl | Anton | 400 | 120px | Hero headlines, campaign titles |
| Display-xl | Anton | 400 | 96px | Large hero text |
| Display-lg | Anton | 400 | 72px | Section hero titles |
| Display | Anton | 400 | 56px | Page titles |
| Heading | Anton | 400 | 42px | Major section headers |
| Heading-sm | Anton | 400 | 32px | Subsection headers |
| Body Large | Inter | 400 | 18px | Lead paragraphs, introductions |
| Body | Inter | 400 | 16px | Standard body text |
| Small | Inter | 500 | 14px | Captions, secondary info |
| XS | Inter | 600 | 12px | Labels, tags, metadata |
| Stat | Anton | 400 | 48-120px | Oversized numbers and stats |

### Line Heights

| Context | Line Height |
|---------|------------|
| Display headings (Anton) | 0.95 - 1.05 |
| Heading sizes (Anton) | 1.1 - 1.15 |
| Body text (Inter) | 1.6 - 1.7 |
| Tight UI elements | 1.3 |
| Labels and tags | 1.0 |

### Color by Typography Role

| Role | Color |
|------|-------|
| Primary heading | rgba(255, 255, 255, 1.0) |
| Strong emphasis | rgba(255, 255, 255, 0.80) |
| Secondary text | rgba(255, 255, 255, 0.70) |
| Body text | rgba(255, 255, 255, 0.60) |
| Muted/caption | rgba(255, 255, 255, 0.50) |
| Labels | rgba(255, 255, 255, 0.40) |
| Section labels | #FE3184 (pink) |
| Gradient text | Pink-to-orange gradient via .text-gradient |
| CTA text | #FFFFFF on gradient background |

### Canvas Font Library (Extended)

For canvas-art and creative compositions, the full `canvas-fonts/` directory
is available with 81+ OFL fonts. Use these for artistic expression while
keeping brand fonts (Anton + Inter) for any Gratitude.com branded elements.

Recommended creative pairings from the library:
- **Editorial:** Lora (serif) + WorkSans (sans)
- **Technical:** JetBrainsMono + InstrumentSans
- **Elegant:** Italiana + CrimsonPro
- **Modern:** Outfit + GeistMono
- **Bold statement:** BigShoulders + Inter
- **Artistic:** PoiretOne + LibreBaskerville

### Rules for Text on Canvas

1. All text must sit within safe zones (see platform-specs.yaml).
2. No text overlapping other text. Clear separation always.
3. No text touching canvas edges. Minimum 40px margin.
4. Contrast ratio must ensure readability. White text on dark backgrounds.
5. When text overlays images, use a gradient or solid overlay for legibility.
6. Anton text is ALWAYS uppercase. If you need mixed case, switch to Inter.
