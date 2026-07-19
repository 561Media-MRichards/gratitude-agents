import Sidebar from "./Sidebar";

/**
 * Shared page shell: the same left sidebar the chat uses (conversation list
 * hidden), a slim header matching the chat header, and a scrollable content
 * column. Every non-chat page renders inside this so the portal feels like
 * one product.
 */
export default function AppShell({
  title,
  maxWidth = "max-w-6xl",
  children,
}: {
  /** Label shown in the slim top bar, matching the chat header. */
  title: string;
  /** Tailwind max-width class for the content column. */
  maxWidth?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-dark-950">
      <Sidebar showConversations={false} />

      <div className="flex-1 flex flex-col h-screen min-w-0">
        <header className="shrink-0 h-[52px] px-6 border-b border-white/[0.06] bg-dark-900/50 flex items-center">
          <h2 className="text-[13px] font-medium text-white/85">{title}</h2>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className={`${maxWidth} mx-auto px-6 py-8`}>{children}</div>
        </div>
      </div>
    </div>
  );
}
