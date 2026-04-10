"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  emoji?: string;
  type?: "xp" | "achievement" | "levelup" | "streak";
  show: boolean;
  onClose: () => void;
}

export function Toast({ message, emoji = "\u2728", type = "xp", show, onClose }: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const bgColors = {
    xp: "from-accent-blue/20 to-accent-green/20 border-accent-blue/40",
    achievement: "from-accent-yellow/20 to-accent-purple/20 border-accent-yellow/40",
    levelup: "from-accent-green/20 to-accent-blue/20 border-accent-green/40",
    streak: "from-orange-500/20 to-red-500/20 border-orange-500/40",
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-bounce-in">
      <div className={`bg-gradient-to-r ${bgColors[type]} border rounded-xl px-5 py-3 shadow-lg backdrop-blur-sm`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{emoji}</span>
          <span className="text-sm font-semibold text-text-primary">{message}</span>
        </div>
      </div>
    </div>
  );
}
