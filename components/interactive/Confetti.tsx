"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

interface ConfettiProps {
  trigger: boolean;
  duration?: number;
}

const COLORS = ["#3b82f6", "#22c55e", "#eab308", "#ef4444", "#8b5cf6", "#f97316"];

interface Piece {
  id: number;
  left: number;
  color: string;
  delay: number;
  size: number;
  isCircle: boolean;
  fallDuration: number;
}

function generatePieces(): Piece[] {
  return Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    delay: Math.random() * 0.5,
    size: Math.random() * 8 + 4,
    isCircle: Math.random() > 0.5,
    fallDuration: 2 + Math.random(),
  }));
}

function useConfettiStore(trigger: boolean, duration: number) {
  const storeRef = useRef({
    pieces: [] as Piece[],
    listeners: new Set<() => void>(),
  });

  const subscribe = (callback: () => void) => {
    storeRef.current.listeners.add(callback);
    return () => storeRef.current.listeners.delete(callback);
  };

  const getSnapshot = () => storeRef.current.pieces;

  useEffect(() => {
    if (!trigger) return;
    storeRef.current.pieces = generatePieces();
    storeRef.current.listeners.forEach((l) => l());
    const timer = setTimeout(() => {
      storeRef.current.pieces = [];
      storeRef.current.listeners.forEach((l) => l());
    }, duration);
    return () => clearTimeout(timer);
  }, [trigger, duration]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function Confetti({ trigger, duration = 3000 }: ConfettiProps) {
  const pieces = useConfettiStore(trigger, duration);

  if (pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.left}%`,
            top: -20,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.isCircle ? "50%" : "2px",
            animation: `confetti-fall ${p.fallDuration}s linear ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}
