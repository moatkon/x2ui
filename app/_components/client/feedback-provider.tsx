"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type FeedbackKind = "success" | "info" | "warning" | "error";
type Feedback = {
  notify: (message: string, kind?: FeedbackKind) => void;
  open: (title: string, body: ReactNode) => void;
  close: () => void;
};

const FeedbackContext = createContext<Feedback | null>(null);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; kind: FeedbackKind } | null>(null);
  const [dialog, setDialog] = useState<{ title: string; body: ReactNode } | null>(null);
  const notify = useCallback((message: string, kind: FeedbackKind = "success") => {
    setToast({ message, kind });
    window.setTimeout(() => setToast(null), 2800);
  }, []);
  const value = useMemo<Feedback>(() => ({
    notify,
    open: (title, body) => setDialog({ title, body }),
    close: () => setDialog(null),
  }), [notify]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      {toast ? <div className="toast toast-end toast-bottom z-50" aria-live="polite"><div className={`alert alert-${toast.kind} border-2`}><span>{toast.message}</span></div></div> : null}
      {dialog ? <dialog className="modal modal-open"><div className="modal-box border-2 border-base-content/20"><h2 className="text-xl font-bold">{dialog.title}</h2><div className="mt-3">{dialog.body}</div><div className="modal-action"><button className="btn" type="button" onClick={() => setDialog(null)}>关闭</button></div></div><button className="modal-backdrop" type="button" aria-label="关闭对话框" onClick={() => setDialog(null)}>关闭</button></dialog> : null}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const value = useContext(FeedbackContext);
  if (!value) throw new Error("Interactive controls must be rendered inside FeedbackProvider");
  return value;
}
