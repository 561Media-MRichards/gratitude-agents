"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Conversation {
  id: string;
  agentId: string;
  title: string;
  updatedAt: string;
}

interface SidebarProps {
  conversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
}

interface SessionResponse {
  user: {
    name: string;
    role: "admin" | "employee" | "partner";
  };
}

export default function Sidebar({
  conversationId,
  onSelectConversation,
  onNewChat,
}: SidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/session").then(async (res) => {
      if (res.ok) setSession(await res.json());
    });
    // Load conversations on mount
    fetch("/api/conversations")
      .then((r) => r.json())
      .then(setConversations);
  }, []);

  // Refresh conversations when a new one is created (conversationId changes)
  useEffect(() => {
    if (conversationId) {
      fetch("/api/conversations")
        .then((r) => r.json())
        .then(setConversations);
    }
  }, [conversationId]);

  const filtered = conversations.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return c.title?.toLowerCase().includes(q);
  });

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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full rounded-xl bg-white/[0.03] border border-white/[0.08] px-3 py-2.5 text-[13px] text-white/75 placeholder:text-white/25 focus:outline-none focus:border-brand-pink/30"
          />
        </div>
      </div>

      {/* Section label */}
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-white/30">
          Recent Conversations
        </span>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        <div className="py-2">
          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-sm text-white/30 text-center">
              {conversations.length === 0
                ? "No conversations yet. Start a new request above."
                : "No conversations match that search"}
            </p>
          ) : (
            filtered.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
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
                  {new Date(conv.updatedAt).toLocaleDateString()}
                </div>
              </button>
            ))
          )}
        </div>
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
