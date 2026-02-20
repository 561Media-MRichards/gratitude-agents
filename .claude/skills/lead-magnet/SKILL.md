---
name: lead-magnet
description: Generate lead magnet concepts and content that build email lists and convert subscribers into sponsors or activators
argument-hint: "[target stakeholder + awareness level + goal]"
---

# Lead Magnet Skill

## Purpose
Build an opt-in offer so valuable that the right person would pay for it.
Then give it away to start the relationship.

## Load Context
Read `.claude/brand-memory.md`, `brand-kit/positioning-core.yaml`,
`brand-kit/voice-core.md`.

## Step 1: Diagnose the Gap
Ask:
1. Who is this for? (sponsors, activators, nonprofit partners, general audience)
2. What is the #1 problem or desire they have?
3. What do they think the solution is? (this may differ from the real answer)
4. What do we want them to do after consuming the lead magnet?
5. What format works best for this audience?

## Step 2: Generate 5 Concepts
For each concept, provide:
- Format (checklist, guide, calculator, audit, template, mini-course, swipe file, playbook)
- Title (clear benefit, specific promise)
- What they get in 1 sentence
- Why this earns an email address
- Conversion path: lead magnet → next step

**Formats that work well for Gratitude.com's stakeholders:**

For sponsors:
- "The Corporate Impact Activation Playbook: Turn CSR Budget into Documented Results"
- "Impact Metrics That Matter: 12 KPIs Your Board Actually Wants to See"
- "The Sponsorship ROI Calculator: See What Activated Impact Looks Like at Scale"

For activators:
- "The Gratitude Activation Guide: 7 Ways to Turn Your Gratitude into Real Impact"
- "Impact Journal: Track Your Activations and See Your Real-World Difference"

For nonprofit partners:
- "The Partner Funding Playbook: How Activation-Based Sponsorship Works"
- "Scaling Impact: A Guide to Corporate Sponsorship Through Activation Platforms"

## Step 3: Build the Chosen Lead Magnet
Once a concept is selected:
- Write the full content (optimized for the format)
- Include a cover page title and subhead
- Write the opt-in page headline and 3 bullet points
- Write the delivery email (Email 1 of the welcome sequence)

## Step 4: Chain to Next Skill
Recommend running `/email-sequences` to build the welcome sequence
and `/direct-response-copy` for the opt-in landing page.

For designed PDF output, recommend: "Run /deliverable-design with the
lead magnet content to create a branded PDF."

## Output Format
Section 1: 5 concept options
Section 2: Full lead magnet content for selected concept
Section 3: Opt-in page copy
Section 4: Delivery email
