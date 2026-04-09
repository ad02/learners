export interface Module {
  id: string;
  slug: string;
  title: string;
  description: string;
  phase: string;
  order: number;
  lessonCount: number;
}

export interface ModuleProgress {
  moduleOrder: number;
  completed: boolean;
  quizScore: number | null;
}

export type ModuleStatus = "locked" | "available" | "in-progress" | "completed";

export const MODULES: Module[] = [
  {
    id: "01-vs-code",
    slug: "01-vs-code",
    title: "Your Computer is Your Workshop",
    description: "VS Code setup, terminal basics, files and folders",
    phase: "Foundations",
    order: 1,
    lessonCount: 5,
  },
  {
    id: "02-git",
    slug: "02-git",
    title: "Git & GitHub — Saving Your Work",
    description: "Version control, commits, branches, GitHub",
    phase: "Foundations",
    order: 2,
    lessonCount: 5,
  },
  {
    id: "03-prompting",
    slug: "03-prompting",
    title: "Talking to AI — The Art of Prompting",
    description: "Good prompts, the prompt formula, iterating",
    phase: "AI & Prompting",
    order: 3,
    lessonCount: 2,
  },
  {
    id: "04-claude-code",
    slug: "04-claude-code",
    title: "Claude Code — AI in Your Terminal",
    description: "Using Claude Code to build, fix, and explain",
    phase: "AI & Prompting",
    order: 4,
    lessonCount: 2,
  },
  {
    id: "05-web-basics",
    slug: "05-web-basics",
    title: "How the Web Works",
    description: "HTML, CSS, JS, domains, hosting, DNS",
    phase: "Web & WordPress",
    order: 5,
    lessonCount: 2,
  },
  {
    id: "06-wordpress",
    slug: "06-wordpress",
    title: "WordPress — Building Without Code",
    description: "Dashboard, pages, posts, themes, plugins",
    phase: "Web & WordPress",
    order: 6,
    lessonCount: 2,
  },
  {
    id: "07-apis",
    slug: "07-apis",
    title: "APIs & Webhooks",
    description: "API calls, webhooks, WordPress REST API",
    phase: "Connecting Things",
    order: 7,
    lessonCount: 2,
  },
  {
    id: "08-automation",
    slug: "08-automation",
    title: "Automation Workflows",
    description: "Triggers, actions, n8n, Make, Zapier",
    phase: "Connecting Things",
    order: 8,
    lessonCount: 2,
  },
  {
    id: "09-capstone",
    slug: "09-capstone",
    title: "Final Project",
    description: "Build your own automation end-to-end",
    phase: "Putting It All Together",
    order: 9,
    lessonCount: 2,
  },
];

export function getModuleBySlug(slug: string): Module | undefined {
  return MODULES.find((m) => m.slug === slug);
}

export function isModuleUnlocked(
  moduleOrder: number,
  progress: ModuleProgress[]
): boolean {
  if (moduleOrder === 1) return true;

  const prevModule = progress.find((p) => p.moduleOrder === moduleOrder - 1);
  if (!prevModule) return false;

  return prevModule.completed && (prevModule.quizScore ?? 0) >= 80;
}

export function getModuleStatus(
  moduleOrder: number,
  progress: ModuleProgress[],
  completedLessons: number
): ModuleStatus {
  if (!isModuleUnlocked(moduleOrder, progress)) return "locked";

  const moduleProgress = progress.find((p) => p.moduleOrder === moduleOrder);

  if (moduleProgress?.completed && (moduleProgress.quizScore ?? 0) >= 80) {
    return "completed";
  }

  if (completedLessons > 0 || moduleProgress) {
    return "in-progress";
  }

  return "available";
}
