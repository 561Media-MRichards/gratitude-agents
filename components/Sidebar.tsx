"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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

const TYPE_ICONS: Record<string, string> = {
  system: "\u2699\uFE0F",
  marketing: "\uD83D\uDCC8",
  design: "\uD83C\uDFA8",
};

const TYPE_LABELS: Record<string, string> = {
  system: "SYSTEM",
  marketing: "MARKETING",
  design: "DESIGN",
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
  const [tab, setTab] = useState<"agents" | "history">("agents");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then(setAgents);
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
            AGENTS
          </span>
        </div>

        <button
          onClick={onNewChat}
          className="w-full py-2 px-4 rounded-lg text-sm font-medium text-white/70 border border-white/[0.1] hover:border-brand-pink/30 hover:text-white/90 hover:bg-white/[0.03] transition-all"
        >
          + New Chat
        </button>
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
          Agents
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
                  {items.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => onSelectAgent(agent.id)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-all group ${
                        selectedAgent === agent.id
                          ? "bg-brand-pink/10 text-white border-r-2 border-brand-pink"
                          : "text-white/50 hover:bg-white/[0.03] hover:text-white/70"
                      }`}
                    >
                      <div className="font-medium text-[13px]">{agent.name}</div>
                      <div className="text-[11px] text-white/30 mt-0.5 line-clamp-1 group-hover:text-white/40">
                        {agent.description}
                      </div>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-2">
            {conversations.length === 0 ? (
              <p className="px-4 py-8 text-sm text-white/30 text-center">
                No conversations yet
              </p>
            ) : (
              conversations.map((conv) => (
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
        <div className="flex gap-2">
          <a
            href="/knowledgebase"
            className="flex-1 py-2 text-center text-[11px] text-white/40 hover:text-white/60 rounded-lg hover:bg-white/[0.03] transition-colors"
          >
            Knowledgebase
          </a>
          <button
            onClick={handleLogout}
            className="flex-1 py-2 text-center text-[11px] text-white/40 hover:text-red-400 rounded-lg hover:bg-white/[0.03] transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
