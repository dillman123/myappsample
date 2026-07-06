// ── Domain types shared across the platform ─────────────────────────

export type Provider = "internal" | "coursera" | "udacity";

export interface DegreeProgram {
  id: string;
  name: string;
  totalCredits: number;
  earnedCredits: number;
  gpa: number;
  expectedGraduation: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  provider: Provider;
  credits: number;
  progress: number; // 0..100
  status: "active" | "completed" | "planned";
  sessionIds: string[];
  color: "green" | "amber" | "cyan";
}

export interface VocabTerm {
  term: string;
  definition: string;
}

export interface StudyPlanItem {
  id: string;
  label: string;
  estMinutes: number;
  done: boolean;
}

export interface StudySession {
  id: string;
  courseId: string;
  index: number; // session number within the course
  title: string;
  objectives: string[];
  notesMarkdown: string;
  vocab: VocabTerm[];
  studyPlan: StudyPlanItem[];
  status: "locked" | "available" | "in-progress" | "completed";
}

// ── Assessment engine ────────────────────────────────────────────────

export type QuestionFormat = "multiple-choice" | "fill-in-the-blank" | "long-form";

export interface QuestionBase {
  id: string;
  format: QuestionFormat;
  prompt: string;
  points: number;
}

export interface MultipleChoiceQuestion extends QuestionBase {
  format: "multiple-choice";
  choices: string[];
  // NOTE: the correct index never leaves the server — the client
  // receives a redacted copy of the question.
  answerIndex?: number;
}

export interface FillInTheBlankQuestion extends QuestionBase {
  format: "fill-in-the-blank";
  // Prompt contains "____" where the answer belongs.
  answer?: string;
}

export interface LongFormQuestion extends QuestionBase {
  format: "long-form";
  rubricKeywords?: string[];
}

export type Question =
  | MultipleChoiceQuestion
  | FillInTheBlankQuestion
  | LongFormQuestion;

export interface Assessment {
  id: string;
  sessionId: string;
  title: string;
  questions: Question[];
}

export interface AnswerSubmission {
  questionId: string;
  answer: string; // MCQ: index as string; others: free text
}

export interface QuestionResult {
  questionId: string;
  correct: boolean;
  awarded: number;
  possible: number;
  feedback: string;
}

export interface GradeReport {
  assessmentId: string;
  score: number;
  possible: number;
  percent: number;
  results: QuestionResult[];
}

// ── Course ingestion (scraper/parser) ────────────────────────────────

/** Raw course structure as ingested from an external platform or upload. */
export interface RawCourseStructure {
  title: string;
  code?: string;
  provider?: Provider;
  credits?: number;
  modules: {
    title: string;
    topics: string[];
    content?: string;
  }[];
}

// ── Tutor chat ───────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
