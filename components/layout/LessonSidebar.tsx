import Link from "next/link";
import type { LessonMeta } from "@/lib/content";

interface LessonSidebarProps {
  moduleSlug: string;
  lessons: LessonMeta[];
  currentLessonSlug: string;
  completedLessons: Set<string>;
}

export function LessonSidebar({
  moduleSlug,
  lessons,
  currentLessonSlug,
  completedLessons,
}: LessonSidebarProps) {
  return (
    <aside className="w-[200px] flex-shrink-0 bg-bg-secondary border-r border-border p-4">
      <div className="text-xs uppercase text-text-secondary mb-3 tracking-wider">
        Lessons
      </div>
      <nav className="flex flex-col gap-1">
        {lessons.map((lesson, index) => {
          const isCurrent = lesson.slug === currentLessonSlug;
          const isCompleted = completedLessons.has(lesson.slug);
          const previousCompleted =
            index === 0 || completedLessons.has(lessons[index - 1].slug);
          const isUnlocked = index === 0 || previousCompleted;

          const icon = isCompleted ? "✓" : isCurrent ? "▶" : isUnlocked ? "" : "🔒";
          const colorClass = isCompleted
            ? "text-accent-green"
            : isCurrent
              ? "text-accent-blue font-bold bg-accent-blue/10"
              : isUnlocked
                ? "text-text-secondary hover:text-text-primary"
                : "text-text-muted";

          if (!isUnlocked) {
            return (
              <div
                key={lesson.slug}
                className={`text-xs px-2 py-1.5 rounded ${colorClass}`}
              >
                {icon} {lesson.order}. {lesson.title}
              </div>
            );
          }

          return (
            <Link
              key={lesson.slug}
              href={`/learn/${moduleSlug}/${lesson.slug}`}
              className={`text-xs px-2 py-1.5 rounded transition-colors ${colorClass}`}
            >
              {icon} {lesson.order}. {lesson.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
