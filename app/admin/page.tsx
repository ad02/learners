import Link from "next/link";
import { prisma } from "@/lib/db";
import { MODULES } from "@/lib/modules";

export default async function AdminPage() {
  const users = await prisma.user.findMany({
    include: {
      progress: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate stats
  const totalUsers = users.length;
  const totalLessonsCompleted = users.reduce(
    (sum, user) => sum + user.progress.filter((p) => p.completed).length,
    0
  );
  const allQuizScores = users.flatMap((user) =>
    user.progress.filter((p) => p.quizScore !== null).map((p) => p.quizScore!)
  );
  const averageQuizScore =
    allQuizScores.length > 0
      ? Math.round(allQuizScores.reduce((a, b) => a + b, 0) / allQuizScores.length)
      : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-text-primary">Admin Dashboard</h1>
        <Link
          href="/dashboard"
          className="text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          Back to Learner Dashboard
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-bg-secondary border border-border rounded-lg p-4">
          <p className="text-xs text-text-muted uppercase tracking-wide">Total Users</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{totalUsers}</p>
        </div>
        <div className="bg-bg-secondary border border-border rounded-lg p-4">
          <p className="text-xs text-text-muted uppercase tracking-wide">
            Lessons Completed
          </p>
          <p className="text-2xl font-bold text-text-primary mt-1">
            {totalLessonsCompleted}
          </p>
        </div>
        <div className="bg-bg-secondary border border-border rounded-lg p-4">
          <p className="text-xs text-text-muted uppercase tracking-wide">
            Avg Quiz Score
          </p>
          <p className="text-2xl font-bold text-text-primary mt-1">
            {averageQuizScore}%
          </p>
        </div>
      </div>

      {/* Users Table */}
      <h2 className="text-lg font-semibold text-text-primary mb-3">Users</h2>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-bg-secondary border-b border-border">
              <th className="text-left px-4 py-2 text-text-secondary font-medium">
                Name
              </th>
              <th className="text-left px-4 py-2 text-text-secondary font-medium">
                Email
              </th>
              <th className="text-left px-4 py-2 text-text-secondary font-medium">
                Role
              </th>
              <th className="text-left px-4 py-2 text-text-secondary font-medium">
                Joined
              </th>
              <th className="text-left px-4 py-2 text-text-secondary font-medium">
                Modules Done
              </th>
              <th className="text-left px-4 py-2 text-text-secondary font-medium">
                Progress
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const completedModules = new Set(
                user.progress
                  .filter(
                    (p) =>
                      p.completed && p.quizScore !== null && p.quizScore >= 80
                  )
                  .map((p) => p.moduleOrder)
              ).size;
              const progressPercent = Math.round(
                (completedModules / MODULES.length) * 100
              );

              return (
                <tr
                  key={user.id}
                  className="border-b border-border last:border-b-0 hover:bg-bg-secondary/50"
                >
                  <td className="px-4 py-2 text-text-primary">{user.name}</td>
                  <td className="px-4 py-2 text-text-secondary">{user.email}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        user.role === "admin"
                          ? "bg-accent/20 text-accent"
                          : "bg-bg-secondary text-text-muted"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-text-secondary">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-text-primary">
                    {completedModules} / {MODULES.length}
                  </td>
                  <td className="px-4 py-2 text-text-primary">{progressPercent}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
