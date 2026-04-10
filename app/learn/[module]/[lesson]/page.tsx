import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getModuleBySlug, isModuleUnlocked, type ModuleProgress } from "@/lib/modules";
import { getLessonsForModule, getLessonContent } from "@/lib/content";
import { getQuizData } from "@/lib/quizzes";
import { LessonSidebar } from "@/components/layout/LessonSidebar";
import { LessonNav } from "@/components/layout/LessonNav";
import { LessonContent } from "@/components/layout/LessonContent";
import { MarkCompleteButton } from "@/components/layout/MarkCompleteButton";
import { Quiz } from "@/components/interactive/Quiz";

interface LessonPageProps {
  params: Promise<{ module: string; lesson: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { module: moduleSlug, lesson: lessonSlug } = await params;

  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Validate module exists
  const mod = getModuleBySlug(moduleSlug);
  if (!mod) {
    notFound();
  }

  // Query all progress for the user
  const progressRecords = await prisma.progress.findMany({
    where: { userId: session.user.id },
  });

  // Aggregate progress per module for unlock check
  const moduleProgressMap = new Map<number, ModuleProgress>();
  for (const record of progressRecords) {
    const existing = moduleProgressMap.get(record.moduleOrder);
    if (!existing) {
      moduleProgressMap.set(record.moduleOrder, {
        moduleOrder: record.moduleOrder,
        completed: record.completed,
        quizScore: record.quizScore,
      });
    } else {
      // A module is "completed" if its quiz record is completed with score >= 80
      // Keep the most relevant record (quiz score takes priority)
      if (record.quizScore !== null) {
        existing.quizScore = record.quizScore;
        existing.completed = record.completed;
      }
    }
  }
  const moduleProgress = Array.from(moduleProgressMap.values());

  // Check if module is unlocked (admins bypass locking)
  const isUserAdmin = session.user?.role === "admin";
  if (!isModuleUnlocked(mod.order, moduleProgress) && !isUserAdmin) {
    redirect("/dashboard");
  }

  // Load lessons and lesson content
  const lessons = getLessonsForModule(moduleSlug);
  const lessonData = getLessonContent(moduleSlug, lessonSlug);
  if (!lessonData) {
    notFound();
  }

  // Determine which lessons are completed
  const completedLessonSlugs = new Set(
    progressRecords
      .filter((p) => p.moduleId === mod.id && p.completed)
      .map((p) => p.lessonId)
  );

  const isCurrentLessonCompleted = completedLessonSlugs.has(lessonSlug);
  const currentIndex = lessons.findIndex((l) => l.slug === lessonSlug);
  const totalLessons = lessons.length;

  return (
    <div className="flex min-h-screen bg-bg-primary">
      <LessonSidebar
        moduleSlug={moduleSlug}
        lessons={lessons}
        currentLessonSlug={lessonSlug}
        completedLessons={completedLessonSlugs}
      />

      <main className="flex-1 flex justify-center">
        <div className="w-full max-w-[680px] px-6 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-text-secondary mb-1">
            <Link href="/dashboard" className="hover:text-text-primary transition-colors">
              ← Dashboard
            </Link>
            <span>|</span>
            <span>Module {mod.order}: {mod.title}</span>
          </div>
          <div className="text-xs text-text-muted mb-6">
            Lesson {currentIndex + 1} of {totalLessons}
          </div>

          {/* MDX Content */}
          <LessonContent source={lessonData.content} />

          {/* Quiz Component (rendered server-side with data from lib/quizzes.ts) */}
          {lessonData.meta.type === "quiz" && (() => {
            const quizData = getQuizData(moduleSlug);
            if (quizData) {
              return (
                <Quiz
                  questions={quizData.questions}
                  moduleId={quizData.moduleId}
                  lessonId={quizData.lessonId}
                  moduleOrder={quizData.moduleOrder}
                  lessonOrder={quizData.lessonOrder}
                />
              );
            }
            return null;
          })()}

          {/* Mark Complete Button (not for quiz type) */}
          {lessonData.meta.type !== "quiz" && (
            <MarkCompleteButton
              moduleId={mod.id}
              lessonId={lessonSlug}
              moduleOrder={mod.order}
              lessonOrder={lessonData.meta.order}
              isCompleted={isCurrentLessonCompleted}
            />
          )}

          {/* Previous / Next Navigation */}
          <LessonNav
            moduleSlug={moduleSlug}
            lessons={lessons}
            currentLessonSlug={lessonSlug}
            isCompleted={isCurrentLessonCompleted}
          />
        </div>
      </main>
    </div>
  );
}
