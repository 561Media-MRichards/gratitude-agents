import AppShell from "@/components/AppShell";
import KnowledgebaseViewer from "@/components/KnowledgebaseViewer";

export default function KnowledgebasePage() {
  return (
    <AppShell title="Knowledge base" maxWidth="max-w-7xl">
      <div className="mb-8">
        <h1 className="font-display uppercase text-[26px] sm:text-[30px] leading-[1.05] tracking-[-0.01em] text-white mb-2">
          Knowledge base
        </h1>
        <p className="text-[14px] text-white/45 max-w-md leading-relaxed">
          Learnings extracted automatically from agent conversations.
        </p>
      </div>
      <KnowledgebaseViewer />
    </AppShell>
  );
}
