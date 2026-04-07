"use client";

import { useEffect, useState } from "react";

interface KBEntry {
  id: string;
  agentId: string;
  category: string;
  status: "draft" | "review" | "approved";
  visibility: "private" | "internal" | "partner";
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
}

interface FormData {
  agentId: string;
  category: string;
  title: string;
  content: string;
  tags: string;
  visibility: "private" | "internal" | "partner";
  status: "draft" | "review" | "approved";
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

const EDIT_CATEGORIES = CATEGORIES.filter((c) => c !== "all");

const CATEGORY_COLORS: Record<string, string> = {
  campaign_result: "#FE3184",
  sponsor_info: "#FF6B35",
  content_insight: "#ec7211",
  strategy_learning: "#FF4D8D",
  design_pattern: "#FF8C5A",
  general: "#888",
};

const AGENTS = [
  "orchestrator",
  "brand-voice",
  "content-atomizer",
  "direct-response-copy",
  "email-sequences",
  "gratitude-content-strategy",
  "lead-magnet",
  "newsletter",
  "positioning-angles",
  "social-creative",
  "deliverable-design",
  "web-mockup",
  "brand-asset-design",
  "canvas-art",
];

const EMPTY_FORM: FormData = {
  agentId: "orchestrator",
  category: "general",
  title: "",
  content: "",
  tags: "",
  visibility: "internal",
  status: "draft",
};

interface SessionResponse {
  user: {
    role: "admin" | "employee" | "partner";
  };
}

export default function KnowledgebaseViewer() {
  const [entries, setEntries] = useState<KBEntry[]>([]);
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [filter, setFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "review" | "approved">("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  function fetchEntries() {
    Promise.all([fetch("/api/knowledgebase"), fetch("/api/session")]).then(
      async ([entriesRes, sessionRes]) => {
        if (entriesRes.ok) {
          setEntries(await entriesRes.json());
        }
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          setSession(sessionData);
          if (sessionData.user.role === "partner") {
            setForm((prev) => ({ ...prev, visibility: "private", status: "draft" }));
          }
        }
        setLoading(false);
      }
    );
  }

  const filtered = entries.filter((e) => {
    if (filter !== "all" && e.category !== filter) return false;
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
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
    if (!confirm("Delete this entry?")) return;
    await fetch(`/api/knowledgebase/${id}`, { method: "DELETE" });
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function openCreate() {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      visibility: session?.user.role === "partner" ? "private" : "internal",
      status: "draft",
    });
    setModalOpen(true);
  }

  function openEdit(entry: KBEntry) {
    setEditingId(entry.id);
    setForm({
      agentId: entry.agentId,
      category: entry.category,
      title: entry.title,
      content: entry.content,
      tags: entry.tags?.join(", ") || "",
      visibility: entry.visibility,
      status: entry.status,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);

    const payload = {
      agentId: form.agentId,
      category: form.category,
      title: form.title.trim(),
      content: form.content.trim(),
      visibility: form.visibility,
      status: form.status,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      if (editingId) {
        const res = await fetch(`/api/knowledgebase/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const updated = await res.json();
        setEntries((prev) =>
          prev.map((e) => (e.id === editingId ? updated : e))
        );
      } else {
        const res = await fetch("/api/knowledgebase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const created = await res.json();
        setEntries((prev) => [created, ...prev]);
      }
      setModalOpen(false);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-brand-pink/30 border-t-brand-pink rounded-full animate-spin" />
      </div>
    );
  }

  const canPublish =
    session?.user.role === "admin" || session?.user.role === "employee";
  const draftCount = entries.filter((entry) => entry.status === "draft").length;
  const approvedCount = entries.filter((entry) => entry.status === "approved").length;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border border-white/[0.08] p-4 bg-white/[0.03]">
          <div className="text-[11px] uppercase tracking-[0.16em] text-white/30 mb-2">Visible entries</div>
          <div className="font-display text-3xl text-gradient">{entries.length}</div>
        </div>
        <div className="rounded-2xl border border-white/[0.08] p-4 bg-white/[0.03]">
          <div className="text-[11px] uppercase tracking-[0.16em] text-white/30 mb-2">Needs refinement</div>
          <div className="font-display text-3xl text-gradient">{draftCount}</div>
        </div>
        <div className="rounded-2xl border border-white/[0.08] p-4 bg-white/[0.03]">
          <div className="text-[11px] uppercase tracking-[0.16em] text-white/30 mb-2">Approved guidance</div>
          <div className="font-display text-3xl text-gradient">{approvedCount}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search learnings..."
          className="px-4 py-2 bg-dark-800 border border-white/[0.08] rounded-lg text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:border-brand-pink/30 w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "all" | "draft" | "review" | "approved")
          }
          className="px-4 py-2 bg-dark-800 border border-white/[0.08] rounded-lg text-sm text-white/80 focus:outline-none focus:border-brand-pink/30"
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="review">Review</option>
          <option value="approved">Approved</option>
        </select>
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
        <button
          onClick={openCreate}
          className="ml-auto px-4 py-2 rounded-full text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
          style={{
            background:
              "linear-gradient(135deg, #FE3184 0%, #FF6B35 50%, #ec7211 100%)",
            boxShadow: "0 8px 30px rgba(254, 49, 132, 0.25)",
          }}
        >
          + Add Entry
        </button>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-lg font-semibold text-white/80 mb-2">
            {entries.length === 0 ? "No knowledge entries yet" : "Nothing matches these filters"}
          </h3>
          <p className="text-white/30 text-sm max-w-xl mx-auto leading-relaxed">
            {entries.length === 0
              ? "Add a learning manually or let the portal create drafts from longer conversations, then review and publish the ones worth sharing."
              : "Try a different category, status, or keyword to widen the results."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((entry) => (
            <div
              key={entry.id}
              className="p-4 rounded-xl border border-white/[0.06] bg-dark-800 hover:border-white/[0.12] transition-all group cursor-pointer"
              onClick={() => openEdit(entry)}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex flex-wrap gap-1.5">
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
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/[0.08] text-white/40">
                    {entry.status}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/[0.08] text-white/40">
                    {entry.visibility}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(entry.id);
                  }}
                  className="text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all text-xs"
                >
                  &#x2715;
                </button>
              </div>

              <h3 className="text-sm font-semibold text-white/85 mb-1.5">
                {entry.title}
              </h3>
              <p className="text-[13px] text-white/50 leading-relaxed mb-3 line-clamp-4">
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

              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-white/20">
                  {entry.agentId} &middot;{" "}
                  {new Date(entry.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  {canPublish && entry.status !== "approved" && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await fetch(`/api/knowledgebase/${entry.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            status: "approved",
                            visibility:
                              entry.visibility === "private" ? "partner" : entry.visibility,
                          }),
                        });
                        fetchEntries();
                      }}
                      className="text-[10px] text-brand-pink"
                    >
                      Approve
                    </button>
                  )}
                  <span className="text-[10px] text-white/20 opacity-0 group-hover:opacity-100 transition-all">
                    Click to edit
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0, 0, 0, 0.7)", backdropFilter: "blur(4px)" }}
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl p-6 space-y-5"
            style={{
              background: "linear-gradient(180deg, rgba(26, 26, 26, 0.98) 0%, rgba(13, 13, 13, 0.98) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5), 0 0 80px rgba(254, 49, 132, 0.08)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-xl uppercase text-gradient">
              {editingId ? "EDIT ENTRY" : "ADD ENTRY"}
            </h2>

            {/* Title */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">
                Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Concise title for this learning"
                className="w-full px-4 py-3 rounded-xl text-[14px] text-white placeholder:text-white/25 focus:outline-none transition-all"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">
                  Visibility
                </label>
                <select
                  value={form.visibility}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      visibility: e.target.value as "private" | "internal" | "partner",
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl text-[14px] text-white bg-dark-800 border border-white/[0.08]"
                >
                  <option value="private">Private</option>
                  <option value="internal">Internal</option>
                  <option value="partner">Partner</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as "draft" | "review" | "approved",
                    })
                  }
                  disabled={!canPublish}
                  className="w-full px-4 py-3 rounded-xl text-[14px] text-white bg-dark-800 border border-white/[0.08] disabled:opacity-50"
                >
                  <option value="draft">Draft</option>
                  <option value="review">Review</option>
                  <option value="approved">Approved</option>
                </select>
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">
                Content
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Detailed description of the learning (2-4 sentences)"
                rows={4}
                className="w-full px-4 py-3 rounded-xl text-[14px] text-white placeholder:text-white/25 focus:outline-none transition-all resize-none"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              />
            </div>

            {/* Category + Agent row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-[14px] text-white focus:outline-none appearance-none cursor-pointer"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  {EDIT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-dark-800">
                      {cat.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">
                  Agent
                </label>
                <select
                  value={form.agentId}
                  onChange={(e) => setForm({ ...form, agentId: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-[14px] text-white focus:outline-none appearance-none cursor-pointer"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  {AGENTS.map((a) => (
                    <option key={a} value={a} className="bg-dark-800">
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">
                Tags
                <span className="text-white/20 normal-case tracking-normal font-normal ml-1">
                  (comma separated)
                </span>
              </label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="positioning, voice, strategy"
                className="w-full px-4 py-3 rounded-xl text-[14px] text-white placeholder:text-white/25 focus:outline-none transition-all"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-3 rounded-full text-sm font-medium text-white/60 border border-white/[0.1] hover:border-white/[0.2] hover:text-white/80 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.title.trim() || !form.content.trim()}
                className="flex-1 py-3 rounded-full text-sm font-semibold text-white transition-all disabled:opacity-40 hover:-translate-y-0.5"
                style={{
                  background:
                    "linear-gradient(135deg, #FE3184 0%, #FF6B35 50%, #ec7211 100%)",
                  boxShadow: "0 8px 30px rgba(254, 49, 132, 0.25)",
                }}
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Add Entry"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
