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
  onDeleteConversation: (id: string) => void;
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
  onDeleteConversation,
}: SidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/session").then(async (res) => {
      if (res.ok) setSession(await res.json());
    });
    fetch("/api/conversations")
      .then((r) => r.json())
      .then(setConversations);
  }, []);

  useEffect(() => {
    if (conversationId) {
      fetch("/api/conversations")
        .then((r) => r.json())
        .then(setConversations);
    }
  }, [conversationId]);

  const filtered = conversations.filter((c) => {
    if (!search.trim()) return true;
    return c.title?.toLowerCase().includes(search.toLowerCase());
  });

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);
  const weekStart = new Date(todayStart.getTime() - 7 * 86400000);

  const groups: { label: string; items: Conversation[] }[] = [];
  const today: Conversation[] = [];
  const yesterday: Conversation[] = [];
  const thisWeek: Conversation[] = [];
  const older: Conversation[] = [];

  for (const c of filtered) {
    const d = new Date(c.updatedAt);
    if (d >= todayStart) today.push(c);
    else if (d >= yesterdayStart) yesterday.push(c);
    else if (d >= weekStart) thisWeek.push(c);
    else older.push(c);
  }

  if (today.length) groups.push({ label: "Today", items: today });
  if (yesterday.length) groups.push({ label: "Yesterday", items: yesterday });
  if (thisWeek.length) groups.push({ label: "This week", items: thisWeek });
  if (older.length) groups.push({ label: "Older", items: older });

  function handleDelete(id: string) {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    onDeleteConversation(id);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const isAdmin = session?.user.role === "admin";

  return (
    <div className="w-64 h-screen bg-dark-900 border-r border-white/[0.06] flex flex-col shrink-0">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between mb-4">
          <Image
            src="/gratitude-white.svg"
            alt="Gratitude"
            width={110}
            height={22}
          />
          {session && (
            <span className="text-[10px] text-white/30 uppercase tracking-wider">
              {session.user.role}
            </span>
          )}
        </div>

        <button
          onClick={onNewChat}
          className="w-full py-2.5 px-4 rounded-xl text-sm font-medium text-white/80 transition-all hover:bg-white/[0.06]"
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          + New conversation
        </button>
      </div>

      {/* Navigation icons */}
      <div className="px-3 pb-2 flex gap-1">
        <Link
          href="/chat"
          className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl text-white/50 hover:text-white/80 hover:bg-white/[0.05] transition-all"
          title="Chat"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          <span className="text-[9px] font-medium tracking-wide uppercase">Chat</span>
        </Link>
        <Link
          href="/knowledgebase"
          className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl text-white/50 hover:text-white/80 hover:bg-white/[0.05] transition-all"
          title="Knowledge Base"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
            <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
          </svg>
          <span className="text-[9px] font-medium tracking-wide uppercase">Knowledge</span>
        </Link>
        <Link
          href="/resources"
          className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl text-white/50 hover:text-white/80 hover:bg-white/[0.05] transition-all"
          title="Files"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
            <polyline points="13 2 13 9 20 9" />
          </svg>
          <span className="text-[9px] font-medium tracking-wide uppercase">Files</span>
        </Link>
        {isAdmin && (
          <Link
            href="/admin"
            className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl text-white/50 hover:text-white/80 hover:bg-white/[0.05] transition-all"
            title="Admin"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87" />
              <path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
            <span className="text-[9px] font-medium tracking-wide uppercase">Admin</span>
          </Link>
        )}
      </div>

      <div className="mx-3 border-t border-white/[0.06]" />

      {/* Search */}
      {conversations.length > 5 && (
        <div className="px-3 pt-3 pb-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-[12px] text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/[0.12]"
          />
        </div>
      )}

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto px-2 pt-2">
        {groups.length === 0 ? (
          <p className="px-3 py-12 text-[13px] text-white/25 text-center">
            {conversations.length === 0
              ? "Start your first conversation"
              : "No results"}
          </p>
        ) : (
          groups.map((group) => (
            <div key={group.label} className="mb-3">
              <div className="px-3 py-1.5 text-[10px] font-medium tracking-wider uppercase text-white/20">
                {group.label}
              </div>
              {group.items.map((conv) => (
                <div key={conv.id} className="group/conv relative">
                  <button
                    onClick={() => onSelectConversation(conv.id)}
                    className={`w-full text-left px-3 py-2 pr-8 rounded-lg text-[13px] transition-all ${
                      conversationId === conv.id
                        ? "bg-white/[0.08] text-white/90"
                        : "text-white/50 hover:bg-white/[0.04] hover:text-white/70"
                    }`}
                  >
                    <div className="line-clamp-1">{conv.title || "Untitled"}</div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(conv.id);
                    }}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-md opacity-0 group-hover/conv:opacity-100 text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all"
                    title="Delete conversation"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0">
              <span className="text-[11px] text-white/50 font-medium">
                {session?.user.name?.charAt(0).toUpperCase() || "?"}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[12px] text-white/60 truncate">{session?.user.name}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-[10px] text-white/25 hover:text-white/50 transition-colors shrink-0 ml-2"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
