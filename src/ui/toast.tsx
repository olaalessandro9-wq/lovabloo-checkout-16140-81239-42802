import React, { createContext, useContext, useState } from "react";
import { createPortal } from "react-dom";

type Toast = { id: number; text: string; kind?: "ok" | "err" };
type Api = { show: (text: string, kind?: "ok" | "err") => void };

const Ctx = createContext<Api | null>(null);

export function useToast() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useToast must be used within <ToastProvider>");
  return v;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const show = (text: string, kind: "ok" | "err" = "ok") => {
    const id = Date.now();
    setItems((s) => [...s, { id, text, kind }]);
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 4000);
  };
  return (
    <Ctx.Provider value={{ show }}>
      {children}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-[1100] space-y-2">
          {items.map((t) => (
            <div
              key={t.id}
              className={`rounded-lg px-3 py-2 text-sm shadow ${
                t.kind === "ok"
                  ? "bg-emerald-600 text-white"
                  : "bg-red-600 text-white"
              }`}
            >
              {t.text}
            </div>
          ))}
        </div>,
        document.body
      )}
    </Ctx.Provider>
  );
}
