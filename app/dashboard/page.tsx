import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { MODULES, getModuleStatus, type ModuleProgress } from "@/lib/modules";
import { ProgressBar } from "@/components/layout/ProgressBar";
import { ModuleCard } from "@/components/layout/ModuleCard";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Fetch all progress for this user
  const progressRecords = await prisma.progress.findMany({
    where: { userId: session.user.id },
  });

  // Aggregate progress per module
  const moduleProgressMap = new Map<
    number,
    { completed: boolean; quizScore: number | null; lessonsCompleted: number }
  >();

  for (const record of progressRecords) {
    const existing = moduleProgressMap.get(record.moduleOrder);
    if (!existing) {
      moduleProgressMap.set(record.moduleOrder, {
        completed: record.completed && record.quizScore !== null && record.quizScore >= 80,
        quizScore: record.quizScore,
        lessonsCompleted: record.completed ? 1 : 0,
      });
    } else {
      if (record.completed) {
        existing.lessonsCompleted += 1;
      }
      if (record.quizScore !== null && record.quizScore >= 80) {
        existing.completed = true;
        existing.quizScore = record.quizScore;
      }
    }
  }

  // Build module progress array for locking logic
  const moduleProgress: ModuleProgress[] = Array.from(
    moduleProgressMap.entries()
  ).map(([moduleOrder, data]) => ({
    moduleOrder,
    completed: data.completed,
    quizScore: data.quizScore,
  }));

  // Count completed modules for overall progress
  const completedModules = moduleProgress.filter((p) => p.completed).length;

  return (
    <div>
      <h1 className="text-xl font-bold text-text-primary mb-1">
        Welcome back, {session.user.name}!
      </h1>
      <p className="text-sm text-text-secondary mb-4">
        {completedModules === 0
          ? "Ready to start your learning journey?"
          : `You're ${Math.round((completedModules / MODULES.length) * 100)}% through the course — keep it up!`}
      </p>

      <ProgressBar
        current={completedModules}
        total={MODULES.length}
        showLabel
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-8">
        {MODULES.map((mod) => {
          const modData = moduleProgressMap.get(mod.order);
          const isUserAdmin = session.user?.role === "admin";
          let status = getModuleStatus(
            mod.order,
            moduleProgress,
            modData?.lessonsCompleted ?? 0
          );
          if (isUserAdmin && status === "locked") {
            status = "available";
          }

          return (
            <ModuleCard
              key={mod.id}
              title={mod.title}
              order={mod.order}
              slug={mod.slug}
              status={status}
              lessonsCompleted={modData?.lessonsCompleted ?? 0}
              lessonCount={mod.lessonCount}
            />
          );
        })}
      </div>
    </div>
  );
}
