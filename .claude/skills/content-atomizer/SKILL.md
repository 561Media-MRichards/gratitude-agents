---
name: content-atomizer
description: Repurpose one piece of content into platform-native assets for LinkedIn, X, Instagram, TikTok, and YouTube
argument-hint: "[paste content or describe the source piece]"
---

# Content Atomizer Skill

## Purpose
Get maximum distribution from one piece of pillar content without writing
from scratch for every platform.

## Load Context
Read `.claude/brand-memory.md` and `brand-kit/voice-core.md`.
Apply voice before writing anything.

## Input Options
- Blog post or article
- Newsletter issue
- Impact report
- Activation story or case study
- Sponsor testimonial
- Event recap
- Video transcript

## Step 1: Extract the Core
From the source content, identify:
- The single most useful insight (this becomes the hook)
- 3 to 5 supporting points
- Any data, results, or specific numbers worth preserving
- A CTA or takeaway

## Step 2: Atomize by Platform

**LinkedIn**
- Hook post: 150 to 200 words. Strong first line that stops the scroll.
  Line breaks every 1 to 2 sentences. End with a question or CTA.
- Carousel script: 7 slides. Slide 1 = hook. Slides 2 to 6 = one point each.
  Slide 7 = CTA or summary.

**X (Twitter)**
- Thread: 8 to 12 tweets. Tweet 1 = hook with promise of value.
  Tweets 2 to 10 = one point each, self-contained. Final tweet = CTA + link.
- Standalone tweet: Under 280 characters. Punchy. Shareable.

**Instagram**
- Caption: 100 to 150 words. Conversational. 3 to 5 hashtags (relevant, not trending).
- Reel script: 60 to 90 seconds. Hook in first 3 seconds. Educational middle.
  CTA in final 5 seconds.

**TikTok**
- Script: 30 to 60 seconds. Pattern interrupt hook. Teach one thing well. Soft CTA.

**YouTube**
- Short script: 60 seconds. Same structure as TikTok but slightly more depth.
- Video title (under 60 characters, keyword-forward)
- Description (150 to 200 words, CTA in first 2 lines)

## Step 3: Quality Check
- Does every piece match the Gratitude.com voice?
- Is the hook specific and not generic?
- Does each platform version feel native, not copy-pasted?
- Are we using "activate" not "donate," "sponsor" not "fund"?

## Step 4: Chain to Design
If visuals are needed, recommend: "Run /social-creative with the carousel
script or caption to generate platform-ready graphics."

## Output Format
One markdown document organized by platform. All assets in one file.
