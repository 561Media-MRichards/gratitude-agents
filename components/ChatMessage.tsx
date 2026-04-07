"use client";

import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  agentName?: string;
  conversationId?: string | null;
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all"
      title={label || "Copy"}
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          {label || "Copy"}
        </>
      )}
    </button>
  );
}

function DownloadButton({
  content,
  title,
  format,
}: {
  content: string;
  title: string;
  format: "md" | "doc" | "pdf" | "pptx";
}) {
  async function handleDownload() {
    const res = await fetch("/api/exports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, title, format }),
    });

    if (!res.ok) return;

    const blob = await res.blob();
    const disposition = res.headers.get("Content-Disposition") || "";
    const match = disposition.match(/filename="([^"]+)"/);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = match?.[1] || `${title}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all"
      title="Download as file"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {format.toUpperCase()}
    </button>
  );
}

function SaveButton({
  content,
  title,
  conversationId,
}: {
  content: string;
  title: string;
  conversationId?: string | null;
}) {
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);

    try {
      await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: "Saved from agent output",
          type: "generated",
          fileName: `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "gratitude-output"}.md`,
          mimeType: "text/markdown; charset=utf-8",
          extension: "md",
          conversationId,
          textContent: content,
          tags: ["agent-output"],
        }),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      onClick={handleSave}
      className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all"
      title="Save to resource library"
      disabled={saving}
    >
      {saving ? "Saving..." : "Save"}
    </button>
  );
}

function CodeBlock({ children, className }: { children: string; className?: string }) {
  const language = className?.replace("language-", "") || "";

  return (
    <div className="relative group/code my-3 rounded-lg overflow-hidden border border-white/[0.06]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.03] border-b border-white/[0.04]">
        <span className="text-[10px] font-medium uppercase tracking-wider text-white/25">
          {language || "code"}
        </span>
        <CopyButton text={children} label="Copy code" />
      </div>
      {/* Code */}
      <pre className="!m-0 !rounded-none !border-0 overflow-x-auto">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}

export default function ChatMessage({
  role,
  content,
  isStreaming,
  agentName = "Gratitude Agent",
  conversationId,
}: ChatMessageProps) {
  if (role === "user") {
    return (
      <div className="flex justify-end group/msg">
        <div className="max-w-[75%] px-4 py-3 rounded-2xl rounded-br-sm text-white/85 text-[15px] leading-relaxed"
          style={{
            background: "rgba(254, 49, 132, 0.12)",
            border: "1px solid rgba(254, 49, 132, 0.18)",
          }}
        >
          <div className="whitespace-pre-wrap">{content}</div>
        </div>
      </div>
    );
  }

  const components: Components = {
    code({ className, children, ...props }) {
      const isBlock = className?.startsWith("language-") ||
        (typeof children === "string" && children.includes("\n"));

      if (isBlock) {
        return (
          <CodeBlock className={className}>
            {String(children).replace(/\n$/, "")}
          </CodeBlock>
        );
      }

      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    pre({ children }) {
      return <>{children}</>;
    },
  };

  return (
    <div className="flex justify-start group/msg">
      <div className="max-w-[85%] min-w-0">
        <div className="prose-chat text-[15px]">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
            {content}
          </ReactMarkdown>
        </div>

        {/* Action bar — appears after streaming completes */}
        {content && !isStreaming && (
          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover/msg:opacity-100 transition-opacity duration-200">
            <CopyButton text={content} label="Copy" />
            <DownloadButton
              content={content}
              title={`${agentName} Output`}
              format="md"
            />
            <DownloadButton
              content={content}
              title={`${agentName} Output`}
              format="doc"
            />
            <DownloadButton
              content={content}
              title={`${agentName} Output`}
              format="pdf"
            />
            <DownloadButton
              content={content}
              title={`${agentName} Output`}
              format="pptx"
            />
            <SaveButton
              content={content}
              title={`${agentName} Output`}
              conversationId={conversationId}
            />
          </div>
        )}
      </div>
    </div>
  );
}
