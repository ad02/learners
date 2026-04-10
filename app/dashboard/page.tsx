import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { MODULES, getModuleStatus, type ModuleProgress } from "@/lib/modules";
import { getLevelForXp, getXpToNextLevel, ACHIEVEMENTS } from "@/lib/gamification";
import { ProgressBar } from "@/components/layout/ProgressBar";
import { ModuleCard } from "@/components/layout/ModuleCard";
import { XpBar } from "@/components/layout/XpBar";

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
  const xpProgress = getXpToNextLevel(userXp);

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
    <div>
      <h1 className="text-xl font-bold gradient-text mb-1">
        Welcome back, {session.user.name}!
      </h1>
      <p className="text-sm text-text-secondary mb-4">
        {completedModules === 0
          ? "Ready to start your learning journey?"
          : `You're ${Math.round((completedModules / MODULES.length) * 100)}% through the course \u2014 keep it up!`}
      </p>

      {/* Gamification stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-bg-secondary rounded-lg p-4 border border-border">
          <div className="text-xs text-text-muted mb-2">Level</div>
          <XpBar
            currentXp={xpProgress.current}
            nextLevelXp={xpProgress.needed}
            percentage={xpProgress.percentage}
            levelEmoji={level.emoji}
            levelName={level.name}
          />
          <div className="text-xs text-text-muted mt-1">{userXp} XP total</div>
        </div>
        <div className="bg-bg-secondary rounded-lg p-4 border border-border">
          <div className="text-xs text-text-muted mb-2">Streak</div>
          <div className="flex items-center gap-2">
            <span className={`text-2xl ${userStreak >= 3 ? "animate-pulse-glow" : ""}`}>{"\uD83D\uDD25"}</span>
            <span className="text-2xl font-bold text-text-primary">{userStreak}</span>
            <span className="text-xs text-text-muted">days</span>
          </div>
        </div>
        <div className="bg-bg-secondary rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-muted">Recent Achievements</span>
            <Link href="/achievements" className="text-xs text-accent-blue hover:text-accent-blue/80">
              View all
            </Link>
          </div>
          {recentAchievements.length > 0 ? (
            <div className="flex gap-2">
              {recentAchievements.map((a) => (
                <span key={a.id} className="text-2xl" title={a.name}>
                  {a.emoji}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-muted">Complete lessons to earn achievements!</p>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="flex gap-3 mb-6">
        <Link
          href="/leaderboard"
          className="text-xs text-accent-blue hover:text-accent-blue/80 flex items-center gap-1"
        >
          {"\uD83C\uDFC6"} Leaderboard
        </Link>
        <Link
          href="/achievements"
          className="text-xs text-accent-purple hover:text-accent-purple/80 flex items-center gap-1"
        >
          {"\uD83C\uDFC5"} Achievements
        </Link>
      </div>

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
