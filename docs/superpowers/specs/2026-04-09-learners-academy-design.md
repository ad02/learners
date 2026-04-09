# Learners Academy — Design Spec

**Date:** 2026-04-09
**Status:** Draft
**Purpose:** Internal training platform to take complete beginners from zero to confident AI tool users

---

## 1. Overview

Learners Academy is a web-based interactive tutorial platform for internal team training. It teaches AI automation, engineering tools, and workflows to people with zero prior technical knowledge. The goal is not to create engineers, but to build confidence — learners should be able to use AI tools effectively in their daily work after completing the course.

**Target audience:** Complete beginners (under 10 people, internal team)
**Delivery:** Public web with email/password authentication
**Budget:** $0 — all free/open-source tools
**Learning model:** Linear locked progression with interactive practice in the browser

---

## 2. Curriculum

9 modules across 5 phases. Each module unlocks only after the previous one is completed. Every module follows the pattern: simple explanation → layman analogy → interactive exercise → quiz checkpoint.

### Phase 1 — Foundations

**Module 1: Your Computer is Your Workshop (VS Code)**
- What is VS Code? (like Microsoft Word, but for code)
- Installing VS Code — step-by-step with screenshots
- The terminal — your command center (like texting your computer)
- Files and folders — how computers organize things
- Extensions — adding superpowers to VS Code
- Exercise: Open VS Code, create a folder, create a file, type in it, save it

**Module 2: Git & GitHub — Saving Your Work**
- What is version control? (like "undo" but for your whole project)
- Git basics — save, commit, push
- GitHub — your project's home on the internet
- Branches — working on something without breaking what works
- Exercise: Simulated Git terminal — make changes, commit, push, see the history

### Phase 2 — AI & Prompting

**Module 3: Talking to AI — The Art of Prompting**
- What is AI? (a very smart assistant that follows instructions)
- Good prompts vs bad prompts — side-by-side examples
- The prompt formula: Role + Context + Task + Format
- Iterating — making your prompt better step by step
- Common mistakes and how to fix them
- Exercise: Interactive prompt sandbox — write prompts, see simulated AI responses, get scored feedback

**Module 4: Claude Code — AI in Your Terminal**
- What is Claude Code? (AI that lives in your terminal and writes code for you)
- Installing and setting up Claude Code
- Your first conversation — asking Claude to create a file
- Giving context — how to help Claude help you
- Common workflows: fix a bug, add a feature, explain code
- Exercise: Simulated Claude Code terminal — practice giving instructions, see results

### Phase 3 — Web & WordPress

**Module 5: How the Web Works**
- Why learn about the web? (connecting AI tools to websites is the foundation of automation)
- What is a website, really? (a folder of files on someone else's computer)
- Websites explained — like a house (HTML = structure, CSS = paint, JS = electricity)
- What happens when you visit a website — the journey of a click
- Domains, hosting, DNS — the address system of the internet (like a phone book for websites)
- Exercise: Build a tiny webpage in the browser — see HTML change in real time

**Module 6: WordPress — Building Without Code**
- What is WordPress? (a website builder used by 40% of the internet)
- The dashboard — your control center
- Pages, posts, media — content management
- Themes and plugins — customizing your site
- Users and permissions
- Exercise: Simulated WP dashboard — create a page, install a plugin, change a setting

### Phase 4 — Connecting Things

**Module 7: APIs & Webhooks — How Apps Talk to Each Other**
- What is an API? (like a waiter — you order, the kitchen makes it, waiter brings it back)
- API keys — your ID badge to use a service
- Making your first API call (simulated)
- Reading API documentation — what to look for
- Webhooks — the reverse of APIs (like the restaurant calling you when your food is ready)
- "When THIS happens, notify THAT" — webhook use cases
- The WordPress REST API — your site has an API too!
- Exercise: Interactive API explorer — send requests, see responses, configure a webhook

**Module 8: Automation Workflows — Making Things Work Together**
- What is automation? (like building a Rube Goldberg machine — each piece triggers the next, and you just press "start")
- Triggers and actions — the building blocks of any automation
- Webhook triggers in practice — using the webhooks from M7 as automation starters
- Tools overview: n8n, Make, Zapier — visual workflow builders
- Building a workflow step by step
- Error handling — what happens when something breaks
- Exercise: Drag-and-drop workflow builder — connect blocks to create an automation with webhook triggers

### Phase 5 — Putting It All Together

**Module 9: Final Project — Build Your Own Automation**
- Choose from 3 guided project templates (not open-ended):
  - **Template A:** "Blog Auto-Publisher" — webhook receives form submission → Claude summarizes it → creates a WordPress post via REST API → sends Slack notification
  - **Template B:** "Daily Digest Bot" — scheduled trigger → fetches data from an API → Claude formats a summary → posts to WordPress → commits config to GitHub
  - **Template C:** "Support Ticket Router" — webhook receives email → Claude categorizes it → updates WordPress page via REST API → notifies the right person
- Step-by-step with checkpoints
- Uses skills from all modules: VS Code (environment), Git (version control), Claude Code (AI assistance), WordPress REST API (content management), APIs/webhooks (integration), automation workflows (orchestration)
- Present your project — explain what it does and why
- Exercise: Guided capstone in the Workflow Builder — build the full automation, run simulation, verify each step

---

## 3. Interactive Components

6 reusable React components embedded directly in lesson content via MDX.

### 3.1 Simulated Terminal
- **Used in:** Modules 1, 2, 4
- **Behavior:** Learner types commands into a fake terminal. The component validates input against expected commands and returns pre-scripted responses matching the lesson context.
- **Validation strategy:** Each exercise step defines an array of accepted command variants (e.g., `["git add .", "git add index.html", "git add -A"]`). A simple tokenizer checks the base command + required arguments while ignoring irrelevant flags. Multi-step sequences use a step index — each accepted command advances to the next step.
- **Features:** Command history, tab completion hints, error messages for wrong commands with gentle guidance ("Close! Try `git add .` instead"), "hint" button showing the expected command.

### 3.2 Prompt Sandbox
- **Used in:** Modules 3, 4
- **Behavior:** Learner writes an AI prompt in a text area. The component scores it based on criteria (has role? has context? is specific? has format?) and shows a score with feedback.
- **Features:** Real-time scoring checklist, side-by-side bad/good comparison, improvement suggestions, pre-loaded example prompts to study.

### 3.3 Code Playground
- **Used in:** Module 5
- **Behavior:** Split-pane editor — code on the left, live HTML preview on the right. Changes update instantly via sandboxed iframe.
- **Security:** The preview iframe MUST use `sandbox="allow-scripts"` WITHOUT `allow-same-origin` to prevent user-typed HTML/JS from accessing the parent page's cookies, DOM, or session. This is a hard requirement.
- **Features:** Syntax highlighting via CodeMirror 6 (or lazy-loaded Monaco), starter code per exercise, reset button, "solution" toggle.

### 3.4 API Explorer
- **Used in:** Module 7
- **Behavior:** Simulated API client. Learner selects HTTP method, enters a URL, adds headers/API key, sends the request. Returns mock JSON responses.
- **Response model:** Each exercise defines a static config map of `{ method, url, requiredHeaders? } → { status, body, explanation }`. Responses are hardcoded per exercise, not dynamically generated. For webhook exercises, a timed event queue simulates incoming payloads at scripted intervals.
- **Features:** Method selector (GET/POST), headers editor, request/response panels, status codes explained in plain English, webhook listener simulation showing incoming payloads.

### 3.5 Workflow Builder
- **Used in:** Modules 8, 9
- **Behavior:** Visual drag-and-drop canvas. Learner drags trigger/action blocks onto a canvas and connects them in sequence. A "Run" button simulates the workflow with animated data flowing between blocks.
- **Implementation:** Built on **React Flow** (MIT license) for the canvas, node rendering, edge connections, and layout. React Flow handles all drag-and-drop, zoom/pan, and edge routing. Custom node components render the block UI (trigger, action, etc.). Framer Motion animates data flow along edges during "Run" simulation.
- **Features:** Block library (trigger types, AI steps, API calls, notifications), connection lines, step-by-step execution animation, error simulation, webhook trigger blocks.

### 3.6 Quiz Checkpoint
- **Used in:** End of every module
- **Behavior:** Multiple choice questions with instant feedback. Must pass (80%+) to unlock the next module.
- **Features:** Question text, 4 answer options, correct/incorrect feedback with layman explanation, retry on failure, score saved to database.

---

## 4. Tech Stack

All free, open-source tools. No paid services required.

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 14 (App Router) | React-based, supports MDX, free hosting on Vercel |
| Content | MDX (Markdown + React components) | Write lessons in Markdown, embed interactive widgets inline |
| Styling | Tailwind CSS | Fast, consistent, utility-first |
| Code Editor | CodeMirror 6 (~400KB) or Monaco (lazy-loaded) | CodeMirror preferred for lighter bundle; Monaco only if VS Code familiarity is critical — must be dynamically imported with `ssr: false` |
| Animations | CSS transitions (default) + Framer Motion (WorkflowBuilder only) | CSS handles all standard UI animations; Framer Motion scoped to animated data flow in WorkflowBuilder to avoid 40KB bundle overhead everywhere |
| Auth | NextAuth.js (credentials provider) | Email/password login, simple setup |
| Database | Turso (libSQL — SQLite-compatible) via Prisma | Free tier, works with serverless (unlike file-based SQLite which doesn't persist on Vercel/CF) |
| Drag-and-drop | React Flow (MIT license) | Node/edge graph canvas for Workflow Builder — building from scratch would take weeks |
| Hosting | Vercel or Cloudflare Pages (free tier) | Zero cost, automatic deployments from Git |

---

## 5. Architecture

### 5.1 Project Structure

```
learners/
├── app/                          # Next.js pages & API routes
│   ├── auth/                     # Login, register pages
│   ├── dashboard/                # Progress overview
│   ├── learn/[module]/[lesson]/  # Dynamic lesson pages
│   └── api/                      # Auth & progress API endpoints
├── content/                      # All lesson content (MDX files)
│   ├── 01-vs-code/               # Module 1 lessons
│   ├── 02-git/                   # Module 2 lessons
│   ├── 03-prompting/             # Module 3 lessons
│   ├── 04-claude-code/           # Module 4 lessons
│   ├── 05-web-basics/            # Module 5 lessons
│   ├── 06-wordpress/             # Module 6 lessons
│   ├── 07-apis/                  # Module 7 lessons (includes webhooks)
│   ├── 08-automation/            # Module 8 lessons
│   └── 09-capstone/              # Module 9 lessons
├── components/                   # Reusable UI components
│   ├── interactive/              # The 6 exercise widgets
│   │   ├── Terminal.tsx
│   │   ├── PromptSandbox.tsx
│   │   ├── CodePlayground.tsx
│   │   ├── ApiExplorer.tsx
│   │   ├── WorkflowBuilder.tsx
│   │   └── Quiz.tsx
│   └── layout/                   # Nav, sidebar, progress bar
├── lib/                          # Auth config, DB helpers, utilities
└── prisma/                       # Database schema
```

### 5.2 Database Schema

3 tables only.

**User**
- id, email, name, password (hashed), createdAt

**Progress**
- id, userId, moduleId, lessonId, moduleOrder (int), lessonOrder (int), completed (boolean), quizScore (int, nullable — only set for module-end quiz lessons), completedAt

**Exercise**
- id, userId, lessonId, exerciseType, userInput, score, attempts, completedAt

Note: `moduleOrder` and `lessonOrder` are denormalized from the content frontmatter to enable efficient ordering queries without reading MDX files. Quizzes exist only at the end of each module (the final lesson), not per-lesson. Regular lessons are marked complete when the learner finishes the embedded exercise; quiz lessons require 80%+ score.

### 5.3 Data Flow

1. User logs in → NextAuth session created
2. Dashboard loads → fetches Progress records for the user → shows completed/in-progress/locked modules
3. User opens a lesson → MDX content rendered with interactive components
4. User completes an exercise → Exercise record saved via API route
5. User passes quiz (80%+) → Progress record marked complete → next module unlocked
6. Dashboard reflects updated progress

### 5.4 Module Locking Logic

- Module 1 is always unlocked
- Lessons within a module are sequential — Lesson N unlocks when Lesson N-1 is completed (exercise finished or content read)
- The final lesson of each module is the quiz checkpoint — requires `quizScore >= 80` to mark the module complete
- Module N unlocks when Module N-1's quiz lesson has `completed: true` and `quizScore >= 80`

---

## 6. UI Design

### 6.1 Design Principles

- **Dark theme** — matches VS Code and terminal, gets learners used to the look before using real tools
- **One concept per screen** — short lessons, one idea at a time, practice immediately after
- **Visible progress** — progress bars, checkmarks, completion percentages, module status badges
- **Layman first, technical second** — every concept starts with an everyday analogy, then introduces the real term
- **Non-intimidating** — friendly language, encouraging feedback, no jargon without explanation

### 6.2 Key Screens

**Login:** Centered card with email/password fields. Clean, minimal. Brand: "Learners Academy" with rocket emoji.

**Dashboard:** Top navigation bar with user greeting. Overall progress bar. Grid of module cards showing status (completed with green border, in-progress with blue border, locked with grey border and opacity). Each card shows module title and lesson count progress.

**Lesson View:** Three-column layout:
- Left sidebar (200px): Lesson navigation within the current module. Shows completed/current/locked lessons.
- Main content (max 680px): Lesson text in MDX with embedded interactive components. Previous/Next navigation at bottom.
- Exercises embedded inline in the content flow, styled with a distinct background to stand out.

**Quiz View:** Full-width within lesson layout. Question with 4 options. Instant feedback per question. Summary score at end with pass/fail and retry option.

---

## 7. Content Writing Guidelines

All lesson content must follow these rules:

1. **Simple language** — write for someone who has never touched a computer professionally
2. **Analogy first** — introduce every new concept with a real-world comparison before the technical definition
3. **Short paragraphs** — 2-3 sentences max per paragraph
4. **One concept per lesson** — don't combine multiple ideas
5. **Show, don't tell** — use screenshots, diagrams, and interactive exercises over text explanations
6. **Encouraging tone** — "Great job!" not "Correct." — "Let's try again" not "Wrong."
7. **No unexplained jargon** — if you use a technical term, define it in parentheses immediately

---

## 8. Scope & Non-Goals

### In Scope
- 9 modules with full lesson content and exercises
- 6 interactive components (all simulated, no real backends)
- User authentication and progress tracking
- Linear locked progression
- Dark theme UI

### Out of Scope (for now)
- Admin panel for managing users/content
- Certificate of completion
- Real API calls or live environments
- Video content
- Mobile-optimized layout (desktop-first, basic responsiveness only)
- Multi-language support
- Analytics/reporting dashboard
- Light theme toggle
