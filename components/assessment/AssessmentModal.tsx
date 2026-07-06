"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import type { Assessment, GradeReport } from "@/lib/types";

// Assessment runner — generates a test server-side, collects answers
// for all three formats, and renders the grade report. Answer keys
// never reach this component.
export function AssessmentModal({ sessionId }: { sessionId: string }) {
  const [open, setOpen] = useState(false);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [report, setReport] = useState<GradeReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setOpen(true);
    setReport(null);
    setAnswers({});
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate assessment");
      setAssessment(data.assessment);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate assessment");
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    if (!assessment) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "grade",
          assessmentId: assessment.id,
          submissions: assessment.questions.map((q) => ({
            questionId: q.id,
            answer: answers[q.id] ?? "",
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Grading failed");
      setReport(data.report);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Grading failed");
    } finally {
      setBusy(false);
    }
  }

  const resultFor = (questionId: string) =>
    report?.results.find((r) => r.questionId === questionId);

  return (
    <>
      <button
        onClick={start}
        className="w-full rounded border border-amber-term/50 bg-amber-term/10 px-3 py-2 text-xs uppercase tracking-widest text-amber-term transition-colors hover:bg-amber-term/20"
      >
        [ run assessment ]
      </button>

      <Modal
        title={assessment?.title ?? "Assessment"}
        open={open}
        onClose={() => setOpen(false)}
        wide
      >
        {busy && !assessment && (
          <p className="text-xs text-phosphor-muted">
            generating questions<span className="term-cursor" />
          </p>
        )}
        {error && <p className="mb-3 text-xs text-red-term">! {error}</p>}

        {report && (
          <div className="mb-4 rounded border border-phosphor-500/30 bg-phosphor-500/5 p-3 text-center">
            <p className="term-glow text-2xl font-bold">
              {report.score}/{report.possible}{" "}
              <span className="text-sm">({report.percent}%)</span>
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-phosphor-muted">
              {report.percent >= 80
                ? "▸ mastery achieved"
                : report.percent >= 60
                  ? "▸ passing — review the misses below"
                  : "▸ revisit the session notes and retry"}
            </p>
          </div>
        )}

        {assessment && (
          <ol className="space-y-5">
            {assessment.questions.map((q, qi) => {
              const result = resultFor(q.id);
              return (
                <li key={q.id} className="border-l-2 border-phosphor-500/30 pl-3">
                  <p className="mb-2 whitespace-pre-line text-xs text-phosphor-300">
                    <span className="text-phosphor-muted">
                      Q{qi + 1} · {q.format} · {q.points}pt ·{" "}
                    </span>
                    {q.prompt}
                  </p>

                  {q.format === "multiple-choice" && (
                    <div className="space-y-1">
                      {q.choices.map((choice, ci) => (
                        <label
                          key={ci}
                          className="flex cursor-pointer items-center gap-2 text-xs text-phosphor-400"
                        >
                          <input
                            type="radio"
                            name={q.id}
                            checked={answers[q.id] === String(ci)}
                            onChange={() =>
                              setAnswers((a) => ({ ...a, [q.id]: String(ci) }))
                            }
                            disabled={!!report}
                            className="accent-[#2eff6e]"
                          />
                          <span>
                            {String.fromCharCode(97 + ci)}) {choice}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  {q.format === "fill-in-the-blank" && (
                    <input
                      type="text"
                      value={answers[q.id] ?? ""}
                      onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                      disabled={!!report}
                      placeholder="type the missing term…"
                      spellCheck={false}
                      className="w-full max-w-sm rounded border border-phosphor-500/30 bg-charcoal-950 px-2 py-1.5 text-xs text-phosphor-300 outline-none focus:border-phosphor-400/60"
                    />
                  )}

                  {q.format === "long-form" && (
                    <textarea
                      value={answers[q.id] ?? ""}
                      onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                      disabled={!!report}
                      rows={4}
                      placeholder="write your response…"
                      className="w-full rounded border border-phosphor-500/30 bg-charcoal-950 px-2 py-1.5 text-xs text-phosphor-300 outline-none focus:border-phosphor-400/60"
                    />
                  )}

                  {result && (
                    <p
                      className={`mt-2 text-xs ${
                        result.correct ? "text-phosphor-400" : "text-red-term"
                      }`}
                    >
                      {result.correct ? "✓" : "✗"} {result.awarded}/{result.possible}pt —{" "}
                      {result.feedback}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        )}

        {assessment && !report && (
          <div className="mt-5 flex justify-end">
            <button
              onClick={submit}
              disabled={busy}
              className="rounded border border-phosphor-500/50 bg-phosphor-500/10 px-4 py-2 text-xs uppercase tracking-widest text-phosphor-300 transition-colors hover:bg-phosphor-500/20 disabled:opacity-50"
            >
              {busy ? "[ grading… ]" : "[ submit for grading ]"}
            </button>
          </div>
        )}
        {report && (
          <div className="mt-5 flex justify-end gap-3">
            <button
              onClick={start}
              className="rounded border border-phosphor-500/50 px-4 py-2 text-xs uppercase tracking-widest text-phosphor-300 hover:bg-phosphor-500/10"
            >
              [ retake ]
            </button>
            <button
              onClick={() => setOpen(false)}
              className="rounded border border-phosphor-muted/40 px-4 py-2 text-xs uppercase tracking-widest text-phosphor-muted hover:text-phosphor-300"
            >
              [ close ]
            </button>
          </div>
        )}
      </Modal>
    </>
  );
}
