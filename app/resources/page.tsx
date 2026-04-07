import Image from "next/image";
import Link from "next/link";
import ResourcesManager from "@/components/ResourcesManager";

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-dark-950">
      <header className="border-b border-white/[0.06] bg-dark-900/50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/gratitude-white.svg"
              alt="Gratitude"
              width={130}
              height={26}
            />
            <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-brand-pink">
              RESOURCES
            </span>
          </div>
          <div className="flex items-center gap-5 text-sm text-white/40">
            <Link href="/portal" className="hover:text-white/70 transition-colors">
              Portal
            </Link>
            <Link href="/chat" className="hover:text-white/70 transition-colors">
              Chat
            </Link>
            <Link href="/knowledgebase" className="hover:text-white/70 transition-colors">
              Knowledge Base
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <ResourcesManager />
      </main>
    </div>
  );
}
