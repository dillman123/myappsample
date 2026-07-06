import "server-only";

// ── Assessment engine ────────────────────────────────────────────────
// Generates and grades tests in three formats: multiple-choice,
// fill-in-the-blank, and long-form response. Answer keys live only on
// the server; clients receive redacted questions.

import type {
  Assessment,
  AnswerSubmission,
  FillInTheBlankQuestion,
  GradeReport,
  LongFormQuestion,
  MultipleChoiceQuestion,
  Question,
  QuestionResult,
  StudySession,
} from "../types";
import { gradeLongFormWithAI } from "../tutor/ai";

// Assessments are generated per request and cached here so grading can
// look up the answer key. A real deployment would persist these.
const g = globalThis as unknown as { __assessments?: Map<string, Assessment> };
function assessmentCache(): Map<string, Assessment> {
  if (!g.__assessments) g.__assessments = new Map();
  return g.__assessments;
}

/** Deterministic-ish shuffle seeded by string, so choices vary per session. */
function shuffled<T>(items: T[], seed: string): T[] {
  const arr = [...items];
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  for (let i = arr.length - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) >>> 0;
    const j = h % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Generate an assessment from a session's vocab and objectives. */
export function generateAssessment(session: StudySession): Assessment {
  const questions: Question[] = [];
  const vocab = session.vocab;

  // Multiple choice: match a definition to its term.
  vocab.slice(0, 3).forEach((v, i) => {
    const distractors = shuffled(
      vocab.filter((o) => o.term !== v.term).map((o) => o.term),
      session.id + i
    ).slice(0, 3);
    const choices = shuffled([v.term, ...distractors], v.term + i);
    const q: MultipleChoiceQuestion = {
      id: `q-mc-${i}`,
      format: "multiple-choice",
      prompt: `Which term matches this definition?\n"${v.definition}"`,
      choices,
      answerIndex: choices.indexOf(v.term),
      points: 2,
    };
    questions.push(q);
  });

  // Fill in the blank: definition with the term blanked out.
  vocab.slice(3, 5).concat(vocab.slice(0, Math.max(0, 2 - Math.max(0, vocab.length - 3)))).slice(0, 2).forEach((v, i) => {
    const q: FillInTheBlankQuestion = {
      id: `q-fb-${i}`,
      format: "fill-in-the-blank",
      prompt: `Fill in the blank: ${v.definition.replace(new RegExp(v.term, "ig"), "____")}\nThe term is: ____`,
      answer: v.term,
      points: 2,
    };
    questions.push(q);
  });

  // Long form: drawn from the session objectives.
  session.objectives.slice(0, 1).forEach((obj, i) => {
    const q: LongFormQuestion = {
      id: `q-lf-${i}`,
      format: "long-form",
      prompt: `In your own words (3–6 sentences): ${obj}.`,
      rubricKeywords: session.vocab.map((v) => v.term),
      points: 6,
    };
    questions.push(q);
  });

  const assessment: Assessment = {
    id: `asmt-${session.id}-${Date.now().toString(36)}`,
    sessionId: session.id,
    title: `Session ${session.index} Assessment: ${session.title}`,
    questions,
  };
  assessmentCache().set(assessment.id, assessment);
  return assessment;
}

/** Strip answer keys before sending an assessment to the client. */
export function redactAssessment(assessment: Assessment): Assessment {
  return {
    ...assessment,
    questions: assessment.questions.map((q) => {
      if (q.format === "multiple-choice") {
        const { answerIndex: _a, ...rest } = q;
        return rest as Question;
      }
      if (q.format === "fill-in-the-blank") {
        const { answer: _a, ...rest } = q;
        return rest as Question;
      }
      const { rubricKeywords: _r, ...rest } = q;
      return rest as Question;
    }),
  };
}

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Grade a submission against the cached answer key. */
export async function gradeAssessment(
  assessmentId: string,
  submissions: AnswerSubmission[]
): Promise<GradeReport> {
  const assessment = assessmentCache().get(assessmentId);
  if (!assessment) {
    throw new Error("Unknown or expired assessment — regenerate and retry");
  }

  const byId = new Map(submissions.map((s) => [s.questionId, s.answer]));
  const results: QuestionResult[] = [];

  for (const q of assessment.questions) {
    const answer = byId.get(q.id) ?? "";

    if (q.format === "multiple-choice") {
      const picked = Number.parseInt(answer, 10);
      const correct = picked === q.answerIndex;
      results.push({
        questionId: q.id,
        correct,
        awarded: correct ? q.points : 0,
        possible: q.points,
        feedback: correct
          ? "Correct."
          : `Incorrect — the right answer was "${q.choices[q.answerIndex ?? 0]}".`,
      });
    } else if (q.format === "fill-in-the-blank") {
      const correct = normalize(answer) === normalize(q.answer ?? "");
      results.push({
        questionId: q.id,
        correct,
        awarded: correct ? q.points : 0,
        possible: q.points,
        feedback: correct ? "Correct." : `Incorrect — expected "${q.answer}".`,
      });
    } else {
      results.push(await gradeLongForm(q, answer));
    }
  }

  const score = results.reduce((sum, r) => sum + r.awarded, 0);
  const possible = results.reduce((sum, r) => sum + r.possible, 0);
  return {
    assessmentId,
    score,
    possible,
    percent: possible === 0 ? 0 : Math.round((score / possible) * 100),
    results,
  };
}

/**
 * Long-form grading: uses Claude when an API key is configured,
 * otherwise a keyword-rubric heuristic so the app works offline.
 */
async function gradeLongForm(q: LongFormQuestion, answer: string): Promise<QuestionResult> {
  if (!answer.trim()) {
    return {
      questionId: q.id,
      correct: false,
      awarded: 0,
      possible: q.points,
      feedback: "No answer submitted.",
    };
  }

  const ai = await gradeLongFormWithAI(q.prompt, answer, q.rubricKeywords ?? [], q.points);
  if (ai) {
    return { questionId: q.id, ...ai, possible: q.points };
  }

  // Offline heuristic: award points proportional to rubric coverage.
  const keywords = q.rubricKeywords ?? [];
  const text = normalize(answer);
  const hits = keywords.filter((k) => text.includes(normalize(k)));
  const lengthOk = answer.trim().split(/\s+/).length >= 20;
  const coverage = keywords.length === 0 ? (lengthOk ? 1 : 0.5) : hits.length / Math.min(keywords.length, 4);
  const awarded = Math.min(q.points, Math.round(q.points * Math.min(1, coverage + (lengthOk ? 0.2 : 0))));

  return {
    questionId: q.id,
    correct: awarded >= q.points * 0.6,
    awarded,
    possible: q.points,
    feedback:
      hits.length > 0
        ? `Rubric terms covered: ${hits.join(", ")}. ${awarded < q.points ? "Consider also discussing: " + keywords.filter((k) => !hits.includes(k)).slice(0, 3).join(", ") + "." : "Strong answer."}`
        : `Your answer did not reference the key concepts (${keywords.slice(0, 3).join(", ")}). Review the session notes and retry.`,
  };
}
