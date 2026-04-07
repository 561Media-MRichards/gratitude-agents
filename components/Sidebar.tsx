"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Agent {
  id: string;
  name: string;
  description: string;
  type: "system" | "marketing" | "design";
}

interface Conversation {
  id: string;
  agentId: string;
  title: string;
  updatedAt: string;
}

interface SidebarProps {
  selectedAgent: string | null;
  onSelectAgent: (id: string) => void;
  conversationId: string | null;
  onSelectConversation: (id: string, agentId: string) => void;
  onNewChat: () => void;
}

interface SessionResponse {
  user: {
    name: string;
    role: "admin" | "employee" | "partner";
  };
}

const TYPE_ICONS: Record<string, string> = {
  system: "\u2699\uFE0F",
  marketing: "\uD83D\uDCC8",
  design: "\uD83C\uDFA8",
};

const TYPE_LABELS: Record<string, string> = {
  system: "START HERE",
  marketing: "WRITING & STRATEGY",
  design: "CREATIVE & DESIGN",
};

export default function Sidebar({
  selectedAgent,
  onSelectAgent,
  conversationId,
  onSelectConversation,
  onNewChat,
}: SidebarProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [agentSearch, setAgentSearch] = useState("");
  const [tab, setTab] = useState<"agents" | "history">("agents");
  const router = useRouter();

  useEffect(() => {
    Promise.all([fetch("/api/agents"), fetch("/api/session")]).then(
      async ([agentsRes, sessionRes]) => {
        setAgents(await agentsRes.json());
        if (sessionRes.ok) {
          setSession(await sessionRes.json());
        }
      }
    );
  }, []);

  useEffect(() => {
    if (tab === "history") {
      fetch("/api/conversations")
        .then((r) => r.json())
        .then(setConversations);
    }
  }, [tab]);

  const grouped = agents.reduce(
    (acc, a) => {
      acc[a.type] = acc[a.type] || [];
      acc[a.type].push(a);
      return acc;
    },
    {} as Record<string, Agent[]>
  );

  const filteredConversations = conversations.filter((conversation) => {
    if (!agentSearch.trim()) return true;
    const q = agentSearch.toLowerCase();
    return (
      conversation.title?.toLowerCase().includes(q) ||
      conversation.agentId.toLowerCase().includes(q)
    );
  });

  function matchesAgentSearch(agent: Agent) {
    if (!agentSearch.trim()) return true;
    const q = agentSearch.toLowerCase();
    return (
      agent.name.toLowerCase().includes(q) ||
      agent.description.toLowerCase().includes(q) ||
      agent.id.toLowerCase().includes(q)
    );
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="w-72 h-screen bg-dark-900 border-r border-white/[0.06] flex flex-col shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3 mb-4">
          <Image
            src="/gratitude-white.svg"
            alt="Gratitude"
            width={130}
            height={26}
          />
          <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-brand-pink">
            ASSISTANT
          </span>
        </div>

        <button
          onClick={onNewChat}
          className="w-full py-2 px-4 rounded-lg text-sm font-medium text-white/70 border border-white/[0.1] hover:border-brand-pink/30 hover:text-white/90 hover:bg-white/[0.03] transition-all"
        >
          + New Request
        </button>

        {session && (
          <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
            <p className="text-[12px] text-white/75">{session.user.name}</p>
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/30 mt-1">
              {session.user.role}
            </p>
          </div>
        )}

        <div className="mt-4">
          <input
            value={agentSearch}
            onChange={(e) => setAgentSearch(e.target.value)}
            placeholder={tab === "agents" ? "What do you need help with?" : "Find a conversation"}
            className="w-full rounded-xl bg-white/[0.03] border border-white/[0.08] px-3 py-2.5 text-[13px] text-white/75 placeholder:text-white/25 focus:outline-none focus:border-brand-pink/30"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.06]">
        <button
          onClick={() => setTab("agents")}
          className={`flex-1 py-2.5 text-xs font-semibold tracking-wider uppercase transition-colors ${
            tab === "agents"
              ? "text-brand-pink border-b-2 border-brand-pink"
              : "text-white/40 hover:text-white/60"
          }`}
        >
          Help Areas
        </button>
        <button
          onClick={() => setTab("history")}
          className={`flex-1 py-2.5 text-xs font-semibold tracking-wider uppercase transition-colors ${
            tab === "history"
              ? "text-brand-pink border-b-2 border-brand-pink"
              : "text-white/40 hover:text-white/60"
          }`}
        >
          History
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === "agents" ? (
          <div className="py-2">
            {(["system", "marketing", "design"] as const).map((type) => {
              const items = grouped[type];
              if (!items?.length) return null;
              return (
                <div key={type} className="mb-1">
                  <div className="px-4 py-2 text-[10px] font-semibold tracking-[0.15em] uppercase text-white/30">
                    {TYPE_ICONS[type]} {TYPE_LABELS[type]}
                  </div>
                  {items.filter(matchesAgentSearch).map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => onSelectAgent(agent.id)}
                      className={`w-full text-left px-4 py-3 text-sm transition-all group ${
                        selectedAgent === agent.id
                          ? "bg-brand-pink/10 text-white border-r-2 border-brand-pink"
                          : "text-white/50 hover:bg-white/[0.03] hover:text-white/70"
                      }`}
                    >
                      <div className="font-medium text-[13px]">{agent.name}</div>
                      <div className="text-[11px] text-white/30 mt-1 line-clamp-2 group-hover:text-white/40 leading-relaxed">
                        {agent.description}
                      </div>
                      <div className="text-[10px] uppercase tracking-[0.14em] text-white/20 mt-2">
                        {agent.type === "system"
                          ? "Best when you are not sure where to start"
                          : agent.type === "design"
                            ? "Best when you need visuals, layout, or creative direction"
                            : "Best when you need messaging, content, or strategy"}
                      </div>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-2">
            {filteredConversations.length === 0 ? (
              <p className="px-4 py-8 text-sm text-white/30 text-center">
                {conversations.length === 0 ? "No conversations yet" : "No conversations match that search"}
              </p>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id, conv.agentId)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-all ${
                    conversationId === conv.id
                      ? "bg-brand-pink/10 text-white border-r-2 border-brand-pink"
                      : "text-white/50 hover:bg-white/[0.03] hover:text-white/70"
                  }`}
                >
                  <div className="text-[13px] font-medium line-clamp-1">
                    {conv.title || "Untitled"}
                  </div>
                  <div className="text-[11px] text-white/30 mt-0.5">
                    {conv.agentId} &middot;{" "}
                    {new Date(conv.updatedAt).toLocaleDateString()}
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/[0.06]">
        <div className="grid grid-cols-2 gap-1 mb-1">
          <Link
            href="/portal"
            className="py-2 text-center text-[11px] text-white/40 hover:text-white/60 rounded-lg hover:bg-white/[0.03] transition-colors"
          >
            Portal
          </Link>
          <Link
            href="/knowledgebase"
            className="py-2 text-center text-[11px] text-white/40 hover:text-white/60 rounded-lg hover:bg-white/[0.03] transition-colors"
          >
            KB
          </Link>
          <Link
            href="/resources"
            className="py-2 text-center text-[11px] text-white/40 hover:text-white/60 rounded-lg hover:bg-white/[0.03] transition-colors"
          >
            Files
          </Link>
          <button
            onClick={handleLogout}
            className="py-2 text-center text-[11px] text-white/40 hover:text-red-400 rounded-lg hover:bg-white/[0.03] transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
