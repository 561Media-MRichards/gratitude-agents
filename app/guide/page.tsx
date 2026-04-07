"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type BoardSection = "capabilities" | "workflows" | "exports" | "tips";

const CAPABILITIES = [
  {
    icon: "📝",
    title: "Copy & Messaging",
    description: "Landing pages, sponsor pitches, email sequences, ad copy, brand voice",
    examples: ["Write a sponsor acquisition email sequence", "Draft landing page copy for our activator program"],
    color: "#FE3184",
  },
  {
    icon: "📊",
    title: "Presentations",
    description: "Branded PPTX decks with dark theme, gradient accents, and multiple slide layouts",
    examples: ["Create a sponsor pitch deck", "Build a quarterly impact report presentation"],
    color: "#FF6B35",
  },
  {
    icon: "📅",
    title: "Content Calendars",
    description: "Multi-platform content plans exportable as branded Excel or CSV",
    examples: ["Build a 4-week social media rollout", "Create a content calendar for next month"],
    color: "#ec7211",
  },
  {
    icon: "🔍",
    title: "Live Research",
    description: "Searches the web in real-time for current trends, competitor data, and industry stats",
    examples: ["Research latest CSR sponsorship trends", "What are competitors doing in the gratitude space?"],
    color: "#FE3184",
  },
  {
    icon: "📧",
    title: "Email Sequences",
    description: "Nurture flows, onboarding series, sponsor outreach, and newsletter content",
    examples: ["Write a 5-email sponsor nurture sequence", "Create a partner onboarding welcome series"],
    color: "#FF6B35",
  },
  {
    icon: "🎨",
    title: "Design Direction",
    description: "Creative briefs, layout specs, visual system guidance, and brand-compliant direction",
    examples: ["Spec out a social media graphic for our campaign", "What should our impact report layout look like?"],
    color: "#ec7211",
  },
  {
    icon: "📱",
    title: "Social Media",
    description: "Platform-specific posts, carousel concepts, hashtag strategies, and content atomization",
    examples: ["Create Instagram carousel content from our blog post", "Generate a week of LinkedIn posts"],
    color: "#FE3184",
  },
  {
    icon: "📑",
    title: "Documents & Reports",
    description: "Impact reports, case studies, lead magnets, sponsor kits, and partner decks",
    examples: ["Write a case study for our latest sponsor", "Create a lead magnet PDF outline"],
    color: "#FF6B35",
  },
];

const WORKFLOWS = [
  {
    title: "Sponsor Acquisition Campaign",
    steps: [
      { label: "Research", detail: "Identify positioning angles and competitor landscape" },
      { label: "Messaging", detail: "Craft the core value proposition and sponsor benefits" },
      { label: "Copy", detail: "Write outreach emails, landing page, and pitch deck" },
      { label: "Distribute", detail: "Create social content and email sequences to amplify" },
    ],
    prompt: "I need to build a complete sponsor acquisition campaign",
    color: "#FE3184",
  },
  {
    title: "Content Launch",
    steps: [
      { label: "Strategy", detail: "Define content pillars, audience, and cadence" },
      { label: "Calendar", detail: "Build multi-platform calendar with specific posts" },
      { label: "Create", detail: "Write each piece with platform-specific formatting" },
      { label: "Export", detail: "Download calendar as Excel and content as documents" },
    ],
    prompt: "Plan and create a full month content launch",
    color: "#FF6B35",
  },
  {
    title: "Partner Onboarding Kit",
    steps: [
      { label: "Welcome", detail: "Write the onboarding email sequence" },
      { label: "Guide", detail: "Create a partner guide or lead magnet" },
      { label: "Deck", detail: "Build a branded presentation for the partnership" },
      { label: "Nurture", detail: "Set up ongoing nurture content" },
    ],
    prompt: "Build a complete partner onboarding kit",
    color: "#ec7211",
  },
  {
    title: "Impact Report",
    steps: [
      { label: "Data", detail: "Research and compile activation metrics" },
      { label: "Narrative", detail: "Write the story around the numbers" },
      { label: "Slides", detail: "Generate a branded PPTX with stats and insights" },
      { label: "Document", detail: "Export as PDF for distribution" },
    ],
    prompt: "Create a quarterly impact report with our latest numbers",
    color: "#FE3184",
  },
];

const EXPORTS = [
  {
    format: "PPTX",
    label: "PowerPoint",
    description: "Branded dark-theme slides with Gratitude colors, logo, and 6 layout types",
    bestFor: "Presentations, pitch decks, reports",
    icon: "📊",
    accent: true,
  },
  {
    format: "XLSX",
    label: "Excel",
    description: "Branded spreadsheet with pink header, dark theme, auto-sized columns, and logo",
    bestFor: "Content calendars, data exports, schedules",
    icon: "📗",
    accent: true,
  },
  {
    format: "CSV",
    label: "CSV",
    description: "Raw comma-separated data for import into any tool",
    bestFor: "Data imports, custom processing",
    icon: "📄",
    accent: false,
  },
  {
    format: "PDF",
    label: "PDF",
    description: "Clean formatted document for sharing and printing",
    bestFor: "Final deliverables, client-facing documents",
    icon: "📕",
    accent: false,
  },
  {
    format: "DOC",
    label: "Word",
    description: "Editable document format for further refinement",
    bestFor: "Drafts that need team editing",
    icon: "📘",
    accent: false,
  },
  {
    format: "MD",
    label: "Markdown",
    description: "Plain text with formatting for developers and CMS",
    bestFor: "Blog posts, documentation, CMS content",
    icon: "📝",
    accent: false,
  },
];

const TIPS = [
  {
    title: "Be specific about the deliverable",
    body: "Instead of 'help with marketing,' say 'write a 5-email sponsor nurture sequence targeting Fortune 500 CSR directors.' The more context you give, the better the output.",
    category: "Prompting",
  },
  {
    title: "Ask for the format you need",
    body: "Say 'give me this as a presentation' or 'create a content calendar' and the assistant will structure the output for that specific export format.",
    category: "Exports",
  },
  {
    title: "Use follow-ups to refine",
    body: "Start broad, then drill down. 'Make the tone more urgent' or 'add a slide about ROI metrics' - the assistant remembers the full conversation.",
    category: "Prompting",
  },
  {
    title: "Research is built in",
    body: "Ask about current trends, competitor activity, or industry data and the assistant will search the web and cite its sources automatically.",
    category: "Research",
  },
  {
    title: "Each conversation is private",
    body: "Your conversations and files are only visible to you. Nobody else on the team can see your work unless you share the exported files.",
    category: "Privacy",
  },
  {
    title: "Download from code blocks",
    body: "When the assistant outputs a CSV or table, look for the download buttons directly on the code block - CSV for raw data, Excel for the branded version.",
    category: "Exports",
  },
  {
    title: "Presentations auto-detect",
    body: "When Gratitude creates a deck, the export bar automatically switches to show PPTX and PDF instead of document formats.",
    category: "Exports",
  },
  {
    title: "Start from the suggestion chips",
    body: "The empty chat shows 6 starter prompts covering the most common requests. Click any of them to jump right in.",
    category: "Getting Started",
  },
];

function CapabilityCard({ item, onTry }: { item: typeof CAPABILITIES[0]; onTry: (prompt: string) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-xl p-4 transition-all hover:-translate-y-0.5 cursor-pointer"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: `1px solid rgba(255,255,255,0.06)`,
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl mt-0.5">{item.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-[14px] font-semibold text-white/85">{item.title}</h3>
          <p className="text-[12px] text-white/40 mt-1 leading-relaxed">{item.description}</p>
        </div>
      </div>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-white/25 mb-2">Try asking</p>
          {item.examples.map((ex) => (
            <button
              key={ex}
              onClick={(e) => { e.stopPropagation(); onTry(ex); }}
              className="block w-full text-left px-3 py-2 rounded-lg text-[12px] text-white/50 hover:text-white/75 hover:bg-brand-pink/[0.06] transition-all"
              style={{ border: "1px solid rgba(255,255,255,0.04)" }}
            >
              &ldquo;{ex}&rdquo;
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GuidePage() {
  const [activeSection, setActiveSection] = useState<BoardSection>("capabilities");

  function handleTryPrompt(prompt: string) {
    window.location.href = `/chat`;
    // Store the prompt to auto-send after navigation
    sessionStorage.setItem("gratitude_starter_prompt", prompt);
  }

  const sections: { id: BoardSection; label: string; icon: string }[] = [
    { id: "capabilities", label: "What Gratitude Can Do", icon: "✦" },
    { id: "workflows", label: "Common Workflows", icon: "→" },
    { id: "exports", label: "Export Formats", icon: "↓" },
    { id: "tips", label: "Tips & Best Practices", icon: "★" },
  ];

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <div className="border-b border-white/[0.06] bg-dark-900/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/gratitude-white.svg" alt="Gratitude" width={110} height={22} />
            <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-white/25">Guide</span>
          </div>
          <Link
            href="/chat"
            className="px-4 py-2 rounded-xl text-[13px] font-medium text-white/70 hover:text-white transition-all"
            style={{
              background: "linear-gradient(135deg, rgba(254,49,132,0.15) 0%, rgba(236,114,17,0.15) 100%)",
              border: "1px solid rgba(254,49,132,0.2)",
            }}
          >
            Open Chat
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="font-display text-3xl uppercase text-gradient mb-2">Resource Guide</h1>
          <p className="text-[14px] text-white/40">Everything you can do with the Gratitude assistant, organized for quick reference.</p>
        </div>

        {/* Section tabs - Notion style */}
        <div className="flex gap-1 mb-8 border-b border-white/[0.06] -mx-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2.5 text-[13px] font-medium transition-all relative ${
                activeSection === section.id
                  ? "text-white/90"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              <span className="mr-1.5 text-[11px]">{section.icon}</span>
              {section.label}
              {activeSection === section.id && (
                <div
                  className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full"
                  style={{ background: "linear-gradient(90deg, #FE3184, #ec7211)" }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Capabilities board */}
        {activeSection === "capabilities" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {CAPABILITIES.map((item) => (
              <CapabilityCard key={item.title} item={item} onTry={handleTryPrompt} />
            ))}
          </div>
        )}

        {/* Workflows board */}
        {activeSection === "workflows" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {WORKFLOWS.map((workflow) => (
              <div
                key={workflow.title}
                className="rounded-xl p-5"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <h3 className="text-[15px] font-semibold text-white/85 mb-4">{workflow.title}</h3>

                {/* Step flow */}
                <div className="space-y-3 mb-5">
                  {workflow.steps.map((step, i) => (
                    <div key={step.label} className="flex items-start gap-3">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold mt-0.5"
                        style={{
                          background: `${workflow.color}18`,
                          color: workflow.color,
                          border: `1px solid ${workflow.color}30`,
                        }}
                      >
                        {i + 1}
                      </div>
                      <div>
                        <span className="text-[12px] font-semibold text-white/70">{step.label}</span>
                        <p className="text-[11px] text-white/35 mt-0.5">{step.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Try it CTA */}
                <button
                  onClick={() => handleTryPrompt(workflow.prompt)}
                  className="w-full py-2.5 rounded-lg text-[12px] font-medium text-white/60 hover:text-white/80 transition-all"
                  style={{
                    background: `${workflow.color}0a`,
                    border: `1px solid ${workflow.color}20`,
                  }}
                >
                  Try this workflow
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Exports board */}
        {activeSection === "exports" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {EXPORTS.map((exp) => (
              <div
                key={exp.format}
                className="rounded-xl p-4"
                style={{
                  background: exp.accent ? "rgba(254,49,132,0.03)" : "rgba(255,255,255,0.02)",
                  border: exp.accent ? "1px solid rgba(254,49,132,0.12)" : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">{exp.icon}</span>
                  <div>
                    <span className="text-[14px] font-semibold text-white/85">{exp.label}</span>
                    <span className="ml-2 text-[10px] font-mono text-white/30 uppercase">.{exp.format.toLowerCase()}</span>
                  </div>
                </div>
                <p className="text-[12px] text-white/40 leading-relaxed mb-3">{exp.description}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-white/20">Best for:</span>
                  <span className="text-[11px] text-white/45">{exp.bestFor}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tips board */}
        {activeSection === "tips" && (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-3 space-y-3">
            {TIPS.map((tip) => (
              <div
                key={tip.title}
                className="rounded-xl p-4 break-inside-avoid"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider"
                    style={{
                      background: "rgba(254,49,132,0.1)",
                      color: "#FE3184",
                      border: "1px solid rgba(254,49,132,0.15)",
                    }}
                  >
                    {tip.category}
                  </span>
                </div>
                <h3 className="text-[13px] font-semibold text-white/80 mb-1.5">{tip.title}</h3>
                <p className="text-[12px] text-white/40 leading-relaxed">{tip.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
