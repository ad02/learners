# Changelog

## 2026-04-09 — Phase 1 & 2 Complete

### Phase 2: Content Engine
- MDX content pipeline with frontmatter parsing (`gray-matter` + `next-mdx-remote`)
- Lesson pages at `/learn/[module]/[lesson]` with sidebar navigation
- Module index pages redirect to first uncompleted lesson
- "Mark as Complete" button with progress API integration
- LessonSidebar: shows completed/current/locked lessons within a module
- LessonNav: previous/next navigation at bottom of each lesson
- Tailwind Typography plugin for clean MDX prose rendering
- Full lesson content for Module 1 (VS Code) and Module 2 (Git)
- Placeholder content for Modules 3-9

### Phase 1: Foundation
- Next.js 16 scaffold with Tailwind v4 dark theme (Catppuccin-inspired)
- Prisma v7 with SQLite — User, Progress, Exercise models
- NextAuth v5 email/password authentication (login + register pages)
- Auth middleware protecting `/dashboard` and `/learn` routes
- Module metadata: 9 modules, 5 phases, locking logic (80% quiz threshold)
- Dashboard with overall progress bar and module card grid
- Progress API: GET all progress, POST complete lesson
- 29 tests passing, 0 lint errors

### Insights & Lessons Learned

**Version surprises:**
- `create-next-app@latest` installs Next.js 16 (not 14) — `params` is now a Promise
- Tailwind v4 dropped `tailwind.config.ts` entirely — uses CSS-based `@theme` blocks
- Prisma v7 moved datasource URL out of `schema.prisma` into `prisma.config.ts`
- Prisma v7 imports from `../generated/prisma/client` not `@prisma/client`
- NextAuth v5 middleware can't import Prisma (Edge Runtime) — needs config split

**Architecture decisions:**
- Used `next-mdx-remote/rsc` (server components) not `serialize` (old Pages Router approach)
- SQLite for local dev, Turso planned for production (free tier, SQLite-compatible)
- Content as MDX files with frontmatter — easy to write lessons without touching code
- Components drop into MDX: `<Terminal />`, `<Quiz />`, etc. (Phase 3)

**What went well:**
- Subagent-driven development worked smoothly — fresh context per task, no pollution
- TDD for module locking logic caught edge cases early
- Dark theme using CSS variables + Tailwind v4 `@theme` is cleaner than v3 config

**What to watch:**
- Next.js 16 deprecation warning on `middleware.ts` → `proxy` (cosmetic for now)
- Monaco Editor may be overkill for CodePlayground — CodeMirror 6 is lighter
- WorkflowBuilder (Phase 3) is the highest-risk component — use React Flow, don't build from scratch
