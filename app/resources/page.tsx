import AppShell from "@/components/AppShell";
import ResourcesManager from "@/components/ResourcesManager";

export default function ResourcesPage() {
  return (
    <AppShell title="Files">
      <div className="mb-8">
        <h1 className="font-display uppercase text-[26px] sm:text-[30px] leading-[1.05] tracking-[-0.01em] text-white mb-2">
          Files
        </h1>
        <p className="text-[14px] text-white/45 max-w-md leading-relaxed">
          Upload files and reference examples, then publish the ones the team
          should see.
        </p>
      </div>
      <ResourcesManager />
    </AppShell>
  );
}
