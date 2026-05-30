"use client";

import { create } from "zustand";
import { useEffect, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

// ─── Toast Store ───

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  exiting?: boolean;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  markExiting: (id: string) => void;
}

const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      set((s) => ({
        toasts: s.toasts.map((t) =>
          t.id === id ? { ...t, exiting: true } : t
        ),
      }));
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
      }, 300);
    }, 4000);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  markExiting: (id) =>
    set((s) => ({
      toasts: s.toasts.map((t) =>
        t.id === id ? { ...t, exiting: true } : t
      ),
    })),
}));

// ─── Public API ───

export const toast = {
  success: (message: string) =>
    useToastStore.getState().addToast({ message, type: "success" }),
  error: (message: string) =>
    useToastStore.getState().addToast({ message, type: "error" }),
  info: (message: string) =>
    useToastStore.getState().addToast({ message, type: "info" }),
};

// ─── Toast Item ───

const typeConfig = {
  success: {
    icon: CheckCircle,
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/30",
    iconColor: "text-emerald-400",
  },
  error: {
    icon: AlertCircle,
    bg: "bg-rose-500/15",
    border: "border-rose-500/30",
    iconColor: "text-rose-400",
  },
  info: {
    icon: Info,
    bg: "bg-blue-500/15",
    border: "border-blue-500/30",
    iconColor: "text-blue-400",
  },
};

function ToastItem({ toast: t }: { toast: Toast }) {
  const { markExiting, removeToast } = useToastStore();
  const config = typeConfig[t.type];
  const Icon = config.icon;

  const dismiss = useCallback(() => {
    markExiting(t.id);
    setTimeout(() => removeToast(t.id), 300);
  }, [t.id, markExiting, removeToast]);

  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl
        ${config.bg} ${config.border}
        ${t.exiting ? "animate-slide-out" : "animate-slide-in"}
        max-w-sm w-full shadow-2xl
      `}
      role="alert"
    >
      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${config.iconColor}`} />
      <p className="text-sm text-white flex-1 leading-relaxed">{t.message}</p>
      <button
        onClick={dismiss}
        className="text-[#a0a0b0] hover:text-white transition-colors shrink-0 cursor-pointer"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Toast Container ───

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  // Add keyframes to document if not present
  useEffect(() => {
    if (typeof document === "undefined") return;
    const id = "toast-keyframes";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes toast-slide-in {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes toast-slide-out {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
      .animate-slide-in { animation: toast-slide-in 0.3s ease-out forwards; }
      .animate-slide-out { animation: toast-slide-out 0.3s ease-in forwards; }
    `;
    document.head.appendChild(style);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
