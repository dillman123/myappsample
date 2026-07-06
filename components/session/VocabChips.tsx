"use client";

import { useState } from "react";
import type { VocabTerm } from "@/lib/types";

// Vocabulary chips — click to flip between term and definition.
export function VocabChips({ vocab }: { vocab: VocabTerm[] }) {
  const [flipped, setFlipped] = useState<Set<string>>(new Set());

  function toggle(term: string) {
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(term)) next.delete(term);
      else next.add(term);
      return next;
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {vocab.map((v) => {
        const isFlipped = flipped.has(v.term);
        return (
          <button
            key={v.term}
            onClick={() => toggle(v.term)}
            title={isFlipped ? "Click to show term" : "Click to reveal definition"}
            className={`rounded-full border px-3 py-1 text-left text-xs transition-colors ${
              isFlipped
                ? "border-cyan-term/50 bg-cyan-term/10 text-cyan-term"
                : "border-phosphor-500/40 bg-phosphor-500/5 text-phosphor-300 hover:bg-phosphor-500/15"
            }`}
          >
            {isFlipped ? v.definition : `⟨${v.term}⟩`}
          </button>
        );
      })}
    </div>
  );
}
