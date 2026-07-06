// ── Course scraper & parser ──────────────────────────────────────────
// Ingests a raw course structure (from an integration adapter, an
// uploaded syllabus, or a scraped outline) and generates a
// session-by-session learning path: notes skeleton, vocabulary chips,
// and a study plan per session.

import type {
  Course,
  RawCourseStructure,
  StudySession,
  StudyPlanItem,
  VocabTerm,
} from "../types";

let seq = 0;
function uid(prefix: string): string {
  seq += 1;
  return `${prefix}-${Date.now().toString(36)}-${seq}`;
}

/**
 * Parse a plain-text course outline into a RawCourseStructure.
 *
 * Accepted shape (tolerant of extra whitespace):
 *   Course Title
 *   ## Module Title
 *   - topic one
 *   - topic two
 */
export function parseOutlineText(text: string): RawCourseStructure {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) {
    throw new Error("Outline is empty");
  }

  const structure: RawCourseStructure = { title: lines[0], modules: [] };

  for (const line of lines.slice(1)) {
    if (line.startsWith("##")) {
      structure.modules.push({ title: line.replace(/^#+\s*/, ""), topics: [] });
    } else if (/^[-*•]/.test(line)) {
      const current = structure.modules[structure.modules.length - 1];
      if (current) {
        current.topics.push(line.replace(/^[-*•]\s*/, ""));
      }
    }
  }

  if (structure.modules.length === 0) {
    throw new Error("No modules found — use '## Module Title' headings");
  }
  return structure;
}

/** Derive vocabulary chips from a module's topics. */
function vocabFromTopics(topics: string[]): VocabTerm[] {
  return topics.slice(0, 6).map((t) => ({
    term: t.toLowerCase(),
    definition: `Key concept from this session: ${t}. Ask the tutor for a full definition.`,
  }));
}

/** Build the default study plan for a generated session. */
function defaultStudyPlan(topicCount: number): StudyPlanItem[] {
  return [
    { id: uid("plan"), label: "Read auto-generated notes", estMinutes: 15 + topicCount * 2, done: false },
    { id: uid("plan"), label: "Flash-review vocabulary chips", estMinutes: 10, done: false },
    { id: uid("plan"), label: "Discuss weak spots with the AI tutor", estMinutes: 10, done: false },
    { id: uid("plan"), label: "Take the session assessment", estMinutes: 20, done: false },
  ];
}

/** Generate a markdown notes skeleton for a module. */
function notesFromModule(title: string, topics: string[], content?: string): string {
  const topicSections = topics
    .map((t) => `## ${t}\n${content ? "" : "*Notes will deepen as you study — ask the tutor to expand this section.*"}`)
    .join("\n\n");
  return `# ${title}\n\n${content ?? ""}\n\n${topicSections}`.trim();
}

/**
 * Turn an ingested course structure into a Course plus its
 * session-by-session learning path.
 */
export function buildLearningPath(raw: RawCourseStructure): {
  course: Course;
  sessions: StudySession[];
} {
  const courseId = uid("crs");

  const sessions: StudySession[] = raw.modules.map((mod, i) => ({
    id: uid("ses"),
    courseId,
    index: i + 1,
    title: mod.title,
    objectives: mod.topics.slice(0, 5).map((t) => `Understand ${t}`),
    notesMarkdown: notesFromModule(mod.title, mod.topics, mod.content),
    vocab: vocabFromTopics(mod.topics),
    studyPlan: defaultStudyPlan(mod.topics.length),
    // First session unlocks immediately; the rest unlock as you go.
    status: i === 0 ? "available" : "locked",
  }));

  const course: Course = {
    id: courseId,
    code: raw.code ?? "EXT-000",
    title: raw.title,
    provider: raw.provider ?? "internal",
    credits: raw.credits ?? 3,
    progress: 0,
    status: "active",
    sessionIds: sessions.map((s) => s.id),
    color: raw.provider === "udacity" ? "amber" : raw.provider === "coursera" ? "cyan" : "green",
  };

  return { course, sessions };
}
