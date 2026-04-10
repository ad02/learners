# Phase 2: Content Engine — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the MDX content pipeline so lessons render as pages with sidebar navigation, progress tracking, and module locking — producing a working app where users can read lessons and navigate between them.

**Architecture:** MDX files in `content/` folders are loaded at build time via `next-mdx-remote`. Each lesson has frontmatter (title, order, type). Lesson pages are dynamic routes at `/learn/[module]/[lesson]`. A sidebar shows lesson progress within the current module. Completing a lesson (clicking "Mark Complete") calls the progress API and unlocks the next lesson.

**Tech Stack:** next-mdx-remote, gray-matter (frontmatter parsing), existing Next.js 16 + Prisma + NextAuth stack

**Spec:** `docs/superpowers/specs/2026-04-09-learners-academy-design.md`

---

## File Structure

```
learners/
├── app/
│   └── learn/
│       ├── layout.tsx                    # Learn layout (no changes needed, uses root)
│       └── [module]/
│           ├── page.tsx                  # Module index → redirect to first unlocked lesson
│           └── [lesson]/
│               └── page.tsx             # Lesson page (renders MDX + sidebar)
├── components/
│   └── layout/
│       ├── LessonSidebar.tsx            # Sidebar nav within a module
│       ├── LessonContent.tsx            # MDX renderer wrapper (client)
│       └── LessonNav.tsx                # Previous/Next navigation at bottom
├── lib/
│   ├── content.ts                       # Content loading utilities (read MDX, parse frontmatter)
│   └── modules.ts                       # (existing, may need minor updates)
├── content/
│   ├── 01-vs-code/
│   │   ├── 01-what-is-vscode.mdx
│   │   ├── 02-installing-vscode.mdx
│   │   ├── 03-the-terminal.mdx
│   │   ├── 04-files-and-folders.mdx
│   │   └── 05-quiz.mdx
│   └── 02-git/
│       ├── 01-what-is-version-control.mdx
│       ├── 02-git-basics.mdx
│       ├── 03-github.mdx
│       ├── 04-branches.mdx
│       └── 05-quiz.mdx
└── __tests__/
    └── lib/
        └── content.test.ts              # Content loading tests
```

Note: Only modules 01 and 02 get full content in Phase 2. Modules 03-09 get placeholder content (title + "Coming soon"). This keeps the scope manageable while proving the full pipeline works.

---

### Task 1: Install MDX Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install packages**

```bash
cd d:/learners
npm install next-mdx-remote gray-matter
```

- [ ] **Step 2: Verify installation**

```bash
node -e "require('next-mdx-remote'); require('gray-matter'); console.log('OK')"
```

Expected: "OK" printed.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add MDX dependencies (next-mdx-remote, gray-matter)"
```

---

### Task 2: Content Loading Utilities

**Files:**
- Create: `lib/content.ts`, `__tests__/lib/content.test.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/lib/content.test.ts`:

```ts
import {
  getLessonsForModule,
  getLessonContent,
  getModuleSlugs,
  type LessonMeta,
} from "@/lib/content";

describe("getModuleSlugs", () => {
  test("returns array of module folder names", () => {
    const slugs = getModuleSlugs();
    expect(slugs).toContain("01-vs-code");
    expect(slugs).toContain("02-git");
    expect(slugs.length).toBeGreaterThanOrEqual(2);
  });
});

describe("getLessonsForModule", () => {
  test("returns sorted lessons for a valid module", () => {
    const lessons = getLessonsForModule("01-vs-code");
    expect(lessons.length).toBeGreaterThan(0);
    expect(lessons[0].slug).toBe("01-what-is-vscode");
    expect(lessons[0].title).toBeTruthy();
    expect(lessons[0].order).toBe(1);
  });

  test("lessons are sorted by order", () => {
    const lessons = getLessonsForModule("01-vs-code");
    for (let i = 1; i < lessons.length; i++) {
      expect(lessons[i].order).toBeGreaterThan(lessons[i - 1].order);
    }
  });

  test("returns empty array for nonexistent module", () => {
    const lessons = getLessonsForModule("nonexistent");
    expect(lessons).toEqual([]);
  });

  test("identifies quiz lessons", () => {
    const lessons = getLessonsForModule("01-vs-code");
    const quiz = lessons.find((l) => l.type === "quiz");
    expect(quiz).toBeDefined();
    expect(quiz!.slug).toContain("quiz");
  });
});

describe("getLessonContent", () => {
  test("returns content and meta for valid lesson", () => {
    const result = getLessonContent("01-vs-code", "01-what-is-vscode");
    expect(result).not.toBeNull();
    expect(result!.meta.title).toBeTruthy();
    expect(result!.content).toBeTruthy();
  });

  test("returns null for nonexistent lesson", () => {
    const result = getLessonContent("01-vs-code", "nonexistent");
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- __tests__/lib/content.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create sample content files for testing**

Create `content/01-vs-code/01-what-is-vscode.mdx`:

```mdx
---
title: "What is VS Code?"
description: "Meet your new best friend for writing code"
order: 1
type: lesson
---

# What is VS Code?

Think of **VS Code** like **Microsoft Word, but for code**. Just like Word helps you write documents with formatting and spell check, VS Code helps you write code with colors, suggestions, and error checking.

## Why VS Code?

VS Code is the most popular code editor in the world. It's:

- **Free** — completely free to download and use
- **Easy to learn** — designed to be beginner-friendly
- **Powerful** — used by professional developers everywhere

## What does it look like?

When you open VS Code, you'll see a few main areas:

1. **The Sidebar** (left) — shows your files and folders
2. **The Editor** (center) — where you type your code
3. **The Terminal** (bottom) — where you can type commands

Don't worry if this seems like a lot — we'll explore each part step by step!
```

Create `content/01-vs-code/02-installing-vscode.mdx`:

```mdx
---
title: "Installing VS Code"
description: "Step-by-step guide to getting VS Code on your computer"
order: 2
type: lesson
---

# Installing VS Code

Let's get VS Code installed on your computer. This should take about 5 minutes.

## Step 1: Download

Go to the VS Code website and click the big download button. It will automatically detect your computer type (Windows, Mac, or Linux).

## Step 2: Install

- **Windows**: Double-click the downloaded file and follow the wizard
- **Mac**: Drag VS Code to your Applications folder

## Step 3: Open It

Find VS Code in your applications and open it. You should see a welcome screen.

Congratulations — you just installed your first developer tool! 🎉
```

Create `content/01-vs-code/03-the-terminal.mdx`:

```mdx
---
title: "The Terminal"
description: "Your command center — like texting your computer"
order: 3
type: lesson
---

# The Terminal

The terminal is like **texting your computer**. Instead of clicking buttons, you type commands, and your computer responds.

## Why use the terminal?

- It's **faster** than clicking through menus
- It's **more powerful** — some things can only be done in the terminal
- It's how **automation works** — bots and scripts use the terminal

## Opening the terminal in VS Code

Press **Ctrl + `** (the backtick key, usually below Escape) to open the terminal inside VS Code.

You'll see something like this:

```
C:\Users\YourName>
```

That's the **prompt** — it's waiting for your command!
```

Create `content/01-vs-code/04-files-and-folders.mdx`:

```mdx
---
title: "Files and Folders"
description: "How computers organize things"
order: 4
type: lesson
---

# Files and Folders

Your computer organizes everything in **files** and **folders** — just like a physical filing cabinet.

## Files

A file is a single document. It could be:

- A text file (`.txt`)
- A code file (`.js`, `.html`, `.css`)
- An image (`.jpg`, `.png`)

The part after the dot is called the **extension** — it tells the computer what kind of file it is.

## Folders

Folders (also called **directories**) are containers that hold files and other folders. Think of them like folders in a filing cabinet.

## Creating files in VS Code

1. Click the **New File** icon in the sidebar
2. Type a name for your file (like `hello.txt`)
3. Press Enter — your file is created!
```

Create `content/01-vs-code/05-quiz.mdx`:

```mdx
---
title: "Module 1 Quiz"
description: "Test your VS Code knowledge"
order: 5
type: quiz
---

# Module 1 Quiz: VS Code Basics

Let's see what you've learned! You need 80% to pass and unlock the next module.
```

Create `content/02-git/01-what-is-version-control.mdx`:

```mdx
---
title: "What is Version Control?"
description: "Like undo, but for your whole project"
order: 1
type: lesson
---

# What is Version Control?

Have you ever worked on a document and wished you could go back to an earlier version? That's exactly what **version control** does — but for your entire project.

## The Problem

Without version control:

- You make a change and it breaks something
- You can't remember what you changed
- Working with others means overwriting each other's work

## The Solution: Git

**Git** is a version control system. Think of it like a **time machine for your project**. Every time you save a checkpoint (called a **commit**), Git remembers exactly what every file looked like at that moment.

You can always go back to any checkpoint.
```

Create `content/02-git/02-git-basics.mdx`:

```mdx
---
title: "Git Basics"
description: "Save, commit, push — the three key actions"
order: 2
type: lesson
---

# Git Basics

Git has three key actions you'll use every day. Think of it like mailing a letter:

1. **Add** (stage) — put your changes in an envelope
2. **Commit** — seal the envelope with a message about what's inside
3. **Push** — mail the envelope to the post office (GitHub)

## The Commands

```
git add .          ← Add all changed files
git commit -m "message"  ← Save with a description
git push           ← Send to GitHub
```

That's it! Those three commands cover 90% of what you'll do with Git.
```

Create `content/02-git/03-github.mdx`:

```mdx
---
title: "GitHub"
description: "Your project's home on the internet"
order: 3
type: lesson
---

# GitHub

**GitHub** is where your code lives on the internet. Think of it like **Google Drive, but for code**.

## Why GitHub?

- **Backup** — your code is safe even if your computer breaks
- **Collaboration** — others can see and contribute to your code
- **Portfolio** — it shows what you've built

## Repository

A **repository** (or "repo") is a project on GitHub. It contains all your files and the entire history of changes.
```

Create `content/02-git/04-branches.mdx`:

```mdx
---
title: "Branches"
description: "Working on something without breaking what works"
order: 4
type: lesson
---

# Branches

A **branch** is a copy of your project where you can make changes without affecting the main version. Think of it like a **parallel universe** for your code.

## Why use branches?

- Work on a new feature without breaking the main project
- Experiment safely
- Multiple people can work on different features at the same time

## Main Branch

Every project has a **main branch** (usually called `main`). This is the official version of your project — the one that works.

When your feature is ready, you **merge** your branch back into main.
```

Create `content/02-git/05-quiz.mdx`:

```mdx
---
title: "Module 2 Quiz"
description: "Test your Git & GitHub knowledge"
order: 5
type: quiz
---

# Module 2 Quiz: Git & GitHub

Let's see what you've learned! You need 80% to pass and unlock the next module.
```

- [ ] **Step 4: Implement content loading utilities**

Create `lib/content.ts`:

```ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content");

export interface LessonMeta {
  slug: string;
  title: string;
  description: string;
  order: number;
  type: "lesson" | "quiz";
}

export function getModuleSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

export function getLessonsForModule(moduleSlug: string): LessonMeta[] {
  const moduleDir = path.join(CONTENT_DIR, moduleSlug);
  if (!fs.existsSync(moduleDir)) return [];

  const files = fs
    .readdirSync(moduleDir)
    .filter((f) => f.endsWith(".mdx"));

  const lessons: LessonMeta[] = files.map((file) => {
    const filePath = path.join(moduleDir, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(raw);

    return {
      slug: file.replace(".mdx", ""),
      title: data.title || file.replace(".mdx", ""),
      description: data.description || "",
      order: data.order || 0,
      type: data.type || "lesson",
    };
  });

  return lessons.sort((a, b) => a.order - b.order);
}

export function getLessonContent(
  moduleSlug: string,
  lessonSlug: string
): { meta: LessonMeta; content: string } | null {
  const filePath = path.join(CONTENT_DIR, moduleSlug, `${lessonSlug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    meta: {
      slug: lessonSlug,
      title: data.title || lessonSlug,
      description: data.description || "",
      order: data.order || 0,
      type: data.type || "lesson",
    },
    content,
  };
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test -- __tests__/lib/content.test.ts
```

Expected: All tests PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/content.ts __tests__/lib/content.test.ts content/
git commit -m "feat: add content loading utilities and first 2 modules of lesson content"
```

---

### Task 3: Lesson Sidebar Component

**Files:**
- Create: `components/layout/LessonSidebar.tsx`

- [ ] **Step 1: Create LessonSidebar**

Create `components/layout/LessonSidebar.tsx`:

```tsx
import Link from "next/link";
import type { LessonMeta } from "@/lib/content";

interface LessonSidebarProps {
  moduleSlug: string;
  lessons: LessonMeta[];
  currentLessonSlug: string;
  completedLessons: Set<string>;
}

export function LessonSidebar({
  moduleSlug,
  lessons,
  currentLessonSlug,
  completedLessons,
}: LessonSidebarProps) {
  return (
    <aside className="w-[200px] flex-shrink-0 bg-bg-secondary border-r border-border p-4">
      <div className="text-xs uppercase text-text-secondary mb-3 tracking-wider">
        Lessons
      </div>
      <nav className="flex flex-col gap-1">
        {lessons.map((lesson, index) => {
          const isCurrent = lesson.slug === currentLessonSlug;
          const isCompleted = completedLessons.has(lesson.slug);
          const previousCompleted =
            index === 0 || completedLessons.has(lessons[index - 1].slug);
          const isUnlocked = index === 0 || previousCompleted;

          const icon = isCompleted ? "✓" : isCurrent ? "▶" : isUnlocked ? "" : "🔒";
          const colorClass = isCompleted
            ? "text-accent-green"
            : isCurrent
              ? "text-accent-blue font-bold bg-accent-blue/10"
              : isUnlocked
                ? "text-text-secondary hover:text-text-primary"
                : "text-text-muted";

          if (!isUnlocked) {
            return (
              <div
                key={lesson.slug}
                className={`text-xs px-2 py-1.5 rounded ${colorClass}`}
              >
                {icon} {lesson.order}. {lesson.title}
              </div>
            );
          }

          return (
            <Link
              key={lesson.slug}
              href={`/learn/${moduleSlug}/${lesson.slug}`}
              className={`text-xs px-2 py-1.5 rounded transition-colors ${colorClass}`}
            >
              {icon} {lesson.order}. {lesson.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/LessonSidebar.tsx
git commit -m "feat: add LessonSidebar component for lesson navigation"
```

---

### Task 4: Lesson Navigation Component

**Files:**
- Create: `components/layout/LessonNav.tsx`

- [ ] **Step 1: Create LessonNav**

Create `components/layout/LessonNav.tsx`:

```tsx
import Link from "next/link";
import type { LessonMeta } from "@/lib/content";

interface LessonNavProps {
  moduleSlug: string;
  lessons: LessonMeta[];
  currentLessonSlug: string;
  isCompleted: boolean;
}

export function LessonNav({
  moduleSlug,
  lessons,
  currentLessonSlug,
  isCompleted,
}: LessonNavProps) {
  const currentIndex = lessons.findIndex((l) => l.slug === currentLessonSlug);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  return (
    <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
      {prevLesson ? (
        <Link
          href={`/learn/${moduleSlug}/${prevLesson.slug}`}
          className="text-sm text-accent-blue hover:underline"
        >
          ← {prevLesson.title}
        </Link>
      ) : (
        <div />
      )}

      {nextLesson ? (
        isCompleted ? (
          <Link
            href={`/learn/${moduleSlug}/${nextLesson.slug}`}
            className="text-sm text-accent-blue hover:underline"
          >
            {nextLesson.title} →
          </Link>
        ) : (
          <span className="text-sm text-text-muted">
            Complete this lesson to continue →
          </span>
        )
      ) : (
        isCompleted && (
          <Link
            href="/dashboard"
            className="text-sm text-accent-green hover:underline"
          >
            Back to Dashboard ✓
          </Link>
        )
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/LessonNav.tsx
git commit -m "feat: add LessonNav component for previous/next navigation"
```

---

### Task 5: MDX Renderer Component

**Files:**
- Create: `components/layout/LessonContent.tsx`

- [ ] **Step 1: Create LessonContent (client component)**

Create `components/layout/LessonContent.tsx`:

```tsx
"use client";

import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";

interface LessonContentProps {
  source: MDXRemoteSerializeResult;
}

export function LessonContent({ source }: LessonContentProps) {
  return (
    <div className="prose prose-invert max-w-none prose-headings:text-text-primary prose-p:text-text-secondary prose-strong:text-text-primary prose-a:text-accent-blue prose-code:text-accent-purple prose-li:text-text-secondary prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg">
      <MDXRemote {...source} />
    </div>
  );
}
```

Note: `next-mdx-remote` serializes MDX on the server, then the client component hydrates it. This is important for App Router compatibility. We use the `serialize` function on the server side (in the page component) and pass the result to this client component.

IMPORTANT: Check the actual `next-mdx-remote` API. In newer versions, the import may be from `next-mdx-remote/serialize` for the serialize function. The MDXRemote component may need `compileMDX` from `next-mdx-remote/rsc` for App Router. Read the package docs or source to confirm the correct import pattern.

- [ ] **Step 2: Install Tailwind typography plugin for prose styles**

```bash
npm install @tailwindcss/typography
```

Then add to `app/globals.css` (after the `@import "tailwindcss"` line):

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
```

Note: Tailwind v4 uses `@plugin` directive instead of the plugins array in config.

- [ ] **Step 3: Commit**

```bash
git add components/layout/LessonContent.tsx app/globals.css package.json package-lock.json
git commit -m "feat: add MDX renderer component with Tailwind typography"
```

---

### Task 6: Mark Complete Button

**Files:**
- Create: `components/layout/MarkCompleteButton.tsx`

- [ ] **Step 1: Create MarkCompleteButton**

Create `components/layout/MarkCompleteButton.tsx`:

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/MarkCompleteButton.tsx
git commit -m "feat: add MarkCompleteButton for lesson progress tracking"
```

---

### Task 7: Lesson Page (Dynamic Route)

**Files:**
- Create: `app/learn/[module]/[lesson]/page.tsx`

- [ ] **Step 1: Create the lesson page**

Create `app/learn/[module]/[lesson]/page.tsx`:

```tsx
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getModuleBySlug, isModuleUnlocked, type ModuleProgress } from "@/lib/modules";
import { getLessonsForModule, getLessonContent } from "@/lib/content";
import { LessonSidebar } from "@/components/layout/LessonSidebar";
import { LessonNav } from "@/components/layout/LessonNav";
import { LessonContent } from "@/components/layout/LessonContent";
import { MarkCompleteButton } from "@/components/layout/MarkCompleteButton";
import { serialize } from "next-mdx-remote/serialize";

interface LessonPageProps {
  params: Promise<{ module: string; lesson: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { module: moduleSlug, lesson: lessonSlug } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  // Validate module exists
  const moduleData = getModuleBySlug(moduleSlug);
  if (!moduleData) notFound();

  // Check module is unlocked
  const allProgress = await prisma.progress.findMany({
    where: { userId: session.user.id },
  });

  const moduleProgress: ModuleProgress[] = [];
  const progressByModule = new Map<number, { completed: boolean; quizScore: number | null }>();
  
  for (const p of allProgress) {
    const existing = progressByModule.get(p.moduleOrder);
    if (!existing) {
      progressByModule.set(p.moduleOrder, {
        completed: p.completed && p.quizScore !== null && p.quizScore >= 80,
        quizScore: p.quizScore,
      });
    } else if (p.quizScore !== null && p.quizScore >= 80) {
      existing.completed = true;
      existing.quizScore = p.quizScore;
    }
  }

  for (const [moduleOrder, data] of progressByModule) {
    moduleProgress.push({ moduleOrder, ...data });
  }

  if (!isModuleUnlocked(moduleData.order, moduleProgress)) {
    redirect("/dashboard");
  }

  // Get lessons and content
  const lessons = getLessonsForModule(moduleSlug);
  const lessonData = getLessonContent(moduleSlug, lessonSlug);
  if (!lessonData) notFound();

  // Serialize MDX
  const mdxSource = await serialize(lessonData.content);

  // Get completed lessons for this module
  const moduleProgressRecords = allProgress.filter(
    (p) => p.moduleId === moduleSlug && p.completed
  );
  const completedLessons = new Set(moduleProgressRecords.map((p) => p.lessonId));

  const isCurrentCompleted = completedLessons.has(lessonSlug);

  return (
    <div className="min-h-screen bg-bg-primary flex">
      <LessonSidebar
        moduleSlug={moduleSlug}
        lessons={lessons}
        currentLessonSlug={lessonSlug}
        completedLessons={completedLessons}
      />

      <main className="flex-1 max-w-[680px] mx-auto px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
            <a href="/dashboard" className="hover:text-accent-blue">
              ← Dashboard
            </a>
            <span className="text-text-muted">|</span>
            <span>Module {moduleData.order}: {moduleData.title}</span>
          </div>
          <div className="text-xs text-text-muted">
            Lesson {lessonData.meta.order} of {lessons.length}
          </div>
        </div>

        <LessonContent source={mdxSource} />

        {lessonData.meta.type !== "quiz" && (
          <MarkCompleteButton
            moduleId={moduleSlug}
            lessonId={lessonSlug}
            moduleOrder={moduleData.order}
            lessonOrder={lessonData.meta.order}
            isCompleted={isCurrentCompleted}
          />
        )}

        <LessonNav
          moduleSlug={moduleSlug}
          lessons={lessons}
          currentLessonSlug={lessonSlug}
          isCompleted={isCurrentCompleted}
        />
      </main>
    </div>
  );
}
```

IMPORTANT: Check the actual `next-mdx-remote` API for App Router compatibility. The `serialize` function may need to be imported differently, or you may need to use `compileMDX` from `next-mdx-remote/rsc` instead. Read the installed package to confirm.

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: Build succeeds with the new dynamic route.

- [ ] **Step 3: Commit**

```bash
git add app/learn/
git commit -m "feat: add lesson page with MDX rendering, sidebar, and progress tracking"
```

---

### Task 8: Module Index Page (Redirect to First Lesson)

**Files:**
- Create: `app/learn/[module]/page.tsx`

- [ ] **Step 1: Create module index page**

Create `app/learn/[module]/page.tsx`:

```tsx
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getModuleBySlug, isModuleUnlocked, type ModuleProgress } from "@/lib/modules";
import { getLessonsForModule } from "@/lib/content";

interface ModulePageProps {
  params: Promise<{ module: string }>;
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { module: moduleSlug } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const moduleData = getModuleBySlug(moduleSlug);
  if (!moduleData) notFound();

  // Check module is unlocked
  const allProgress = await prisma.progress.findMany({
    where: { userId: session.user.id },
  });

  const progressByModule = new Map<number, { completed: boolean; quizScore: number | null }>();
  for (const p of allProgress) {
    const existing = progressByModule.get(p.moduleOrder);
    if (!existing) {
      progressByModule.set(p.moduleOrder, {
        completed: p.completed && p.quizScore !== null && p.quizScore >= 80,
        quizScore: p.quizScore,
      });
    } else if (p.quizScore !== null && p.quizScore >= 80) {
      existing.completed = true;
      existing.quizScore = p.quizScore;
    }
  }

  const moduleProgress: ModuleProgress[] = Array.from(
    progressByModule.entries()
  ).map(([moduleOrder, data]) => ({ moduleOrder, ...data }));

  if (!isModuleUnlocked(moduleData.order, moduleProgress)) {
    redirect("/dashboard");
  }

  // Find first uncompleted lesson, or first lesson
  const lessons = getLessonsForModule(moduleSlug);
  if (lessons.length === 0) notFound();

  const completedSlugs = new Set(
    allProgress
      .filter((p) => p.moduleId === moduleSlug && p.completed)
      .map((p) => p.lessonId)
  );

  const firstUncompleted = lessons.find((l) => !completedSlugs.has(l.slug));
  const targetLesson = firstUncompleted || lessons[0];

  redirect(`/learn/${moduleSlug}/${targetLesson.slug}`);
}
```

- [ ] **Step 2: Commit**

```bash
git add app/learn/[module]/page.tsx
git commit -m "feat: add module index page that redirects to first uncompleted lesson"
```

---

### Task 9: Placeholder Content for Modules 3-9

**Files:**
- Create: placeholder MDX files for modules 03 through 09

- [ ] **Step 1: Create placeholder content**

For each module 03-09, create a single placeholder lesson file. Each file follows this pattern:

Create `content/03-prompting/01-intro.mdx`:
```mdx
---
title: "Introduction to AI Prompting"
description: "Learn the art of talking to AI"
order: 1
type: lesson
---

# Talking to AI — The Art of Prompting

This module is coming soon! Check back later for full content.
```

Create `content/03-prompting/02-quiz.mdx`:
```mdx
---
title: "Module 3 Quiz"
description: "Test your prompting knowledge"
order: 2
type: quiz
---

# Module 3 Quiz

Quiz coming soon!
```

Repeat this pattern for modules 04 through 09:
- `content/04-claude-code/01-intro.mdx` + `02-quiz.mdx`
- `content/05-web-basics/01-intro.mdx` + `02-quiz.mdx`
- `content/06-wordpress/01-intro.mdx` + `02-quiz.mdx`
- `content/07-apis/01-intro.mdx` + `02-quiz.mdx`
- `content/08-automation/01-intro.mdx` + `02-quiz.mdx`
- `content/09-capstone/01-intro.mdx` + `02-quiz.mdx`

Each intro file should have a relevant title matching the module name from the spec. Each quiz file has `type: quiz`.

- [ ] **Step 2: Update MODULES lessonCount to match actual content**

Update `lib/modules.ts` — change `lessonCount` for each module to match the actual number of MDX files:
- Module 1: 5 lessons
- Module 2: 5 lessons
- Modules 3-9: 2 lessons each (placeholder)

- [ ] **Step 3: Run tests to ensure nothing broke**

```bash
npm test
```

- [ ] **Step 4: Commit**

```bash
git add content/ lib/modules.ts
git commit -m "feat: add placeholder content for modules 3-9, update lesson counts"
```

---

### Task 10: Smoke Test & Build Verification

- [ ] **Step 1: Run all tests**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 2: Run build**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Manual testing**

```bash
npm run dev -- --port 3333
```

1. Log in at http://localhost:3333
2. Dashboard shows 9 modules, Module 1 is "START"
3. Click Module 1 → redirected to first lesson
4. See lesson content with sidebar
5. Click "Mark as Complete" → lesson shows ✓
6. Next lesson unlocks in sidebar
7. Navigate between lessons with Previous/Next
8. Click "← Dashboard" to go back

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "chore: Phase 2 smoke test fixes"
```

---

## Phase 2 Complete Checklist

- [x] MDX dependencies installed
- [x] Content loading utilities with tests
- [x] Lesson content for modules 1-2 (full) and 3-9 (placeholder)
- [x] LessonSidebar component
- [x] LessonNav component (previous/next)
- [x] LessonContent MDX renderer
- [x] MarkCompleteButton with progress API integration
- [x] Lesson page dynamic route
- [x] Module index page (redirect to first uncompleted lesson)
- [x] All tests passing, build succeeds

**Next:** Phase 3 (Interactive Components — Terminal, PromptSandbox, CodePlayground, ApiExplorer, WorkflowBuilder, Quiz)
