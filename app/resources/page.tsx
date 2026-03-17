import Image from "next/image";
import Link from "next/link";

const MARKETING_AGENTS = [
  {
    name: "Orchestrator",
    id: "orchestrator",
    type: "System",
    description:
      "Don't know where to start? Tell this agent your goal and it will recommend which agent(s) to use and in what order.",
  },
  {
    name: "Brand Voice",
    id: "brand-voice",
    type: "Marketing",
    description:
      "Extract or define voice profiles for Gratitude.com or partners. Outputs a reusable voice profile with dimensions, word banks, tone guides, and before/after rewrites.",
  },
  {
    name: "Positioning Angles",
    id: "positioning-angles",
    type: "Marketing",
    description:
      "Find the angle that makes a campaign, offer, or partnership actually convert. Delivers 5 selling angles with competitive gap analysis.",
  },
  {
    name: "Direct Response Copy",
    id: "direct-response-copy",
    type: "Marketing",
    description:
      "Write high-converting copy for landing pages, ads, emails, and sponsor pitches using PAS, AIDA, and BAB frameworks.",
  },
  {
    name: "Email Sequences",
    id: "email-sequences",
    type: "Marketing",
    description:
      "Build sponsor welcome (5 emails), activator welcome (4), partner onboarding (5), sales (7), and nurture sequences.",
  },
  {
    name: "Content Atomizer",
    id: "content-atomizer",
    type: "Marketing",
    description:
      "Take one piece of content and repurpose it into platform-native assets for LinkedIn, X, Instagram, TikTok, and YouTube.",
  },
  {
    name: "Lead Magnet",
    id: "lead-magnet",
    type: "Marketing",
    description:
      "Generate 5 opt-in concepts with full content. Designed to build email lists and convert subscribers into sponsors or activators.",
  },
  {
    name: "Newsletter",
    id: "newsletter",
    type: "Marketing",
    description:
      "Create newsletters with subject line A/B variants and audience-specific versions for sponsors, activators, and partners.",
  },
  {
    name: "Content Strategy",
    id: "gratitude-content-strategy",
    type: "Marketing",
    description:
      "Master content strategy with pillars, platform plans, and monthly calendars. The context file for all Gratitude content.",
  },
];

const DESIGN_AGENTS = [
  {
    name: "Social Creative",
    id: "social-creative",
    type: "Design",
    description:
      "Instagram, LinkedIn, X, YouTube graphics. Provides specs for dimensions, safe zones, typography, color values, and composition.",
  },
  {
    name: "Deliverable Design",
    id: "deliverable-design",
    type: "Design",
    description:
      "Multi-page branded PDFs: impact reports, sponsor kits, partner decks, case studies, and lead magnet layouts.",
  },
  {
    name: "Web Mockup",
    id: "web-mockup",
    type: "Design",
    description:
      "High-fidelity page mockups with the full 6-component hover system and dark glow aesthetic for gratitude.com pages.",
  },
  {
    name: "Brand Asset Design",
    id: "brand-asset-design",
    type: "Design",
    description:
      "Presentation slides (1920x1080), email headers, OG images, infographics, and other visual collateral specs.",
  },
  {
    name: "Canvas Art",
    id: "canvas-art",
    type: "Design",
    description:
      "Abstract hero backgrounds, campaign key visuals, and creative compositions using the Gratitude glow aesthetic.",
  },
];

const WORKFLOWS = [
  {
    name: "Social Content with Graphics",
    flow: "Content Atomizer → Social Creative",
    use: "Turn a blog post, report, or any content into social posts with design specs",
  },
  {
    name: "Landing Page with Design",
    flow: "Direct Response Copy → Web Mockup",
    use: "Write conversion copy then get a full page mockup with hover system",
  },
  {
    name: "Lead Magnet PDF",
    flow: "Lead Magnet → Deliverable Design",
    use: "Generate opt-in content then get the PDF layout and design specs",
  },
  {
    name: "Sponsor Kit",
    flow: "Direct Response Copy → Deliverable Design",
    use: "Write sponsor-facing copy then design the deck",
  },
  {
    name: "Full Campaign",
    flow: "Positioning Angles → Direct Response Copy → Content Atomizer → Social Creative",
    use: "End-to-end campaign from angle discovery to social-ready assets",
  },
  {
    name: "Newsletter Distribution",
    flow: "Newsletter → Content Atomizer → Social Creative",
    use: "Write a newsletter then repurpose it across social platforms",
  },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <header className="border-b border-white/[0.06] bg-dark-900/50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/gratitude-white.svg"
              alt="Gratitude"
              width={130}
              height={26}
            />
            <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-brand-pink">
              RESOURCES
            </span>
          </div>
          <Link
            href="/chat"
            className="text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            &larr; Back to Chat
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="mb-16 text-center">
          <h1 className="font-display text-4xl md:text-5xl uppercase text-gradient mb-4">
            HOW TO USE AGENTS
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
            14 AI agents trained on the full Gratitude.com brand system.
            Every response comes back on-brand automatically.
          </p>
        </div>

        {/* Getting Started */}
        <section className="mb-16">
          <h2 className="font-display text-2xl uppercase text-gradient mb-6">
            GETTING STARTED
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                step: "01",
                title: "Pick an Agent",
                desc: "Choose from the sidebar. Not sure which one? Start with the Orchestrator and describe your goal.",
              },
              {
                step: "02",
                title: "Describe Your Goal",
                desc: "Be specific about what you need: the audience, format, purpose, and any constraints. The more context, the better the output.",
              },
              {
                step: "03",
                title: "Iterate & Chain",
                desc: "Refine the output in the same conversation. Then take the result to the next agent in the chain for design or distribution.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="p-6 rounded-xl border border-white/[0.06] transition-all hover:border-white/[0.12]"
                style={{
                  background:
                    "linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%)",
                }}
              >
                <span className="font-display text-3xl text-brand-pink/60">
                  {item.step}
                </span>
                <h3 className="text-white/90 font-semibold mt-2 mb-2">
                  {item.title}
                </h3>
                <p className="text-[14px] text-white/45 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Agent Directory */}
        <section className="mb-16">
          <h2 className="font-display text-2xl uppercase text-gradient mb-6">
            AGENT DIRECTORY
          </h2>

          {/* System + Marketing */}
          <div className="mb-8">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/30 mb-4">
              System & Marketing Agents
            </h3>
            <div className="space-y-3">
              {MARKETING_AGENTS.map((agent) => (
                <div
                  key={agent.id}
                  className="p-4 rounded-xl border border-white/[0.06] hover:border-white/[0.12] transition-all"
                  style={{
                    background:
                      "linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-sm mt-0.5">
                      {agent.type === "System" ? "\u2699\uFE0F" : "\uD83D\uDCC8"}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-[15px] font-semibold text-white/90">
                          {agent.name}
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-white/30 border border-white/[0.04]">
                          {agent.type}
                        </span>
                      </div>
                      <p className="text-[13px] text-white/45 mt-1 leading-relaxed">
                        {agent.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Design */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/30 mb-4">
              Design Agents
              <span className="text-brand-orange ml-2 normal-case tracking-normal">
                — Web Mode: specs & direction only
              </span>
            </h3>
            <div className="space-y-3">
              {DESIGN_AGENTS.map((agent) => (
                <div
                  key={agent.id}
                  className="p-4 rounded-xl border border-white/[0.06] hover:border-white/[0.12] transition-all"
                  style={{
                    background:
                      "linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-sm mt-0.5">{"\uD83C\uDFA8"}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-[15px] font-semibold text-white/90">
                          {agent.name}
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-orange/10 text-brand-orange border border-brand-orange/20">
                          Design
                        </span>
                      </div>
                      <p className="text-[13px] text-white/45 mt-1 leading-relaxed">
                        {agent.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Workflow Chains */}
        <section className="mb-16">
          <h2 className="font-display text-2xl uppercase text-gradient mb-6">
            WORKFLOW CHAINS
          </h2>
          <p className="text-[14px] text-white/45 mb-6 leading-relaxed">
            Agents are designed to chain together. Run the first agent, then
            take its output to the next agent in the pipeline.
          </p>
          <div className="space-y-3">
            {WORKFLOWS.map((wf) => (
              <div
                key={wf.name}
                className="p-5 rounded-xl border border-white/[0.06] hover:border-white/[0.12] transition-all"
                style={{
                  background:
                    "linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%)",
                }}
              >
                <h4 className="text-[15px] font-semibold text-white/90 mb-1">
                  {wf.name}
                </h4>
                <p className="text-[13px] text-brand-pink/80 font-medium mb-2">
                  {wf.flow}
                </p>
                <p className="text-[13px] text-white/40">{wf.use}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What Agents Know */}
        <section className="mb-16">
          <h2 className="font-display text-2xl uppercase text-gradient mb-6">
            WHAT THE AGENTS ALREADY KNOW
          </h2>
          <p className="text-[14px] text-white/45 mb-6 leading-relaxed">
            You don&apos;t need to brief the agents on the brand. Every
            conversation automatically includes:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "Full voice profile — tone, rules, key phrases",
              "Positioning and value proposition",
              "Messaging framework by stakeholder",
              'Terminology rules — "activate" not "donate," "sponsor" not "fund"',
              "Content guardrails — what we never say",
              "Visual system — colors, gradients, typography, hover system",
              "Platform dimensions and safe zones for social graphics",
              "Knowledgebase entries from past conversations",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 p-3 rounded-lg"
              >
                <span className="text-brand-pink text-sm mt-0.5">&#x2713;</span>
                <span className="text-[14px] text-white/60">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Knowledgebase */}
        <section className="mb-16">
          <h2 className="font-display text-2xl uppercase text-gradient mb-6">
            KNOWLEDGEBASE
          </h2>
          <div
            className="p-6 rounded-xl border border-white/[0.06]"
            style={{
              background:
                "linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%)",
            }}
          >
            <p className="text-[14px] text-white/55 leading-relaxed mb-4">
              The{" "}
              <Link
                href="/knowledgebase"
                className="text-brand-pink underline underline-offset-2 decoration-brand-pink/30 hover:decoration-brand-pink"
              >
                Knowledgebase
              </Link>{" "}
              stores learnings that get smarter over time:
            </p>
            <ul className="space-y-2 text-[14px] text-white/50">
              <li className="flex gap-2">
                <span className="text-brand-pink/60">&#x2022;</span>
                <span>
                  <strong className="text-white/70">Auto-extraction</strong> —
                  After 4+ messages in a conversation, the system automatically
                  extracts learnings and adds them to the knowledgebase.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-brand-pink/60">&#x2022;</span>
                <span>
                  <strong className="text-white/70">Manual entries</strong> —
                  Click &quot;+ Add Entry&quot; to add learnings manually. Click
                  any card to edit it.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-brand-pink/60">&#x2022;</span>
                <span>
                  <strong className="text-white/70">Context injection</strong> —
                  Relevant entries are automatically injected into future agent
                  conversations, so every agent benefits from past work.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-brand-pink/60">&#x2022;</span>
                <span>
                  <strong className="text-white/70">Categories</strong> —
                  Campaign results, sponsor info, content insights, strategy
                  learnings, design patterns, and general.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Limitations */}
        <section className="mb-16">
          <h2 className="font-display text-2xl uppercase text-gradient mb-6">
            LIMITATIONS
          </h2>
          <div className="space-y-3">
            {[
              {
                title: "Design Agents — Web Mode Only",
                desc: "The 5 design agents provide specs, creative direction, and copy but cannot render PNG/PDF files in the browser. For production assets, run the agents locally via Claude Code.",
              },
              {
                title: "Session Duration",
                desc: "Your login session lasts 8 hours. After that, you'll need to re-enter the password.",
              },
              {
                title: "Shared Access",
                desc: "Everyone uses the same password. There are no individual accounts. Conversation history is shared across the team.",
              },
              {
                title: "Streaming Responses",
                desc: "Responses stream in real-time. If you navigate away mid-stream, the partial response is still saved to the conversation.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-4 rounded-xl border border-white/[0.06]"
                style={{
                  background:
                    "linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%)",
                }}
              >
                <h4 className="text-[14px] font-semibold text-white/80 mb-1">
                  {item.title}
                </h4>
                <p className="text-[13px] text-white/40 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section className="mb-16">
          <h2 className="font-display text-2xl uppercase text-gradient mb-6">
            TIPS FOR BEST RESULTS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                tip: "Be specific about your audience",
                detail:
                  'Instead of "write an email," say "write a follow-up email to a Fortune 500 CSR director who attended our webinar last week."',
              },
              {
                tip: "Include awareness level",
                detail:
                  "Tell the agent if your audience is cold (never heard of us), warm (knows us), or hot (ready to buy). This changes the messaging approach.",
              },
              {
                tip: "Use the Orchestrator first",
                detail:
                  "If you're not sure which agent to use, start with the Orchestrator. Describe your goal and it will map out the exact workflow.",
              },
              {
                tip: "Chain agents for complete deliverables",
                detail:
                  "Copy the output from one agent and paste it into the next. For example, take Content Atomizer output into Social Creative for design specs.",
              },
              {
                tip: "Iterate in the same conversation",
                detail:
                  "Don't start a new chat to refine output. Ask for changes in the same conversation — the agent remembers context and improves with each round.",
              },
              {
                tip: "Add learnings to the knowledgebase",
                detail:
                  "When you learn something from a campaign or sponsor interaction, add it to the knowledgebase so all agents benefit from it going forward.",
              },
            ].map((item) => (
              <div
                key={item.tip}
                className="p-5 rounded-xl border border-white/[0.06] hover:border-white/[0.12] transition-all"
                style={{
                  background:
                    "linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%)",
                }}
              >
                <h4 className="text-[14px] font-semibold text-white/85 mb-1.5">
                  {item.tip}
                </h4>
                <p className="text-[13px] text-white/40 leading-relaxed">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
