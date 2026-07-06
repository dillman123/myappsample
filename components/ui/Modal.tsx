"use client";

import { useEffect, useRef } from "react";

// Glassmorphism modal overlay with terminal chrome.
export function Modal({
  title,
  open,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    // Move focus into the dialog for keyboard users.
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`glass-modal max-h-[85vh] w-full overflow-y-auto rounded-lg p-5 ${
          wide ? "max-w-3xl" : "max-w-lg"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between border-b border-phosphor-500/25 pb-2">
          <h2 className="term-glow text-sm font-bold uppercase tracking-widest">
            ┌ {title} ┐
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="px-2 text-phosphor-muted transition-colors hover:text-red-term"
            aria-label="Close"
          >
            [x]
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
