"use client";

import { useState, useCallback, useMemo } from "react";
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  type Node,
  type Edge,
  type Connection,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type BlockType = "trigger" | "ai" | "action" | "notify";

interface BlockConfig {
  type: BlockType;
  label: string;
}

interface WorkflowBuilderProps {
  availableBlocks: BlockConfig[];
  expectedFlow?: BlockType[];
  onComplete?: () => void;
}

/* ------------------------------------------------------------------ */
/* Colors                                                              */
/* ------------------------------------------------------------------ */

const BLOCK_COLORS: Record<BlockType, string> = {
  trigger: "#89b4fa",
  ai: "#a6e3a1",
  action: "#f9e2af",
  notify: "#cba6f7",
};

const BLOCK_LABELS: Record<BlockType, string> = {
  trigger: "Trigger",
  ai: "AI Step",
  action: "Action",
  notify: "Notify",
};

/* ------------------------------------------------------------------ */
/* Custom Node                                                         */
/* ------------------------------------------------------------------ */

interface WorkflowNodeData {
  label: string;
  blockType: BlockType;
  active: boolean;
  [key: string]: unknown;
}

function WorkflowNode({ data }: NodeProps<Node<WorkflowNodeData>>) {
  const color = BLOCK_COLORS[data.blockType] ?? "#cdd6f4";
  const isActive = data.active;

  return (
    <div
      className="rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300"
      style={{
        background: isActive ? `${color}30` : "#1e1e2e",
        border: `2px solid ${color}`,
        color: "#cdd6f4",
        boxShadow: isActive ? `0 0 20px ${color}60` : "none",
        minWidth: 140,
        textAlign: "center",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: color }}
      />
      <div className="text-xs opacity-60 mb-1">
        {BLOCK_LABELS[data.blockType]}
      </div>
      <div>{data.label}</div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: color }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Component                                                      */
/* ------------------------------------------------------------------ */

export function WorkflowBuilder({
  availableBlocks,
  expectedFlow,
  onComplete,
}: WorkflowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<WorkflowNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [running, setRunning] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [completed, setCompleted] = useState(false);
  const [validationMsg, setValidationMsg] = useState<string | null>(null);

  const nodeTypes = useMemo(() => ({ workflow: WorkflowNode }), []);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges]
  );

  /* Add a block to the canvas */
  function addBlock(block: BlockConfig) {
    const id = `node-${Date.now()}`;
    const yOffset = nodes.length * 100 + 50;

    const newNode: Node<WorkflowNodeData> = {
      id,
      type: "workflow",
      position: { x: 250, y: yOffset },
      data: {
        label: block.label,
        blockType: block.type,
        active: false,
      },
    };

    setNodes((nds) => [...nds, newNode]);
  }

  /* Build execution order by traversing edges from source nodes */
  function getExecutionOrder(): Node<WorkflowNodeData>[] {
    if (nodes.length === 0) return [];

    // Find nodes that have no incoming edges (start nodes)
    const targetIds = new Set(edges.map((e) => e.target));
    const startNodes = nodes.filter((n) => !targetIds.has(n.id));

    if (startNodes.length === 0) return [...nodes];

    // BFS from start nodes
    const visited = new Set<string>();
    const order: Node<WorkflowNodeData>[] = [];
    const queue = [...startNodes];

    while (queue.length > 0) {
      const node = queue.shift()!;
      if (visited.has(node.id)) continue;
      visited.add(node.id);
      order.push(node);

      const outgoing = edges.filter((e) => e.source === node.id);
      for (const edge of outgoing) {
        const target = nodes.find((n) => n.id === edge.target);
        if (target && !visited.has(target.id)) {
          queue.push(target);
        }
      }
    }

    // Include unconnected nodes at the end
    for (const n of nodes) {
      if (!visited.has(n.id)) order.push(n);
    }

    return order;
  }

  /* Validate flow against expected order */
  function validateFlow(order: Node<WorkflowNodeData>[]): boolean {
    if (!expectedFlow) return true;

    const actualTypes = order.map((n) => n.data.blockType);
    if (actualTypes.length !== expectedFlow.length) return false;

    return actualTypes.every((t, i) => t === expectedFlow[i]);
  }

  /* Run animation */
  async function handleRun() {
    if (nodes.length === 0) return;
    setRunning(true);
    setValidationMsg(null);
    setActiveIdx(-1);

    const order = getExecutionOrder();

    // Validate
    if (expectedFlow) {
      const valid = validateFlow(order);
      if (!valid) {
        setValidationMsg(
          `Flow does not match expected order. Expected: ${expectedFlow.join(" -> ")}`
        );
        setRunning(false);
        return;
      }
    }

    // Animate through nodes
    for (let i = 0; i < order.length; i++) {
      setActiveIdx(i);
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: { ...n.data, active: n.id === order[i].id },
        }))
      );
      await new Promise((r) => setTimeout(r, 800));
    }

    // Clear active state
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, active: false },
      }))
    );
    setActiveIdx(-1);
    setRunning(false);

    if (!completed) {
      setCompleted(true);
      setValidationMsg("Workflow executed successfully!");
      onComplete?.();
    }
  }

  function handleClear() {
    setNodes([]);
    setEdges([]);
    setActiveIdx(-1);
    setValidationMsg(null);
    setCompleted(false);
  }

  return (
    <div className="rounded-xl border border-border-default bg-bg-secondary overflow-hidden">
      {/* Block palette */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-[#181825] border-b border-white/10">
        <span className="text-xs text-text-muted mr-2">Add blocks:</span>
        {availableBlocks.map((block, i) => (
          <button
            key={i}
            onClick={() => addBlock(block)}
            disabled={running}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
            style={{
              background: `${BLOCK_COLORS[block.type]}20`,
              color: BLOCK_COLORS[block.type],
              border: `1px solid ${BLOCK_COLORS[block.type]}50`,
            }}
          >
            + {block.label}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div className="h-[400px] bg-[#1e1e2e]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
          style={{ background: "#1e1e2e" }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#181825] border-t border-white/10">
        <button
          onClick={handleRun}
          disabled={running || nodes.length === 0}
          className="text-xs px-4 py-1.5 rounded-lg bg-accent-green/20 text-accent-green hover:bg-accent-green/30 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {running ? `Running step ${activeIdx + 1}/${nodes.length}...` : "Run"}
        </button>
        <button
          onClick={handleClear}
          disabled={running}
          className="text-xs px-3 py-1.5 rounded bg-white/10 text-text-muted hover:text-white transition-colors disabled:opacity-50"
        >
          Clear
        </button>

        {validationMsg && (
          <span
            className={`ml-auto text-xs font-medium ${
              validationMsg.includes("successfully")
                ? "text-accent-green"
                : "text-red-400"
            }`}
          >
            {validationMsg}
          </span>
        )}
      </div>
    </div>
  );
}
