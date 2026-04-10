import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { MODULES, getModuleStatus, type ModuleProgress } from "@/lib/modules";
import { getLevelForXp, ACHIEVEMENTS } from "@/lib/gamification";
import { ProgressBar } from "@/components/layout/ProgressBar";
import { ModuleCard } from "@/components/layout/ModuleCard";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Fetch user data for gamification
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { xp: true, streak: true },
  });

  const userXp = user?.xp ?? 0;
  const userStreak = user?.streak ?? 0;
  const level = getLevelForXp(userXp);

  // Fetch user achievements (last 3)
  const userAchievements = await prisma.achievement.findMany({
    where: { userId: session.user.id },
    orderBy: { unlockedAt: "desc" },
    take: 3,
    select: { achievementId: true },
  });
  const recentAchievementIds = userAchievements.map((a) => a.achievementId);
  const recentAchievements = ACHIEVEMENTS.filter((a) =>
    recentAchievementIds.includes(a.id)
  );

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
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary mb-1">
          Welcome back, {session.user.name}!
        </h1>
        <p className="text-text-secondary">
          {completedModules === 0
            ? "Ready to start your learning journey?"
            : `You're ${Math.round((completedModules / MODULES.length) * 100)}% through the course`}
        </p>
      </div>

      {/* Stats inline */}
      <div className="flex items-center gap-6 mb-8 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl">{level.emoji}</span>
          <div>
            <span className="font-semibold text-text-primary">{level.name}</span>
            <span className="text-text-muted ml-1">· {userXp} XP</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-lg">🔥</span>
          <span className="font-semibold text-text-primary">{userStreak}</span>
          <span className="text-text-muted">day streak</span>
        </div>
        {recentAchievements.length > 0 && (
          <div className="flex items-center gap-1">
            {recentAchievements.map((a) => (
              <span key={a.id} className="text-lg" title={a.name}>{a.emoji}</span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-3 text-text-muted ml-auto">
          <Link href="/leaderboard" className="hover:text-accent-blue transition-colors">Leaderboard</Link>
          <Link href="/achievements" className="hover:text-accent-purple transition-colors">Achievements</Link>
        </div>
      </div>

      {/* Overall progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-secondary">Overall Progress</span>
          <span className="text-sm font-semibold text-text-primary">{completedModules}/{MODULES.length} modules</span>
        </div>
        <ProgressBar current={completedModules} total={MODULES.length} />
      </div>

      {/* Module list */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-2">Your Learning Path</h2>
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
