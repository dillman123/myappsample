"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import type { IntegrationStatus } from "@/lib/integrations/provider";

const SAMPLE_OUTLINE = `Distributed Systems
## Consistency Models
- linearizability
- eventual consistency
- CAP theorem
## Consensus
- leader election
- raft
- quorums`;

// Course import panel: paste an outline (parsed server-side) or pull
// from a connected platform adapter. No credentials are handled here —
// the browser only ever sends an outline or an external course id.
export function ImportCourse({ integrations }: { integrations: IntegrationStatus[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [outline, setOutline] = useState(SAMPLE_OUTLINE);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function importOutline() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/courses/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "outline", outlineText: outline }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="mb-3 space-y-1 text-xs">
        {integrations.map((integration) => (
          <div key={integration.id} className="flex items-center justify-between">
            <span className="uppercase tracking-widest text-phosphor-muted">
              {integration.name}
            </span>
            {integration.connected ? (
              <span className="text-phosphor-400">● linked</span>
            ) : (
              <span className="text-phosphor-muted/60" title="Set the API token in server env vars">
                ○ offline
              </span>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded border border-phosphor-500/40 px-3 py-2 text-xs uppercase tracking-widest text-phosphor-300 transition-colors hover:bg-phosphor-500/10"
      >
        [ + ingest course ]
      </button>
      <p className="mt-2 text-[10px] leading-relaxed text-phosphor-muted/70">
        Platform tokens are configured server-side (.env) — this client never
        stores credentials.
      </p>

      <Modal title="Course Ingestion" open={open} onClose={() => setOpen(false)} wide>
        <p className="mb-2 text-xs text-phosphor-muted">
          Paste a course outline. First line = title, <code>## headings</code> =
          modules, <code>-</code> bullets = topics. The parser generates a
          session-by-session learning path with notes, vocab chips and a study
          plan.
        </p>
        <textarea
          value={outline}
          onChange={(e) => setOutline(e.target.value)}
          rows={10}
          spellCheck={false}
          className="w-full rounded border border-phosphor-500/30 bg-charcoal-950 p-3 text-xs text-phosphor-400 outline-none focus:border-phosphor-400/60"
        />
        {error && <p className="mt-2 text-xs text-red-term">! {error}</p>}
        <div className="mt-3 flex justify-end gap-3">
          <button
            onClick={() => setOpen(false)}
            className="rounded border border-phosphor-muted/40 px-3 py-1.5 text-xs uppercase tracking-widest text-phosphor-muted hover:text-phosphor-300"
          >
            [ cancel ]
          </button>
          <button
            onClick={importOutline}
            disabled={busy}
            className="rounded border border-phosphor-500/50 bg-phosphor-500/10 px-3 py-1.5 text-xs uppercase tracking-widest text-phosphor-300 transition-colors hover:bg-phosphor-500/20 disabled:opacity-50"
          >
            {busy ? "[ parsing… ]" : "[ run parser ]"}
          </button>
        </div>
      </Modal>
    </>
  );
}
