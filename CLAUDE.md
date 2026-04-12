# Learners Academy

Internal training platform teaching AI automation to complete beginners. Gamified, interactive, Duolingo-style.

## Quick Start

```bash
npm run dev                                    # starts on port 3333
npm test                                       # 42 tests (Jest)
npm run lint                                   # ESLint
npm run build                                  # production build
node scripts/make-admin.mjs your@email.com     # promote user to admin
```

## Tech Stack (all latest versions — NOT what tutorials assume)

- **Next.js 16** — `params` is `Promise<{}>`, use `await params`
- **Tailwind v4** — CSS config in `globals.css` (no `tailwind.config.ts`), plugins via `@plugin`
- **Prisma v7** — import from `../generated/prisma/client`, config in `prisma.config.ts`
- **NextAuth v5 beta** — `auth()` for server sessions, Edge-safe config split in `lib/auth.config.ts`
- **SQLite** (local dev), **Turso** (production planned)

## Project Structure

```
app/                        Next.js pages and API routes
  admin/                    Admin dashboard (role-protected)
  auth/                     Login, register pages
  dashboard/                Progress dashboard with gamification stats
  leaderboard/              XP leaderboard
  achievements/             Achievement badges
  learn/[module]/[lesson]/  Lesson pages (split layout: content left, exercise right)
  api/                      Auth, progress, XP, leaderboard, admin endpoints
components/layout/          UI components (Navbar, ModuleCard, ProgressBar, LessonSidebar, XpBar, etc.)
components/interactive/     6 exercise widgets (Quiz, Terminal, PromptSandbox, CodePlayground, ApiExplorer, WorkflowBuilder)
content/                    MDX lesson files (01-vs-code through 09-capstone, 5 lessons each)
lib/                        Auth, DB, modules, content, gamification, quizzes, exercises
prisma/                     Database schema (User, Progress, Exercise, Achievement)
scripts/                    make-admin.mjs
```

## Key Patterns

- Lessons are MDX files with frontmatter (`title`, `description`, `order`, `type`)
- Module locking: Module N requires Module N-1 quiz score >= 80%
- Admin users bypass all module locks
- Interactive exercises rendered server-side via `lib/exercises.ts` (not inline MDX — next-mdx-remote/rsc limitation)
- Quiz data in `lib/quizzes.ts`, exercise data in `lib/exercises.ts`
- Progress + XP saved via POST `/api/progress/complete`
- Light colorful theme (Duolingo-style) — CSS variables in globals.css
- Split layout for lessons with exercises (content left, exercise right)

## Gamification

- XP: +50 lesson, +100 quiz pass, +50 bonus for perfect score
- 6 levels: Beginner → Explorer → Learner → Builder → Automator → Specialist
- Daily streaks with fire emoji
- 9 achievements (First Steps, Quiz Whiz, Perfect Score, Module Master, etc.)
- Leaderboard at `/leaderboard`

## Build Status — ALL COMPLETE

- **Phase 1** ✅ Foundation (scaffold, auth, DB, dashboard, middleware, progress API)
- **Phase 2** ✅ Content Engine (MDX pipeline, lesson pages, nav, sidebar)
- **Phase 3** ✅ Interactive Components (Terminal, PromptSandbox, CodePlayground, ApiExplorer, WorkflowBuilder, Quiz)
- **Phase 4** ✅ Full Content (all 9 modules, 45 lessons, 90-175 lines each)
- **Gamification** ✅ XP, levels, streaks, achievements, leaderboard
- **Admin Panel** ✅ User management, progress stats, module lock bypass
- **Theme** ✅ Light colorful Duolingo-style (switched from dark)

## Rules

- Dev server port: **3333** (not 3000)
- Content must use simple language, layman analogies, short paragraphs
- All interactive exercises are simulated (no real API calls)
- Always run `npm test && npm run lint && npm run build` after every code change
- Light theme preferred — dark looked "boring" and "too AI built"
- Design spec: `docs/superpowers/specs/2026-04-09-learners-academy-design.md`
