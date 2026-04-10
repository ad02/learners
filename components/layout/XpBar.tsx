interface XpBarProps {
  currentXp: number;
  nextLevelXp: number;
  percentage: number;
  levelEmoji: string;
  levelName: string;
}

export function XpBar({ currentXp, nextLevelXp, percentage, levelEmoji, levelName }: XpBarProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-lg" title={levelName}>{levelEmoji}</span>
      <div className="flex-1 h-2 bg-bg-surface rounded-full overflow-hidden min-w-[80px]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent-blue to-accent-green transition-all duration-700"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-text-muted whitespace-nowrap">{currentXp}/{nextLevelXp} XP</span>
    </div>
  );
}
