import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getLevelForXp } from "@/lib/gamification";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, xp: true, level: true, streak: true },
    orderBy: { xp: "desc" },
  });

  const leaderboard = users.map((u, i) => {
    const level = getLevelForXp(u.xp);
    return {
      rank: i + 1,
      name: u.name,
      xp: u.xp,
      level: level.level,
      levelName: level.name,
      levelEmoji: level.emoji,
      streak: u.streak,
      isCurrentUser: u.id === session.user.id,
    };
  });

  return NextResponse.json(leaderboard);
}
