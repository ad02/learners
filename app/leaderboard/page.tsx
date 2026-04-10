import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getLevelForXp } from "@/lib/gamification";

export default async function LeaderboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, xp: true, streak: true },
    orderBy: { xp: "desc" },
    take: 50,
  });

  const rankStyles = [
    "from-accent-yellow/20 to-accent-yellow/5 border-accent-yellow/40",
    "from-accent-blue/15 to-accent-blue/5 border-accent-blue/30",
    "from-accent-purple/15 to-accent-purple/5 border-accent-purple/30",
  ];

  const rankEmojis = ["\uD83E\uDD47", "\uD83E\uDD48", "\uD83E\uDD49"];

  return (
    <div>
      <h1 className="text-xl font-bold gradient-text mb-1">
        {"\uD83C\uDFC6"} Leaderboard
      </h1>
      <p className="text-sm text-text-secondary mb-6">
        See how you stack up against your fellow learners.
      </p>

      <div className="space-y-2">
        {users.map((user, index) => {
          const level = getLevelForXp(user.xp);
          const isCurrentUser = user.id === session.user?.id;
          const isTop3 = index < 3;

          return (
            <div
              key={user.id}
              className={`flex items-center gap-4 rounded-lg px-4 py-3 border ${
                isTop3
                  ? `bg-gradient-to-r ${rankStyles[index]} `
                  : "bg-bg-secondary border-border"
              } ${isCurrentUser ? "ring-2 ring-accent-blue/50" : ""}`}
            >
              <span className="text-lg w-8 text-center font-bold text-text-muted">
                {isTop3 ? rankEmojis[index] : `${index + 1}`}
              </span>
              <span className="text-lg" title={level.name}>
                {level.emoji}
              </span>
              <div className="flex-1 min-w-0">
                <span className={`text-sm font-semibold ${isCurrentUser ? "text-accent-blue" : "text-text-primary"}`}>
                  {user.name}
                  {isCurrentUser && " (you)"}
                </span>
                <span className="text-xs text-text-muted ml-2">{level.name}</span>
              </div>
              {user.streak > 0 && (
                <span className="text-xs text-accent-yellow">{"\uD83D\uDD25"} {user.streak}</span>
              )}
              <span className="text-sm font-bold text-text-secondary">
                {user.xp.toLocaleString()} XP
              </span>
            </div>
          );
        })}

        {users.length === 0 && (
          <p className="text-center text-text-muted py-8">No learners yet. Be the first!</p>
        )}
      </div>
    </div>
  );
}
