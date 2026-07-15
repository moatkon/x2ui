"use client";

import { useEffect, useRef } from "react";
import { useFeedback } from "./feedback-provider";

export function ThemeToggle() {
  const { notify } = useFeedback();
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const cookieTheme = document.cookie.split("; ").find((item) => item.startsWith("x2post_theme="))?.split("=")[1];
    const stored = cookieTheme ? cookieTheme === "night" : localStorage.getItem("x2post-theme") === "night";
    if (inputRef.current) inputRef.current.checked = stored;
    document.documentElement.dataset.theme = stored ? "night" : "lofi";
    document.cookie = `x2post_theme=${stored ? "night" : "lofi"}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }, []);
  return <label className="btn btn-ghost btn-square" aria-label="切换深浅主题"><input ref={inputRef} className="sr-only" type="checkbox" onChange={(event) => { const next = event.target.checked; const theme = next ? "night" : "lofi"; document.documentElement.dataset.theme = theme; localStorage.setItem("x2post-theme", theme); document.cookie = `x2post_theme=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`; notify(`已切换为${next ? "深色" : "浅色"}主题`, "info"); }} /><span aria-hidden="true">◐</span></label>;
}
