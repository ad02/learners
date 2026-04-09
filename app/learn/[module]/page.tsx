import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getModuleBySlug, isModuleUnlocked, type ModuleProgress } from "@/lib/modules";
import { getLessonsForModule } from "@/lib/content";

interface ModulePageProps {
  params: Promise<{ module: string }>;
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { module: moduleSlug } = await params;

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
      if (record.quizScore !== null) {
        existing.quizScore = record.quizScore;
        existing.completed = record.completed;
      }
    }
  }
  const moduleProgress = Array.from(moduleProgressMap.values());

  // Check if module is unlocked
  if (!isModuleUnlocked(mod.order, moduleProgress)) {
    redirect("/dashboard");
  }

  // Load lessons for this module
  const lessons = getLessonsForModule(moduleSlug);
  if (lessons.length === 0) {
    notFound();
  }

  // Find completed lesson slugs for this module
  const completedSlugs = new Set(
    progressRecords
      .filter((p) => p.moduleId === mod.id && p.completed)
      .map((p) => p.lessonId)
  );

  // Find first uncompleted lesson, or first lesson if all done
  const firstUncompleted = lessons.find((l) => !completedSlugs.has(l.slug));
  const targetLesson = firstUncompleted ?? lessons[0];

  redirect(`/learn/${moduleSlug}/${targetLesson.slug}`);
}
