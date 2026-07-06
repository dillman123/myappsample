import Link from "next/link";
import type { Course } from "@/lib/types";
import { AsciiProgress } from "@/components/ui/AsciiProgress";

const providerLabel: Record<Course["provider"], string> = {
  internal: "LOCAL",
  coursera: "COURSERA",
  udacity: "UDACITY",
};

export function CourseCard({ course }: { course: Course }) {
  const tone = course.color;
  const border =
    tone === "amber"
      ? "hover:border-amber-term/60"
      : tone === "cyan"
        ? "hover:border-cyan-term/60"
        : "hover:border-phosphor-400/60";

  return (
    <Link
      href={`/courses/${course.id}`}
      className={`term-panel block rounded-md p-4 transition-colors ${border}`}
    >
      <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-widest text-phosphor-muted">
        <span>{course.code}</span>
        <span
          className={
            course.provider === "coursera"
              ? "text-cyan-term"
              : course.provider === "udacity"
                ? "text-amber-term"
                : "text-phosphor-400"
          }
        >
          [{providerLabel[course.provider]}]
        </span>
      </div>
      <h3 className="mb-3 text-sm font-bold text-phosphor-300">{course.title}</h3>
      <div className="text-xs">
        <AsciiProgress percent={course.progress} width={18} tone={tone} />
      </div>
      <div className="mt-2 flex justify-between text-[10px] uppercase tracking-widest text-phosphor-muted">
        <span>{course.credits} credits</span>
        <span>
          {course.status === "completed"
            ? "✓ complete"
            : `${course.sessionIds.length} sessions`}
        </span>
      </div>
    </Link>
  );
}
