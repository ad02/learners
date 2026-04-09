"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface MarkCompleteButtonProps {
  moduleId: string;
  lessonId: string;
  moduleOrder: number;
  lessonOrder: number;
  isCompleted: boolean;
}

export function MarkCompleteButton({
  moduleId,
  lessonId,
  moduleOrder,
  lessonOrder,
  isCompleted,
}: MarkCompleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (isCompleted) {
    return (
      <div className="flex items-center gap-2 text-accent-green text-sm mt-6">
        <span>✓</span> Lesson completed
      </div>
    );
  }

  async function handleComplete() {
    setLoading(true);

    await fetch("/api/progress/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        moduleId,
        lessonId,
        moduleOrder,
        lessonOrder,
      }),
    });

    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleComplete}
      disabled={loading}
      className="mt-6 px-6 py-2 rounded-lg bg-accent-blue text-bg-primary font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      {loading ? "Saving..." : "Mark as Complete ✓"}
    </button>
  );
}
