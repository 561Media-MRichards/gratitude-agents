# Gratitude Agents — Scope & Build Plan

**Owner:** Michael Richards / 561 Media
**Status:** Approved direction — build scope (v1)
**Last updated:** 2026-07-18

---

## 1. What this is (long-term vision)

A durable, brand-trained AI agent platform the **561 team interfaces with to do the
heavy lift on content creation** — so the team can **quickly engage every Gratitude
audience**: end users (activators), corporate sponsors, **investors**, and nonprofit
partners. Output spans copy, email sequences, social content, decks, PDFs, impact
reports, investor materials — and, for **approved users**, **landing pages built and
published directly to the Gratitude side**.

**The speed target:** request → finished, on-brand, ready-to-send asset in minutes,
one approval click away from live. That is the metric the platform is judged on.

### Audience map (who the content engages)

| Audience | What engages them | Producing agents |
|----------|-------------------|------------------|
| **End users / activators** | Challenge & experience campaigns, social content, activation emails, landing pages | Content Atomizer, Email Sequences, Social Creative, Landing Page Builder (reviving `~/Gratitude` concepts: gratitude challenge, micro-experiences) |
| **Corporate sponsors** | Sponsor kits, proposals, impact reports, decks | Positioning Angles, Direct Response Copy, Deliverable Design |
| **Investors** | Pitch deck, one-pager, investor updates, traction narrative | **Investor Relations (NEW — see §3)** |
| **Nonprofit partners** | Partner onboarding, co-branded materials | Email Sequences, Deliverable Design |

Three principles hold across everything:

1. **On-brand by default.** Every agent loads the Gratitude brand system (voice,
   positioning, messaging, constraints, design tokens) before it does anything, so
   output is on-brand from the first run — no re-prompting.
2. **Draft, then act — with a human gate.** Agents can take real actions (generate
   images, post to social, publish a landing page), but **nothing goes live without an
   approved user signing off on the exact output.** The runtime enforces this, not
   prompt discipline.
3. **It compounds.** Every good deliverable and every learning is stored, searchable,
   and reused — the platform gets more useful over time, not less.

This replaces the "one-off Claude session" workflow with a shared, governed system the
whole team pulls from.

---

## 2. Who uses it (access model)

Three roles, enforced by the existing RBAC layer (`lib/permissions.ts`) and carried into
the rebuild.

| Role | Who | Can do |
|------|-----|--------|
| **Admin** | 561 leadership (Michael) | Everything: manage users, approve any action, publish landing pages, see all history/library, manage the brand-kit and knowledgebase |
| **Employee** | 561 team | Run all agents, create/export documents, request actions; **approval-gated** for anything outbound (social posts, landing-page publish). Sees team-shared library + own history |
| **Approved user (partner)** | Vetted Gratitude-side users | Run agents, create documents, **and build landing pages** — but every publish/outbound action is gated on admin/employee approval. Sees only what's shared with them + their own work |

**"Approved user" = the gate for the Gratitude side.** A partner can *draft* a landing
page, but it only reaches gratitude.com after an approver signs off. Un-approved users
get read/draft only, never publish.

---

## 3. What the agents do (capability map)

14 agents today (9 marketing + 5 design) plus one new capability (landing pages).

### Marketing (9) — text generators, some with actions
| Agent | Produces | Action surface |
|-------|----------|----------------|
| Orchestrator | Routes to the right agent/chain | — |
| Brand Voice | Voice profiles / diagnostics | — |
| Positioning Angles | Selling angles + gap analysis | web search |
| Direct Response Copy | Landing/ad/email copy | feeds landing-page builder |
| Email Sequences | Sponsor/activator/partner/sales/nurture flows | **send/schedule via email platform (gated)** |
| Content Atomizer | 1 piece → LinkedIn/X/IG/TikTok/YouTube | **post/schedule social (gated)** |
| Lead Magnet | Opt-in concept + PDF | export + list capture |
| Newsletter | Issues w/ subject A/B | **send via email platform (gated)** |
| Content Strategy | Pillars, calendar, platform plan | — |

### Design (5) — must produce real files (today they only describe them)
| Agent | Produces | Action surface |
|-------|----------|----------------|
| Social Creative | IG/LinkedIn/X/YouTube graphics | **image generation** |
| Deliverable Design | Multi-page PDFs (impact reports, sponsor kits, decks) | **image gen + PDF/PPTX export** |
| Web Mockup | High-fidelity page mockups | **image gen → feeds landing-page builder** |
| Brand Asset Design | Slides, email headers, OG images | **image gen + export** |
| Canvas Art | Hero backgrounds / key art | **image gen** |

### New agent — Investor Relations (gap: no investor coverage exists today)
**The brand kit and all 14 skills have zero investor messaging** — stakeholders today
are sponsors / activators / nonprofits only. Engaging investors requires:
| Produces | Notes |
|----------|-------|
| Pitch deck (narrative + slides via Deliverable Design) | Credibility-and-numbers voice, distinct from activation-energy marketing voice |
| One-pager / teaser | |
| Investor-update emails (monthly/quarterly) | Traction, impact metrics, asks |
| Data-room narrative & FAQ | |

**Prerequisite work item:** add an `investors` stakeholder to `positioning-core.yaml`
and `messaging-framework.md` (voice, proof points, objection responses). Inputs needed
from Michael: raise stage/story, key metrics, the ask.

### New capability — Landing Page Builder & Publisher
Turn a copy + mockup into a **real, deployable landing page** on the Gratitude side.
See §5.

---

## 4. Actions & APIs (the real surface)

Everything the platform touches externally. **Accounts for the Gratitude side do not
exist yet — standing these up is part of the build.**

| Capability | Provider(s) | Notes |
|------------|-------------|-------|
| **LLM (multi-provider)** | Claude + OpenAI + Kimi (Moonshot) | Via **Vercel AI Gateway** (one key, unified billing/observability). **Default everything to Claude** (brand voice was tuned on it); enable per-task OpenAI/Kimi routing only when the eval harness shows a measured quality/cost win — outcome-led, not provider-led |
| **Image generation** | Gemini Imagen / gpt-image-2 | Unstubs the 5 design agents. gpt-image-2 for in-image text, Imagen for general |
| **Social / Meta** | Meta Graph API (+ other channels) | Post + schedule, **approval-gated**. New Meta app + tokens for Gratitude |
| **Landing-page deploy** | Vercel | Publish target on the Gratitude side (see §5) |
| **Email** *(phase 2+)* | Klaviyo or GHL | Only if email-sequences/newsletter go from "draft" to "send" |
| **Knowledgebase** | Neon Postgres + **pgvector** | Semantic memory (see §6) |
| **Document storage** | Vercel Blob / S3 | Move file binaries out of Postgres (see §7) |

---

## 5. Landing Page Builder & Publisher (the new capability)

Lets an **approved user** go from idea → published Gratitude landing page, safely.

**Model: typed page-spec, not free code generation.** The agent never writes arbitrary
Next.js/HTML. It emits a **typed page specification** (JSON: sections, copy, images,
order, constrained styling) rendered by a **fixed registry of approved Gratitude
components** built from the `gratitude-site` design system. This eliminates XSS /
injected-script / dependency risk by construction, keeps every page on-brand, and is
less build effort than reviewing generated code.

**Flow:**
1. **Request** — approved user describes the page (or chains Direct Response Copy →
   Web Mockup).
2. **Build** — agent generates the page spec; the renderer produces the real page from
   approved components.
3. **Preview** — deploys to a **staging/preview URL** first. Nothing touches production.
4. **Approve** — an admin/employee reviews the live preview and approves the exact page
   (`approval: always()` gate).
5. **Publish** — on approval, deploys to the Gratitude production target (a route on
   `gratitude-site`, or a dedicated landing-page project / subdomain — see open
   decisions).
6. **Rollback** — every publish is a versioned deploy; one-click revert.

**Guardrails (non-negotiable):**
- Only **approved users** can invoke the builder; only **admin/employee** can approve a
  publish.
- **Staging preview before production, always.** No direct-to-prod.
- **Brand constraints enforced** — the "what to never say" file is loaded into the
  builder's context (today it isn't; see §6).
- Every publish is logged (who requested, who approved, what deployed, rollback point).

---

## 6. Context engine (upgrade — drives output quality)

Two layers today: **brand retrieval** (inject the right brand files per task) and the
**KB learning loop** (distill conversations into reusable learnings). The concept is
right; the implementation has real gaps.

**Fix in the rebuild:**
1. **Single source of truth.** Retrieval rules are duplicated between
   `brand-context.ts` and `_retrieval-rules.yaml` — AND the agent definitions
   themselves exist twice (`.claude/skills/` vs `.agents/skills/`, already diverged).
   Keep ONE versioned brand-core source, **compile** it into each agent's instructions
   at build time (don't hand-inline 15 copies), and stamp the compiled version/hash on
   every run so output is traceable to the brand-kit version that produced it.
2. **Load the guardrails.** `constraints-messaging.yaml` ("what to never say") is
   declared but **never actually loaded** in the web app (the `load_if_relevant` tier
   isn't implemented). It must be in every agent's base context — especially the
   landing-page builder.
3. **Semantic KB.** Retrieval is recency-based today; move to **pgvector** so the top-K
   learnings injected are the most *relevant* to the request, not just the newest. This
   is what makes the learning loop compound.
4. **Fix the enrichment cost leak.** A failed enrichment never marks the conversation
   `enriched`, so every later message re-fires a failing model call. Fix while porting.

---

## 7. Documents: create, store, reuse

The team needs to *create and reuse* documents long-term, not regenerate from scratch.

- **Create** — exporters produce PDF / PPTX / XLSX / (DOCX) branded deliverables.
- **Store** — output goes to blob storage (not Postgres), in a searchable **library**
  with title, type, owner, tags, and the conversation that produced it.
- **Reuse** — any team member (per visibility rules) can find, re-open, duplicate, or
  regenerate a document. Versioned.
- **Governed** — visibility (`private` / `internal` / `partner`) follows the RBAC model.

---

## 8. Architecture

**Eve agent core + companion Next.js portal.** Eve gives the durable agent runtime,
tool-calling, scheduling, and — critically — first-class approval gating. It does *not*
give us multi-user auth, the team portal, or the document library, so those stay in a
companion app.

```
gratitude/                         # Eve agent (Vercel, Node ≥24)
  agent/agent.ts                   # defineAgent — model routing via AI Gateway
  agent/instructions.md            # orchestrator + inlined brand core (incl. constraints)
  agent/tools/
    search_knowledge.ts            # Neon KB read — semantic (pgvector)
    save_learning.ts               # replaces enrich.ts (cost-leak fixed)
    generate_image.ts              # image gen — unstubs design agents
    build_landing_page.ts          # generate real page -> staging preview
    publish_landing_page.ts        # approval: always() -> production deploy
    post_social.ts / schedule_post.ts   # approval: always()
    export_deck.ts / export_pdf.ts # wrap slides.ts / exporters.ts
  agent/channels/eve.ts            # approval surface for the team

companion-app/                     # Next.js portal (what Eve doesn't provide)
  auth + RBAC (lib/auth.ts, lib/permissions.ts)   # reused from current build
  team portal UI (history, resources, admin)
  document library (blob-backed, versioned)
  Neon + pgvector
```

Landing-page builds reuse the **`gratitude-site` design system and components** so pages
match the live brand.

---

## 9. Governance & approval model

- **Every outbound/publish action is gated:** social post, email send, landing-page
  publish. Draft/preview is free; going live needs an approver.
- **Approver = admin or employee, and requester ≠ approver** (no self-approval;
  admin may override explicitly). Approved users (partners) can request, not approve.
- **Approvals reference an immutable payload hash.** The approver signs off on the
  exact artifact (hash of the payload / preview deploy); publishing promotes that
  artifact — never a regeneration.
- **Audit log** for every gated action: requester, approver, payload hash, timestamp,
  rollback point. **The audit substrate ships with the FIRST gated action**, not later.
- **Brand safety is layered:** constraints file always loaded (context layer) AND
  deterministic preflight checks on outbound content (prohibited claims, unsupported
  metrics, required disclosures) — human approval is the final gate, not the only one.

---

## 10. Accounts & connections to stand up (net-new for Gratitude)

- [ ] **LLM access** — Vercel AI Gateway key (routes Claude + OpenAI + Kimi), or direct
      provider keys (Anthropic, OpenAI, Moonshot/Kimi) if not using the gateway.
- [ ] **Image generation** — Gemini Imagen and/or gpt-image-2 key.
- [ ] **Meta app + tokens** — Gratitude-owned Meta app for social posting/scheduling
      (+ any other channels in scope).
- [ ] **Deploy target** — Vercel project + domain/subdomain for published landing pages
      (decision in §12).
- [ ] **Neon** — enable `pgvector` on the Gratitude DB.
- [ ] **Blob storage** — Vercel Blob (or S3) for the document library.

---

## 11. Roadmap (phased)

*(Resequenced 7/18 after three-way review — Kimi K3 + Codex GPT-5.6 + Claude. Core
change: the approval/audit substrate lands with the FIRST gated action; account
provisioning starts day one; landing pages moved after social.)*

| Phase | Goal | Key work |
|-------|------|----------|
| **0 — Stabilize + provision** | Clean base; long-lead items started | Fix enrichment cost leak + auto-approval + write-authz + blob-projection + history cap *(DONE 7/18)*; **start ALL §10 account provisioning now** (Meta app review takes weeks); enable pgvector + add embedding column in first migration (cheap now, painful backfill later); resolve `gratitude-site` uncommitted work; **1-day Eve validation spike:** confirm the approval primitive supports an externally-supplied approver identity (portal button, not chat message) — if not, fall back to AI SDK + own tool loop |
| **1 — Eve pilot + context SSOT + evals** | One agent, done right, measured | Stand up `email-sequences` on Eve (Claude via AI SDK); compile brand core from ONE source (kills `.claude/skills` vs `.agents/skills` and TS-vs-YAML drift); **constraints always loaded**; **golden-prompt eval set per agent** (voice parity is measured, not vibes); fix KB save-quality (re-enrichment cadence, draft-by-default review queue). **Add `investors` stakeholder to brand kit** (needs Michael's raise inputs — external dependency, date it) |
| **2 — Image gen (alone)** | Design agents produce real files | Wire image-gen tool; unstub the 5 design agents; brand-font embedding in exporters (PDF is Helvetica, PPTX maps Anton→Impact today — not brand-grade). Biggest daily-value unlock; ships solo |
| **3 — Approval substrate + gated social** | First real outbound action, safely | Immutable action intents (payload hash), requester≠approver, audit log table, Eve↔portal identity bridge; then `post_social`/`schedule_post` on the Meta app provisioned in Phase 0. Social first: simpler than pages, daily-frequency value, no external repo dependency |
| **4 — Landing-page builder** | Approved-user page publishing | Typed page-spec + approved component registry (see §5); staging previews; approval-gated versioned publish to dedicated project/subdomain; automated security/accessibility preflight |
| **5 — Portal + library + rollout** | Team-ready | Companion portal (RBAC, history), semantic KB rerank (embeddings already accumulating since Phase 0), document library on blob storage, **Investor Relations agent** ships once verified metrics/claims exist, onboard approved users. Multi-provider routing (OpenAI/Kimi) only when evals show a quality/cost win |

---

## 12. Open decisions

1. **LLM routing** — Vercel AI Gateway (recommended) vs. direct provider keys.
2. **Landing-page publish target** — routes inside `gratitude-site` vs. a dedicated
   landing-page Vercel project vs. a `*.gratitude.com` subdomain. (Recommendation: a
   dedicated project/subdomain so agent-published pages can't destabilize the main
   site.)
3. **Meta app ownership** — new Gratitude-owned app vs. reuse 561's business manager.
4. **Email actions** — do email-sequences/newsletter actually *send* (Klaviyo/GHL), or
   stay draft-only for now?
