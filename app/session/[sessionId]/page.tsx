import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourse, getSession } from "@/lib/data";
import { renderMarkdown } from "@/lib/markdown";
import { VocabChips } from "@/components/session/VocabChips";
import { StudyPlan } from "@/components/session/StudyPlan";
import { AssessmentModal } from "@/components/assessment/AssessmentModal";
import { TutorChat } from "@/components/tutor/TutorChat";

export const dynamic = "force-dynamic";

// Session workspace — split screen: content, vocab and study plan on
// the left; the persistent AI tutor sidebar on the right.
export default async function SessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const session = getSession(sessionId);
  if (!session) notFound();

  const course = getCourse(session.courseId);

  return (
    <div className="space-y-4">
      <p className="text-xs text-phosphor-muted">
        <Link href="/" className="hover:text-phosphor-300">
          ~/dashboard
        </Link>{" "}
        /{" "}
        <Link href={`/courses/${session.courseId}`} className="hover:text-phosphor-300">
          {course?.code ?? "course"}
        </Link>{" "}
        /{" "}
        <span className="text-phosphor-300">
          session-{String(session.index).padStart(2, "0")}
        </span>
      </p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left: content + notes */}
        <div className="space-y-4 lg:col-span-2">
          <section className="term-panel rounded-md p-5">
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <h1 className="term-glow text-base font-bold uppercase tracking-widest text-phosphor-300">
                S{session.index} :: {session.title}
              </h1>
              <span
                className={`text-[10px] uppercase tracking-widest ${
                  session.status === "completed"
                    ? "text-phosphor-400"
                    : session.status === "in-progress"
                      ? "text-amber-term"
                      : "text-phosphor-muted"
                }`}
              >
                status: {session.status}
              </span>
            </div>
            <ul className="ml-4 list-['▸_'] space-y-0.5 text-xs text-phosphor-muted">
              {session.objectives.map((o) => (
                <li key={o} className="pl-1">
                  {o}
                </li>
              ))}
            </ul>
          </section>

          <section className="term-panel rounded-md p-5">
            <h2 className="mb-2 text-xs uppercase tracking-widest text-phosphor-muted">
              ┌ vocabulary chips ┐{" "}
              <span className="normal-case tracking-normal text-phosphor-muted/60">
                (click to flip)
              </span>
            </h2>
            <VocabChips vocab={session.vocab} />
          </section>

          <section className="term-panel rounded-md p-5">
            <h2 className="mb-3 text-xs uppercase tracking-widest text-phosphor-muted">
              ┌ session notes // auto-generated ┐
            </h2>
            <article>{renderMarkdown(session.notesMarkdown)}</article>
          </section>
        </div>

        {/* Right: sticky sidebar — study plan, assessment, tutor */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-4 lg:h-[calc(100vh-6rem)] lg:self-start">
          <section className="term-panel rounded-md p-4">
            <h2 className="mb-2 text-xs uppercase tracking-widest text-phosphor-muted">
              ┌ study plan ┐
            </h2>
            <StudyPlan items={session.studyPlan} />
            <div className="mt-3">
              <AssessmentModal sessionId={session.id} />
            </div>
          </section>

          <div className="min-h-0 flex-1">
            <TutorChat sessionId={session.id} sessionTitle={session.title} />
          </div>
        </div>
      </div>
    </div>
  );
}
