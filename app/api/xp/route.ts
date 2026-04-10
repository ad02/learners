import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getLevelForXp,
  getXpToNextLevel,
  ACHIEVEMENTS,
} from "@/lib/gamification";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { xp: true, level: true, streak: true, lastActiveDate: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const achievements = await prisma.achievement.findMany({
    where: { userId: session.user.id },
  });

  const level = getLevelForXp(user.xp);
  const progress = getXpToNextLevel(user.xp);

  return NextResponse.json({
    xp: user.xp,
    level: level.level,
    levelName: level.name,
    levelEmoji: level.emoji,
    streak: user.streak,
    xpProgress: progress,
    achievements: achievements.map((a) => a.achievementId),
    allAchievements: ACHIEVEMENTS,
  });
}
