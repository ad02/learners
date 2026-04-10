"use client";

import { useState, useCallback } from "react";

interface EndpointConfig {
  method: string;
  url: string;
  requiredHeaders?: Record<string, string>;
  response: {
    status: number;
    statusText: string;
    body: Record<string, unknown>;
    explanation: string;
  };
}

interface ApiExplorerProps {
  endpoints: EndpointConfig[];
  onComplete?: () => void;
}

interface ApiResponse {
  status: number;
  statusText: string;
  body: Record<string, unknown>;
  explanation: string;
}

function parseHeaders(raw: string): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      const key = line.slice(0, idx).trim().toLowerCase();
      const value = line.slice(idx + 1).trim();
      if (key) headers[key] = value;
    }
  }
  return headers;
}

function statusColor(status: number): string {
  if (status >= 200 && status < 300) return "bg-green-50 text-accent-green border border-green-200";
  if (status >= 400 && status < 500) return "bg-red-50 text-accent-red border border-red-200";
  if (status >= 500) return "bg-red-100 text-red-700 border border-red-300";
  return "bg-yellow-50 text-accent-yellow border border-yellow-200";
}

export function ApiExplorer({ endpoints, onComplete }: ApiExplorerProps) {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headersRaw, setHeadersRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [discovered, setDiscovered] = useState<Set<string>>(new Set());
  const [completed, setCompleted] = useState(false);

  const totalEndpoints = endpoints.length;

  const sendRequest = useCallback(() => {
    setLoading(true);
    setResponse(null);

    setTimeout(() => {
      const normalizedUrl = url.trim().toLowerCase();
      const parsedHeaders = parseHeaders(headersRaw);

      const match = endpoints.find((ep) => {
        if (ep.method.toUpperCase() !== method.toUpperCase()) return false;
        if (!normalizedUrl.includes(ep.url.toLowerCase())) return false;

        if (ep.requiredHeaders) {
          for (const [key, value] of Object.entries(ep.requiredHeaders)) {
            const headerVal = parsedHeaders[key.toLowerCase()];
            if (!headerVal || !headerVal.toLowerCase().includes(value.toLowerCase())) {
              return false;
            }
          }
        }

        return true;
      });

      if (match) {
        const endpointKey = `${match.method}:${match.url}`;
        setDiscovered((prev) => {
          const next = new Set(prev);
          next.add(endpointKey);

          if (next.size >= totalEndpoints && !completed) {
            setCompleted(true);
            onComplete?.();
          }

          return next;
        });

        setResponse(match.response);
      } else {
        setResponse({
          status: 404,
          statusText: "Not Found",
          body: { error: "No matching endpoint found. Check method and URL." },
          explanation:
            "This endpoint was not recognized. Try a different URL or method.",
        });
      }

      setLoading(false);
    }, 500);
  }, [method, url, headersRaw, endpoints, totalEndpoints, completed, onComplete]);

  return (
    <div className="rounded-xl border border-border bg-white p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">
          API Explorer
        </h3>
        <span className="text-xs text-text-muted font-medium">
          {discovered.size}/{totalEndpoints} endpoints discovered
        </span>
      </div>

      {/* Method + URL */}
      <div className="flex gap-2">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-text-primary font-mono focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue"
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
          placeholder="https://api.example.com/users"
          className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-text-primary font-mono placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue"
        />
      </div>

      {/* Headers */}
      <div>
        <label className="block text-xs text-text-muted mb-1 font-medium">
          Headers (one per line: Key: Value)
        </label>
        <textarea
          value={headersRaw}
          onChange={(e) => setHeadersRaw(e.target.value)}
          placeholder={"Authorization: Bearer token123\nContent-Type: application/json"}
          rows={3}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-text-primary font-mono placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue resize-y"
        />
      </div>

      {/* Send */}
      <button
        onClick={sendRequest}
        disabled={loading || !url.trim()}
        className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-5 py-2 text-sm font-medium text-white hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
      >
        {loading ? "Sending..." : "Send Request"}
      </button>

      {/* Response */}
      {response && (
        <div className="space-y-3 rounded-xl border border-border bg-bg-surface p-4">
          {/* Status badge */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${statusColor(response.status)}`}
            >
              {response.status} {response.statusText}
            </span>
          </div>

          {/* Body - keep dark for code readability */}
          <pre className="rounded-xl bg-slate-900 p-4 text-sm text-slate-100 font-mono overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(response.body, null, 2)}
          </pre>

          {/* Explanation */}
          <p className="text-sm text-text-secondary border-t border-border pt-3">
            {response.explanation}
          </p>
        </div>
      )}

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="h-2 rounded-full bg-bg-surface overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent-blue to-accent-green rounded-full transition-all duration-300"
            style={{ width: `${(discovered.size / totalEndpoints) * 100}%` }}
          />
        </div>
      </div>

      {completed && (
        <p className="text-sm text-accent-green font-semibold">
          All endpoints discovered! Exercise complete.
        </p>
      )}
    </div>
  );
}
