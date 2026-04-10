import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { userId, role } = await request.json();
  if (!userId || !["admin", "user"].includes(role)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  return NextResponse.json({ message: "Role updated" });
}
