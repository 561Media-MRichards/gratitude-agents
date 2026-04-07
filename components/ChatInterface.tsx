"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ChatMessage from "./ChatMessage";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  agentId: string;
  conversationId: string | null;
  onConversationCreated: (id: string) => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

async function downloadConversation(
  messages: Message[],
  format: "md" | "doc" | "pdf"
) {
  const content = messages
    .map((m) =>
      m.role === "user"
        ? `## You\n\n${m.content}`
        : `## Gratitude\n\n${m.content}`
    )
    .join("\n\n---\n\n");

  const title = "Conversation with Gratitude";
  const res = await fetch("/api/exports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      content: `_Gratitude.com -- ${new Date().toLocaleDateString()}_\n\n---\n\n${content}`,
      format,
    }),
  });

  if (!res.ok) return;

  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition") || "";
  const match = disposition.match(/filename="([^"]+)"/);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download =
    match?.[1] || `gratitude-conversation-${Date.now()}.${format}`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ChatInterface({
  agentId,
  conversationId,
  onConversationCreated,
  messages,
  setMessages,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [agentId]);

  function resizeTextarea() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || streaming) return;

    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setStreaming(true);

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
                    if (last?.role === "assistant") {
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

  const hasMessages = messages.length > 0;

  return (
    <div className="flex-1 flex flex-col h-screen bg-dark-950">
      {/* Header */}
      <div className="shrink-0 px-6 py-3 border-b border-white/[0.06] bg-dark-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
              style={{
                background: "rgba(254, 49, 132, 0.1)",
                border: "1px solid rgba(254, 49, 132, 0.2)",
              }}
            >
              &#x2728;
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-white/90">Gratitude</h2>
              <p className="text-[11px] text-white/40 truncate max-w-lg">
                Ask me anything - I'll bring the right expertise behind the scenes
              </p>
            </div>
          </div>

          {hasMessages && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => void downloadConversation(messages, "md")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] text-white/35 hover:text-white/60 hover:bg-white/[0.04] transition-all"
                title="Download as Markdown"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                MD
              </button>
              <button
                onClick={() => void downloadConversation(messages, "doc")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] text-white/35 hover:text-white/60 hover:bg-white/[0.04] transition-all"
                title="Download as DOC"
              >
                DOC
              </button>
              <button
                onClick={() => void downloadConversation(messages, "pdf")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] text-white/35 hover:text-white/60 hover:bg-white/[0.04] transition-all"
                title="Download as PDF"
              >
                PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto"
      >
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
          {!hasMessages && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-5"
                style={{
                  background: "rgba(254, 49, 132, 0.1)",
                  border: "1px solid rgba(254, 49, 132, 0.15)",
                }}
              >
                &#x2728;
              </div>
              <h3 className="font-display text-xl uppercase text-gradient mb-2">
                Gratitude
              </h3>
              <p className="text-sm text-white/40 max-w-md leading-relaxed">
                Your workspace assistant for copy, strategy, design direction, and anything else you need done.
              </p>
              <p className="text-[12px] text-white/25 mt-4">
                Tell me what you need and I'll take it from there
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <ChatMessage
              key={i}
              role={msg.role}
              content={msg.content}
              agentName="Gratitude"
              conversationId={conversationId}
              isStreaming={streaming && i === messages.length - 1 && msg.role === "assistant"}
            />
          ))}

          {streaming && messages[messages.length - 1]?.content === "" && (
            <div className="flex items-center gap-2 px-1">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-pink/70 animate-pulse" />
                <div
                  className="w-1.5 h-1.5 rounded-full bg-brand-coral/70 animate-pulse"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-1.5 h-1.5 rounded-full bg-brand-orange/70 animate-pulse"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
              <span className="text-[11px] text-white/25">
                Gratitude is working on it...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-white/[0.06] bg-dark-900/30">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div
            className="flex items-end gap-3 rounded-2xl px-4 py-3 transition-all"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                resizeTextarea();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Tell Gratitude what you need..."
              rows={1}
              className="flex-1 resize-none bg-transparent text-white/85 text-[15px] leading-relaxed placeholder:text-white/25 focus:outline-none"
              style={{ maxHeight: "200px" }}
              disabled={streaming}
            />
            <div className="flex items-center gap-2 shrink-0 pb-0.5">
              <span className="text-[10px] text-white/15 hidden sm:block">
                {streaming ? "Streaming..." : "Enter to send"}
              </span>
              <button
                onClick={handleSend}
                disabled={!input.trim() || streaming}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all duration-200 disabled:opacity-20 hover:-translate-y-0.5 active:translate-y-0"
                style={{
                  background:
                    input.trim() && !streaming
                      ? "linear-gradient(135deg, #FE3184 0%, #FF6B35 50%, #ec7211 100%)"
                      : "rgba(255,255,255,0.04)",
                  boxShadow:
                    input.trim() && !streaming
                      ? "0 4px 20px rgba(254, 49, 132, 0.25)"
                      : "none",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
