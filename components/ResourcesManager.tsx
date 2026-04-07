"use client";

import { useEffect, useState } from "react";

interface ResourceItem {
  id: string;
  title: string;
  description: string | null;
  fileName: string | null;
  mimeType: string | null;
  visibility: "private" | "internal" | "partner";
  status: "draft" | "published";
  type: "upload" | "generated" | "link";
  tags: string[];
  updatedAt: string;
}

interface SessionResponse {
  user: {
    role: "admin" | "employee" | "partner";
  };
}

export default function ResourcesManager() {
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("all");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"private" | "internal" | "partner">("internal");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function loadResources() {
    const [sessionRes, resourcesRes] = await Promise.all([
      fetch("/api/session"),
      fetch("/api/resources"),
    ]);

    if (sessionRes.ok) {
      const sessionData = await sessionRes.json();
      setSession(sessionData);
      if (sessionData.user.role === "partner") {
        setVisibility("private");
      }
    }

    if (resourcesRes.ok) {
      setResources(await resourcesRes.json());
    }
  }

  useEffect(() => {
    void loadResources();
  }, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file && !title.trim()) return;

    setSaving(true);

    try {
      const formData = new FormData();
      formData.set("title", title);
      formData.set("description", description);
      formData.set("visibility", visibility);
      formData.set("tags", tags);

      if (file) {
        formData.set("file", file);
      }

      const res = await fetch("/api/resources", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setTitle("");
        setDescription("");
        setTags("");
        setFile(null);
        await loadResources();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish(resource: ResourceItem) {
    await fetch(`/api/resources/${resource.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "published",
        visibility: resource.visibility === "private" ? "partner" : resource.visibility,
      }),
    });
    await loadResources();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/resources/${id}`, { method: "DELETE" });
    await loadResources();
  }

  const canPublish = session?.user.role === "admin" || session?.user.role === "employee";
  const filteredResources = resources.filter((resource) => {
    const matchesQuery = !query.trim()
      || resource.title.toLowerCase().includes(query.toLowerCase())
      || resource.description?.toLowerCase().includes(query.toLowerCase())
      || resource.tags?.some((tag) => tag.toLowerCase().includes(query.toLowerCase()));
    const matchesStatus = statusFilter === "all" || resource.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleUpload}
        className="rounded-2xl border border-white/[0.08] p-6 space-y-4"
        style={{
          background: "linear-gradient(180deg, rgba(26,26,26,0.95) 0%, rgba(13,13,13,0.95) 100%)",
        }}
      >
        <div>
          <h2 className="font-display text-2xl uppercase text-gradient mb-2">
            Resource Library
          </h2>
          <p className="text-sm text-white/45">
            Upload partner documents, keep generated outputs, and make approved files downloadable by the right audience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Resource title"
            className="px-4 py-3 rounded-xl bg-dark-800 border border-white/[0.08] text-white/80"
          />
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as "private" | "internal" | "partner")}
            className="px-4 py-3 rounded-xl bg-dark-800 border border-white/[0.08] text-white/80"
          >
            <option value="private">Private</option>
            <option value="internal">Internal</option>
            <option value="partner">Partner</option>
          </select>
        </div>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this file for?"
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-white/[0.08] text-white/80"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="proposal, sponsor, deck"
            className="px-4 py-3 rounded-xl bg-dark-800 border border-white/[0.08] text-white/80"
          />
          <input
            type="file"
            accept=".md,.markdown,.txt,.doc,.docx,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="px-4 py-3 rounded-xl bg-dark-800 border border-white/[0.08] text-white/60"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-3 rounded-full text-sm font-semibold text-white"
          style={{
            background: "linear-gradient(135deg, #FE3184 0%, #FF6B35 50%, #ec7211 100%)",
          }}
        >
          {saving ? "Saving..." : "Add Resource"}
        </button>
      </form>

      <div className="rounded-2xl border border-white/[0.08] p-5 bg-white/[0.03]">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
          <div>
            <h3 className="text-lg text-white/90 font-semibold">Browse saved files</h3>
            <p className="text-sm text-white/40 mt-1">
              Search by title, description, or tags. Publish only the files that should be visible beyond the creator.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search files"
              className="px-4 py-3 rounded-xl bg-dark-800 border border-white/[0.08] text-white/80"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "draft" | "published")}
              className="px-4 py-3 rounded-xl bg-dark-800 border border-white/[0.08] text-white/80"
            >
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </div>

      {filteredResources.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.1] p-10 text-center bg-white/[0.02]">
          <h3 className="text-lg font-semibold text-white/80 mb-2">No resources to show</h3>
          <p className="text-sm text-white/40 max-w-xl mx-auto leading-relaxed">
            Upload a file, save an agent output from chat, or widen your filters to see more documents in the shared library.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredResources.map((resource) => (
          <div
            key={resource.id}
            className="rounded-2xl border border-white/[0.08] p-5 bg-white/[0.03]"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="text-lg font-semibold text-white/90">{resource.title}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-[10px] uppercase tracking-[0.16em] text-white/30 border border-white/[0.08] rounded-full px-2 py-1">
                    {resource.type}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.16em] text-white/30 border border-white/[0.08] rounded-full px-2 py-1">
                    {resource.status}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.16em] text-white/30 border border-white/[0.08] rounded-full px-2 py-1">
                    {resource.visibility}
                  </span>
                </div>
              </div>
              <a
                href={`/api/resources/${resource.id}/download`}
                className="text-sm text-brand-pink hover:text-white"
              >
                Download
              </a>
            </div>

            {resource.description && (
              <p className="text-sm text-white/45 leading-relaxed mb-4">{resource.description}</p>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
              {resource.tags?.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] px-2 py-1 rounded-full border border-white/[0.08] text-white/45"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between text-[12px] text-white/30">
              <span>{resource.fileName || resource.mimeType || "Stored output"}</span>
              <span>{new Date(resource.updatedAt).toLocaleDateString()}</span>
            </div>

            <div className="flex gap-2 mt-4">
              {canPublish && resource.status !== "published" && (
                <button
                  onClick={() => void handlePublish(resource)}
                  className="px-3 py-2 rounded-lg text-[12px] border border-brand-pink/30 text-brand-pink"
                >
                  Publish
                </button>
              )}
              <button
                onClick={() => void handleDelete(resource.id)}
                className="px-3 py-2 rounded-lg text-[12px] border border-white/[0.08] text-white/45"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
}
