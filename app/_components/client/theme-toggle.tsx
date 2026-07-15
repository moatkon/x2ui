"use client";

import { useEffect, useRef } from "react";
import { useFeedback } from "./feedback-provider";

export function ThemeToggle() {
  const { notify } = useFeedback();
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const stored = localStorage.getItem("x2post-theme") === "night";
    if (inputRef.current) inputRef.current.checked = stored;
    document.documentElement.dataset.theme = stored ? "night" : "lofi";
  }, []);
  return <label className="btn btn-ghost btn-square" aria-label="切换深浅主题"><input ref={inputRef} className="sr-only" type="checkbox" onChange={(event) => { const next = event.target.checked; document.documentElement.dataset.theme = next ? "night" : "lofi"; localStorage.setItem("x2post-theme", next ? "night" : "lofi"); notify(`已切换为${next ? "深色" : "浅色"}主题`, "info"); }} /><span aria-hidden="true">◐</span></label>;
}
