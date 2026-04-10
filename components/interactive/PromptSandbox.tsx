"use client";

import { useState } from "react";

interface CriterionResult {
  name: string;
  passed: boolean;
  feedback: string;
}

interface PromptSandboxProps {
  exercise: string;
  badExample?: string;
  hint?: string;
}

const CRITERIA = [
  {
    name: "Role",
    regex: /you are|act as|as a|your role/i,
    requireWordCount: false,
    minWords: 0,
    passFeedback: "You assigned a role to the AI.",
    failFeedback: "Try assigning a role (e.g. \"You are a...\").",
  },
  {
    name: "Context",
    regex: /for my|because|i need|we are/i,
    requireWordCount: true,
    minWords: 15,
    passFeedback: "You provided context for the task.",
    failFeedback: "Add context about why you need this (e.g. \"for my...\", \"because...\").",
  },
  {
    name: "Task",
    regex: /write|create|explain|list|summarize|generate|build|make|help/i,
    requireWordCount: false,
    minWords: 0,
    passFeedback: "You clearly stated a task.",
    failFeedback: "State what you want the AI to do (e.g. \"Write...\", \"Create...\").",
  },
  {
    name: "Format",
    regex: /bullet|list|paragraph|word|sentence|step|header|format/i,
    requireWordCount: false,
    minWords: 0,
    passFeedback: "You specified an output format.",
    failFeedback: "Specify a format (e.g. \"bullet points\", \"3 paragraphs\").",
  },
  {
    name: "Specificity",
    regex: null,
    requireWordCount: true,
    minWords: 20,
    passFeedback: "Your prompt is detailed enough.",
    failFeedback: "Add more detail — aim for at least 20 words.",
  },
];

function scorePrompt(text: string): CriterionResult[] {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  return CRITERIA.map((criterion) => {
    let passed = true;

    if (criterion.regex) {
      passed = criterion.regex.test(text);
    }

    if (criterion.requireWordCount && wordCount < criterion.minWords) {
      passed = false;
    }

    return {
      name: criterion.name,
      passed,
      feedback: passed ? criterion.passFeedback : criterion.failFeedback,
    };
  });
}

function getScoreColor(score: number): string {
  if (score >= 8) return "text-accent-green";
  if (score >= 4) return "text-yellow-400";
  return "text-red-400";
}

export function PromptSandbox({ exercise, badExample, hint }: PromptSandboxProps) {
  const [prompt, setPrompt] = useState("");
  const [results, setResults] = useState<CriterionResult[] | null>(null);
  const [score, setScore] = useState<number | null>(null);

  function handleCheck() {
    const criteria = scorePrompt(prompt);
    const total = criteria.filter((c) => c.passed).length * 2;
    setResults(criteria);
    setScore(total);
  }

  return (
    <div className="rounded-xl border border-border-default bg-bg-secondary p-6 space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">
        Prompt Writing Exercise
      </h3>

      {badExample && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4">
          <p className="text-sm font-medium text-red-400 mb-1">Bad example:</p>
          <p className="text-sm text-text-secondary italic">{badExample}</p>
        </div>
      )}

      {hint && (
        <p className="text-sm text-text-secondary">
          <span className="font-medium text-accent-blue">Hint:</span> {hint}
        </p>
      )}

      <div className="space-y-2">
        <label htmlFor={`prompt-${exercise}`} className="sr-only">
          Your prompt
        </label>
        <textarea
          id={`prompt-${exercise}`}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Write your prompt here..."
          rows={5}
          className="w-full rounded-lg border border-border-default bg-bg-surface px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue/50 resize-y"
        />
      </div>

      <button
        onClick={handleCheck}
        className="rounded-lg bg-accent-blue px-5 py-2 text-sm font-medium text-white hover:bg-accent-blue/80 transition-colors"
      >
        Check My Prompt
      </button>

      {/* Criteria labels always visible */}
      <div className="flex flex-wrap gap-2">
        {CRITERIA.map((c) => {
          const result = results?.find((r) => r.name === c.name);
          let badgeClass = "bg-bg-surface text-text-secondary border-border-default";
          if (result) {
            badgeClass = result.passed
              ? "bg-accent-green/10 text-accent-green border-accent-green/30"
              : "bg-red-500/10 text-red-400 border-red-500/30";
          }
          return (
            <span
              key={c.name}
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${badgeClass}`}
            >
              {result && (result.passed ? "✓ " : "✗ ")}
              {c.name}
            </span>
          );
        })}
      </div>

      {/* Score and detailed results */}
      {score !== null && results && (
        <div className="space-y-3">
          <p className={`text-2xl font-bold ${getScoreColor(score)}`}>
            {score}/10
          </p>

          <ul className="space-y-2">
            {results.map((r) => (
              <li key={r.name} className="flex items-start gap-2 text-sm">
                <span className={r.passed ? "text-accent-green" : "text-red-400"}>
                  {r.passed ? "✓" : "✗"}
                </span>
                <span className="text-text-secondary">{r.feedback}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
