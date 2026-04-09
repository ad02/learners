# Phase 1: Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the Next.js app with authentication, database, layout shell, and dashboard — producing a working app where users can log in and see their (empty) module progress grid.

**Architecture:** Next.js 14 App Router with Tailwind dark theme. NextAuth credentials provider for email/password auth. Turso (libSQL) via Prisma for user and progress data. Server components by default, client components only where interactivity is needed.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, NextAuth.js v5, Prisma, Turso (libSQL), bcryptjs

**Spec:** `docs/superpowers/specs/2026-04-09-learners-academy-design.md`

---

## File Structure

```
learners/
├── app/
│   ├── layout.tsx                    # Root layout: dark theme, fonts, session provider
│   ├── page.tsx                      # Redirect to /dashboard or /auth/login
│   ├── globals.css                   # Tailwind imports + dark theme base styles
│   ├── auth/
│   │   ├── login/page.tsx            # Login page
│   │   └── register/page.tsx         # Register page
│   ├── dashboard/
│   │   └── page.tsx                  # Progress dashboard (protected)
│   └── api/
│       └── auth/[...nextauth]/route.ts  # NextAuth API route
├── components/
│   └── layout/
│       ├── Navbar.tsx                # Top navigation bar
│       ├── ModuleCard.tsx            # Module progress card (completed/in-progress/locked)
│       └── ProgressBar.tsx           # Reusable progress bar component
├── lib/
│   ├── auth.ts                       # NextAuth configuration
│   ├── db.ts                         # Prisma client singleton
│   └── modules.ts                    # Module metadata (titles, order, lesson counts)
├── prisma/
│   └── schema.prisma                 # Database schema
├── __tests__/
│   ├── lib/
│   │   └── modules.test.ts           # Module metadata + locking logic tests
│   ├── components/
│   │   ├── ModuleCard.test.tsx        # ModuleCard rendering tests
│   │   └── ProgressBar.test.tsx       # ProgressBar rendering tests
│   └── app/
│       └── dashboard.test.tsx         # Dashboard integration test
├── tailwind.config.ts
├── next.config.mjs
├── tsconfig.json
├── package.json
├── .env.local.example
└── .gitignore
```

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `.gitignore`, `.env.local.example`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd d:/learners
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm
```

Select defaults when prompted. This creates the Next.js 14 scaffold with App Router, TypeScript, Tailwind, and ESLint.

- [ ] **Step 2: Clean up generated files**

Remove the default page content. Replace `app/page.tsx` with:

```tsx
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard");
}
```

Replace `app/globals.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --bg-primary: #1e1e2e;
    --bg-secondary: #181825;
    --bg-surface: #313244;
    --text-primary: #cdd6f4;
    --text-secondary: #a6adc8;
    --text-muted: #6c7086;
    --accent-blue: #89b4fa;
    --accent-green: #a6e3a1;
    --accent-yellow: #f9e2af;
    --accent-red: #f38ba8;
    --accent-purple: #cba6f7;
    --border: #313244;
  }

  body {
    @apply bg-[var(--bg-primary)] text-[var(--text-primary)];
  }
}
```

- [ ] **Step 3: Update tailwind.config.ts for dark theme**

Replace `tailwind.config.ts` with:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          surface: "var(--bg-surface)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        accent: {
          blue: "var(--accent-blue)",
          green: "var(--accent-green)",
          yellow: "var(--accent-yellow)",
          red: "var(--accent-red)",
          purple: "var(--accent-purple)",
        },
        border: "var(--border)",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 4: Update root layout**

Replace `app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Learners Academy",
  description: "Your path to AI automation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

- [ ] **Step 5: Create .env.local.example**

```
# Auth
NEXTAUTH_SECRET=your-secret-here-generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# Database (Turso)
TURSO_DATABASE_URL=libsql://your-db-name.turso.io
TURSO_AUTH_TOKEN=your-auth-token
```

- [ ] **Step 6: Update .gitignore**

Append to the generated `.gitignore`:

```
# Environment
.env.local
.env

# Superpowers
.superpowers/

# Prisma
prisma/*.db
prisma/*.db-journal
```

- [ ] **Step 7: Verify dev server starts**

```bash
npm run dev
```

Expected: Dev server starts at http://localhost:3000, redirects to /dashboard (which will 404 — that's fine for now).

- [ ] **Step 8: Commit**

```bash
git init
git add -A
git commit -m "feat: scaffold Next.js 14 project with Tailwind dark theme"
```

---

### Task 2: Database Setup (Prisma + Turso)

**Files:**
- Create: `prisma/schema.prisma`, `lib/db.ts`

- [ ] **Step 1: Install dependencies**

```bash
npm install prisma @prisma/client @prisma/adapter-libsql @libsql/client bcryptjs
npm install -D @types/bcryptjs
```

- [ ] **Step 2: Create Prisma schema**

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model User {
  id        String     @id @default(cuid())
  email     String     @unique
  name      String
  password  String
  createdAt DateTime   @default(now())
  progress  Progress[]
  exercises Exercise[]
}

model Progress {
  id          String    @id @default(cuid())
  userId      String
  moduleId    String
  lessonId    String
  moduleOrder Int
  lessonOrder Int
  completed   Boolean   @default(false)
  quizScore   Int?
  completedAt DateTime?
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, moduleId, lessonId])
  @@index([userId])
}

model Exercise {
  id           String    @id @default(cuid())
  userId       String
  lessonId     String
  exerciseType String
  userInput    String
  score        Int       @default(0)
  attempts     Int       @default(1)
  completedAt  DateTime?
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, lessonId])
}
```

- [ ] **Step 3: Create Prisma client singleton**

Create `lib/db.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

Note: For local development, this uses SQLite directly via `file:./dev.db`. For production (Turso), the Prisma client will be configured with the libSQL adapter. We'll add the production adapter setup in a later deployment task. This keeps local dev simple — no Turso account needed to develop.

- [ ] **Step 4: Generate Prisma client and push schema**

```bash
npx prisma generate
npx prisma db push
```

Expected: `prisma/dev.db` created, Prisma client generated without errors.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma lib/db.ts package.json package-lock.json
git commit -m "feat: add Prisma schema with User, Progress, Exercise models"
```

---

### Task 3: Authentication (NextAuth)

**Files:**
- Create: `lib/auth.ts`, `app/api/auth/[...nextauth]/route.ts`, `app/auth/login/page.tsx`, `app/auth/register/page.tsx`, `app/api/auth/register/route.ts`

- [ ] **Step 1: Install NextAuth**

```bash
npm install next-auth@beta
```

Note: Using NextAuth v5 (beta) which has native App Router support.

- [ ] **Step 2: Create NextAuth configuration**

Create `lib/auth.ts`:

```ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!passwordMatch) {
          return null;
        }

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
```

- [ ] **Step 3: Create NextAuth API route**

Create `app/api/auth/[...nextauth]/route.ts`:

```ts
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
```

- [ ] **Step 4: Create registration API route**

Create `app/api/auth/register/route.ts`:

```ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email, name, password } = await request.json();

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: { email, name, password: hashedPassword },
    });

    return NextResponse.json({ message: "User created" }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 5: Create login page**

Create `app/auth/login/page.tsx`:

```tsx
"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="bg-bg-secondary rounded-xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🚀</div>
          <h1 className="text-xl font-bold text-text-primary">
            Learners Academy
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Your path to AI automation
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              className="w-full px-4 py-3 rounded-lg bg-bg-surface border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue"
            />
          </div>
          <div>
            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              className="w-full px-4 py-3 rounded-lg bg-bg-surface border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue"
            />
          </div>

          {error && (
            <p className="text-accent-red text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-accent-blue text-bg-primary font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-4">
          No account?{" "}
          <Link href="/auth/register" className="text-accent-blue hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create register page**

Create `app/auth/register/page.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        name: formData.get("name"),
        password: formData.get("password"),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Registration failed");
    } else {
      router.push("/auth/login");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="bg-bg-secondary rounded-xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🚀</div>
          <h1 className="text-xl font-bold text-text-primary">
            Create Account
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Join Learners Academy
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              name="name"
              type="text"
              placeholder="Your name"
              required
              className="w-full px-4 py-3 rounded-lg bg-bg-surface border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue"
            />
          </div>
          <div>
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              className="w-full px-4 py-3 rounded-lg bg-bg-surface border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue"
            />
          </div>
          <div>
            <input
              name="password"
              type="password"
              placeholder="Password (8+ characters)"
              required
              minLength={8}
              className="w-full px-4 py-3 rounded-lg bg-bg-surface border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue"
            />
          </div>

          {error && (
            <p className="text-accent-red text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-accent-blue text-bg-primary font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-4">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-accent-blue hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Add SessionProvider to root layout**

Update `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Learners Academy",
  description: "Your path to AI automation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 8: Set up .env.local for local development**

Create `.env.local` (not committed):

```
NEXTAUTH_SECRET=dev-secret-change-in-production-1234567890abcdef
NEXTAUTH_URL=http://localhost:3000
```

- [ ] **Step 9: Test auth flow manually**

```bash
npm run dev
```

1. Go to http://localhost:3000/auth/register — create an account
2. Go to http://localhost:3000/auth/login — log in with those credentials
3. Should redirect to /dashboard (will 404 — that's expected, dashboard is next task)

- [ ] **Step 10: Commit**

```bash
git add lib/auth.ts app/api/auth/ app/auth/ app/layout.tsx .env.local.example package.json package-lock.json
git commit -m "feat: add NextAuth email/password authentication with login and register pages"
```

---

### Task 4: Module Metadata & Locking Logic

**Files:**
- Create: `lib/modules.ts`, `__tests__/lib/modules.test.ts`

- [ ] **Step 1: Install testing dependencies**

```bash
npm install -D jest @jest/globals ts-jest @types/jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

- [ ] **Step 2: Create Jest config**

Create `jest.config.ts`:

```ts
import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterSetup: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};

export default createJestConfig(config);
```

Create `jest.setup.ts`:

```ts
import "@testing-library/jest-dom";
```

Add to `package.json` scripts:

```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 3: Write failing tests for module metadata**

Create `__tests__/lib/modules.test.ts`:

```ts
import {
  MODULES,
  getModuleBySlug,
  isModuleUnlocked,
  getModuleStatus,
  type ModuleProgress,
} from "@/lib/modules";

describe("MODULES", () => {
  test("has 9 modules", () => {
    expect(MODULES).toHaveLength(9);
  });

  test("modules are ordered 1-9", () => {
    MODULES.forEach((mod, i) => {
      expect(mod.order).toBe(i + 1);
    });
  });

  test("each module has required fields", () => {
    MODULES.forEach((mod) => {
      expect(mod.id).toBeTruthy();
      expect(mod.title).toBeTruthy();
      expect(mod.description).toBeTruthy();
      expect(mod.lessonCount).toBeGreaterThan(0);
      expect(mod.order).toBeGreaterThan(0);
    });
  });
});

describe("getModuleBySlug", () => {
  test("returns module for valid slug", () => {
    const mod = getModuleBySlug("01-vs-code");
    expect(mod).toBeDefined();
    expect(mod!.title).toBe("Your Computer is Your Workshop");
  });

  test("returns undefined for invalid slug", () => {
    expect(getModuleBySlug("nonexistent")).toBeUndefined();
  });
});

describe("isModuleUnlocked", () => {
  test("module 1 is always unlocked", () => {
    expect(isModuleUnlocked(1, [])).toBe(true);
  });

  test("module 2 is locked when module 1 is not completed", () => {
    expect(isModuleUnlocked(2, [])).toBe(false);
  });

  test("module 2 is locked when module 1 quiz score is below 80", () => {
    const progress: ModuleProgress[] = [
      { moduleOrder: 1, completed: true, quizScore: 60 },
    ];
    expect(isModuleUnlocked(2, progress)).toBe(false);
  });

  test("module 2 is unlocked when module 1 is completed with 80+ quiz", () => {
    const progress: ModuleProgress[] = [
      { moduleOrder: 1, completed: true, quizScore: 80 },
    ];
    expect(isModuleUnlocked(2, progress)).toBe(true);
  });

  test("module 5 requires module 4 completion", () => {
    const progress: ModuleProgress[] = [
      { moduleOrder: 1, completed: true, quizScore: 100 },
      { moduleOrder: 2, completed: true, quizScore: 90 },
      { moduleOrder: 3, completed: true, quizScore: 85 },
      { moduleOrder: 4, completed: false, quizScore: null },
    ];
    expect(isModuleUnlocked(5, progress)).toBe(false);
  });
});

describe("getModuleStatus", () => {
  test("returns 'locked' for locked module", () => {
    expect(getModuleStatus(2, [], 0)).toBe("locked");
  });

  test("returns 'available' for unlocked module with no progress", () => {
    expect(getModuleStatus(1, [], 0)).toBe("available");
  });

  test("returns 'in-progress' for module with some lessons done", () => {
    const progress: ModuleProgress[] = [
      { moduleOrder: 1, completed: false, quizScore: null },
    ];
    expect(getModuleStatus(1, progress, 2)).toBe("in-progress");
  });

  test("returns 'completed' for module with quiz passed", () => {
    const progress: ModuleProgress[] = [
      { moduleOrder: 1, completed: true, quizScore: 90 },
    ];
    expect(getModuleStatus(1, progress, 5)).toBe("completed");
  });
});
```

- [ ] **Step 4: Run tests to verify they fail**

```bash
npm test -- __tests__/lib/modules.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/modules'`

- [ ] **Step 5: Implement module metadata and locking logic**

Create `lib/modules.ts`:

```ts
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
    lessonCount: 5,
  },
  {
    id: "04-claude-code",
    slug: "04-claude-code",
    title: "Claude Code — AI in Your Terminal",
    description: "Using Claude Code to build, fix, and explain",
    phase: "AI & Prompting",
    order: 4,
    lessonCount: 5,
  },
  {
    id: "05-web-basics",
    slug: "05-web-basics",
    title: "How the Web Works",
    description: "HTML, CSS, JS, domains, hosting, DNS",
    phase: "Web & WordPress",
    order: 5,
    lessonCount: 5,
  },
  {
    id: "06-wordpress",
    slug: "06-wordpress",
    title: "WordPress — Building Without Code",
    description: "Dashboard, pages, posts, themes, plugins",
    phase: "Web & WordPress",
    order: 6,
    lessonCount: 5,
  },
  {
    id: "07-apis",
    slug: "07-apis",
    title: "APIs & Webhooks",
    description: "API calls, webhooks, WordPress REST API",
    phase: "Connecting Things",
    order: 7,
    lessonCount: 5,
  },
  {
    id: "08-automation",
    slug: "08-automation",
    title: "Automation Workflows",
    description: "Triggers, actions, n8n, Make, Zapier",
    phase: "Connecting Things",
    order: 8,
    lessonCount: 5,
  },
  {
    id: "09-capstone",
    slug: "09-capstone",
    title: "Final Project",
    description: "Build your own automation end-to-end",
    phase: "Putting It All Together",
    order: 9,
    lessonCount: 5,
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
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
npm test -- __tests__/lib/modules.test.ts
```

Expected: All 10 tests PASS.

- [ ] **Step 7: Commit**

```bash
git add lib/modules.ts __tests__/lib/modules.test.ts jest.config.ts jest.setup.ts package.json package-lock.json
git commit -m "feat: add module metadata and locking logic with tests"
```

---

### Task 5: Layout Components (Navbar, ProgressBar, ModuleCard)

**Files:**
- Create: `components/layout/Navbar.tsx`, `components/layout/ProgressBar.tsx`, `components/layout/ModuleCard.tsx`
- Create: `__tests__/components/ProgressBar.test.tsx`, `__tests__/components/ModuleCard.test.tsx`

- [ ] **Step 1: Write failing test for ProgressBar**

Create `__tests__/components/ProgressBar.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "@/components/layout/ProgressBar";

describe("ProgressBar", () => {
  test("renders with correct percentage", () => {
    render(<ProgressBar current={3} total={9} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "33"
    );
  });

  test("shows label when provided", () => {
    render(<ProgressBar current={3} total={9} showLabel />);
    expect(screen.getByText("33%")).toBeInTheDocument();
  });

  test("handles zero total", () => {
    render(<ProgressBar current={0} total={0} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "0"
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- __tests__/components/ProgressBar.test.tsx
```

Expected: FAIL — cannot find module.

- [ ] **Step 3: Implement ProgressBar**

Create `components/layout/ProgressBar.tsx`:

```tsx
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
```

- [ ] **Step 4: Run ProgressBar test to verify it passes**

```bash
npm test -- __tests__/components/ProgressBar.test.tsx
```

Expected: All 3 tests PASS.

- [ ] **Step 5: Write failing test for ModuleCard**

Create `__tests__/components/ModuleCard.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { ModuleCard } from "@/components/layout/ModuleCard";

// Mock next/link
jest.mock("next/link", () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

describe("ModuleCard", () => {
  test("renders completed state", () => {
    render(
      <ModuleCard
        title="VS Code Basics"
        order={1}
        slug="01-vs-code"
        status="completed"
        lessonsCompleted={5}
        lessonCount={5}
      />
    );
    expect(screen.getByText("VS Code Basics")).toBeInTheDocument();
    expect(screen.getByText("COMPLETED")).toBeInTheDocument();
    expect(screen.getByText("5/5 lessons")).toBeInTheDocument();
  });

  test("renders locked state with reduced opacity", () => {
    const { container } = render(
      <ModuleCard
        title="Git & GitHub"
        order={2}
        slug="02-git"
        status="locked"
        lessonsCompleted={0}
        lessonCount={5}
      />
    );
    expect(screen.getByText("LOCKED")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("opacity-50");
  });

  test("renders in-progress state", () => {
    render(
      <ModuleCard
        title="AI Prompting"
        order={3}
        slug="03-prompting"
        status="in-progress"
        lessonsCompleted={2}
        lessonCount={5}
      />
    );
    expect(screen.getByText("IN PROGRESS")).toBeInTheDocument();
    expect(screen.getByText("2/5 lessons")).toBeInTheDocument();
  });

  test("locked card is not a link", () => {
    render(
      <ModuleCard
        title="Locked Module"
        order={4}
        slug="04-claude-code"
        status="locked"
        lessonsCompleted={0}
        lessonCount={5}
      />
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  test("available card is a link", () => {
    render(
      <ModuleCard
        title="Available Module"
        order={1}
        slug="01-vs-code"
        status="available"
        lessonsCompleted={0}
        lessonCount={5}
      />
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/learn/01-vs-code");
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

```bash
npm test -- __tests__/components/ModuleCard.test.tsx
```

Expected: FAIL — cannot find module.

- [ ] **Step 7: Implement ModuleCard**

Create `components/layout/ModuleCard.tsx`:

```tsx
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

const statusConfig: Record<
  ModuleStatus,
  { label: string; color: string; borderColor: string }
> = {
  completed: {
    label: "COMPLETED",
    color: "text-accent-green",
    borderColor: "border-l-accent-green",
  },
  "in-progress": {
    label: "IN PROGRESS",
    color: "text-accent-blue",
    borderColor: "border-l-accent-blue",
  },
  available: {
    label: "START",
    color: "text-accent-blue",
    borderColor: "border-l-accent-blue",
  },
  locked: {
    label: "LOCKED",
    color: "text-text-muted",
    borderColor: "border-l-bg-surface",
  },
};

export function ModuleCard({
  title,
  order,
  slug,
  status,
  lessonsCompleted,
  lessonCount,
}: ModuleCardProps) {
  const config = statusConfig[status];
  const statusIcon =
    status === "completed"
      ? "✓"
      : status === "in-progress"
        ? "▶"
        : status === "available"
          ? "▶"
          : "🔒";

  const card = (
    <div
      className={`bg-bg-secondary rounded-lg p-4 border-l-[3px] ${config.borderColor} ${
        status === "locked" ? "opacity-50" : "hover:bg-bg-surface transition-colors"
      }`}
    >
      <div className={`text-xs ${config.color} mb-1`}>
        {statusIcon} {config.label}
      </div>
      <div className="text-sm font-bold text-text-primary">
        {order}. {title}
      </div>
      <div className="text-xs text-text-secondary mt-1">
        {lessonsCompleted}/{lessonCount} lessons
      </div>
    </div>
  );

  if (status === "locked") {
    return card;
  }

  return <Link href={`/learn/${slug}`}>{card}</Link>;
}
```

- [ ] **Step 8: Run ModuleCard test to verify it passes**

```bash
npm test -- __tests__/components/ModuleCard.test.tsx
```

Expected: All 5 tests PASS.

- [ ] **Step 9: Implement Navbar**

Create `components/layout/Navbar.tsx`:

```tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-bg-secondary border-b border-border">
      <Link href="/dashboard" className="flex items-center gap-2">
        <span className="text-lg">🚀</span>
        <span className="font-bold text-sm text-text-primary">
          Learners Academy
        </span>
      </Link>

      {session?.user && (
        <div className="flex items-center gap-4">
          <span className="text-xs text-text-secondary">
            Hi, {session.user.name}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
}
```

- [ ] **Step 10: Run all tests**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 11: Commit**

```bash
git add components/layout/ __tests__/components/
git commit -m "feat: add Navbar, ProgressBar, and ModuleCard layout components with tests"
```

---

### Task 6: Dashboard Page

**Files:**
- Create: `app/dashboard/page.tsx`, `app/dashboard/layout.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create dashboard layout with Navbar**

Create `app/dashboard/layout.tsx`:

```tsx
import { Navbar } from "@/components/layout/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: Create dashboard page**

Create `app/dashboard/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { MODULES, getModuleStatus, type ModuleProgress } from "@/lib/modules";
import { ProgressBar } from "@/components/layout/ProgressBar";
import { ModuleCard } from "@/components/layout/ModuleCard";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Fetch all progress for this user
  const progressRecords = await prisma.progress.findMany({
    where: { userId: session.user.id },
  });

  // Aggregate progress per module
  const moduleProgressMap = new Map<
    number,
    { completed: boolean; quizScore: number | null; lessonsCompleted: number }
  >();

  for (const record of progressRecords) {
    const existing = moduleProgressMap.get(record.moduleOrder);
    if (!existing) {
      moduleProgressMap.set(record.moduleOrder, {
        completed: record.completed && record.quizScore !== null && record.quizScore >= 80,
        quizScore: record.quizScore,
        lessonsCompleted: record.completed ? 1 : 0,
      });
    } else {
      if (record.completed) {
        existing.lessonsCompleted += 1;
      }
      // Module is completed only if the quiz lesson is completed with 80+
      if (record.quizScore !== null && record.quizScore >= 80) {
        existing.completed = true;
        existing.quizScore = record.quizScore;
      }
    }
  }

  // Build module progress array for locking logic
  const moduleProgress: ModuleProgress[] = Array.from(
    moduleProgressMap.entries()
  ).map(([moduleOrder, data]) => ({
    moduleOrder,
    completed: data.completed,
    quizScore: data.quizScore,
  }));

  // Count completed modules for overall progress
  const completedModules = moduleProgress.filter((p) => p.completed).length;

  return (
    <div>
      <h1 className="text-xl font-bold text-text-primary mb-1">
        Welcome back, {session.user.name}!
      </h1>
      <p className="text-sm text-text-secondary mb-4">
        {completedModules === 0
          ? "Ready to start your learning journey?"
          : `You're ${Math.round((completedModules / MODULES.length) * 100)}% through the course — keep it up!`}
      </p>

      <ProgressBar
        current={completedModules}
        total={MODULES.length}
        showLabel
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-8">
        {MODULES.map((mod) => {
          const modData = moduleProgressMap.get(mod.order);
          const status = getModuleStatus(
            mod.order,
            moduleProgress,
            modData?.lessonsCompleted ?? 0
          );

          return (
            <ModuleCard
              key={mod.id}
              title={mod.title}
              order={mod.order}
              slug={mod.slug}
              status={status}
              lessonsCompleted={modData?.lessonsCompleted ?? 0}
              lessonCount={mod.lessonCount}
            />
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Update root page redirect**

Verify `app/page.tsx` has:

```tsx
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard");
}
```

- [ ] **Step 4: Test manually**

```bash
npm run dev
```

1. Go to http://localhost:3000 — should redirect to /auth/login (not authenticated)
2. Register a new account
3. Log in — should see dashboard with 9 module cards
4. Module 1 should show "START", modules 2-9 should show "LOCKED"
5. Progress bar should show 0%

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/ app/page.tsx
git commit -m "feat: add dashboard page with module grid and progress tracking"
```

---

### Task 7: Middleware for Route Protection

**Files:**
- Create: `middleware.ts`

- [ ] **Step 1: Create middleware**

Create `middleware.ts` at project root:

```ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage =
    req.nextUrl.pathname.startsWith("/auth/login") ||
    req.nextUrl.pathname.startsWith("/auth/register");

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL("/auth/login", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/learn/:path*", "/auth/:path*"],
};
```

- [ ] **Step 2: Test middleware manually**

```bash
npm run dev
```

1. Open incognito window, go to http://localhost:3000/dashboard — should redirect to /auth/login
2. Log in — should redirect to /dashboard
3. Go to http://localhost:3000/auth/login while logged in — should redirect to /dashboard

- [ ] **Step 3: Commit**

```bash
git add middleware.ts
git commit -m "feat: add auth middleware for route protection"
```

---

### Task 8: Progress API Routes

**Files:**
- Create: `app/api/progress/route.ts`, `app/api/progress/complete/route.ts`

- [ ] **Step 1: Create GET progress API**

Create `app/api/progress/route.ts`:

```ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const progress = await prisma.progress.findMany({
    where: { userId: session.user.id },
    orderBy: [{ moduleOrder: "asc" }, { lessonOrder: "asc" }],
  });

  return NextResponse.json(progress);
}
```

- [ ] **Step 2: Create POST complete-lesson API**

Create `app/api/progress/complete/route.ts`:

```ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { moduleId, lessonId, moduleOrder, lessonOrder, quizScore } =
      await request.json();

    if (!moduleId || !lessonId || moduleOrder === undefined || lessonOrder === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // If quiz score provided, check if it passes
    const completed = quizScore !== undefined ? quizScore >= 80 : true;

    const progress = await prisma.progress.upsert({
      where: {
        userId_moduleId_lessonId: {
          userId: session.user.id,
          moduleId,
          lessonId,
        },
      },
      update: {
        completed,
        quizScore: quizScore ?? null,
        completedAt: completed ? new Date() : null,
      },
      create: {
        userId: session.user.id,
        moduleId,
        lessonId,
        moduleOrder,
        lessonOrder,
        completed,
        quizScore: quizScore ?? null,
        completedAt: completed ? new Date() : null,
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Test API manually with curl or browser**

```bash
npm run dev
```

After logging in (to get a session cookie), the GET endpoint should return an empty array for a new user.

- [ ] **Step 4: Commit**

```bash
git add app/api/progress/
git commit -m "feat: add progress API routes for fetching and completing lessons"
```

---

### Task 9: Smoke Test & Cleanup

- [ ] **Step 1: Run all tests**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 2: Run linter**

```bash
npm run lint
```

Fix any lint errors that appear.

- [ ] **Step 3: Build check**

```bash
npm run build
```

Expected: Build succeeds without errors. If there are type errors, fix them.

- [ ] **Step 4: Manual end-to-end walkthrough**

```bash
npm run dev
```

Full flow:
1. Visit http://localhost:3000 → redirected to /auth/login
2. Click "Register" → create account (name, email, password)
3. Redirected to login → sign in
4. Dashboard loads: 9 module cards, Module 1 is "START", 2-9 are "LOCKED"
5. Progress bar shows 0%
6. Navbar shows "Hi, [name]" and "Sign out"
7. Click "Sign out" → back to login

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: lint fixes and build verification for Phase 1 foundation"
```

---

## Phase 1 Complete Checklist

After all tasks, verify:
- [x] Next.js 14 app with Tailwind dark theme
- [x] Prisma schema with User, Progress, Exercise tables
- [x] NextAuth email/password authentication
- [x] Login and register pages
- [x] Auth middleware protecting routes
- [x] Module metadata with 9 modules
- [x] Module locking logic with tests
- [x] Dashboard with progress bar and module grid
- [x] Progress API routes (GET + POST)
- [x] All tests passing, build succeeds

**Next:** Phase 2 (Content Engine — MDX pipeline, lesson rendering, lesson navigation)
