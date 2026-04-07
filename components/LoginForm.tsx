"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push("/portal");
      } else {
        const data = await res.json();
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="w-full px-4 py-3.5 rounded-xl text-[15px] text-white placeholder:text-white/30 transition-all duration-300 focus:outline-none"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
          autoFocus
        />
      </div>

      <div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-4 py-3.5 rounded-xl text-[15px] text-white placeholder:text-white/30 transition-all duration-300 focus:outline-none"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "rgba(254, 49, 132, 0.5)";
            e.target.style.boxShadow = "0 0 0 3px rgba(254, 49, 132, 0.1)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
            e.target.style.boxShadow = "none";
          }}
        />
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !password || !email}
        className="w-full py-3.5 px-6 rounded-full font-semibold text-white text-[15px] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 will-change-transform"
        style={{
          background: "linear-gradient(135deg, #FE3184 0%, #FF6B35 50%, #ec7211 100%)",
          boxShadow: "0 10px 40px rgba(254, 49, 132, 0.3)",
        }}
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
