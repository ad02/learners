# Changelog

## 2026-04-10 — Platform Complete

### Full Content Expansion
- All 36 lessons expanded to 90-175 lines each (was 20-85)
- Added real-world examples, "Try It Yourself" exercises, tips, practice scenarios
- Added Markdown, JSON, YAML file type deep-dive in Module 1
- Every lesson now has enough depth for learners to work independently

### Gamification System
- XP points: +50 per lesson, +100 per quiz pass, +50 bonus for perfect score
- 6 levels: Beginner (0 XP) → Specialist (3500 XP)
- Daily streaks with fire emoji counter
- 9 achievements: First Steps, Quiz Whiz, Perfect Score, Module Master, etc.
- Leaderboard page at `/leaderboard`
- Achievements page at `/achievements`
- Confetti animation, toast notifications, XP bar in navbar

### Admin Panel
- Admin role on User model (`role` field)
- Admin dashboard at `/admin` — user table with progress stats
- Admin bypass — all modules unlocked for admin users
- Admin link in navbar (only visible to admins)
- `node scripts/make-admin.mjs your@email.com` to promote users
- Role promotion API at `/api/admin/promote`

### Interactive Components (Phase 3)
- Quiz: multiple choice with scoring, 80% pass threshold, retry
- Terminal: simulated command-line with validation, hints, step tracking
- PromptSandbox: prompt scoring on Role/Context/Task/Format/Specificity
- CodePlayground: split-pane HTML editor with sandboxed live preview
- ApiExplorer: mock API client with endpoint discovery
- WorkflowBuilder: React Flow drag-and-drop automation canvas
- All components registered in MDX via server-side rendering (lib/exercises.ts)
- Split layout: lesson content left, exercise panel right

### Theme Switch
- Switched from dark Catppuccin theme to light colorful Duolingo-style
- White/cream backgrounds, bold colorful accents, gradient buttons
- Clean list-based module layout (removed boxy cards)
- Terminal and CodePlayground kept dark for code readability

### Bug Fixes
- Fixed Quiz crash: next-mdx-remote/rsc doesn't serialize complex JSX props — moved to server-side
- Fixed admin role not in JWT: NextAuth v5 strips non-standard fields — fetch role from DB
- Fixed make-admin script for Prisma v7 (uses prisma db execute)
- Fixed exercise panel width (was too narrow, now 50/50 split)

---

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
