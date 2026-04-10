// XP rewards
export const XP_REWARDS = {
  LESSON_COMPLETE: 50,
  QUIZ_PASS: 100,
  QUIZ_PERFECT: 50, // bonus on top of QUIZ_PASS
  EXERCISE_COMPLETE: 25,
};

// Levels
export const LEVELS = [
  { level: 1, name: "Beginner", minXp: 0, emoji: "🌱" },
  { level: 2, name: "Explorer", minXp: 200, emoji: "🔍" },
  { level: 3, name: "Learner", minXp: 500, emoji: "📚" },
  { level: 4, name: "Builder", minXp: 1000, emoji: "🔨" },
  { level: 5, name: "Automator", minXp: 2000, emoji: "⚡" },
  { level: 6, name: "Specialist", minXp: 3500, emoji: "🏆" },
];

export function getLevelForXp(xp: number) {
  // return highest level where minXp <= xp
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getNextLevel(currentLevel: number) {
  return LEVELS.find((l) => l.level === currentLevel + 1) || null;
}

export function getXpToNextLevel(xp: number) {
  const current = getLevelForXp(xp);
  const next = getNextLevel(current.level);
  if (!next) return { current: 0, needed: 0, percentage: 100 }; // max level
  const currentLevelXp = xp - current.minXp;
  const neededForNext = next.minXp - current.minXp;
  return {
    current: currentLevelXp,
    needed: neededForNext,
    percentage: Math.round((currentLevelXp / neededForNext) * 100),
  };
}

// Achievements
export const ACHIEVEMENTS = [
  {
    id: "first-steps",
    name: "First Steps",
    description: "Complete your first lesson",
    emoji: "👶",
    condition: "first_lesson",
  },
  {
    id: "quiz-whiz",
    name: "Quiz Whiz",
    description: "Pass your first quiz",
    emoji: "🧠",
    condition: "first_quiz",
  },
  {
    id: "perfect-score",
    name: "Perfect Score",
    description: "Get 100% on any quiz",
    emoji: "💯",
    condition: "perfect_quiz",
  },
  {
    id: "module-master",
    name: "Module Master",
    description: "Complete any module",
    emoji: "🎓",
    condition: "first_module",
  },
  {
    id: "halfway",
    name: "Halfway There",
    description: "Complete 5 modules",
    emoji: "🏔️",
    condition: "five_modules",
  },
  {
    id: "speed-learner",
    name: "Speed Learner",
    description: "Complete 3 lessons in one day",
    emoji: "🚀",
    condition: "three_daily",
  },
  {
    id: "streak-3",
    name: "Streak Starter",
    description: "3-day learning streak",
    emoji: "🔥",
    condition: "streak_3",
  },
  {
    id: "streak-7",
    name: "On Fire",
    description: "7-day learning streak",
    emoji: "💥",
    condition: "streak_7",
  },
  {
    id: "graduate",
    name: "Graduate",
    description: "Complete all 9 modules",
    emoji: "🎉",
    condition: "all_modules",
  },
];

// Streak logic
export function calculateStreak(
  lastActiveDate: Date | null,
  currentStreak: number
): { newStreak: number; isNewDay: boolean } {
  if (!lastActiveDate) return { newStreak: 1, isNewDay: true };

  const now = new Date();
  const last = new Date(lastActiveDate);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastDay = new Date(
    last.getFullYear(),
    last.getMonth(),
    last.getDate()
  );

  const diffDays = Math.floor(
    (today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return { newStreak: currentStreak, isNewDay: false }; // same day
  if (diffDays === 1) return { newStreak: currentStreak + 1, isNewDay: true }; // consecutive
  return { newStreak: 1, isNewDay: true }; // streak broken
}
