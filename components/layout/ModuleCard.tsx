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

const moduleEmojis = [
  "💻", "🔄", "🤖", "⚡", "🌐", "📝", "🔌", "⚙️", "🎓",
];

const statusColors: Record<ModuleStatus, string> = {
  completed: "text-accent-green",
  "in-progress": "text-accent-blue",
  available: "text-accent-purple",
  locked: "text-text-muted",
};

export function ModuleCard({
  title,
  order,
  slug,
  status,
  lessonsCompleted,
  lessonCount,
}: ModuleCardProps) {
  const progressPct = lessonCount > 0 ? Math.round((lessonsCompleted / lessonCount) * 100) : 0;
  const emoji = moduleEmojis[order - 1] || "📖";

  const statusLabel =
    status === "completed" ? "Completed ✓"
    : status === "in-progress" ? `${lessonsCompleted}/${lessonCount} lessons`
    : status === "available" ? "Ready to start"
    : "Locked";

  const content = (
    <div className={`group py-5 ${status === "locked" ? "opacity-40" : ""}`}>
      <div className="flex items-start gap-4">
        <div className={`text-3xl flex-shrink-0 ${status !== "locked" ? "group-hover:scale-110 transition-transform" : ""}`}>
          {status === "locked" ? "🔒" : emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-text-muted">Module {order}</span>
            {status === "completed" && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Done</span>}
          </div>
          <h3 className={`text-base font-semibold leading-snug ${status === "locked" ? "text-text-muted" : "text-text-primary"}`}>
            {title}
          </h3>
          <div className={`text-sm mt-1 ${statusColors[status]}`}>
            {statusLabel}
          </div>
          {(status === "in-progress" || status === "completed") && (
            <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden w-full max-w-[200px]">
              <div
                className={`h-full rounded-full transition-all duration-700 ${status === "completed" ? "bg-accent-green" : "bg-gradient-to-r from-accent-blue to-accent-purple"}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          )}
        </div>
        {status !== "locked" && (
          <span className="text-text-muted group-hover:text-accent-blue transition-colors text-lg">→</span>
        )}
      </div>
    </div>
  );

  if (status === "locked") {
    return <div className="border-b border-gray-100 last:border-b-0">{content}</div>;
  }

  return (
    <Link href={`/learn/${slug}`} className="block border-b border-gray-100 last:border-b-0 hover:bg-blue-50/30 transition-colors rounded-lg -mx-3 px-3">
      {content}
    </Link>
  );
}
