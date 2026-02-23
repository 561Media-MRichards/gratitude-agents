# Gratitude Agents

14 Claude Code skills (9 marketing + 5 design) for Gratitude.com. Every skill loads the brand system automatically — colors, voice, positioning, design tokens — so all output is on-brand from the first run.

**Live resources:**
- Team Hub: [gratitude-agents-hub.vercel.app/agents](https://gratitude-agents-hub.vercel.app/agents)
- Brand Guide: [gratitude-brandguide.vercel.app](https://gratitude-brandguide.vercel.app)
- GitHub: [561Media-MRichards/gratitude-agents](https://github.com/561Media-MRichards/gratitude-agents)

## Quick Start

```bash
# 1. Clone and open in Claude Code
git clone https://github.com/561Media-MRichards/gratitude-agents.git
cd gratitude-agents
claude

# 2. Not sure where to start? Ask the orchestrator
/orchestrator

# 3. Or jump straight to a skill
/direct-response-copy sponsor landing page for Fortune 500 CSR directors
```

## Skills

### Marketing (9)

| Skill | Command | What It Does |
|-------|---------|--------------|
| Orchestrator | `/orchestrator` | Routes you to the right skill or chain based on your goal |
| Brand Voice | `/brand-voice` | 10-question diagnostic to extract/codify voice profiles |
| Positioning Angles | `/positioning-angles` | 5 selling angles with competitive gap analysis |
| Direct Response Copy | `/direct-response-copy` | Landing pages, ads, emails using PAS/AIDA/BAB frameworks |
| Email Sequences | `/email-sequences` | Sponsor welcome (5), activator welcome (4), partner onboarding (5), sales (7), nurture |
| Content Atomizer | `/content-atomizer` | One piece of content into LinkedIn, X, Instagram, TikTok, YouTube assets |
| Lead Magnet | `/lead-magnet` | 5 opt-in concepts with full content, chains to design for PDF |
| Newsletter | `/newsletter` | One-big-idea issues with subject line A/B and audience variants |
| Content Strategy | `/gratitude-content-strategy` | Master strategy: pillars, platform plan, monthly calendars |

### Design (5)

| Skill | Command | What It Does |
|-------|---------|--------------|
| Social Creative | `/social-creative` | Instagram, LinkedIn, X, YouTube graphics with exact brand specs |
| Deliverable Design | `/deliverable-design` | Multi-page PDFs: impact reports, sponsor kits, partner decks, case studies |
| Web Mockup | `/web-mockup` | High-fidelity page mockups with the 6-component hover system |
| Brand Asset Design | `/brand-asset-design` | Slides (1920x1080), email headers, OG images, infographics |
| Canvas Art | `/canvas-art` | Abstract hero backgrounds and campaign key art with glow aesthetic |

## Workflow Chains

Skills chain together — strategy feeds copy, copy feeds design.

| Pipeline | Chain | Use When |
|----------|-------|----------|
| Full Campaign | `/positioning-angles` → `/direct-response-copy` → `/content-atomizer` → `/social-creative` + `/deliverable-design` | Launching a new campaign end-to-end |
| Landing Page | `/direct-response-copy` → `/web-mockup` | Building a conversion page |
| Sponsor Kit | `/direct-response-copy` → `/deliverable-design` | Pitching a new sponsor |
| Lead Magnet PDF | `/lead-magnet` → `/deliverable-design` | Building an opt-in offer |
| Social Content | `/content-atomizer` → `/social-creative` | Repurposing content with matching graphics |
| Newsletter Dist | `/newsletter` → `/content-atomizer` → `/social-creative` | Writing and promoting a newsletter issue |
| Impact Report | `/gratitude-content-strategy` → `/deliverable-design` | Creating a quarterly impact report |

## Repo Structure

```
gratitude-agents/
├── .claude/
│   ├── brand-memory.md              # Shared memory loaded by every skill
│   └── skills/                      # All 14 skill definitions
│       ├── orchestrator/SKILL.md
│       ├── brand-voice/SKILL.md
│       ├── positioning-angles/SKILL.md
│       ├── direct-response-copy/SKILL.md
│       ├── email-sequences/SKILL.md
│       ├── content-atomizer/SKILL.md
│       ├── lead-magnet/SKILL.md
│       ├── newsletter/SKILL.md
│       ├── gratitude-content-strategy/SKILL.md
│       ├── social-creative/SKILL.md
│       ├── deliverable-design/SKILL.md
│       ├── web-mockup/SKILL.md
│       ├── brand-asset-design/SKILL.md
│       └── canvas-art/SKILL.md
├── brand-kit/                       # Brand infrastructure
│   ├── visual-system.json           # Colors, gradients, shadows, hover system, tokens
│   ├── voice-core.md                # Voice rules and tone by channel
│   ├── positioning-core.yaml        # Platform model, stakeholders, differentiators
│   ├── messaging-framework.md       # Key messages per stakeholder
│   ├── constraints-messaging.yaml   # What to never say
│   ├── terminology.yaml             # "activate" not "donate", "sponsor" not "fund"
│   └── _retrieval-rules.yaml        # Which files each skill loads
├── design-kit/                      # Design-specific config
│   ├── platform-specs.yaml          # Dimensions and safe zones per platform
│   ├── typography-guide.md          # Anton (display) + Inter (body) rules
│   ├── illustration-style.md        # Dark/glow art direction
│   ├── canvas-philosophy-library.md # 5 pre-built design philosophies
│   └── template-registry.yaml       # All deliverable types and specs
├── brandguide/                      # Standalone HTML brand guide
│   └── index.html                   # Deployed to gratitude-brandguide.vercel.app
├── hub/                             # Interactive team hub
│   └── agents/index.html            # Deployed to gratitude-agents-hub.vercel.app/agents
├── canvas-fonts/                    # 81 OFL fonts + Anton + Inter
├── logos/                           # SVG and PNG logo variants
├── output/                          # Generated files (.gitignored)
├── scripts/                         # Future canvas helper scripts
└── package.json                     # @napi-rs/canvas + sharp
```

## Brand System (Quick Reference)

| Token | Value |
|-------|-------|
| Pink | `#FE3184` (primary accent) |
| Coral | `#FF6B35` (gradient midpoint) |
| Orange | `#ec7211` (gradient end) |
| Gradient | `linear-gradient(135deg, #FE3184 0%, #FF6B35 50%, #ec7211 100%)` |
| Backgrounds | Pure black `#000000` to `#2a2a2a` (never navy) |
| Display font | Anton 400, always UPPERCASE |
| Body font | Inter 400-700 |
| Text colors | White with opacity: 1.0, 0.80, 0.70, 0.60, 0.50, 0.40 |
| Cards | `linear-gradient(180deg, #1a1a1a, #0d0d0d)`, border `rgba(255,255,255,0.08)` |
| Hover system | 6 components: glow orb, text brightness, icon scale, icon glow, bottom accent, border glow |

## Key Files to Know

- **`brand-kit/visual-system.json`** — The single source of truth for all design tokens. Every design skill reads this.
- **`.claude/brand-memory.md`** — Shared context loaded by every skill. Update this as campaigns run and learnings accumulate.
- **`brand-kit/voice-core.md`** — Voice rules, tone by channel, and the Gratitude writing style.
- **`brand-kit/terminology.yaml`** — Word substitutions enforced across all copy (activate, not donate).

## How It Works

1. You run a skill command (e.g., `/direct-response-copy`)
2. The skill reads `brand-memory.md` + relevant `brand-kit/` files automatically
3. It asks you targeted questions about the brief
4. It produces output following brand rules
5. You chain into the next skill — it picks up context from the previous output
6. Design skills write files to `output/`

Brand memory compounds over time. As you run campaigns and save learnings to `brand-memory.md`, every future skill run gets smarter.

## Dependencies

```bash
npm install   # @napi-rs/canvas + sharp (for design skills)
```

## Deployments

| What | URL | Source |
|------|-----|--------|
| Team Hub | [gratitude-agents-hub.vercel.app/agents](https://gratitude-agents-hub.vercel.app/agents) | `hub/agents/index.html` |
| Brand Guide | [gratitude-brandguide.vercel.app](https://gratitude-brandguide.vercel.app) | `brandguide/index.html` |

---

*Gratitude Agent System v1.0 — Built for Claude Code*
