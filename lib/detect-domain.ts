/**
 * Lightweight keyword classifier that maps conversation content
 * to the most relevant specialist agent ID.
 *
 * This runs on every request for the unified "gratitude" agent so it
 * must be zero-latency (no API calls). The keyword map mirrors the
 * orchestrator's routing table in .claude/skills/orchestrator/SKILL.md.
 */

interface DomainMatch {
  agentId: string;
  score: number;
}

const DOMAIN_KEYWORDS: Record<string, string[]> = {
  // Marketing specialists
  "positioning-angles": [
    "positioning", "angle", "value prop", "differentiator", "competitive",
    "sponsor acquisition", "unique selling", "usp", "pitch angle",
    "market position", "competitive advantage",
  ],
  "direct-response-copy": [
    "landing page", "copy", "headline", "cta", "call to action",
    "sales page", "sponsor pitch", "page copy", "website copy",
    "conversion copy", "persuasive", "copywriting", "ad copy",
    "pitch deck", "sponsor kit", "one-pager",
  ],
  "email-sequences": [
    "email", "sequence", "drip", "nurture", "onboarding email",
    "welcome series", "follow-up", "outreach", "cold email",
    "email campaign", "subject line",
  ],
  "content-atomizer": [
    "repurpose", "atomize", "break down", "social posts from",
    "turn into posts", "content pieces", "slice", "redistribute",
    "social content", "content calendar",
  ],
  "lead-magnet": [
    "lead magnet", "pdf", "guide", "checklist", "download",
    "ebook", "whitepaper", "free resource", "gated content",
  ],
  "newsletter": [
    "newsletter", "digest", "weekly update", "monthly update",
    "subscriber", "email blast",
  ],
  "gratitude-content-strategy": [
    "content strategy", "editorial", "thought leadership",
    "authority", "blog strategy", "content plan", "pillar content",
    "content roadmap",
  ],
  "brand-voice": [
    "brand voice", "tone of voice", "messaging guide", "voice guide",
    "how we sound", "brand personality", "writing style",
  ],

  // Design specialists
  "social-creative": [
    "social graphic", "instagram", "facebook post", "linkedin graphic",
    "social media design", "post graphic", "carousel", "story design",
    "social visual",
  ],
  "deliverable-design": [
    "sponsor kit design", "impact report", "deck design",
    "presentation design", "report layout", "formatted document",
    "designed pdf", "brochure",
  ],
  "web-mockup": [
    "mockup", "wireframe", "page design", "layout", "landing page design",
    "web design", "homepage design", "ui design",
  ],
  "brand-asset-design": [
    "slide", "email header", "og image", "open graph", "banner",
    "header image", "presentation slide", "social banner",
  ],
  "canvas-art": [
    "hero art", "abstract", "key visual", "illustration",
    "campaign visual", "artistic", "canvas", "generative art",
  ],
};

/**
 * Scans recent user messages and returns the best-matching specialist
 * agent ID, or null if no strong match is found.
 */
export function detectSpecialistDomain(
  msgs: { role: string; content: string }[]
): string | null {
  // Only look at user messages (last 6 max to keep it focused)
  const userText = msgs
    .filter((m) => m.role === "user")
    .slice(-6)
    .map((m) => m.content.toLowerCase())
    .join(" ");

  if (!userText.trim()) return null;

  const scores: DomainMatch[] = [];

  for (const [agentId, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (userText.includes(keyword)) {
        // Longer keywords are more specific, weight them higher
        score += keyword.split(" ").length;
      }
    }
    if (score > 0) {
      scores.push({ agentId, score });
    }
  }

  if (scores.length === 0) return null;

  scores.sort((a, b) => b.score - a.score);

  // Only return if the top match has a meaningful score (at least 2 keyword-words matched)
  const best = scores[0];
  if (best.score < 2) return null;

  return best.agentId;
}
