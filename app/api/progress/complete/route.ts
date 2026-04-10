import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  XP_REWARDS,
  getLevelForXp,
  calculateStreak,
} from "@/lib/gamification";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { moduleId, lessonId, moduleOrder, lessonOrder, quizScore } =
      await request.json();

    if (
      !moduleId ||
      !lessonId ||
      moduleOrder === undefined ||
      lessonOrder === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const completed = quizScore !== undefined ? quizScore >= 80 : true;

    const progress = await prisma.progress.upsert({
      where: {
        userId_moduleId_lessonId: {
          userId: session.user.id,
          moduleId,
          lessonId,
        },
      },
      update: {
        completed,
        quizScore: quizScore ?? null,
        completedAt: completed ? new Date() : null,
      },
      create: {
        userId: session.user.id,
        moduleId,
        lessonId,
        moduleOrder,
        lessonOrder,
        completed,
        quizScore: quizScore ?? null,
        completedAt: completed ? new Date() : null,
      },
    });

    // Award XP
    let xpEarned = 0;
    if (completed) {
      xpEarned =
        quizScore !== undefined
          ? XP_REWARDS.QUIZ_PASS
          : XP_REWARDS.LESSON_COMPLETE;
      if (quizScore === 100) xpEarned += XP_REWARDS.QUIZ_PERFECT;
    }

    if (xpEarned > 0) {
      // Update streak
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { xp: true, streak: true, lastActiveDate: true },
      });

      const { newStreak } = calculateStreak(
        user?.lastActiveDate || null,
        user?.streak || 0
      );
      const newXp = (user?.xp || 0) + xpEarned;
      const newLevel = getLevelForXp(newXp);

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          xp: newXp,
          level: newLevel.level,
          streak: newStreak,
          lastActiveDate: new Date(),
        },
      });

      // Check achievements
      const existingAchievements = await prisma.achievement.findMany({
        where: { userId: session.user.id },
      });
      const unlockedIds = new Set(
        existingAchievements.map((a) => a.achievementId)
      );
      const newAchievements: string[] = [];

      // First lesson
      if (!unlockedIds.has("first-steps") && quizScore === undefined) {
        newAchievements.push("first-steps");
      }

      // First quiz pass
      if (
        !unlockedIds.has("quiz-whiz") &&
        quizScore !== undefined &&
        quizScore >= 80
      ) {
        newAchievements.push("quiz-whiz");
      }

      // Perfect score
      if (!unlockedIds.has("perfect-score") && quizScore === 100) {
        newAchievements.push("perfect-score");
      }

      // Module complete (quiz passed)
      if (
        !unlockedIds.has("module-master") &&
        quizScore !== undefined &&
        quizScore >= 80
      ) {
        newAchievements.push("module-master");
      }

      // Streak achievements
      if (!unlockedIds.has("streak-3") && newStreak >= 3) {
        newAchievements.push("streak-3");
      }
      if (!unlockedIds.has("streak-7") && newStreak >= 7) {
        newAchievements.push("streak-7");
      }

      // Check module counts for halfway/graduate
      const allProgress = await prisma.progress.findMany({
        where: { userId: session.user.id, completed: true },
      });
      const completedModules = new Set<string>();
      for (const p of allProgress) {
        if (p.quizScore !== null && p.quizScore >= 80) {
          completedModules.add(p.moduleId);
        }
      }
      if (!unlockedIds.has("halfway") && completedModules.size >= 5) {
        newAchievements.push("halfway");
      }
      if (!unlockedIds.has("graduate") && completedModules.size >= 9) {
        newAchievements.push("graduate");
      }

      // Check speed learner (3 lessons today)
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayProgress = await prisma.progress.count({
        where: {
          userId: session.user.id,
          completed: true,
          completedAt: { gte: todayStart },
        },
      });
      if (!unlockedIds.has("speed-learner") && todayProgress >= 3) {
        newAchievements.push("speed-learner");
      }

      // Save new achievements
      for (const achId of newAchievements) {
        await prisma.achievement.create({
          data: { userId: session.user.id, achievementId: achId },
        });
      }

      // Return XP info in response
      return NextResponse.json({
        ...progress,
        xpEarned,
        totalXp: newXp,
        level: newLevel,
        streak: newStreak,
        newAchievements,
        leveledUp:
          newLevel.level > (user?.xp ? getLevelForXp(user.xp).level : 1),
      });
    }

    return NextResponse.json(progress);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
