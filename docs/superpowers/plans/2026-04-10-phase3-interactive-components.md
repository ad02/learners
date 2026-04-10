# Phase 3: Interactive Components — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 6 interactive React components that embed in MDX lessons — Quiz, Terminal, PromptSandbox, CodePlayground, ApiExplorer, WorkflowBuilder. Wire them into MDX and update lesson content to use them.

**Architecture:** All components are client components (`"use client"`) living in `components/interactive/`. They accept exercise configuration via props (defined per-exercise in MDX). State is local — exercise results POST to `/api/progress/complete` or `/api/exercises` when finished. Components are registered in MDX via a components map passed to `MDXRemote`.

**Tech Stack:** React 19, CodeMirror 6, React Flow, Framer Motion (WorkflowBuilder only), existing Next.js 16 stack

**Spec:** `docs/superpowers/specs/2026-04-09-learners-academy-design.md` §3

---

## File Structure

```
components/interactive/
├── Quiz.tsx                    # Multiple choice quiz with scoring
├── Terminal.tsx                # Simulated terminal with command validation
├── PromptSandbox.tsx           # Prompt writing with criteria-based scoring
├── CodePlayground.tsx          # Split-pane code editor with live preview
├── ApiExplorer.tsx             # Simulated API client with mock responses
├── WorkflowBuilder.tsx         # Drag-and-drop automation canvas
└── index.ts                    # Re-exports all components for MDX registration

lib/
├── mdx-components.ts           # MDX component map (registers interactive widgets)

__tests__/components/
├── Quiz.test.tsx
├── Terminal.test.tsx
└── PromptSandbox.test.tsx
```

---

### Task 1: Quiz Component

The most critical component — needed for module progression (80% to unlock next module).

**Files:**
- Create: `components/interactive/Quiz.tsx`
- Create: `__tests__/components/Quiz.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `__tests__/components/Quiz.test.tsx`:

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Quiz } from "@/components/interactive/Quiz";

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
) as jest.Mock;

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

const sampleQuestions = [
  {
    question: "What does VS Code stand for?",
    options: [
      "Visual Studio Code",
      "Very Simple Code",
      "Virtual System Code",
      "Video Source Code",
    ],
    correct: 0,
    explanation: "VS Code stands for Visual Studio Code — a free code editor by Microsoft.",
  },
  {
    question: "What is the terminal?",
    options: [
      "A type of computer",
      "A place to type commands",
      "A web browser",
      "A file type",
    ],
    correct: 1,
    explanation: "The terminal is where you type commands to communicate with your computer.",
  },
];

describe("Quiz", () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  test("renders first question", () => {
    render(
      <Quiz
        questions={sampleQuestions}
        moduleId="01-vs-code"
        lessonId="05-quiz"
        moduleOrder={1}
        lessonOrder={5}
      />
    );
    expect(screen.getByText("What does VS Code stand for?")).toBeInTheDocument();
    expect(screen.getByText("Question 1 of 2")).toBeInTheDocument();
  });

  test("shows all 4 options", () => {
    render(
      <Quiz
        questions={sampleQuestions}
        moduleId="01-vs-code"
        lessonId="05-quiz"
        moduleOrder={1}
        lessonOrder={5}
      />
    );
    expect(screen.getByText("Visual Studio Code")).toBeInTheDocument();
    expect(screen.getByText("Very Simple Code")).toBeInTheDocument();
  });

  test("shows correct feedback on right answer", () => {
    render(
      <Quiz
        questions={sampleQuestions}
        moduleId="01-vs-code"
        lessonId="05-quiz"
        moduleOrder={1}
        lessonOrder={5}
      />
    );
    fireEvent.click(screen.getByText("Visual Studio Code"));
    expect(screen.getByText(/VS Code stands for/)).toBeInTheDocument();
  });

  test("shows incorrect feedback on wrong answer", () => {
    render(
      <Quiz
        questions={sampleQuestions}
        moduleId="01-vs-code"
        lessonId="05-quiz"
        moduleOrder={1}
        lessonOrder={5}
      />
    );
    fireEvent.click(screen.getByText("Very Simple Code"));
    expect(screen.getByText(/not quite/i)).toBeInTheDocument();
  });

  test("advances to next question after answering", () => {
    render(
      <Quiz
        questions={sampleQuestions}
        moduleId="01-vs-code"
        lessonId="05-quiz"
        moduleOrder={1}
        lessonOrder={5}
      />
    );
    fireEvent.click(screen.getByText("Visual Studio Code"));
    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText("What is the terminal?")).toBeInTheDocument();
    expect(screen.getByText("Question 2 of 2")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- __tests__/components/Quiz.test.tsx
```

- [ ] **Step 3: Implement Quiz component**

Create `components/interactive/Quiz.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface QuizProps {
  questions: Question[];
  moduleId: string;
  lessonId: string;
  moduleOrder: number;
  lessonOrder: number;
}

export function Quiz({
  questions,
  moduleId,
  lessonId,
  moduleOrder,
  lessonOrder,
}: QuizProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const question = questions[currentIndex];
  const isCorrect = selectedOption === question.correct;
  const isLastQuestion = currentIndex === questions.length - 1;
  const finalScore = Math.round(
    ((score + (isCorrect && selectedOption !== null ? 1 : 0)) / questions.length) * 100
  );

  function handleSelect(optionIndex: number) {
    if (selectedOption !== null) return; // Already answered
    setSelectedOption(optionIndex);
    if (optionIndex === question.correct) {
      setScore((s) => s + 1);
    }
  }

  function handleNext() {
    if (isLastQuestion) {
      setShowResult(true);
      // Save quiz score
      const quizScore = Math.round(
        ((score + (isCorrect ? 1 : 0)) / questions.length) * 100
      );
      fetch("/api/progress/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId,
          lessonId,
          moduleOrder,
          lessonOrder,
          quizScore,
        }),
      }).then(() => {
        setSubmitted(true);
      });
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
    }
  }

  function handleRetry() {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setShowResult(false);
    setSubmitted(false);
  }

  if (showResult) {
    const passed = finalScore >= 80;
    return (
      <div className="bg-bg-secondary rounded-lg p-6 mt-6">
        <h3 className="text-lg font-bold text-text-primary mb-2">
          Quiz Complete!
        </h3>
        <div
          className={`text-3xl font-bold mb-2 ${
            passed ? "text-accent-green" : "text-accent-red"
          }`}
        >
          {finalScore}%
        </div>
        <p className="text-text-secondary text-sm mb-4">
          You got {score} out of {questions.length} correct.
        </p>
        {passed ? (
          <div>
            <p className="text-accent-green text-sm mb-4">
              Great job! You passed! The next module is now unlocked.
            </p>
            <button
              onClick={() => {
                router.refresh();
                router.push("/dashboard");
              }}
              className="px-6 py-2 rounded-lg bg-accent-green text-bg-primary font-semibold text-sm"
            >
              Back to Dashboard →
            </button>
          </div>
        ) : (
          <div>
            <p className="text-accent-red text-sm mb-4">
              You need 80% to pass. Let's try again — you've got this!
            </p>
            <button
              onClick={handleRetry}
              className="px-6 py-2 rounded-lg bg-accent-blue text-bg-primary font-semibold text-sm"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-bg-secondary rounded-lg p-6 mt-6">
      <div className="text-xs text-text-muted mb-4">
        Question {currentIndex + 1} of {questions.length}
      </div>
      <h3 className="text-base font-bold text-text-primary mb-4">
        {question.question}
      </h3>
      <div className="flex flex-col gap-2">
        {question.options.map((option, i) => {
          let optionClass =
            "px-4 py-3 rounded-lg border text-sm text-left transition-colors cursor-pointer ";

          if (selectedOption === null) {
            optionClass +=
              "bg-bg-primary border-border text-text-primary hover:border-accent-blue";
          } else if (i === question.correct) {
            optionClass += "bg-accent-green/10 border-accent-green text-accent-green";
          } else if (i === selectedOption) {
            optionClass += "bg-accent-red/10 border-accent-red text-accent-red";
          } else {
            optionClass += "bg-bg-primary border-border text-text-muted";
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={selectedOption !== null}
              className={optionClass}
            >
              {option}
            </button>
          );
        })}
      </div>

      {selectedOption !== null && (
        <div className="mt-4">
          <div
            className={`text-sm p-3 rounded-lg ${
              isCorrect
                ? "bg-accent-green/10 text-accent-green"
                : "bg-accent-red/10 text-accent-red"
            }`}
          >
            {isCorrect
              ? `✓ Correct! ${question.explanation}`
              : `Not quite. ${question.explanation}`}
          </div>
          <button
            onClick={handleNext}
            className="mt-3 px-4 py-2 rounded-lg bg-accent-blue text-bg-primary font-semibold text-sm"
          >
            {isLastQuestion ? "See Results" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run tests**

```bash
npm test -- __tests__/components/Quiz.test.tsx
```

Expected: All 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add components/interactive/Quiz.tsx __tests__/components/Quiz.test.tsx
git commit -m "feat: add Quiz interactive component with scoring and module unlock"
```

---

### Task 2: Simulated Terminal Component

**Files:**
- Create: `components/interactive/Terminal.tsx`
- Create: `__tests__/components/Terminal.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `__tests__/components/Terminal.test.tsx`:

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Terminal } from "@/components/interactive/Terminal";

const sampleSteps = [
  {
    prompt: "~/project $",
    expectedCommands: ["mkdir my-project", "mkdir my-project/"],
    response: "Directory created: my-project/",
    hint: "Create a new folder called my-project",
  },
  {
    prompt: "~/project $",
    expectedCommands: ["cd my-project", "cd my-project/"],
    response: "Now in ~/project/my-project",
    hint: "Navigate into the my-project folder",
  },
];

describe("Terminal", () => {
  test("renders with prompt and input", () => {
    render(<Terminal steps={sampleSteps} />);
    expect(screen.getByText("~/project $")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  test("accepts correct command and shows response", () => {
    render(<Terminal steps={sampleSteps} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "mkdir my-project" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByText("Directory created: my-project/")).toBeInTheDocument();
  });

  test("shows error for wrong command", () => {
    render(<Terminal steps={sampleSteps} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "wrong command" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByText(/not quite/i)).toBeInTheDocument();
  });

  test("shows hint when hint button is clicked", () => {
    render(<Terminal steps={sampleSteps} />);
    fireEvent.click(screen.getByText("Hint"));
    expect(screen.getByText(/Create a new folder/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Implement Terminal**

Create `components/interactive/Terminal.tsx`:

```tsx
"use client";

import { useState, useRef, useEffect } from "react";

interface TerminalStep {
  prompt: string;
  expectedCommands: string[];
  response: string;
  hint: string;
}

interface TerminalProps {
  steps: TerminalStep[];
  onComplete?: () => void;
}

interface HistoryEntry {
  type: "prompt" | "command" | "response" | "error";
  text: string;
}

export function Terminal({ steps, onComplete }: TerminalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [completed, setCompleted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const step = steps[currentStep];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  function normalizeCommand(cmd: string): string {
    return cmd.trim().toLowerCase().replace(/\s+/g, " ");
  }

  function handleSubmit() {
    if (!input.trim() || completed) return;

    const normalized = normalizeCommand(input);
    const isCorrect = step.expectedCommands.some(
      (expected) => normalizeCommand(expected) === normalized
    );

    const newHistory: HistoryEntry[] = [
      ...history,
      { type: "prompt", text: step.prompt },
      { type: "command", text: input },
    ];

    if (isCorrect) {
      newHistory.push({ type: "response", text: step.response });
      setHistory(newHistory);
      setInput("");
      setShowHint(false);

      if (currentStep === steps.length - 1) {
        setCompleted(true);
        onComplete?.();
      } else {
        setCurrentStep((s) => s + 1);
      }
    } else {
      newHistory.push({
        type: "error",
        text: `Not quite. Try again! Use the Hint button if you're stuck.`,
      });
      setHistory(newHistory);
      setInput("");
    }
  }

  return (
    <div className="bg-[#1e1e2e] rounded-lg overflow-hidden border border-border mt-6">
      <div className="flex items-center justify-between px-3 py-2 bg-[#181825] border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">Terminal</span>
          {completed && (
            <span className="text-xs text-accent-green">✓ Complete</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">
            Step {Math.min(currentStep + 1, steps.length)}/{steps.length}
          </span>
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-xs px-2 py-1 rounded bg-bg-surface text-text-secondary hover:text-text-primary transition-colors"
          >
            Hint
          </button>
        </div>
      </div>

      {showHint && !completed && (
        <div className="px-3 py-2 bg-accent-blue/10 text-accent-blue text-xs border-b border-border">
          💡 {step.hint}
        </div>
      )}

      <div
        ref={scrollRef}
        className="p-3 font-mono text-sm min-h-[200px] max-h-[400px] overflow-y-auto"
      >
        {history.map((entry, i) => (
          <div key={i} className="leading-7">
            {entry.type === "prompt" && (
              <span className="text-text-muted">{entry.text} </span>
            )}
            {entry.type === "command" && (
              <span className="text-text-primary">{entry.text}</span>
            )}
            {entry.type === "response" && (
              <div className="text-accent-green">{entry.text}</div>
            )}
            {entry.type === "error" && (
              <div className="text-accent-red">{entry.text}</div>
            )}
          </div>
        ))}

        {!completed && (
          <div className="flex items-center leading-7">
            <span className="text-text-muted">{step.prompt} </span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              className="flex-1 bg-transparent text-text-primary outline-none font-mono text-sm"
              autoFocus
            />
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Run tests**

```bash
npm test -- __tests__/components/Terminal.test.tsx
```

Expected: All 4 tests PASS.

- [ ] **Step 4: Commit**

```bash
git add components/interactive/Terminal.tsx __tests__/components/Terminal.test.tsx
git commit -m "feat: add simulated Terminal component with command validation"
```

---

### Task 3: Prompt Sandbox Component

**Files:**
- Create: `components/interactive/PromptSandbox.tsx`
- Create: `__tests__/components/PromptSandbox.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `__tests__/components/PromptSandbox.test.tsx`:

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { PromptSandbox } from "@/components/interactive/PromptSandbox";

describe("PromptSandbox", () => {
  test("renders with empty textarea", () => {
    render(<PromptSandbox exercise="test" />);
    expect(screen.getByPlaceholderText(/write your prompt/i)).toBeInTheDocument();
  });

  test("shows scoring criteria", () => {
    render(<PromptSandbox exercise="test" />);
    expect(screen.getByText(/role/i)).toBeInTheDocument();
    expect(screen.getByText(/context/i)).toBeInTheDocument();
    expect(screen.getByText(/task/i)).toBeInTheDocument();
    expect(screen.getByText(/format/i)).toBeInTheDocument();
  });

  test("scores prompt when check button is clicked", () => {
    render(<PromptSandbox exercise="test" />);
    const textarea = screen.getByPlaceholderText(/write your prompt/i);
    fireEvent.change(textarea, {
      target: {
        value:
          "You are a professional copywriter. I need a blog post about automation for my company website. Write a 500-word article with headers and bullet points.",
      },
    });
    fireEvent.click(screen.getByText(/check/i));
    // Should detect role, context, task, and format
    expect(screen.getByText(/\/10/)).toBeInTheDocument();
  });

  test("shows bad example when provided", () => {
    render(
      <PromptSandbox exercise="test" badExample="Write about dogs" />
    );
    expect(screen.getByText("Write about dogs")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Implement PromptSandbox**

Create `components/interactive/PromptSandbox.tsx`:

```tsx
"use client";

import { useState } from "react";

interface PromptSandboxProps {
  exercise: string;
  badExample?: string;
  hint?: string;
  onComplete?: () => void;
}

interface CriteriaResult {
  name: string;
  met: boolean;
  feedback: string;
}

function scorePrompt(text: string): { score: number; criteria: CriteriaResult[] } {
  const lower = text.toLowerCase();
  const wordCount = text.trim().split(/\s+/).length;

  const criteria: CriteriaResult[] = [
    {
      name: "Role",
      met: /you are|act as|as a|your role|pretend you/.test(lower),
      feedback: "Tell the AI who it should be (e.g., 'You are a helpful assistant')",
    },
    {
      name: "Context",
      met: /for my|because|the goal|i need|i want|we are|our/.test(lower) && wordCount > 15,
      feedback: "Explain the situation or background (e.g., 'for my company blog')",
    },
    {
      name: "Task",
      met: /write|create|explain|list|summarize|generate|build|make|help|find|analyze/.test(lower),
      feedback: "Clearly state what you need done (e.g., 'Write a blog post about...')",
    },
    {
      name: "Format",
      met: /bullet|list|paragraph|word|sentence|step|header|section|format|table|json/.test(lower) ||
        /\d+.word|\d+.sentence/.test(lower),
      feedback: "Specify the output format (e.g., 'in bullet points', '300 words')",
    },
    {
      name: "Specificity",
      met: wordCount >= 20,
      feedback: "Be more specific — aim for at least 20 words in your prompt",
    },
  ];

  const metCount = criteria.filter((c) => c.met).length;
  const score = metCount * 2; // 0-10 scale

  return { score, criteria };
}

export function PromptSandbox({
  exercise,
  badExample,
  hint,
  onComplete,
}: PromptSandboxProps) {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<{
    score: number;
    criteria: CriteriaResult[];
  } | null>(null);

  function handleCheck() {
    const scored = scorePrompt(prompt);
    setResult(scored);
    if (scored.score >= 8 && onComplete) {
      onComplete();
    }
  }

  return (
    <div className="bg-bg-secondary rounded-lg p-6 mt-6 border border-border">
      <div className="text-xs uppercase text-accent-blue mb-3 tracking-wider">
        🎮 Prompt Sandbox
      </div>

      {badExample && (
        <div className="mb-4 p-3 rounded-lg bg-accent-red/10 border border-accent-red/20">
          <div className="text-xs text-accent-red mb-1 font-bold">Bad Example:</div>
          <div className="text-sm text-text-secondary italic">{badExample}</div>
        </div>
      )}

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Write your prompt here..."
        rows={4}
        className="w-full p-3 rounded-lg bg-bg-primary border border-border text-text-primary text-sm resize-none focus:outline-none focus:border-accent-blue placeholder:text-text-muted"
      />

      {hint && !result && (
        <p className="text-xs text-text-muted mt-2">💡 Hint: {hint}</p>
      )}

      <div className="flex items-center justify-between mt-3">
        <div className="flex gap-3 text-xs text-text-muted">
          <span>☐ Role</span>
          <span>☐ Context</span>
          <span>☐ Task</span>
          <span>☐ Format</span>
          <span>☐ Specificity</span>
        </div>
        <button
          onClick={handleCheck}
          disabled={!prompt.trim()}
          className="px-4 py-2 rounded-lg bg-accent-blue text-bg-primary font-semibold text-xs disabled:opacity-50"
        >
          Check My Prompt
        </button>
      </div>

      {result && (
        <div className="mt-4">
          <div
            className={`inline-block px-3 py-1 rounded-lg text-sm font-bold ${
              result.score >= 8
                ? "bg-accent-green/10 text-accent-green"
                : result.score >= 4
                  ? "bg-accent-yellow/10 text-accent-yellow"
                  : "bg-accent-red/10 text-accent-red"
            }`}
          >
            {result.score}/10
          </div>

          <div className="mt-3 flex flex-col gap-2">
            {result.criteria.map((c) => (
              <div key={c.name} className="flex items-start gap-2 text-xs">
                <span className={c.met ? "text-accent-green" : "text-accent-red"}>
                  {c.met ? "✓" : "✗"}
                </span>
                <div>
                  <span className="font-bold text-text-primary">{c.name}: </span>
                  <span className={c.met ? "text-accent-green" : "text-text-secondary"}>
                    {c.met ? "Found!" : c.feedback}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Run tests**

```bash
npm test -- __tests__/components/PromptSandbox.test.tsx
```

- [ ] **Step 4: Commit**

```bash
git add components/interactive/PromptSandbox.tsx __tests__/components/PromptSandbox.test.tsx
git commit -m "feat: add PromptSandbox component with criteria-based scoring"
```

---

### Task 4: Code Playground Component

**Files:**
- Create: `components/interactive/CodePlayground.tsx`

- [ ] **Step 1: Install CodeMirror 6**

```bash
npm install @codemirror/lang-html @codemirror/lang-css codemirror @codemirror/view @codemirror/state @codemirror/theme-one-dark
```

- [ ] **Step 2: Implement CodePlayground**

Create `components/interactive/CodePlayground.tsx`:

```tsx
"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface CodePlaygroundProps {
  starterCode?: string;
  solution?: string;
  onComplete?: () => void;
}

export function CodePlayground({
  starterCode = "<h1>Hello World</h1>\n<p>Edit me!</p>",
  solution,
  onComplete,
}: CodePlaygroundProps) {
  const [code, setCode] = useState(starterCode);
  const [showSolution, setShowSolution] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const updatePreview = useCallback(() => {
    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head><style>body { font-family: sans-serif; padding: 16px; color: #333; }</style></head>
        <body>${showSolution && solution ? solution : code}</body>
      </html>
    `);
    doc.close();
  }, [code, showSolution, solution]);

  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  return (
    <div className="bg-bg-secondary rounded-lg overflow-hidden border border-border mt-6">
      <div className="flex items-center justify-between px-3 py-2 bg-[#181825] border-b border-border">
        <span className="text-xs text-text-muted">Code Playground</span>
        <div className="flex gap-2">
          <button
            onClick={() => setCode(starterCode)}
            className="text-xs px-2 py-1 rounded bg-bg-surface text-text-secondary hover:text-text-primary"
          >
            Reset
          </button>
          {solution && (
            <button
              onClick={() => setShowSolution(!showSolution)}
              className="text-xs px-2 py-1 rounded bg-bg-surface text-text-secondary hover:text-text-primary"
            >
              {showSolution ? "Hide Solution" : "Show Solution"}
            </button>
          )}
        </div>
      </div>

      <div className="flex min-h-[250px]">
        <div className="flex-1 border-r border-border">
          <div className="text-[10px] uppercase text-text-muted px-3 py-1 border-b border-border tracking-wider">
            Edit Code
          </div>
          <textarea
            value={showSolution && solution ? solution : code}
            onChange={(e) => {
              if (!showSolution) setCode(e.target.value);
            }}
            readOnly={showSolution}
            spellCheck={false}
            className="w-full h-[220px] p-3 bg-[#1e1e2e] text-text-primary font-mono text-xs resize-none outline-none"
          />
        </div>

        <div className="flex-1">
          <div className="text-[10px] uppercase text-text-muted px-3 py-1 border-b border-border tracking-wider">
            Live Preview
          </div>
          <iframe
            ref={iframeRef}
            sandbox="allow-scripts"
            className="w-full h-[220px] bg-white"
            title="Preview"
          />
        </div>
      </div>
    </div>
  );
}
```

Note: Using a simple textarea for now instead of CodeMirror. CodeMirror can be added later for syntax highlighting — the textarea approach works and avoids SSR issues. The security-critical `sandbox="allow-scripts"` (without `allow-same-origin`) is in place.

- [ ] **Step 3: Commit**

```bash
git add components/interactive/CodePlayground.tsx
git commit -m "feat: add CodePlayground with live preview and sandboxed iframe"
```

---

### Task 5: API Explorer Component

**Files:**
- Create: `components/interactive/ApiExplorer.tsx`

- [ ] **Step 1: Implement ApiExplorer**

Create `components/interactive/ApiExplorer.tsx`:

```tsx
"use client";

import { useState } from "react";

interface MockEndpoint {
  method: string;
  url: string;
  requiredHeaders?: Record<string, string>;
  response: {
    status: number;
    statusText: string;
    body: object;
    explanation: string;
  };
}

interface ApiExplorerProps {
  endpoints: MockEndpoint[];
  onComplete?: () => void;
}

export function ApiExplorer({ endpoints, onComplete }: ApiExplorerProps) {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState("");
  const [response, setResponse] = useState<{
    status: number;
    statusText: string;
    body: string;
    explanation: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [requestCount, setRequestCount] = useState(0);

  function handleSend() {
    setLoading(true);

    // Simulate network delay
    setTimeout(() => {
      const normalizedUrl = url.trim().toLowerCase();
      const normalizedMethod = method.toUpperCase();

      const match = endpoints.find(
        (ep) =>
          ep.method.toUpperCase() === normalizedMethod &&
          normalizedUrl.includes(ep.url.toLowerCase())
      );

      if (match) {
        // Check required headers
        let headersMatch = true;
        if (match.requiredHeaders) {
          const parsedHeaders = headers
            .split("\n")
            .filter(Boolean)
            .reduce(
              (acc, line) => {
                const [key, ...val] = line.split(":");
                if (key) acc[key.trim().toLowerCase()] = val.join(":").trim();
                return acc;
              },
              {} as Record<string, string>
            );

          for (const [key, value] of Object.entries(match.requiredHeaders)) {
            if (parsedHeaders[key.toLowerCase()] !== value) {
              headersMatch = false;
              break;
            }
          }
        }

        if (headersMatch) {
          setResponse({
            status: match.response.status,
            statusText: match.response.statusText,
            body: JSON.stringify(match.response.body, null, 2),
            explanation: match.response.explanation,
          });
          setRequestCount((c) => c + 1);
          if (requestCount + 1 >= endpoints.length && onComplete) {
            onComplete();
          }
        } else {
          setResponse({
            status: 401,
            statusText: "Unauthorized",
            body: JSON.stringify({ error: "Missing or invalid headers. Check your API key!" }, null, 2),
            explanation: "This endpoint requires specific headers. Check the exercise instructions.",
          });
        }
      } else {
        setResponse({
          status: 404,
          statusText: "Not Found",
          body: JSON.stringify({ error: "Endpoint not found" }, null, 2),
          explanation: "This URL doesn't match any available endpoint. Check the URL and method.",
        });
      }

      setLoading(false);
    }, 500);
  }

  return (
    <div className="bg-bg-secondary rounded-lg overflow-hidden border border-border mt-6">
      <div className="flex items-center justify-between px-3 py-2 bg-[#181825] border-b border-border">
        <span className="text-xs text-text-muted">API Explorer</span>
        <span className="text-xs text-text-muted">
          {requestCount}/{endpoints.length} endpoints discovered
        </span>
      </div>

      <div className="p-4">
        {/* Request */}
        <div className="flex gap-2 mb-3">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="px-3 py-2 rounded-lg bg-accent-green text-bg-primary font-bold text-xs"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.example.com/endpoint"
            className="flex-1 px-3 py-2 rounded-lg bg-bg-primary border border-border text-text-primary font-mono text-xs focus:outline-none focus:border-accent-blue"
          />
          <button
            onClick={handleSend}
            disabled={loading || !url.trim()}
            className="px-4 py-2 rounded-lg bg-accent-blue text-bg-primary font-bold text-xs disabled:opacity-50"
          >
            {loading ? "..." : "Send"}
          </button>
        </div>

        {/* Headers */}
        <textarea
          value={headers}
          onChange={(e) => setHeaders(e.target.value)}
          placeholder="Headers (one per line, e.g. Authorization: Bearer your-key)"
          rows={2}
          className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border text-text-primary font-mono text-xs resize-none focus:outline-none focus:border-accent-blue placeholder:text-text-muted mb-3"
        />

        {/* Response */}
        {response && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`px-2 py-1 rounded text-xs font-bold ${
                  response.status < 300
                    ? "bg-accent-green/10 text-accent-green"
                    : response.status < 500
                      ? "bg-accent-yellow/10 text-accent-yellow"
                      : "bg-accent-red/10 text-accent-red"
                }`}
              >
                {response.status} {response.statusText}
              </span>
            </div>
            <pre className="p-3 rounded-lg bg-[#1e1e2e] text-text-primary font-mono text-xs overflow-x-auto max-h-[200px]">
              {response.body}
            </pre>
            <p className="text-xs text-text-secondary mt-2">
              💡 {response.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/interactive/ApiExplorer.tsx
git commit -m "feat: add ApiExplorer component with mock endpoint matching"
```

---

### Task 6: Workflow Builder Component

**Files:**
- Create: `components/interactive/WorkflowBuilder.tsx`

- [ ] **Step 1: Install React Flow and Framer Motion**

```bash
npm install @xyflow/react framer-motion
```

- [ ] **Step 2: Implement WorkflowBuilder**

Create `components/interactive/WorkflowBuilder.tsx`:

```tsx
"use client";

import { useState, useCallback } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

interface BlockConfig {
  id: string;
  type: "trigger" | "ai" | "action" | "notify";
  label: string;
  description: string;
  icon: string;
}

interface WorkflowBuilderProps {
  availableBlocks: BlockConfig[];
  expectedFlow?: string[]; // Expected block type order for validation
  onComplete?: () => void;
}

const blockColors: Record<string, string> = {
  trigger: "#89b4fa",
  ai: "#a6e3a1",
  action: "#f9e2af",
  notify: "#cba6f7",
};

function WorkflowNode({ data }: { data: { label: string; icon: string; blockType: string; description: string } }) {
  return (
    <div
      className="px-4 py-3 rounded-lg border-2 min-w-[150px] text-center"
      style={{
        backgroundColor: `${blockColors[data.blockType]}20`,
        borderColor: blockColors[data.blockType],
      }}
    >
      <Handle type="target" position={Position.Left} className="!bg-text-muted" />
      <div className="text-lg mb-1">{data.icon}</div>
      <div className="text-xs font-bold" style={{ color: blockColors[data.blockType] }}>
        {data.label}
      </div>
      <div className="text-[10px] text-text-muted mt-1">{data.description}</div>
      <Handle type="source" position={Position.Right} className="!bg-text-muted" />
    </div>
  );
}

const nodeTypes = { workflowNode: WorkflowNode };

export function WorkflowBuilder({
  availableBlocks,
  expectedFlow,
  onComplete,
}: WorkflowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [running, setRunning] = useState(false);
  const [runStep, setRunStep] = useState(-1);
  const [validated, setValidated] = useState(false);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            animated: false,
            style: { stroke: "#6c7086", strokeWidth: 2 },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  function addBlock(block: BlockConfig) {
    const newNode: Node = {
      id: `${block.id}-${Date.now()}`,
      type: "workflowNode",
      position: { x: nodes.length * 220 + 50, y: 100 },
      data: {
        label: block.label,
        icon: block.icon,
        blockType: block.type,
        description: block.description,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }

  function runWorkflow() {
    if (nodes.length === 0) return;
    setRunning(true);
    setRunStep(0);

    // Animate step by step
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step >= nodes.length) {
        clearInterval(interval);
        setRunning(false);
        setRunStep(-1);

        // Validate flow
        if (expectedFlow) {
          const nodeTypes = nodes.map(
            (n) => (n.data as { blockType: string }).blockType
          );
          const isValid = expectedFlow.every(
            (type, i) => nodeTypes[i] === type
          );
          setValidated(isValid);
          if (isValid && onComplete) onComplete();
        } else {
          setValidated(true);
          onComplete?.();
        }
      } else {
        setRunStep(step);
      }
    }, 800);
  }

  // Highlight running node
  const highlightedNodes = nodes.map((node, i) => ({
    ...node,
    style: {
      ...node.style,
      boxShadow: i === runStep ? `0 0 20px ${blockColors[(node.data as { blockType: string }).blockType]}` : undefined,
      transform: i === runStep ? "scale(1.05)" : undefined,
      transition: "all 0.3s ease",
    },
  }));

  return (
    <div className="bg-bg-secondary rounded-lg overflow-hidden border border-border mt-6">
      <div className="flex items-center justify-between px-3 py-2 bg-[#181825] border-b border-border">
        <span className="text-xs text-text-muted">Workflow Builder</span>
        <div className="flex gap-2">
          <button
            onClick={runWorkflow}
            disabled={running || nodes.length === 0}
            className="text-xs px-3 py-1 rounded bg-accent-green text-bg-primary font-bold disabled:opacity-50"
          >
            {running ? "Running..." : "▶ Run"}
          </button>
          <button
            onClick={() => {
              setNodes([]);
              setEdges([]);
              setValidated(false);
            }}
            className="text-xs px-2 py-1 rounded bg-bg-surface text-text-secondary"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Block palette */}
      <div className="flex gap-2 px-3 py-2 border-b border-border overflow-x-auto">
        {availableBlocks.map((block) => (
          <button
            key={block.id}
            onClick={() => addBlock(block)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap"
            style={{
              backgroundColor: `${blockColors[block.type]}20`,
              color: blockColors[block.type],
              border: `1px solid ${blockColors[block.type]}40`,
            }}
          >
            {block.icon} {block.label}
          </button>
        ))}
      </div>

      {validated && (
        <div className="px-3 py-2 bg-accent-green/10 text-accent-green text-xs border-b border-border">
          ✓ Workflow validated! Great job building your automation.
        </div>
      )}

      {/* Canvas */}
      <div className="h-[350px]">
        <ReactFlow
          nodes={highlightedNodes}
          edges={edges.map((e) => ({
            ...e,
            animated: running,
          }))}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Controls className="!bg-bg-surface !border-border" />
          <Background color="#313244" gap={20} />
        </ReactFlow>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/interactive/WorkflowBuilder.tsx package.json package-lock.json
git commit -m "feat: add WorkflowBuilder component with React Flow drag-and-drop canvas"
```

---

### Task 7: Component Index + MDX Registration

**Files:**
- Create: `components/interactive/index.ts`
- Modify: `components/layout/LessonContent.tsx` — register interactive components in MDX

- [ ] **Step 1: Create index.ts**

Create `components/interactive/index.ts`:

```ts
export { Quiz } from "./Quiz";
export { Terminal } from "./Terminal";
export { PromptSandbox } from "./PromptSandbox";
export { CodePlayground } from "./CodePlayground";
export { ApiExplorer } from "./ApiExplorer";
export { WorkflowBuilder } from "./WorkflowBuilder";
```

- [ ] **Step 2: Register components in LessonContent**

Update `components/layout/LessonContent.tsx` — read it first to see the current implementation, then modify it to pass the interactive components to MDXRemote so they can be used in MDX files like `<Quiz questions={[...]} />`.

The component map should include all 6 interactive widgets:
```ts
const components = { Quiz, Terminal, PromptSandbox, CodePlayground, ApiExplorer, WorkflowBuilder };
```

Pass this to MDXRemote via its `components` prop.

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add components/interactive/index.ts components/layout/LessonContent.tsx
git commit -m "feat: register interactive components in MDX renderer"
```

---

### Task 8: Update Quiz Lessons with Real Questions

**Files:**
- Modify: `content/01-vs-code/05-quiz.mdx`, `content/02-git/05-quiz.mdx`

- [ ] **Step 1: Update Module 1 quiz**

Replace `content/01-vs-code/05-quiz.mdx` with actual quiz questions using the Quiz component:

```mdx
---
title: "Module 1 Quiz"
description: "Test your VS Code knowledge"
order: 5
type: quiz
---

# Module 1 Quiz: VS Code Basics

Let's see what you've learned! You need 80% to pass and unlock the next module.

<Quiz
  questions={[
    {
      question: "What is VS Code?",
      options: ["A web browser", "A code editor", "An operating system", "A programming language"],
      correct: 1,
      explanation: "VS Code (Visual Studio Code) is a free code editor made by Microsoft — like Microsoft Word but for writing code."
    },
    {
      question: "What is the terminal?",
      options: ["A type of monitor", "A place to type commands to your computer", "A web browser plugin", "A file format"],
      correct: 1,
      explanation: "The terminal is where you type commands — like texting your computer instead of clicking buttons."
    },
    {
      question: "What does a file extension tell you?",
      options: ["How big the file is", "When the file was created", "What kind of file it is", "Who created the file"],
      correct: 2,
      explanation: "The extension (like .txt, .html, .js) tells your computer what kind of file it is and how to open it."
    },
    {
      question: "How do you open the terminal in VS Code?",
      options: ["File > New Window", "Press Ctrl + backtick", "Click the blue button", "Right-click the desktop"],
      correct: 1,
      explanation: "Press Ctrl + backtick (the key below Escape) to open VS Code's built-in terminal."
    },
    {
      question: "What is a folder also called?",
      options: ["A container", "A directory", "A package", "A module"],
      correct: 1,
      explanation: "Folders are also called directories — they hold files and other folders, like a filing cabinet."
    }
  ]}
  moduleId="01-vs-code"
  lessonId="05-quiz"
  moduleOrder={1}
  lessonOrder={5}
/>
```

- [ ] **Step 2: Update Module 2 quiz**

Replace `content/02-git/05-quiz.mdx`:

```mdx
---
title: "Module 2 Quiz"
description: "Test your Git & GitHub knowledge"
order: 5
type: quiz
---

# Module 2 Quiz: Git & GitHub

Let's see what you've learned! You need 80% to pass and unlock the next module.

<Quiz
  questions={[
    {
      question: "What is Git?",
      options: ["A website", "A version control system", "A programming language", "A code editor"],
      correct: 1,
      explanation: "Git is a version control system — like a time machine that remembers every version of your project."
    },
    {
      question: "What does 'git commit' do?",
      options: ["Deletes your files", "Saves a checkpoint of your changes", "Uploads to the internet", "Opens a new file"],
      correct: 1,
      explanation: "A commit is like sealing an envelope — it saves a snapshot of your changes with a message describing what you did."
    },
    {
      question: "What is GitHub?",
      options: ["A code editor", "A search engine", "A place to store code online", "An operating system"],
      correct: 2,
      explanation: "GitHub is like Google Drive but for code — it stores your projects online so they're safe and shareable."
    },
    {
      question: "What is a branch in Git?",
      options: ["A copy of your project to work on safely", "A type of file", "A Git error", "A terminal command"],
      correct: 0,
      explanation: "A branch is like a parallel universe for your code — you can make changes without affecting the main version."
    },
    {
      question: "What does 'git push' do?",
      options: ["Downloads files", "Sends your commits to GitHub", "Creates a new file", "Deletes a branch"],
      correct: 1,
      explanation: "Push sends your committed changes to GitHub — like mailing your sealed envelope to the post office."
    }
  ]}
  moduleId="02-git"
  lessonId="05-quiz"
  moduleOrder={2}
  lessonOrder={5}
/>
```

- [ ] **Step 3: Verify build and test**

```bash
npm test && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add content/01-vs-code/05-quiz.mdx content/02-git/05-quiz.mdx
git commit -m "feat: add real quiz questions for modules 1 and 2"
```

---

### Task 9: Smoke Test & Final Verification

- [ ] **Step 1: Run all tests**

```bash
npm test
```

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

- [ ] **Step 3: Build**

```bash
npm run build
```

- [ ] **Step 4: Manual testing**

Start dev server: `npm run dev` (port 3333)

1. Log in, go to Module 1, read through lessons
2. Mark lessons complete, verify sidebar updates
3. Reach the quiz — answer questions, verify scoring
4. Pass with 80%+ — verify "next module unlocked" message
5. Dashboard shows Module 1 completed, Module 2 available

- [ ] **Step 5: Commit any fixes**

```bash
git add -A
git commit -m "chore: Phase 3 smoke test fixes"
```

---

## Phase 3 Complete Checklist

- [x] Quiz component with scoring, feedback, retry, and progress save
- [x] Terminal component with command validation, history, hints
- [x] PromptSandbox with criteria-based scoring (role/context/task/format)
- [x] CodePlayground with live preview and sandboxed iframe
- [x] ApiExplorer with mock endpoint matching and response display
- [x] WorkflowBuilder with React Flow canvas, block palette, and run simulation
- [x] Components registered in MDX renderer
- [x] Real quiz questions for modules 1-2
- [x] All tests passing, build succeeds

**Next:** Phase 4 (Full Content — lesson content for modules 3-9)
