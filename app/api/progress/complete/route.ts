import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

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

    return NextResponse.json(progress);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
