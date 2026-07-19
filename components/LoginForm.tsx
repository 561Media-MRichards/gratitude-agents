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
        router.push("/chat");
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

  const inputClasses =
    "w-full px-3.5 py-3 rounded-lg text-[15px] text-white bg-white/[0.05] border border-white/[0.1] placeholder:text-white/25 transition-[border-color,box-shadow] duration-200 focus:outline-none focus:border-brand-pink/50 focus:shadow-[0_0_0_3px_rgba(254,49,132,0.1)]";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="login-email" className="block text-[12px] font-medium text-white/50">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@gratitude.com"
          autoComplete="email"
          className={inputClasses}
          autoFocus
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="login-password" className="block text-[12px] font-medium text-white/50">
          Password
        </label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className={inputClasses}
        />
      </div>

      {error && (
        <p className="text-[13px] text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !password || !email}
        className="w-full mt-2 py-3 px-6 rounded-full font-semibold text-white text-[15px] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 will-change-transform"
        style={{
          background: "linear-gradient(135deg, #FE3184 0%, #FF6B35 50%, #ec7211 100%)",
          boxShadow: "0 10px 40px rgba(254, 49, 132, 0.3)",
        }}
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
