import KnowledgebaseViewer from "@/components/KnowledgebaseViewer";
import Image from "next/image";
import Link from "next/link";

export default function KnowledgebasePage() {
  return (
    <div className="min-h-screen bg-dark-950">
      <header className="border-b border-white/[0.06] bg-dark-900/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/gratitude-white.svg"
              alt="Gratitude"
              width={130}
              height={26}
            />
            <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-brand-pink">
              KNOWLEDGEBASE
            </span>
          </div>
          <div className="flex items-center gap-5 text-sm text-white/40">
            <Link href="/portal" className="hover:text-white/70 transition-colors">
              Portal
            </Link>
            <Link href="/chat" className="hover:text-white/70 transition-colors">
              Chat
            </Link>
            <Link href="/resources" className="hover:text-white/70 transition-colors">
              Resources
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl uppercase text-gradient mb-2">
            KNOWLEDGE BASE
          </h1>
          <p className="text-sm text-white/40">
            Learnings extracted automatically from agent conversations.
          </p>
        </div>

        <KnowledgebaseViewer />
      </main>
    </div>
  );
}
