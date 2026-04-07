---
name: web-mockup
description: Create static visual mockups of Gratitude.com pages with the full 6-component hover system and dark glow aesthetic
argument-hint: "[page type + purpose + key content]"
---

# Web Mockup Skill

## Purpose
Create high-fidelity static visual mockups of landing pages, hero sections,
and UI components. These mockups use Gratitude.com's exact design system —
including the 6-component hover system — and can serve as visual references
for development or presentations.

## Load Context
Read ALL of the following before creating any mockup:
- `.Codex/brand-memory.md`
- `brand-kit/visual-system.json` (the complete design token system including hover_system)
- `design-kit/typography-guide.md` (font rules)
- `design-kit/illustration-style.md` (art direction)
- `design-kit/template-registry.yaml` (for landing page templates)

## Process

### Step 1: Define the Mockup
Determine from the user's input:
1. **Page type**: Landing page, hero section, sponsor page, activator page, pricing section, CTA section
2. **Purpose**: Sponsor acquisition, activator recruitment, partner onboarding, general awareness
3. **Key content**: Headline, body copy, CTA, features/benefits, social proof
4. **Target stakeholder**: Sponsors, activators, nonprofits, general

If the user ran `/direct-response-copy` first, use that copy directly.

### Step 2: Layout Planning

**Landing Page Structure (full page)**
1. Hero section: Headline, subheadline, CTA button, glow background
2. Social proof bar: Sponsor logos, activation stats
3. How it works: 3-step activation model with icon cards
4. Benefits section: 3-4 benefit cards with full hover system
5. Impact stats: Large stat callouts with glow effects
6. Testimonial section: Quote with attribution
7. CTA section: Final call to action
8. Footer: Navigation, contact info, Gratitude logo

**Hero Section Only**
- Full-width, 100vh
- Headline (Anton, UPPERCASE, display size)
- Subheadline (Inter, body-lg size, white/60)
- CTA button (gradient pill, pink→coral→orange)
- Background: Layered pink/orange glow orbs on black

### Step 3: Design the Mockup

**BRAND DESIGN SYSTEM (use exactly):**

**Backgrounds:**
- All sections: Black (#000000) or near-black (#0a0a0a)
- NO light sections. NO navy. NO cream. Pure dark theme.
- Hero section: Layered radial glow orbs (pink + orange) on black
- Grid overlay: 60px grid at 3% opacity for texture

**Typography:**
- Hero headline: Anton 400, display-2xl to display-lg sizes, UPPERCASE, white
- Section labels: Inter 400, 14px, uppercase, tracking-widest, pink (#FE3184)
- Section titles: Anton 400, heading to display sizes, UPPERCASE, white
- Body text: Inter 400, 16-18px, line-height 1.65, white/60
- No label trailing lines (unlike 561 Media). Section labels are pink text only.

**Cards (with full 6-component hover system):**
- Background: linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%)
- Border: 1px solid rgba(255,255,255,0.08)
- Border-radius: 1rem
- Padding: 2rem to 2.5rem
- Hover effects (show in "active" state on one card):
  1. Glow orb: Gradient blur in corner
  2. Text brightness: white/60 → white/80
  3. Icon scale: 110%
  4. Icon glow: 0 0 30px rgba(254,49,132,0.3)
  5. Bottom accent: Gradient line, full width
  6. Border glow: inset 1px pink/30 + outer 40px glow

**Buttons:**
- Primary: 3-stop gradient (pink→coral→orange), pill shape (radius: 9999px)
- Font: Inter SemiBold (600)
- Shadow: 0 10px 40px rgba(254,49,132,0.3)
- Hover: translateY(-2px), shadow intensifies
- Secondary: Ghost with 1px white/20 border

**Icon Containers:**
- Background: rgba(254,49,132,0.1)
- Border: 1px solid rgba(254,49,132,0.2)
- Border-radius: 12px
- Size: 56x56px
- Icon: Thin line (1.5px), pink (#FE3184), 28x28px

**Section Spacing:**
- Between sections: py-24 lg:py-32 (6rem to 8rem)
- Container: max-w-[1200px] mx-auto px-5
- Between components: 2rem to 4rem

**Glow Elements:**
- Background glow orbs: Large blurred circles (pink at 10-20% opacity, orange at 8-15%)
- Icon glow on hover: 0 0 30px rgba(254,49,132,0.3)
- CTA shadow: 0 10px 40px rgba(254,49,132,0.3)

### Step 4: Responsive Considerations
Design at 1440px width (desktop) as the primary viewport. If requested,
also create mobile (375px) and tablet (768px) versions.

Max content width: 1200px, centered.

### Step 5: Output
- Save to `output/` directory as .png
- Default: Full-page screenshot style (1440px wide, height varies by content)
- For hero sections only: 1440x900px
- Name files descriptively: `landing-page-sponsors.png`, `hero-activator.png`

### Step 6: Quality Check
Before delivering, verify:
- [ ] Uses exact brand design tokens (colors, fonts, spacing, shadows, radii)
- [ ] Black backgrounds throughout (NOT navy, NOT light)
- [ ] Cards have full 6-component hover system (at least one card in hover state)
- [ ] Anton headlines are ALWAYS UPPERCASE
- [ ] Section labels are pink (#FE3184), Inter, uppercase
- [ ] CTA buttons use 3-stop gradient with pill shape
- [ ] Glow orbs provide depth in hero/background areas
- [ ] Content is realistic and on-brand (not lorem ipsum)
- [ ] Layout would be implementable in CSS
- [ ] Professional enough for a sponsor presentation

## Chain From
Works best when fed copy from `/direct-response-copy`.
