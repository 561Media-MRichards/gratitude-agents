---
name: brand-voice
description: Define or extract a consistent brand voice for Gratitude.com or a partner
argument-hint: "[partner name] or 'us' for Gratitude.com"
---

# Brand Voice Skill

## Purpose
Extract, define, and codify a brand voice. Output a reusable voice profile
that every other skill can reference.

## Load Context
Read `.claude/brand-memory.md` and `brand-kit/voice-core.md` before starting.

## Process

### Step 1: Source Collection
Ask for 3 to 5 examples of existing content: emails, website copy, social posts,
impact reports, anything written in their voice. If nothing exists, run the diagnostic:

Ask these 10 questions:
1. Describe your brand in 3 words.
2. Who is your primary audience? Be specific.
3. What do your best sponsors/partners say about working with you?
4. Name a brand outside your industry whose voice you admire.
5. What do similar platforms say that you would never say?
6. Formal or casual? Expert or peer?
7. Do you use humor? If so, what kind?
8. What's the one thing you want every reader to feel after consuming your content?
9. What topics or phrases are completely off-limits?
10. If your brand were a person at a dinner party, how would they show up?

### Step 2: Voice Extraction
Analyze the samples or answers for:
- Sentence length and rhythm
- Vocabulary complexity and preferred words
- Tone markers (authoritative, warm, playful, serious)
- POV (we/you/I)
- What they avoid
- Formatting patterns (headers, bullet points, length)

### Step 3: Voice Profile Output

Deliver a structured voice profile with:

**Voice Dimensions** (rate each on a 1-5 spectrum)
- Formal <-> Casual
- Expert <-> Peer
- Serious <-> Playful
- Brief <-> Expansive
- Assertive <-> Exploratory

**Word Bank**
- 10 words or phrases that belong in this voice
- 10 words or phrases that do not

**Tone Guide by Channel**
- Website, email (sponsor), email (activator), social, impact reports, ads

**3 Before / After Rewrites**
Show the same copy in generic AI voice vs. brand voice

**Voice Summary (one paragraph)**
Paste-ready for any brief or prompt

### Step 4: Save to Memory
Append the completed voice profile to `.claude/brand-memory.md` under
the partner name or "Gratitude.com Voice."

## Output Format
One markdown document: "[Name] Voice Profile"
