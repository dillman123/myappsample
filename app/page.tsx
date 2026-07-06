import Link from "next/link";
import { getCourses, getDegree, getSessions } from "@/lib/data";
import { getIntegrationStatuses } from "@/lib/integrations/registry";
import { AsciiProgress } from "@/components/ui/AsciiProgress";
import { CourseCard } from "@/components/dashboard/CourseCard";
import { ImportCourse } from "@/components/dashboard/ImportCourse";

export const dynamic = "force-dynamic";

// Main dashboard — bento grid of degree progress, active classes,
// upcoming sessions, and external course integrations.
export default function DashboardPage() {
  const degree = getDegree();
  const courses = getCourses();
  const sessions = getSessions();
  const integrations = getIntegrationStatuses();

  const active = courses.filter((c) => c.status === "active");
  const upNext = sessions
    .filter((s) => s.status === "in-progress" || s.status === "available")
    .slice(0, 4);
  const creditPct = (degree.earnedCredits / degree.totalCredits) * 100;

  return (
    <div className="space-y-4">
      <p className="text-xs text-phosphor-muted">
        <span className="text-phosphor-400">student@studyterm</span>:~$ ./dashboard
        --render<span className="term-cursor" />
      </p>

      {/* Bento grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {/* Degree progress — hero tile */}
        <section className="term-panel rounded-md p-5 md:col-span-2 md:row-span-2">
          <h2 className="mb-4 text-xs uppercase tracking-widest text-phosphor-muted">
            ┌ degree progress ┐
          </h2>
          <p className="term-glow mb-1 text-lg font-bold text-phosphor-300">
            {degree.name}
          </p>
          <div className="my-4 text-sm">
            <AsciiProgress percent={creditPct} width={28} />
          </div>
          <dl className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded border border-phosphor-500/20 p-3">
              <dt className="text-[10px] uppercase tracking-widest text-phosphor-muted">
                credits
              </dt>
              <dd className="term-glow mt-1 text-xl font-bold">
                {degree.earnedCredits}
                <span className="text-xs text-phosphor-muted">/{degree.totalCredits}</span>
              </dd>
            </div>
            <div className="rounded border border-phosphor-500/20 p-3">
              <dt className="text-[10px] uppercase tracking-widest text-phosphor-muted">
                gpa
              </dt>
              <dd className="term-glow mt-1 text-xl font-bold">{degree.gpa.toFixed(2)}</dd>
            </div>
            <div className="rounded border border-phosphor-500/20 p-3">
              <dt className="text-[10px] uppercase tracking-widest text-phosphor-muted">
                grad eta
              </dt>
              <dd className="term-glow mt-1 text-xl font-bold">{degree.expectedGraduation}</dd>
            </div>
          </dl>
          <p className="mt-4 text-[10px] uppercase tracking-widest text-phosphor-muted/70">
            {active.length} active classes · {sessions.length} sessions indexed
          </p>
        </section>

        {/* Up-next sessions */}
        <section className="term-panel rounded-md p-5 md:col-span-2">
          <h2 className="mb-3 text-xs uppercase tracking-widest text-phosphor-muted">
            ┌ up next ┐
          </h2>
          <ul className="space-y-2 text-xs">
            {upNext.map((s) => {
              const course = courses.find((c) => c.id === s.courseId);
              return (
                <li key={s.id}>
                  <Link
                    href={`/session/${s.id}`}
                    className="flex items-center justify-between rounded border border-transparent px-2 py-1.5 transition-colors hover:border-phosphor-500/30 hover:bg-phosphor-500/5"
                  >
                    <span>
                      <span className="text-phosphor-muted">{course?.code}</span>{" "}
                      <span className="text-phosphor-300">
                        S{s.index}: {s.title}
                      </span>
                    </span>
                    <span
                      className={
                        s.status === "in-progress" ? "text-amber-term" : "text-phosphor-muted"
                      }
                    >
                      {s.status === "in-progress" ? "▶ resume" : "○ start"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Integrations */}
        <section className="term-panel rounded-md p-5 md:col-span-1">
          <h2 className="mb-3 text-xs uppercase tracking-widest text-phosphor-muted">
            ┌ integrations ┐
          </h2>
          <ImportCourse integrations={integrations} />
        </section>

        {/* Study stats */}
        <section className="term-panel rounded-md p-5 md:col-span-1">
          <h2 className="mb-3 text-xs uppercase tracking-widest text-phosphor-muted">
            ┌ session log ┐
          </h2>
          <ul className="space-y-1.5 text-xs text-phosphor-muted">
            <li>
              <span className="text-phosphor-400">
                {sessions.filter((s) => s.status === "completed").length}
              </span>{" "}
              sessions completed
            </li>
            <li>
              <span className="text-amber-term">
                {sessions.filter((s) => s.status === "in-progress").length}
              </span>{" "}
              in progress
            </li>
            <li>
              <span className="text-cyan-term">
                {sessions.reduce((n, s) => n + s.vocab.length, 0)}
              </span>{" "}
              vocab terms indexed
            </li>
            <li>
              <span className="text-phosphor-400">
                {sessions.reduce(
                  (n, s) => n + s.studyPlan.filter((p) => p.done).length,
                  0
                )}
              </span>{" "}
              plan items checked
            </li>
          </ul>
        </section>
      </div>

      {/* Active classes */}
      <section>
        <h2 className="mb-3 text-xs uppercase tracking-widest text-phosphor-muted">
          ┌ active classes ┐
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>
    </div>
  );
}
