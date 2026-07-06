import { NextResponse } from "next/server";
import { askTutor } from "@/lib/tutor/ai";
import { getSession } from "@/lib/data";
import type { ChatMessage } from "@/lib/types";

export const runtime = "nodejs";

// Input bounds: clamp history length and per-message size at parse
// time so oversized client payloads can't inflate memory usage or
// upstream model costs.
const MAX_HISTORY = 20;
const MAX_MESSAGE_CHARS = 4000;

// POST /api/tutor  { sessionId?: string, messages: ChatMessage[] }
// All model access happens here, server-side — the browser never sees
// the Anthropic API key.
export async function POST(request: Request) {
  let body: { sessionId?: string; messages?: ChatMessage[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!Array.isArray(body.messages)) {
    return NextResponse.json({ error: "messages must be an array" }, { status: 400 });
  }

  const messages = body.messages
    .slice(-MAX_HISTORY)
    .filter(
      (m): m is ChatMessage =>
        (m.role === "user" || m.role === "assistant") && typeof m.content === "string"
    )
    .map((m) => ({ ...m, content: m.content.slice(0, MAX_MESSAGE_CHARS) }));
  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return NextResponse.json(
      { error: "messages must end with a user message" },
      { status: 400 }
    );
  }

  const history = messages;
  const session = body.sessionId ? getSession(body.sessionId) : undefined;

  try {
    const reply = await askTutor(history, session);
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("tutor error:", err);
    return NextResponse.json(
      { error: "The tutor is unavailable right now — try again shortly." },
      { status: 502 }
    );
  }
}
