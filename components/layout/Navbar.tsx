"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-bg-secondary border-b border-border">
      <Link href="/dashboard" className="flex items-center gap-2">
        <span className="text-lg">{"\uD83D\uDE80"}</span>
        <span className="font-bold text-sm text-text-primary">
          Learners Academy
        </span>
      </Link>

      {session?.user && (
        <div className="flex items-center gap-4">
          <span className="text-xs text-text-secondary">
            Hi, {session.user.name}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
}
