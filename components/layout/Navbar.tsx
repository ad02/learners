"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { XpBar } from "./XpBar";

interface XpData {
  xp: number;
  levelName: string;
  levelEmoji: string;
  streak: number;
  xpProgress: { current: number; needed: number; percentage: number };
}

export function Navbar() {
  const { data: session } = useSession();
  const [xpData, setXpData] = useState<XpData | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/xp")
        .then((r) => r.json())
        .then((data) => setXpData(data))
        .catch(() => {});
    }
  }, [session?.user]);

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-bg-secondary border-b border-border">
      <Link href="/dashboard" className="flex items-center gap-2">
        <span className="text-lg">{"\uD83D\uDE80"}</span>
        <span className="font-bold text-sm gradient-text">
          Learners Academy
        </span>
      </Link>

      {session?.user && (
        <div className="flex items-center gap-4">
          {xpData && (
            <>
              <div className="hidden sm:block w-32">
                <XpBar
                  currentXp={xpData.xpProgress.current}
                  nextLevelXp={xpData.xpProgress.needed}
                  percentage={xpData.xpProgress.percentage}
                  levelEmoji={xpData.levelEmoji}
                  levelName={xpData.levelName}
                />
              </div>
              {xpData.streak > 0 && (
                <span
                  className={`text-xs font-semibold text-accent-yellow flex items-center gap-1 ${xpData.streak >= 3 ? "animate-pulse-glow" : ""}`}
                  title={`${xpData.streak}-day streak`}
                >
                  {"\uD83D\uDD25"} {xpData.streak}
                </span>
              )}
            </>
          )}
          <Link
            href="/leaderboard"
            className="text-xs text-text-muted hover:text-text-secondary"
            title="Leaderboard"
          >
            {"\uD83C\uDFC6"}
          </Link>
          <Link
            href="/achievements"
            className="text-xs text-text-muted hover:text-text-secondary"
            title="Achievements"
          >
            {"\uD83C\uDFC5"}
          </Link>
          <span className="text-xs text-text-secondary">
            {session.user.name}
          </span>
          {session.user.role === "admin" && (
            <Link
              href="/admin"
              className="text-xs text-accent-purple hover:text-accent-purple/80"
            >
              Admin
            </Link>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="text-xs text-text-muted hover:text-text-secondary"
          >
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
}
