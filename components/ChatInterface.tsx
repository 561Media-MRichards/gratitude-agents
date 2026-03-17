"use client";

import { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  agentId: string;
  agentName: string;
  agentDescription: string;
  agentType: "system" | "marketing" | "design";
  conversationId: string | null;
  onConversationCreated: (id: string) => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const DESIGN_AGENTS = new Set([
  "social-creative",
  "deliverable-design",
  "web-mockup",
  "brand-asset-design",
  "canvas-art",
]);

export default function ChatInterface({
  agentId,
  agentName,
  agentDescription,
  agentType,
  conversationId,
  onConversationCreated,
  messages,
  setMessages,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [agentId]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || streaming) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setStreaming(true);

    // Add empty assistant message for streaming
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          agentId,
          conversationId,
        }),
      });

      if (!res.ok) throw new Error("Chat failed");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No reader");

      let done = false;
      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (value) {
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  setMessages((prev) => {
                    const updated = [...prev];
                    const last = updated[updated.length - 1];
                    if (last.role === "assistant") {
                      updated[updated.length - 1] = {
                        ...last,
                        content: last.content + parsed.text,
                      };
                    }
                    return updated;
                  });
                }
                if (parsed.conversationId && !conversationId) {
                  onConversationCreated(parsed.conversationId);
                }
              } catch {
                // skip parse errors
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Stream error:", err);
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last.role === "assistant" && !last.content) {
          updated[updated.length - 1] = {
            ...last,
            content: "Sorry, something went wrong. Please try again.",
          };
        }
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const isDesign = DESIGN_AGENTS.has(agentId);

  return (
    <div className="flex-1 flex flex-col h-screen bg-dark-950">
      {/* Agent header */}
      <div className="shrink-0 px-6 py-4 border-b border-white/[0.06] bg-dark-900/50">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
            style={{
              background: "rgba(254, 49, 132, 0.1)",
              border: "1px solid rgba(254, 49, 132, 0.2)",
            }}
          >
            {agentType === "system"
              ? "\u2699\uFE0F"
              : agentType === "design"
                ? "\uD83C\uDFA8"
                : "\uD83D\uDCC8"}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white/90">{agentName}</h2>
            <p className="text-[11px] text-white/40 line-clamp-1 max-w-lg">
              {agentDescription}
            </p>
          </div>
        </div>

        {isDesign && (
          <div className="mt-3 px-3 py-2 rounded-lg bg-brand-orange/10 border border-brand-orange/20 text-[12px] text-brand-orange">
            Web Mode — provides design specs and creative direction. For
            rendered PNG/PDF output, run locally via Claude Code.
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-4"
              style={{
                background: "rgba(254, 49, 132, 0.1)",
                border: "1px solid rgba(254, 49, 132, 0.15)",
              }}
            >
              {agentType === "system"
                ? "\u2699\uFE0F"
                : agentType === "design"
                  ? "\uD83C\uDFA8"
                  : "\uD83D\uDCC8"}
            </div>
            <h3 className="font-display text-xl uppercase text-gradient mb-2">
              {agentName}
            </h3>
            <p className="text-sm text-white/40 max-w-md">
              {agentDescription}
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} />
        ))}

        {streaming && messages[messages.length - 1]?.content === "" && (
          <div className="flex gap-1 px-2">
            <div className="w-2 h-2 rounded-full bg-brand-pink/60 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-brand-coral/60 animate-pulse delay-150" />
            <div className="w-2 h-2 rounded-full bg-brand-orange/60 animate-pulse delay-300" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-6 py-4 border-t border-white/[0.06]">
        <div className="flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${agentName}...`}
            rows={1}
            className="flex-1 resize-none px-4 py-3 bg-dark-800 border border-white/[0.08] rounded-xl text-white/80 text-[15px] placeholder:text-white/30 focus:outline-none focus:border-brand-pink/30 focus:ring-1 focus:ring-brand-pink/20 transition-colors"
            style={{ maxHeight: "150px" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = Math.min(target.scrollHeight, 150) + "px";
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || streaming}
            className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-30"
            style={{
              background:
                input.trim() && !streaming
                  ? "linear-gradient(135deg, #FE3184 0%, #FF6B35 50%, #ec7211 100%)"
                  : "rgba(255,255,255,0.05)",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
