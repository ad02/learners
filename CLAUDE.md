# Learners Academy

Internal training platform teaching AI automation to complete beginners.

## Quick Start

```bash
npm run dev        # starts on port 3333
npm test           # 29 tests (Jest)
npm run lint       # ESLint
npm run build      # production build
```

## Tech Stack (all latest versions — NOT what tutorials assume)

- **Next.js 16** — `params` is `Promise<{}>`, use `await params`
- **Tailwind v4** — CSS config in `globals.css` (no `tailwind.config.ts`), plugins via `@plugin`
- **Prisma v7** — import from `../generated/prisma/client`, config in `prisma.config.ts`
- **NextAuth v5 beta** — `auth()` for server sessions, Edge-safe config split in `lib/auth.config.ts`
- **SQLite** (local dev), **Turso** (production planned)

## Project Structure

```
app/                    Next.js pages and API routes
  auth/                 Login, register pages
  dashboard/            Progress dashboard
  learn/[module]/[lesson]/ Lesson pages (dynamic)
  api/                  Auth + progress endpoints
components/layout/      UI components (Navbar, ModuleCard, ProgressBar, LessonSidebar, etc.)
components/interactive/ Interactive exercise widgets (Phase 3 — not yet built)
content/               MDX lesson files (01-vs-code through 09-capstone)
lib/                   Auth, DB, modules, content utilities
prisma/                Database schema
```

## Key Patterns

- Lessons are MDX files with frontmatter (`title`, `description`, `order`, `type`)
- Module locking: Module N requires Module N-1 quiz score >= 80%
- Lesson locking: sequential within modules
- Progress saved via POST `/api/progress/complete`
- Dark theme with Catppuccin-inspired colors (CSS variables in globals.css)

## Build Status

- **Phase 1** ✅ Foundation (scaffold, auth, DB, dashboard, middleware, progress API)
- **Phase 2** ✅ Content Engine (MDX pipeline, lesson pages, nav, M1-M2 content, M3-M9 placeholders)
- **Phase 3** ⬜ Interactive Components (Terminal, PromptSandbox, CodePlayground, ApiExplorer, WorkflowBuilder, Quiz)
- **Phase 4** ⬜ Full Content (lesson content for modules 3-9)

## Rules

- Dev server port: **3333** (not 3000)
- Content must use simple language, layman analogies, short paragraphs
- All interactive exercises are simulated (no real API calls)
- Design spec: `docs/superpowers/specs/2026-04-09-learners-academy-design.md`
