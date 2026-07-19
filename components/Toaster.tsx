"use client";

import { useEffect, useState } from "react";

// Lightweight toast bus - call toast("message") from anywhere on the client.
// Toaster (mounted once in the root layout) listens and renders the stack.
export function toast(message: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("gratitude:toast", { detail: message }));
  }
}

interface ToastItem {
  id: number;
  message: string;
}

export default function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    let nextId = 1;
    function onToast(e: Event) {
      const message = (e as CustomEvent<string>).detail;
      const id = nextId++;
      setToasts((prev) => [...prev, { id, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    }
    window.addEventListener("gratitude:toast", onToast);
    return () => window.removeEventListener("gratitude:toast", onToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="px-4 py-3 rounded-xl text-[13px] text-white/85 shadow-lg"
          style={{
            background: "rgba(26,26,26,0.97)",
            border: "1px solid rgba(254,49,132,0.3)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
