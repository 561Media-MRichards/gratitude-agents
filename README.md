# Gratitude Agents

Unified agent system combining marketing content skills with visual design skills for Gratitude.com. Built for Claude Code.

## 14 Skills

### Marketing (9)
| Skill | Command | Purpose |
|-------|---------|---------|
| Orchestrator | `/orchestrator` | Routes to correct skill/workflow |
| Brand Voice | `/brand-voice` | Extract/codify Gratitude voice profiles |
| Positioning Angles | `/positioning-angles` | Find selling angles for campaigns/offers |
| Direct Response Copy | `/direct-response-copy` | High-converting copy (landing pages, ads, emails) |
| Email Sequences | `/email-sequences` | Sponsor onboarding, activation, partner sequences |
| Content Atomizer | `/content-atomizer` | Repurpose content across platforms |
| Lead Magnet | `/lead-magnet` | Opt-in offer concepts and content |
| Newsletter | `/newsletter` | Newsletter issues with one-big-idea structure |
| Gratitude Content Strategy | `/gratitude-content-strategy` | Master content strategy and calendars |

### Design (5)
| Skill | Command | Purpose |
|-------|---------|---------|
| Social Creative | `/social-creative` | Platform-specific social graphics |
| Deliverable Design | `/deliverable-design` | Impact reports, sponsor kits, partner decks |
| Web Mockup | `/web-mockup` | Gratitude.com page mockups with hover system |
| Brand Asset Design | `/brand-asset-design` | OG images, email headers, presentation slides |
| Canvas Art | `/canvas-art` | Artistic compositions with Gratitude glow aesthetic |

## Workflow Chains

```
Social content:      /content-atomizer -> /social-creative
Landing page:        /direct-response-copy -> /web-mockup
Lead magnet PDF:     /lead-magnet -> /deliverable-design
Sponsor kit:         /direct-response-copy -> /deliverable-design
Full campaign:       /positioning-angles -> /direct-response-copy -> /content-atomizer -> /social-creative + /deliverable-design
Newsletter dist:     /newsletter -> /content-atomizer -> /social-creative
Impact report:       /gratitude-content-strategy -> /deliverable-design
```

## Structure

- `.claude/` - Brand memory + all 14 skill definitions
- `brand-kit/` - Brand infrastructure (positioning, voice, visual system, messaging)
- `design-kit/` - Design-specific config (platform specs, templates, typography)
- `canvas-fonts/` - 81 OFL fonts + Anton + Inter
- `logos/` - SVG and PNG logo variants
- `brandguide/` - Standalone HTML brand guide
- `output/` - Generated files (.gitignored)

## Usage

1. Open this repo in Claude Code
2. Type `/orchestrator` and describe your goal
3. Follow the skill chain recommendation
4. Design skills output to `output/`

Every skill chains into the next. Brand memory compounds over time.

---

*Gratitude Agent System v1.0*
