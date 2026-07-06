import { NextResponse } from "next/server";
import { addCourseWithSessions } from "@/lib/data";
import { getAdapter } from "@/lib/integrations/registry";
import { buildLearningPath, parseOutlineText } from "@/lib/parser/courseParser";
import type { RawCourseStructure } from "@/lib/types";

export const runtime = "nodejs";

// POST /api/courses/import
//   { source: "outline", outlineText }               ← paste a syllabus
//   { source: "coursera" | "udacity", externalId }   ← platform adapter
// Ingests a course structure and generates a session-by-session
// learning path. Platform credentials stay in server env vars.
export async function POST(request: Request) {
  let body: { source?: string; outlineText?: string; externalId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  let raw: RawCourseStructure;
  try {
    if (body.source === "outline") {
      if (!body.outlineText) {
        return NextResponse.json({ error: "outlineText is required" }, { status: 400 });
      }
      raw = parseOutlineText(body.outlineText);
    } else if (body.source) {
      const adapter = getAdapter(body.source);
      if (!adapter) {
        return NextResponse.json({ error: `Unknown source "${body.source}"` }, { status: 400 });
      }
      if (!body.externalId) {
        return NextResponse.json({ error: "externalId is required" }, { status: 400 });
      }
      raw = await adapter.fetchCourse(body.externalId);
    } else {
      return NextResponse.json({ error: "source is required" }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Import failed" },
      { status: 422 }
    );
  }

  const { course, sessions } = buildLearningPath(raw);
  addCourseWithSessions(course, sessions);

  return NextResponse.json({ course, sessionCount: sessions.length }, { status: 201 });
}
