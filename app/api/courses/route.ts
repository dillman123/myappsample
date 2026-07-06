import { NextResponse } from "next/server";
import { getCourses, getDegree, getSessions } from "@/lib/data";
import { getIntegrationStatuses } from "@/lib/integrations/registry";

export const runtime = "nodejs";

// GET /api/courses — dashboard payload: degree progress, courses,
// sessions, and integration connection status (booleans only — no
// credentials cross this boundary).
export async function GET() {
  return NextResponse.json({
    degree: getDegree(),
    courses: getCourses(),
    sessions: getSessions(),
    integrations: getIntegrationStatuses(),
  });
}
