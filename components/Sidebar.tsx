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
    fetch("/api/conversations")
      .then((r) => r.json())
      .then(setConversations);
  }, []);

  // Refresh conversations when a new one is created
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

  // Group conversations by relative time
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

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

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

      {/* Search */}
      {conversations.length > 5 && (
        <div className="px-4 pb-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-[12px] text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/[0.12]"
          />
        </div>
      )}

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto px-2">
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
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[13px] transition-all ${
                    conversationId === conv.id
                      ? "bg-white/[0.08] text-white/90"
                      : "text-white/50 hover:bg-white/[0.04] hover:text-white/70"
                  }`}
                >
                  <div className="line-clamp-1">{conv.title || "Untitled"}</div>
                </button>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Footer - minimal */}
      <div className="p-3 border-t border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/knowledgebase"
              className="text-[10px] text-white/25 hover:text-white/50 transition-colors"
            >
              Knowledge
            </Link>
            <Link
              href="/resources"
              className="text-[10px] text-white/25 hover:text-white/50 transition-colors"
            >
              Files
            </Link>
          </div>
          <button
            onClick={handleLogout}
            className="text-[10px] text-white/25 hover:text-white/50 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
