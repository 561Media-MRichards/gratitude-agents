"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface SessionResponse {
  user: {
    name: string;
    email: string;
    role: "admin" | "employee" | "partner";
  };
}

interface DashboardState {
  conversations: number;
  knowledgeEntries: number;
  resources: number;
}

const QUICK_STARTS = [
  {
    title: "Figure out where to start",
    description: "Describe the goal in plain English and let the orchestrator route the work.",
    href: "/chat?agent=orchestrator",
    label: "Open Orchestrator",
  },
  {
    title: "Create sponsor-facing copy",
    description: "Start with the copy agent when you need landing page, email, or pitch language fast.",
    href: "/chat?agent=direct-response-copy",
    label: "Open Copy Agent",
  },
  {
    title: "Turn an output into files",
    description: "Save useful responses to the resource library and download them as MD, DOC, or PDF.",
    href: "/resources",
    label: "Open Resource Library",
  },
];

const WORKFLOWS = [
  {
    name: "New campaign",
    steps: "Positioning Angles -> Direct Response Copy -> Content Atomizer -> Social Creative",
    href: "/chat?agent=positioning-angles",
  },
  {
    name: "Partner deck or sponsor kit",
    steps: "Direct Response Copy -> Deliverable Design -> Resources",
    href: "/chat?agent=direct-response-copy",
  },
  {
    name: "Capture team learning",
    steps: "Chat -> Knowledge Base review -> Publish partner-safe insight",
    href: "/knowledgebase",
  },
];

export default function PortalDashboard() {
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [stats, setStats] = useState<DashboardState>({
    conversations: 0,
    knowledgeEntries: 0,
    resources: 0,
  });

  useEffect(() => {
    async function load() {
      const [sessionRes, conversationsRes, kbRes, resourcesRes] = await Promise.all([
        fetch("/api/session"),
        fetch("/api/conversations"),
        fetch("/api/knowledgebase"),
        fetch("/api/resources"),
      ]);

      if (sessionRes.ok) {
        setSession(await sessionRes.json());
      }

      const [conversations, knowledgeEntries, resources] = await Promise.all([
        conversationsRes.ok ? conversationsRes.json() : [],
        kbRes.ok ? kbRes.json() : [],
        resourcesRes.ok ? resourcesRes.json() : [],
      ]);

      setStats({
        conversations: conversations.length,
        knowledgeEntries: knowledgeEntries.length,
        resources: resources.length,
      });
    }

    void load();
  }, []);

  const cards = [
    {
      label: "Live Conversations",
      value: stats.conversations,
      href: "/chat",
      body: "Open a thread, continue an existing one, or route a new request to the right agent.",
    },
    {
      label: "Approved Knowledge",
      value: stats.knowledgeEntries,
      href: "/knowledgebase",
      body: "Find reusable learnings, improve weak drafts, and turn good conversations into team memory.",
    },
    {
      label: "Saved Resources",
      value: stats.resources,
      href: "/resources",
      body: "Keep source files, generated outputs, and client-ready downloads in one place.",
    },
  ];

  return (
    <div className="min-h-screen bg-dark-950 px-6 py-8">
      <div
        className="absolute inset-0 pointer-events-none opacity-80"
        style={{
          background:
            "radial-gradient(circle at 15% 20%, rgba(254,49,132,0.12), transparent 28%), radial-gradient(circle at 82% 18%, rgba(255,107,53,0.11), transparent 24%), radial-gradient(circle at 50% 100%, rgba(236,114,17,0.08), transparent 30%)",
        }}
      />
      <div className="relative max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-5 mb-8">
          <div
            className="rounded-[28px] border border-white/[0.08] p-8 overflow-hidden"
            style={{
              background:
                "linear-gradient(145deg, rgba(20,20,20,0.96) 0%, rgba(8,8,8,0.98) 100%)",
              boxShadow: "0 24px 100px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            <p className="text-[11px] uppercase tracking-[0.28em] text-brand-pink mb-3">
              Gratitude Partner Portal
            </p>
            <h1 className="font-display text-4xl md:text-6xl uppercase text-gradient leading-none mb-5">
              Work With Agents Without Guesswork
            </h1>
            <p className="max-w-2xl text-white/55 leading-relaxed text-[15px]">
              This workspace is built to help employees and partners move from request to usable deliverable quickly:
              start with the right agent, save what matters, and turn useful output into repeatable knowledge.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/chat?agent=orchestrator"
                className="px-5 py-3 rounded-full text-sm font-semibold text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #FE3184 0%, #FF6B35 50%, #ec7211 100%)",
                  boxShadow: "0 10px 30px rgba(254,49,132,0.25)",
                }}
              >
                Start With The Orchestrator
              </Link>
              <Link
                href="/resources"
                className="px-5 py-3 rounded-full text-sm font-semibold text-white/75 border border-white/[0.1] hover:border-white/[0.2] hover:text-white transition-colors"
              >
                Browse Files & Downloads
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/[0.08] p-6 bg-white/[0.03]">
            <div className="mb-5">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/30 mb-2">
                Workspace Identity
              </p>
              {session ? (
                <>
                  <h2 className="text-xl text-white/90 font-semibold">{session.user.name}</h2>
                  <p className="text-sm text-white/45 mt-1">{session.user.email}</p>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-brand-pink mt-3">
                    {session.user.role}
                  </p>
                </>
              ) : (
                <p className="text-sm text-white/40">Loading session...</p>
              )}
            </div>

            <div className="space-y-3 text-sm text-white/50">
              <p>Private work stays private until it is intentionally published.</p>
              <p>Knowledge should be edited for clarity before it becomes shared guidance.</p>
              <p>Every strong response can become a downloadable file or reusable resource.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {cards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="group rounded-2xl border border-white/[0.08] p-6 transition-all hover:border-brand-pink/30 hover:-translate-y-1"
              style={{
                background:
                  "linear-gradient(180deg, rgba(26,26,26,0.95) 0%, rgba(13,13,13,0.95) 100%)",
              }}
            >
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/30 mb-4">
                {card.label}
              </div>
              <div className="font-display text-4xl text-gradient mb-4">{card.value}</div>
              <p className="text-sm text-white/45 leading-relaxed">{card.body}</p>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-5">
          <div className="rounded-3xl border border-white/[0.08] p-6 bg-white/[0.03]">
            <h2 className="font-display text-3xl uppercase text-gradient mb-4">
              Quick Starts
            </h2>
            <div className="space-y-4">
              {QUICK_STARTS.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/[0.08] p-5 bg-black/20"
                >
                  <h3 className="text-lg font-semibold text-white/90 mb-2">{item.title}</h3>
                  <p className="text-sm text-white/45 leading-relaxed mb-4">{item.description}</p>
                  <Link href={item.href} className="text-sm text-brand-pink hover:text-white">
                    {item.label}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/[0.08] p-6 bg-white/[0.03]">
            <h2 className="font-display text-3xl uppercase text-gradient mb-4">
              Common Paths
            </h2>
            <div className="space-y-4">
              {WORKFLOWS.map((workflow) => (
                <Link
                  key={workflow.name}
                  href={workflow.href}
                  className="block rounded-2xl border border-white/[0.08] p-5 bg-black/20 hover:border-white/[0.14] transition-colors"
                >
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/30 mb-2">
                    {workflow.name}
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed">{workflow.steps}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
