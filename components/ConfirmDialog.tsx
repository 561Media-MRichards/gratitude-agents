"use client";

// Non-blocking replacement for window.confirm(). Native confirm() freezes the
// main thread until dismissed, which shows up as an INP violation on whatever
// button opened it - this renders as a normal React overlay instead.
// Styled to match the sidebar's delete-confirmation modal.
export default function ConfirmDialog({
  open,
  title,
  body = "This can't be undone.",
  confirmLabel = "Delete",
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  body?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="mx-4 w-full max-w-xs p-5 rounded-2xl"
        style={{
          background: "linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <p className="text-[14px] text-white/80 font-medium mb-1">{title}</p>
        <p className="text-[12px] text-white/40 mb-5">{body}</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg text-[12px] font-medium text-white/60 border border-white/[0.1] hover:bg-white/[0.05] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-lg text-[12px] font-medium text-white bg-red-500/80 hover:bg-red-500 transition-all"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
