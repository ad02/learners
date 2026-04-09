interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
}

export function ProgressBar({ current, total, showLabel }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="flex items-center gap-3">
      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        className="flex-1 h-2 bg-bg-surface rounded-full overflow-hidden"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent-blue to-accent-green transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm text-text-secondary">{percentage}%</span>
      )}
    </div>
  );
}
