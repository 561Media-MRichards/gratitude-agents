"use client";

import { useEffect, useState } from "react";

interface KBEntry {
  id: string;
  agentId: string;
  category: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
}

const CATEGORIES = [
  "all",
  "campaign_result",
  "sponsor_info",
  "content_insight",
  "strategy_learning",
  "design_pattern",
  "general",
];

const CATEGORY_COLORS: Record<string, string> = {
  campaign_result: "#FE3184",
  sponsor_info: "#FF6B35",
  content_insight: "#ec7211",
  strategy_learning: "#FF4D8D",
  design_pattern: "#FF8C5A",
  general: "#888",
};

export default function KnowledgebaseViewer() {
  const [entries, setEntries] = useState<KBEntry[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/knowledgebase")
      .then((r) => r.json())
      .then((data) => {
        setEntries(data);
        setLoading(false);
      });
  }, []);

  const filtered = entries.filter((e) => {
    if (filter !== "all" && e.category !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        e.content.toLowerCase().includes(q) ||
        e.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  async function handleDelete(id: string) {
    await fetch(`/api/knowledgebase/${id}`, { method: "DELETE" });
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-brand-pink/30 border-t-brand-pink rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search learnings..."
          className="px-4 py-2 bg-dark-800 border border-white/[0.08] rounded-lg text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:border-brand-pink/30 w-64"
        />
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-medium uppercase tracking-wider transition-all ${
                filter === cat
                  ? "bg-brand-pink/15 text-brand-pink border border-brand-pink/30"
                  : "text-white/40 border border-white/[0.06] hover:text-white/60 hover:border-white/[0.12]"
              }`}
            >
              {cat.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-white/30 text-sm">
            {entries.length === 0
              ? "No learnings yet. They'll appear automatically after conversations reach 4+ messages."
              : "No results match your filters."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((entry) => (
            <div
              key={entry.id}
              className="p-4 rounded-xl border border-white/[0.06] bg-dark-800 hover:border-white/[0.12] transition-all group"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    color: CATEGORY_COLORS[entry.category] || "#888",
                    background: `${CATEGORY_COLORS[entry.category] || "#888"}15`,
                    border: `1px solid ${CATEGORY_COLORS[entry.category] || "#888"}30`,
                  }}
                >
                  {entry.category.replace(/_/g, " ")}
                </span>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all text-xs"
                >
                  &#x2715;
                </button>
              </div>

              <h3 className="text-sm font-semibold text-white/85 mb-1.5">
                {entry.title}
              </h3>
              <p className="text-[13px] text-white/50 leading-relaxed mb-3">
                {entry.content}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {entry.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-white/35 border border-white/[0.04]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-3 text-[10px] text-white/20">
                {entry.agentId} &middot;{" "}
                {new Date(entry.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
