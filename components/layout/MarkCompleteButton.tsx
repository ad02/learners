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
      <div className="flex items-center gap-2 text-accent-green text-sm mt-6 font-semibold">
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
      className="mt-6 px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-sm hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
    >
      {loading ? "Saving..." : "Mark as Complete ✓"}
    </button>
  );
}
