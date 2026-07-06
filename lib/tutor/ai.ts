import "server-only";

// ── AI tutor + AI grading (server-side only) ─────────────────────────
// The Anthropic API key is read from the environment inside API routes
// and never shipped to the browser. When the key is absent, both
// functions degrade to deterministic offline behavior so the app stays
// usable in development.

import Anthropic from "@anthropic-ai/sdk";
import type { ChatMessage, StudySession } from "../types";

const MODEL = "claude-opus-4-8";

// Imported courses can carry arbitrarily large notes; cap what we put
// in the system prompt to bound request size, latency and cost.
const MAX_NOTES_CHARS = 8000;

function truncateNotes(notes: string): string {
  if (notes.length <= MAX_NOTES_CHARS) return notes;
  return `${notes.slice(0, MAX_NOTES_CHARS)}\n\n[... notes truncated for length — ask the student which section to focus on]`;
}

function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  return new Anthropic();
}

function tutorSystemPrompt(session: StudySession | undefined): string {
  const base = `You are the resident AI tutor inside a retro-terminal study companion app for a developer-focused student. Be precise, encouraging, and Socratic: prefer guiding questions and worked examples over just handing out answers. Keep responses tight — a few short paragraphs or a list. Plain text or light markdown only.`;
  if (!session) return base;
  return `${base}

Current study session context:
- Session ${session.index}: ${session.title}
- Objectives: ${session.objectives.join("; ")}
- Vocabulary: ${session.vocab.map((v) => `${v.term} — ${v.definition}`).join("; ")}

Session notes:
${truncateNotes(session.notesMarkdown)}`;
}

/**
 * Answer a tutor question grounded in the current session.
 * Returns the assistant reply text.
 */
export async function askTutor(
  history: ChatMessage[],
  session: StudySession | undefined
): Promise<string> {
  const client = getClient();

  if (!client) {
    return offlineTutorReply(history, session);
  }

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    thinking: { type: "adaptive" },
    system: tutorSystemPrompt(session),
    messages: history.map((m) => ({ role: m.role, content: m.content })),
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
  return text || "I could not produce a response — try rephrasing your question.";
}

/**
 * Grade a long-form answer with Claude. Returns null when no API key
 * is configured so the caller can fall back to the keyword rubric.
 */
export async function gradeLongFormWithAI(
  prompt: string,
  answer: string,
  rubricKeywords: string[],
  points: number
): Promise<{ correct: boolean; awarded: number; feedback: string } | null> {
  const client = getClient();
  if (!client) return null;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    thinking: { type: "adaptive" },
    system:
      "You grade short student answers. Respond following the JSON schema exactly.",
    messages: [
      {
        role: "user",
        content: `Question: ${prompt}\n\nRubric concepts: ${rubricKeywords.join(", ")}\n\nMax points: ${points}\n\nStudent answer:\n${answer}\n\nGrade the answer.`,
      },
    ],
    output_config: {
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          properties: {
            awarded: { type: "integer" },
            feedback: { type: "string" },
          },
          required: ["awarded", "feedback"],
          additionalProperties: false,
        },
      },
    },
  });

  if (response.stop_reason === "refusal") return null;

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  try {
    const parsed = JSON.parse(text) as { awarded: number; feedback: string };
    const awarded = Math.max(0, Math.min(points, parsed.awarded));
    return { correct: awarded >= points * 0.6, awarded, feedback: parsed.feedback };
  } catch {
    return null;
  }
}

// ── Offline fallback tutor ───────────────────────────────────────────

function offlineTutorReply(history: ChatMessage[], session: StudySession | undefined): string {
  const last = history[history.length - 1]?.content.toLowerCase() ?? "";

  if (session) {
    const hit = session.vocab.find((v) => last.includes(v.term.toLowerCase()));
    if (hit) {
      return `[offline tutor] ${hit.term}: ${hit.definition}\n\nWant to go deeper? Configure ANTHROPIC_API_KEY on the server to enable the full AI tutor.`;
    }
    if (/quiz|test|practice/.test(last)) {
      return `[offline tutor] Try the session assessment (the [ RUN ASSESSMENT ] button) — it generates multiple-choice, fill-in-the-blank and long-form questions from this session.`;
    }
    return `[offline tutor] I'm running without an API key, so I can only point you at session material. This session covers: ${session.objectives.join("; ")}. Ask about any vocabulary term for its definition, or set ANTHROPIC_API_KEY to enable full tutoring.`;
  }

  return `[offline tutor] No session context loaded. Open a session workspace and ask again — or set ANTHROPIC_API_KEY on the server to enable the full AI tutor.`;
}
