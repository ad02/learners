import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ACHIEVEMENTS } from "@/lib/gamification";

export default async function AchievementsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const userAchievements = await prisma.achievement.findMany({
    where: { userId: session.user.id },
    select: { achievementId: true, unlockedAt: true },
  });

  const unlockedIds = new Set(userAchievements.map((a) => a.achievementId));
  const unlockedMap = new Map(
    userAchievements.map((a) => [a.achievementId, a.unlockedAt])
  );

  return (
    <div>
      <h1 className="text-xl font-bold gradient-text mb-1">
        {"\uD83C\uDFC5"} Achievements
      </h1>
      <p className="text-sm text-text-secondary mb-6">
        {unlockedIds.size} of {ACHIEVEMENTS.length} unlocked
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ACHIEVEMENTS.map((achievement, index) => {
          const unlocked = unlockedIds.has(achievement.id);
          const unlockedAt = unlockedMap.get(achievement.id);

          return (
            <div
              key={achievement.id}
              className={`rounded-xl p-4 border shadow-sm ${
                unlocked
                  ? "bg-white border-accent-green/30 glow-card"
                  : "bg-gray-50 border-border opacity-60"
              }`}
              style={{
                animationDelay: `${index * 0.05}s`,
              }}
            >
              <div className="flex items-center gap-3">
                <span className={`text-3xl ${unlocked ? "animate-bounce-in" : "grayscale"}`}>
                  {unlocked ? achievement.emoji : "\uD83D\uDD12"}
                </span>
                <div>
                  <h3 className={`text-sm font-bold ${unlocked ? "text-text-primary" : "text-text-muted"}`}>
                    {achievement.name}
                  </h3>
                  <p className="text-xs text-text-muted">{achievement.description}</p>
                  {unlocked && unlockedAt && (
                    <p className="text-[10px] text-accent-green mt-1 font-medium">
                      Unlocked {new Date(unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
