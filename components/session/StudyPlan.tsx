"use client";

import { useMemo, useState } from "react";
import type { StudyPlanItem } from "@/lib/types";
import { AsciiProgress } from "@/components/ui/AsciiProgress";

// Dynamic study plan — checkable items with a live progress readout.
export function StudyPlan({ items: initial }: { items: StudyPlanItem[] }) {
  const [items, setItems] = useState(initial);

  const { pct, remaining } = useMemo(() => {
    const done = items.filter((i) => i.done).length;
    const remainingMin = items.filter((i) => !i.done).reduce((n, i) => n + i.estMinutes, 0);
    return {
      pct: items.length === 0 ? 0 : (done / items.length) * 100,
      remaining: remainingMin,
    };
  }, [items]);

  function toggle(id: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <AsciiProgress percent={pct} width={14} />
        <span className="text-phosphor-muted">~{remaining} min left</span>
      </div>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.id}>
            <label className="flex cursor-pointer items-start gap-2 text-xs">
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => toggle(item.id)}
                className="mt-0.5 accent-[#2eff6e]"
              />
              <span
                className={
                  item.done ? "text-phosphor-muted line-through" : "text-phosphor-300"
                }
              >
                {item.label}{" "}
                <span className="text-phosphor-muted/70">({item.estMinutes}m)</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
