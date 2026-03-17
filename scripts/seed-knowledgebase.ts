import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { knowledgebaseEntries } from "../db/schema";
import { config } from "dotenv";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const entries = [
  // === POSITIONING & PLATFORM MODEL ===
  {
    agentId: "orchestrator",
    category: "strategy_learning" as const,
    title: "Gratitude.com Platform Model — Three-Sided Marketplace",
    content:
      "Gratitude.com is a three-sided impact technology platform. Sponsors (companies) fund impact through sponsorship. Activators (people) activate gratitude through action. Impact Partners (nonprofits/causes) receive delivered impact. This is NOT a donation platform — it's an activation engine.",
    tags: ["platform-model", "positioning", "core"],
  },
  {
    agentId: "orchestrator",
    category: "strategy_learning" as const,
    title: "Core Positioning Statement",
    content:
      'For companies that want their social impact to be real, measurable, and activated by real people, Gratitude.com is the platform that turns corporate goodwill into delivered outcomes. We\'re not a donation portal. We\'re an activation engine. Tagline: "Gratitude isn\'t just felt. It\'s delivered."',
    tags: ["positioning", "tagline", "value-prop"],
  },
  {
    agentId: "positioning-angles",
    category: "strategy_learning" as const,
    title: "Five Key Differentiators",
    content:
      "1) Real activation, not passive donation — people participate. 2) Instant delivery at scale — technology-driven. 3) Measurable outcomes — every act documented. 4) Corporate sponsorship model — brands fund impact, not individuals. 5) Bridges corporate CSR and personal meaning.",
    tags: ["differentiators", "competitive", "positioning"],
  },

  // === VOICE & MESSAGING ===
  {
    agentId: "brand-voice",
    category: "content_insight" as const,
    title: "Brand Voice Profile — Action-Oriented, Impact-Focused",
    content:
      "Gratitude.com sounds like someone who has already done the work and seen the results. Action-oriented, impact-focused, professional yet warm, and confident. Bold statements, not hedging language. Short sentences preferred. No em dashes. Lead with what was delivered, back with how.",
    tags: ["voice", "tone", "writing-style"],
  },
  {
    agentId: "brand-voice",
    category: "content_insight" as const,
    title: "Tone by Channel — Context-Specific Voice",
    content:
      "Sponsor comms: strategic, ROI-forward, partnership language. Activator messaging: warm, empowering, action-oriented. Nonprofit/partner: respectful, collaborative, impact-focused. Website: confident, conversion-focused, emotionally resonant. Social: punchy, inspiring, shareable. Impact reports: data-forward, credibility-first. Ads: problem-aware, benefit-led, strong CTA.",
    tags: ["tone", "channels", "voice-guide"],
  },
  {
    agentId: "brand-voice",
    category: "content_insight" as const,
    title: "Key Brand Phrases",
    content:
      'Five core phrases to use across all content: 1) "Gratitude isn\'t just felt. It\'s delivered." 2) "Activate gratitude as a force for good" 3) "Companies sponsor. People activate. Impact is delivered." 4) "Turn gratitude into action" 5) "Delivered into the world instantly and at scale."',
    tags: ["phrases", "copy", "messaging"],
  },

  // === TERMINOLOGY ===
  {
    agentId: "brand-voice",
    category: "content_insight" as const,
    title: "Terminology Rules — Words We Use vs. Words We Don't",
    content:
      'Always say "activate" not "donate." Say "sponsor" not "fund." Say "activator" not "donor/user." Say "impact" not "charity." Say "delivered" not "distributed." Say "activation" not "transaction." Say "impact partner" not "charity/beneficiary." Say "sponsor kit" not "media kit." Say "impact report" not "annual report." Always include .com in "Gratitude.com."',
    tags: ["terminology", "vocabulary", "brand-language"],
  },
  {
    agentId: "brand-voice",
    category: "content_insight" as const,
    title: "Corporate Jargon Replacements",
    content:
      'Replace corporate jargon with plain language: "leverage" → "use," "utilize" → "use," "synergies" → "working together," "scalable" → "built to grow," "ecosystem" → "platform," "actionable" → "useful," "circle back" → "follow up," "deep dive" → "detailed look," "move the needle" → "make a difference," "give back" → "activate impact," "make a donation" → "activate gratitude."',
    tags: ["terminology", "plain-language", "writing-rules"],
  },

  // === MESSAGING FRAMEWORK ===
  {
    agentId: "direct-response-copy",
    category: "strategy_learning" as const,
    title: "Messaging by Stakeholder — Sponsors",
    content:
      "For sponsors (corporate partners): Your CSR budget deserves real outcomes. Not a logo on a banner. Not a line item in an annual report. Gratitude.com turns your sponsorship into activated impact that people participate in, documented with real numbers you can report to your board.",
    tags: ["sponsors", "messaging", "B2B"],
  },
  {
    agentId: "direct-response-copy",
    category: "strategy_learning" as const,
    title: "Messaging by Stakeholder — Activators",
    content:
      "For activators (individuals): Gratitude is something you do, not just something you feel. In seconds, you can activate real impact — funded by companies, delivered to people and causes that need it. Every act is tracked. Every result is real.",
    tags: ["activators", "messaging", "B2C"],
  },
  {
    agentId: "direct-response-copy",
    category: "strategy_learning" as const,
    title: "Messaging by Stakeholder — Nonprofits",
    content:
      "For nonprofits (impact partners): Stop chasing individual donors. Gratitude.com connects you with corporate sponsors and activated communities at scale. Reliable funding, real participation, documented outcomes.",
    tags: ["nonprofits", "messaging", "partnerships"],
  },
  {
    agentId: "direct-response-copy",
    category: "strategy_learning" as const,
    title: "Objection Handling Framework",
    content:
      'Five key objections and responses: 1) "How is this different from donation?" → Donations are passive, we activate real participation. 2) "We have CSR already" → Your current program measures dollars spent, we measure impact delivered. 3) "Can you prove impact?" → Every activation is documented, dashboards not brochures. 4) "Employees won\'t engage" → Zero-friction activation, seconds not hours. 5) "No budget" → Replaces existing CSR spend with measurable outcomes.',
    tags: ["objections", "sales", "sponsor-acquisition"],
  },

  // === CONSTRAINTS ===
  {
    agentId: "brand-voice",
    category: "content_insight" as const,
    title: "Content Guardrails — What We Never Do",
    content:
      'Never claim grandiose impact without data. Never guarantee ROI on social impact. Never sound like a charity asking for donations, a tech startup overhyping, a corporate CSR press release, or a vague wellness brand. Never be sycophantic in sponsor comms. Never send deliverables without clear next steps. No passive voice in CTAs. No filler openers like "Hope this finds you well." Never guilt activators into action — inspire them.',
    tags: ["guardrails", "constraints", "brand-safety"],
  },

  // === VISUAL SYSTEM ===
  {
    agentId: "social-creative",
    category: "design_pattern" as const,
    title: "Brand Color System — Pink/Coral/Orange on Black",
    content:
      "Primary gradient: 135deg #FE3184 (pink) → #FF6B35 (coral) → #ec7211 (orange). Backgrounds: pure black #000000 to #2a2a2a — NEVER navy. Text: white with opacity scale (1.0, 0.80, 0.70, 0.60, 0.50, 0.40). Extended palette includes pink-400 (#FF4D8D), pink-600 (#E82878), coral-400 (#FF8C5A), coral-600 (#E85A2A).",
    tags: ["colors", "palette", "visual-system"],
  },
  {
    agentId: "social-creative",
    category: "design_pattern" as const,
    title: "Typography System — Anton + Inter",
    content:
      "Display font: Anton (weight 400 only, ALWAYS uppercase). Body font: Inter (weights 400-700). Type scale: display-2xl (120px) through XS (12px). Display fonts get tight line heights (0.95-1.15). Body gets relaxed line heights (1.65-1.7). Section labels: 14px Inter semibold, uppercase, 0.1em letter spacing, pink color.",
    tags: ["typography", "fonts", "type-scale"],
  },
  {
    agentId: "web-mockup",
    category: "design_pattern" as const,
    title: "6-Component Hover System for Cards",
    content:
      "All interactive cards use 6 hover components: 1) Glow orb — background radial gradient fades in from corner (0.7s). 2) Text brightness — opacity increases from 50-60% to 70-80% (0.3s). 3) Icon scale — scales up to 110% (0.5s). 4) Icon glow — container gets pink shadow + border (0.5s). 5) Bottom accent — gradient line scales in from center (0.5s). 6) Border glow — inset border + outer pink shadow appears (0.5s).",
    tags: ["hover-system", "interaction", "cards", "animation"],
  },
  {
    agentId: "web-mockup",
    category: "design_pattern" as const,
    title: "Card & Button Component Specs",
    content:
      "Cards: gradient bg (180deg #1a1a1a → #0d0d0d), 1px border rgba(255,255,255,0.08), rounded-2xl, hover lifts -8px with shadow. Primary buttons: gradient pill (pink→coral→orange), rounded-full, shadow 0 10px 40px rgba(254,49,132,0.3), hover lifts -2px. Secondary buttons: transparent, white/20 border, hover gets white/5 bg. Icon containers: 56x56px, rounded-xl, pink/10 bg, pink/20 border.",
    tags: ["components", "buttons", "cards", "UI"],
  },
  {
    agentId: "canvas-art",
    category: "design_pattern" as const,
    title: "Glow & Background Effects",
    content:
      "Hero backgrounds use layered radial gradients: pink glow (top center, blur 150px, 60% opacity), orange glow (right side, blur 120px), secondary pink (bottom-left, blur 100px). Grid overlay: 60px grid lines at 3% white opacity. Glow shadows: icons get 0 0 30px rgba(254,49,132,0.3), CTAs get 0 10px 40px. Background dividers: subtle gradient fade or pink accent gradient.",
    tags: ["glow", "backgrounds", "effects", "hero"],
  },

  // === PLATFORM SPECS ===
  {
    agentId: "social-creative",
    category: "design_pattern" as const,
    title: "Social Platform Dimensions Quick Reference",
    content:
      "Instagram post square: 1080x1080 (60px safe zones). Instagram portrait: 1080x1350. Instagram story: 1080x1920 (top 200px and bottom 280px are UI zones). LinkedIn landscape: 1200x627 (40px safe zones). Facebook post: 1200x630. X/Twitter: 1200x675. YouTube thumbnail: 1280x720 (bottom-right has timestamp). Carousel: 1080x1080 per slide. Logo placement: bottom-right, 40px margin, max 120px wide.",
    tags: ["dimensions", "platforms", "social-media", "specs"],
  },

  // === WORKFLOW KNOWLEDGE ===
  {
    agentId: "orchestrator",
    category: "strategy_learning" as const,
    title: "Agent Workflow Chains — Marketing + Design Pipelines",
    content:
      "Key pipelines: Social content with graphics = content-atomizer → social-creative. Landing page with design = direct-response-copy → web-mockup. Lead magnet PDF = lead-magnet → deliverable-design. Sponsor kit = direct-response-copy → deliverable-design. Full campaign = positioning-angles → direct-response-copy → content-atomizer → social-creative + deliverable-design. Newsletter distribution = newsletter → content-atomizer → social-creative.",
    tags: ["workflows", "pipelines", "agent-chains"],
  },
  {
    agentId: "email-sequences",
    category: "strategy_learning" as const,
    title: "Email Sequence Types Available",
    content:
      "Five sequence types: 1) Sponsor welcome (5 emails) — onboarding new corporate sponsors. 2) Activator welcome (4 emails) — engaging new activators. 3) Partner onboarding (5 emails) — nonprofit partner setup. 4) Sales sequence (7 emails) — sponsor acquisition. 5) Nurture sequence — ongoing engagement. All follow voice-core rules: no filler openers, clear next steps, action-oriented CTAs.",
    tags: ["email", "sequences", "automation"],
  },
  {
    agentId: "content-atomizer",
    category: "content_insight" as const,
    title: "Content Atomization Strategy — 1 Piece → 5 Platforms",
    content:
      "Take one piece of source content and repurpose into platform-native assets for: LinkedIn (professional, data-forward), X/Twitter (punchy, thread-ready), Instagram (visual-first, inspiring), TikTok (short-form, hook-driven), YouTube (long-form, authority-building). Each platform gets its own tone, format, and CTA style per the messaging framework.",
    tags: ["content-strategy", "repurposing", "social-media"],
  },
  {
    agentId: "gratitude-content-strategy",
    category: "strategy_learning" as const,
    title: "Channel-to-Message Map",
    content:
      "Website homepage: lead with value prop, support with platform model + social proof. Sponsor landing pages: lead with ROI, support with case studies. Activator pages: lead with ease and meaning, support with impact stories. LinkedIn: impact data or insight. Instagram: visual impact stories. Email to sponsors: one measurable outcome. Email to activators: one impact story. Ads: problem-aware hook. Impact reports: result headline. Partner decks: platform model + differentiation.",
    tags: ["channel-strategy", "messaging-map", "content-planning"],
  },
];

async function seed() {
  console.log(`Seeding ${entries.length} knowledgebase entries...`);

  for (const entry of entries) {
    await db.insert(knowledgebaseEntries).values(entry);
    console.log(`  ✓ ${entry.title}`);
  }

  console.log("\nDone! Knowledgebase seeded.");
}

seed().catch(console.error);
