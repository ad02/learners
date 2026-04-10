"use client";

import { useState, useRef, useEffect } from "react";

export interface TerminalStep {
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
  prompt: string;
  command: string;
  output: string;
  isError: boolean;
}

function normalize(cmd: string): string {
  return cmd.trim().toLowerCase().replace(/\s+/g, " ");
}

export function Terminal({ steps, onComplete }: TerminalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [completed, setCompleted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const step = steps[currentStep];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter" || !input.trim()) return;

    const normalizedInput = normalize(input);
    const isCorrect = step.expectedCommands.some(
      (cmd) => normalize(cmd) === normalizedInput
    );

    if (isCorrect) {
      setHistory((prev) => [
        ...prev,
        {
          prompt: step.prompt,
          command: input,
          output: step.response,
          isError: false,
        },
      ]);
      setShowHint(false);

      const nextStep = currentStep + 1;
      if (nextStep >= steps.length) {
        setCompleted(true);
        onComplete?.();
      } else {
        setCurrentStep(nextStep);
      }
    } else {
      setHistory((prev) => [
        ...prev,
        {
          prompt: step.prompt,
          command: input,
          output: "Not quite. Try again or use the Hint button.",
          isError: true,
        },
      ]);
    }

    setInput("");
  }

  return (
    <div className="rounded-lg overflow-hidden border border-white/10 font-mono text-sm">
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#181825]">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#f38ba8]" />
          <span className="w-3 h-3 rounded-full bg-[#f9e2af]" />
          <span className="w-3 h-3 rounded-full bg-[#a6e3a1]" />
        </div>
        <span className="text-text-muted text-xs">
          Step {Math.min(currentStep + 1, steps.length)}/{steps.length}
        </span>
      </div>

      {/* Terminal body */}
      <div
        ref={scrollRef}
        className="bg-[#1e1e2e] p-4 min-h-[200px] max-h-[400px] overflow-y-auto"
      >
        {/* Command history */}
        {history.map((entry, i) => (
          <div key={i} className="mb-2">
            <div>
              <span className="text-text-muted">{entry.prompt} </span>
              <span className="text-white">{entry.command}</span>
            </div>
            <div
              className={
                entry.isError ? "text-accent-red" : "text-accent-green"
              }
            >
              {entry.output}
            </div>
          </div>
        ))}

        {/* Current prompt + input or complete indicator */}
        {completed ? (
          <div className="text-accent-green font-bold mt-2">
            Complete! All steps finished.
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-text-muted whitespace-nowrap">
              {step.prompt}
            </span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-white outline-none border-none caret-accent-green"
              autoFocus
              spellCheck={false}
            />
          </div>
        )}
      </div>

      {/* Bottom bar */}
      {!completed && (
        <div className="flex items-center justify-between px-4 py-2 bg-[#181825]">
          <button
            onClick={() => setShowHint((h) => !h)}
            className="text-xs px-3 py-1 rounded bg-white/10 text-text-muted hover:text-white transition-colors"
          >
            Hint
          </button>
          {showHint && (
            <span className="text-xs text-accent-green ml-2">
              {step.hint}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
