"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "employee" | "partner";
  active: boolean;
  createdAt: string;
}

interface SessionResponse {
  user: {
    name: string;
    role: "admin" | "employee" | "partner";
  };
}

const ROLES: User["role"][] = ["admin", "employee", "partner"];

export default function AdminPage() {
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPassword, setEditPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  // New user form
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<User["role"]>("employee");

  useEffect(() => {
    async function load() {
      const sessionRes = await fetch("/api/session");
      if (!sessionRes.ok) {
        router.push("/login");
        return;
      }

      const sess = await sessionRes.json();
      if (sess.user.role !== "admin") {
        router.push("/chat");
        return;
      }

      setSession(sess);

      const usersRes = await fetch("/api/admin/users");
      if (usersRes.ok) {
        setUsers(await usersRes.json());
      } else {
        setError("Failed to load users");
      }

      setLoading(false);
    }

    void load();
  }, [router]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName,
        email: newEmail,
        password: newPassword,
        role: newRole,
      }),
    });

    if (res.ok) {
      const user = await res.json();
      setUsers((prev) => [...prev, user]);
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("employee");
      setShowForm(false);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to create user");
    }

    setSaving(false);
  }

  async function handleToggleActive(user: User) {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, active: !user.active }),
    });

    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, active: !u.active } : u))
    );
  }

  async function handleRoleChange(user: User, role: User["role"]) {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, role }),
    });

    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, role } : u))
    );
  }

  async function handleResetPassword(userId: string) {
    if (!editPassword.trim()) return;
    setSaving(true);

    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId, password: editPassword }),
    });

    setEditPassword("");
    setEditingId(null);
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <p className="text-white/40">Loading...</p>
      </div>
    );
  }

  if (!session || session.user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-dark-950 px-6 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Image
              src="/gratitude-white.svg"
              alt="Gratitude"
              width={110}
              height={22}
            />
            <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-white/30">
              Admin
            </span>
          </div>
          <Link
            href="/chat"
            className="text-[13px] text-white/40 hover:text-white/70 transition-colors"
          >
            Back to chat
          </Link>
        </div>

        {/* Title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-white/90">Users</h1>
            <p className="text-[13px] text-white/40 mt-1">
              {users.length} user{users.length !== 1 ? "s" : ""} total
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-xl text-[13px] font-medium text-white/80 transition-all hover:bg-white/[0.08]"
            style={{
              background: showForm ? "rgba(255,255,255,0.06)" : "rgba(254, 49, 132, 0.15)",
              border: showForm
                ? "1px solid rgba(255,255,255,0.1)"
                : "1px solid rgba(254, 49, 132, 0.3)",
            }}
          >
            {showForm ? "Cancel" : "+ Add user"}
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[13px] text-red-400">
            {error}
          </div>
        )}

        {/* Add user form */}
        {showForm && (
          <form
            onSubmit={handleCreate}
            className="mb-6 p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02]"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-white/30 mb-1.5">
                  Name
                </label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Full name"
                  required
                  className="w-full px-3 py-2.5 rounded-lg text-[13px] text-white/80 placeholder:text-white/20 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-white/[0.15]"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-white/30 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                  className="w-full px-3 py-2.5 rounded-lg text-[13px] text-white/80 placeholder:text-white/20 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-white/[0.15]"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-white/30 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Set a password"
                  required
                  className="w-full px-3 py-2.5 rounded-lg text-[13px] text-white/80 placeholder:text-white/20 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-white/[0.15]"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-white/30 mb-1.5">
                  Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as User["role"])}
                  className="w-full px-3 py-2.5 rounded-lg text-[13px] text-white/80 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-white/[0.15]"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r} className="bg-dark-900 text-white">
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={saving || !newName || !newEmail || !newPassword}
              className="px-5 py-2.5 rounded-xl text-[13px] font-medium text-white disabled:opacity-40 transition-all"
              style={{
                background: "linear-gradient(135deg, #FE3184 0%, #FF6B35 50%, #ec7211 100%)",
              }}
            >
              {saving ? "Creating..." : "Create user"}
            </button>
          </form>
        )}

        {/* Users table */}
        <div className="rounded-2xl border border-white/[0.08] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider text-white/30 font-medium">
                  User
                </th>
                <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider text-white/30 font-medium">
                  Role
                </th>
                <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider text-white/30 font-medium">
                  Status
                </th>
                <th className="text-right px-5 py-3 text-[10px] uppercase tracking-wider text-white/30 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="text-[13px] text-white/80 font-medium">
                      {user.name}
                    </div>
                    <div className="text-[11px] text-white/35 mt-0.5">
                      {user.email}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user, e.target.value as User["role"])
                      }
                      className="px-2 py-1 rounded-md text-[12px] bg-white/[0.04] border border-white/[0.08] text-white/70 focus:outline-none"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r} className="bg-dark-900 text-white">
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => handleToggleActive(user)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                        user.active
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          user.active ? "bg-green-400" : "bg-red-400"
                        }`}
                      />
                      {user.active ? "Active" : "Disabled"}
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {editingId === user.id ? (
                      <div className="flex items-center gap-2 justify-end">
                        <input
                          type="password"
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          placeholder="New password"
                          className="w-36 px-2.5 py-1.5 rounded-lg text-[12px] text-white/80 placeholder:text-white/20 bg-white/[0.04] border border-white/[0.08] focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleResetPassword(user.id)}
                          disabled={saving || !editPassword.trim()}
                          className="px-3 py-1.5 rounded-lg text-[11px] text-white/70 bg-white/[0.06] hover:bg-white/[0.1] disabled:opacity-40 transition-all"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditPassword("");
                          }}
                          className="px-2 py-1.5 rounded-lg text-[11px] text-white/40 hover:text-white/60 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingId(user.id)}
                        className="text-[11px] text-white/30 hover:text-white/60 transition-colors"
                      >
                        Reset password
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
