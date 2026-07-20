import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
config({ path: ".env.local", quiet: true });
const sql = neon(process.env.DATABASE_URL);

async function embed(text) {
  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
    body: JSON.stringify({ content: { parts: [{ text }] }, outputDimensionality: 768 }),
  });
  const v = (await res.json()).embedding.values;
  const n = Math.sqrt(v.reduce((a, x) => a + x * x, 0)) || 1;
  return `[${v.map((x) => x / n).join(",")}]`;
}

const ENTRIES = [
  ["2026 raise: $3-5M Friends & Family SAFE round", "Gratitude.com is raising $3-5M on a SAFE in a 2026 Friends & Family round. Use of funds: 60% Product & Engineering, 20% Growth & Partnerships, 10% Operations, 10% Partner Network. Valuation/cap and committed capital are not yet published; mark [NEEDS INPUT] rather than inventing."],
  ["Dual structure: Gratitude.com PBC + ActivateGratitude.org 501(c)(3)", "Gratitude.com is a Public Benefit Corporation that builds the platform (technology, enterprise customers, consumer experience, revenue, scale). ActivateGratitude.org is a 501(c)(3) public charity that activates impact (receives donations, funds nonprofit partners, delivers verified acts). One creates enterprise value, the other creates public trust."],
  ["Founder and investor contact: Michael Hilf", "Michael Hilf is Founder & CEO of Gratitude.com. Investor contact: mhilf@gratitude.com. All investor materials carry the footer: Michael Hilf, Founder & CEO, mhilf@gratitude.com, GRATITUDE.COM."],
  ["Investor positioning: the Human Acknowledgment category", "Investor narrative positions Gratitude.com as category creation, not competition: the first platform turning gratitude into measurable impact, building shared behavioral infrastructure for human acknowledgment. AI angle: AI will reshape how we work; Gratitude.com will reshape how we connect."],
  ["Flagship mechanic for investors: Tell Them (Express, Activate, Multiply)", "The flagship experience: Express (send a message to someone who changed your life), Activate (a pre-funded act of real-world impact triggers instantly through trusted nonprofit partners), Multiply (the recipient experiences both and is inspired to Tell Them). Tagline: Every message changes two lives."],
  ["Market frames used with investors: $600B+ and $500B+", "Approved market frames: Wellbeing and employee engagement spend $600B+ (the budgets already exist) and social impact and philanthropy $500B+ (connecting existing capital, not creating a new market). Expansion path: individuals to organizations to communities to institutions."],
  ["24-month roadmap shown to investors", "Launch (60-90 days): MVP live, first enterprise customers, first nonprofit partners. Validate (months 1-6): thousands of verified activations, demonstrated enterprise value, proven repeatable model. Scale (18-24 months): millions of participants, global nonprofit ecosystem, category leadership. Framing: this round proves the model, the next scales it."],
  ["Investor voice rules", "Investor-facing materials use a credibility-and-numbers voice: confident, declarative, zero hype qualifiers, US spelling (acknowledgment), no em dashes. Never invent metrics, traction, valuations, or projections; anything not in brand-kit/investor-core.yaml is [NEEDS INPUT]."],
];

const [owner] = await sql`select id from users where email = 'mrichards@561media.com'`;
let added = 0;
for (const [title, content] of ENTRIES) {
  const [dup] = await sql`select 1 from knowledgebase_entries where title = ${title} limit 1`;
  if (dup) continue;
  const vec = await embed(title + "\n" + content);
  await sql`insert into knowledgebase_entries
    (owner_id, agent_id, category, status, visibility, title, content, tags, source_type, embedding)
    values (${owner.id}, 'orchestrator', 'strategy_learning', 'approved', 'internal',
            ${title}, ${content}, ${JSON.stringify(["investor", "raise-2026"])}::jsonb,
            'manual', ${vec}::vector)`;
  added++;
  await new Promise((r) => setTimeout(r, 120));
}
console.log("investor KB entries added:", added);
process.exit(0);
