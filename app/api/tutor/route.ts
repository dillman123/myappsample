import { NextResponse } from "next/server";
import { askTutor } from "@/lib/tutor/ai";
import { getSession } from "@/lib/data";
import type { ChatMessage } from "@/lib/types";

export const runtime = "nodejs";

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

  const messages = (body.messages ?? []).filter(
    (m): m is ChatMessage =>
      (m.role === "user" || m.role === "assistant") && typeof m.content === "string"
  );
  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return NextResponse.json(
      { error: "messages must end with a user message" },
      { status: 400 }
    );
  }

  // Cap history to keep requests bounded.
  const history = messages.slice(-20);
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
