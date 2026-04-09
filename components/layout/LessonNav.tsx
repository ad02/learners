import Link from "next/link";
import type { LessonMeta } from "@/lib/content";

interface LessonNavProps {
  moduleSlug: string;
  lessons: LessonMeta[];
  currentLessonSlug: string;
  isCompleted: boolean;
}

export function LessonNav({
  moduleSlug,
  lessons,
  currentLessonSlug,
  isCompleted,
}: LessonNavProps) {
  const currentIndex = lessons.findIndex((l) => l.slug === currentLessonSlug);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  return (
    <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
      {prevLesson ? (
        <Link
          href={`/learn/${moduleSlug}/${prevLesson.slug}`}
          className="text-sm text-accent-blue hover:underline"
        >
          ← {prevLesson.title}
        </Link>
      ) : (
        <div />
      )}

      {nextLesson ? (
        isCompleted ? (
          <Link
            href={`/learn/${moduleSlug}/${nextLesson.slug}`}
            className="text-sm text-accent-blue hover:underline"
          >
            {nextLesson.title} →
          </Link>
        ) : (
          <span className="text-sm text-text-muted">
            Complete this lesson to continue →
          </span>
        )
      ) : (
        isCompleted && (
          <Link
            href="/dashboard"
            className="text-sm text-accent-green hover:underline"
          >
            Back to Dashboard ✓
          </Link>
        )
      )}
    </div>
  );
}
