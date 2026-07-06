import { NextResponse } from "next/server";
import {
  generateAssessment,
  gradeAssessment,
  redactAssessment,
} from "@/lib/assessment/engine";
import { getSession } from "@/lib/data";
import type { AnswerSubmission } from "@/lib/types";

export const runtime = "nodejs";

// POST /api/assessment
//   { action: "generate", sessionId }                → redacted assessment
//   { action: "grade", assessmentId, submissions[] } → grade report
// Answer keys never leave the server.
export async function POST(request: Request) {
  let body: {
    action?: string;
    sessionId?: string;
    assessmentId?: string;
    submissions?: AnswerSubmission[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.action === "generate") {
    const session = body.sessionId ? getSession(body.sessionId) : undefined;
    if (!session) {
      return NextResponse.json({ error: "Unknown sessionId" }, { status: 404 });
    }
    const assessment = generateAssessment(session);
    return NextResponse.json({ assessment: redactAssessment(assessment) });
  }

  if (body.action === "grade") {
    if (!body.assessmentId || !Array.isArray(body.submissions)) {
      return NextResponse.json(
        { error: "assessmentId and submissions are required" },
        { status: 400 }
      );
    }
    try {
      const report = await gradeAssessment(body.assessmentId, body.submissions);
      return NextResponse.json({ report });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Grading failed" },
        { status: 400 }
      );
    }
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
