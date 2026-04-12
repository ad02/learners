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
    <div className="rounded-xl overflow-hidden border border-white/10 font-mono text-base">
      {/* Title bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-[#181825]">
        <div className="flex gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-[#f38ba8]" />
          <span className="w-3.5 h-3.5 rounded-full bg-[#f9e2af]" />
          <span className="w-3.5 h-3.5 rounded-full bg-[#a6e3a1]" />
        </div>
        <span className="text-text-muted text-sm">
          Step {Math.min(currentStep + 1, steps.length)}/{steps.length}
        </span>
      </div>

      {/* Terminal body */}
      <div
        ref={scrollRef}
        className="bg-[#1e1e2e] p-5 min-h-[300px] max-h-[500px] overflow-y-auto"
      >
        {/* Command history */}
        {history.map((entry, i) => (
          <div key={i} className="mb-3">
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
        <div className="flex items-center justify-between px-5 py-3 bg-[#181825]">
          <button
            onClick={() => setShowHint((h) => !h)}
            className="text-sm px-4 py-1.5 rounded-lg bg-white/10 text-text-muted hover:text-white transition-colors"
          >
            Hint
          </button>
          {showHint && (
            <span className="text-sm text-accent-green ml-3">
              {step.hint}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
