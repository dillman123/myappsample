import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourse, getSessions } from "@/lib/data";
import { AsciiProgress } from "@/components/ui/AsciiProgress";

export const dynamic = "force-dynamic";

const statusGlyph: Record<string, string> = {
  completed: "[✓]",
  "in-progress": "[▶]",
  available: "[ ]",
  locked: "[⋯]",
};

// Course detail — the generated session-by-session learning path.
export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = getCourse(courseId);
  if (!course) notFound();

  const sessions = getSessions(course.id).sort((a, b) => a.index - b.index);

  return (
    <div className="space-y-4">
      <p className="text-xs text-phosphor-muted">
        <Link href="/" className="hover:text-phosphor-300">
          ~/dashboard
        </Link>{" "}
        / courses / <span className="text-phosphor-300">{course.code}</span>
      </p>

      <section className="term-panel rounded-md p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="term-glow text-lg font-bold uppercase tracking-widest text-phosphor-300">
            █ {course.title}
          </h1>
          <span className="text-xs uppercase tracking-widest text-phosphor-muted">
            {course.provider} · {course.credits} credits
          </span>
        </div>
        <div className="mt-3 text-sm">
          <AsciiProgress percent={course.progress} width={28} tone={course.color} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xs uppercase tracking-widest text-phosphor-muted">
          ┌ learning path ┐
        </h2>
        {sessions.length === 0 ? (
          <p className="text-xs text-phosphor-muted">
            No sessions generated for this course.
          </p>
        ) : (
          <ol className="space-y-2">
            {sessions.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/session/${s.id}`}
                  className="term-panel flex flex-wrap items-center justify-between gap-2 rounded-md px-4 py-3 transition-colors hover:border-phosphor-400/60"
                >
                  <span className="text-sm">
                    <span
                      className={
                        s.status === "completed"
                          ? "text-phosphor-400"
                          : s.status === "in-progress"
                            ? "text-amber-term"
                            : "text-phosphor-muted"
                      }
                    >
                      {statusGlyph[s.status]}
                    </span>{" "}
                    <span className="text-phosphor-muted">S{s.index}</span>{" "}
                    <span className="text-phosphor-300">{s.title}</span>
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-phosphor-muted">
                    {s.vocab.length} terms · {s.studyPlan.length} plan items ·{" "}
                    {s.objectives.length} objectives
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
