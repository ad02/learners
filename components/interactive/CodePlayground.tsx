"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface CodePlaygroundProps {
  starterCode?: string;
  solution?: string;
  onComplete?: () => void;
}

const DEFAULT_STARTER = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; padding: 20px; }
    h1 { color: #89b4fa; }
  </style>
</head>
<body>
  <h1>Hello, World!</h1>
  <p>Edit this code and see the preview update live.</p>
</body>
</html>`;

export function CodePlayground({
  starterCode = DEFAULT_STARTER,
  solution,
  onComplete,
}: CodePlaygroundProps) {
  const [code, setCode] = useState(starterCode);
  const [showSolution, setShowSolution] = useState(false);
  const [completed, setCompleted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const updatePreview = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // For sandboxed iframes without allow-same-origin,
    // we must use srcdoc to inject content
    iframe.srcdoc = showSolution && solution ? solution : code;
  }, [code, showSolution, solution]);

  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  function handleReset() {
    setCode(starterCode);
    setShowSolution(false);
  }

  function handleComplete() {
    if (!completed) {
      setCompleted(true);
      onComplete?.();
    }
  }

  return (
    <div className="rounded-lg overflow-hidden border border-white/10">
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#181825]">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#f38ba8]" />
          <span className="w-3 h-3 rounded-full bg-[#f9e2af]" />
          <span className="w-3 h-3 rounded-full bg-[#a6e3a1]" />
        </div>
        <span className="text-text-muted text-xs">Code Playground</span>
      </div>

      {/* Split pane */}
      <div className="flex flex-col md:flex-row min-h-[300px]">
        {/* Editor */}
        <div className="flex-1 flex flex-col border-r border-white/10">
          <div className="px-3 py-1.5 bg-[#1e1e2e] border-b border-white/10">
            <span className="text-xs text-text-muted">index.html</span>
          </div>
          <textarea
            value={showSolution && solution ? solution : code}
            onChange={(e) => {
              if (showSolution) setShowSolution(false);
              setCode(e.target.value);
            }}
            className="flex-1 bg-[#1e1e2e] text-text-primary font-mono text-sm p-4 resize-none outline-none border-none w-full"
            spellCheck={false}
          />
        </div>

        {/* Preview */}
        <div className="flex-1 flex flex-col">
          <div className="px-3 py-1.5 bg-[#1e1e2e] border-b border-white/10">
            <span className="text-xs text-text-muted">Preview</span>
          </div>
          <div className="flex-1 bg-white">
            <iframe
              ref={iframeRef}
              sandbox="allow-scripts"
              title="Code preview"
              className="w-full h-full min-h-[250px] border-none"
            />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[#181825]">
        <button
          onClick={handleReset}
          className="text-xs px-3 py-1 rounded bg-white/10 text-text-muted hover:text-white transition-colors"
        >
          Reset
        </button>
        {solution && (
          <button
            onClick={() => setShowSolution((s) => !s)}
            className="text-xs px-3 py-1 rounded bg-white/10 text-text-muted hover:text-white transition-colors"
          >
            {showSolution ? "Hide Solution" : "Show Solution"}
          </button>
        )}
        {!completed && (
          <button
            onClick={handleComplete}
            className="ml-auto text-xs px-3 py-1 rounded bg-accent-green/20 text-accent-green hover:bg-accent-green/30 transition-colors"
          >
            Mark Complete
          </button>
        )}
        {completed && (
          <span className="ml-auto text-xs text-accent-green font-medium">
            Complete!
          </span>
        )}
      </div>
    </div>
  );
}
