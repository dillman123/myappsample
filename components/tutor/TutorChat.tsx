"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/types";

// Persistent AI tutor sidebar. All model calls go through /api/tutor —
// the browser holds conversation text only, never credentials.
export function TutorChat({
  sessionId,
  sessionTitle,
}: {
  sessionId: string;
  sessionTitle: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `Tutor ready for "${sessionTitle}". Ask me about any concept, request a walkthrough, or say "quiz me" for guidance on the assessment.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  // "ready" until the first reply tells us which mode the server is in.
  const [mode, setMode] = useState<"ready" | "ai" | "offline" | "error">("ready");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, busy]);

  async function send() {
    const question = input.trim();
    if (!question || busy) return;
    const nextHistory: ChatMessage[] = [...messages, { role: "user", content: question }];
    setMessages(nextHistory);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, messages: nextHistory }),
      });
      const data = await res.json();
      const reply: string = res.ok
        ? data.reply
        : (data.error ?? "Tutor request failed — try again.");
      if (res.ok) {
        setMode(reply.startsWith("[offline tutor]") ? "offline" : "ai");
      } else {
        setMode("error");
      }
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMode("error");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Network error — the tutor endpoint is unreachable." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="term-panel flex h-full min-h-[420px] flex-col rounded-md">
      <div className="flex items-center justify-between border-b border-phosphor-500/25 px-4 py-2">
        <h2 className="text-xs font-bold uppercase tracking-widest text-phosphor-300">
          ┌ ai tutor ┐
        </h2>
        <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-phosphor-muted">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              mode === "error"
                ? "bg-red-term shadow-[0_0_5px_#ff5c5c]"
                : mode === "offline"
                  ? "bg-amber-term shadow-[0_0_5px_#ffb347]"
                  : "bg-phosphor-500 shadow-[0_0_5px_#2eff6e]"
            }`}
          />
          {mode === "ai"
            ? "ai online"
            : mode === "offline"
              ? "offline mode"
              : mode === "error"
                ? "unreachable"
                : "ready"}
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div key={i} className="text-xs leading-relaxed">
            <span
              className={
                m.role === "user" ? "text-amber-term term-glow-amber" : "text-phosphor-300 term-glow"
              }
            >
              {m.role === "user" ? "you>" : "tutor>"}
            </span>{" "}
            <span className="whitespace-pre-wrap text-phosphor-400">{m.content}</span>
          </div>
        ))}
        {busy && (
          <p className="text-xs text-phosphor-muted">
            tutor is thinking<span className="term-cursor" />
          </p>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex gap-2 border-t border-phosphor-500/25 p-3"
      >
        <span className="py-1.5 text-xs text-phosphor-muted">$</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ask about this session…"
          spellCheck={false}
          className="flex-1 rounded border border-phosphor-500/30 bg-charcoal-950 px-2 py-1.5 text-xs text-phosphor-300 outline-none placeholder:text-phosphor-muted/50 focus:border-phosphor-400/60"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded border border-phosphor-500/50 bg-phosphor-500/10 px-3 py-1.5 text-xs uppercase tracking-widest text-phosphor-300 transition-colors hover:bg-phosphor-500/20 disabled:opacity-40"
        >
          send
        </button>
      </form>
    </div>
  );
}
