import Link from "next/link";
import type { ModuleStatus } from "@/lib/modules";

interface ModuleCardProps {
  title: string;
  order: number;
  slug: string;
  status: ModuleStatus;
  lessonsCompleted: number;
  lessonCount: number;
}

const statusConfig: Record<
  ModuleStatus,
  { label: string; color: string; borderColor: string }
> = {
  completed: {
    label: "COMPLETED",
    color: "text-accent-green",
    borderColor: "border-l-accent-green",
  },
  "in-progress": {
    label: "IN PROGRESS",
    color: "text-accent-blue",
    borderColor: "border-l-accent-blue",
  },
  available: {
    label: "START",
    color: "text-accent-blue",
    borderColor: "border-l-accent-blue",
  },
  locked: {
    label: "LOCKED",
    color: "text-text-muted",
    borderColor: "border-l-bg-surface",
  },
};

export function ModuleCard({
  title,
  order,
  slug,
  status,
  lessonsCompleted,
  lessonCount,
}: ModuleCardProps) {
  const config = statusConfig[status];
  const statusIcon =
    status === "completed"
      ? "\u2713"
      : status === "in-progress"
        ? "\u25B6"
        : status === "available"
          ? "\u25B6"
          : "\uD83D\uDD12";

  const card = (
    <div
      className={`bg-bg-secondary rounded-lg p-4 border-l-[3px] ${config.borderColor} ${
        status === "locked" ? "opacity-50" : "hover:bg-bg-surface transition-colors"
      }`}
    >
      <div className={`text-xs ${config.color} mb-1`}>
        <span>{statusIcon}</span> <span>{config.label}</span>
      </div>
      <div className="text-sm font-bold text-text-primary">
        <span>{order}.</span> <span>{title}</span>
      </div>
      <div className="text-xs text-text-secondary mt-1">
        <span>{lessonsCompleted}/{lessonCount} lessons</span>
      </div>
    </div>
  );

  if (status === "locked") {
    return card;
  }

  return <Link href={`/learn/${slug}`}>{card}</Link>;
}
