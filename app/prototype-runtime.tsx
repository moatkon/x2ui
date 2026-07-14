"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    UI?: unknown;
  }
}

export function PrototypeRuntime() {
  useEffect(() => {
    if (!document.getElementById("app")) return;
    if (document.documentElement.dataset.x2RuntimeLoaded === "true") return;
    document.documentElement.dataset.x2RuntimeLoaded = "true";

    const load = (src: string) => new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`无法加载 ${src}`));
      document.body.appendChild(script);
    });

    const scripts = [
      "/assets/ui.js",
      "/assets/app-core.js",
      "/assets/pages/community.js",
      "/assets/pages/account.js",
      "/assets/pages/coin.js",
      "/assets/pages/journey.js",
      "/assets/app-runtime.js",
    ];

    void scripts.reduce((pending, src) => pending.then(() => load(src)), Promise.resolve())
      .catch((error) => {
        console.error("X2Post 原型交互层加载失败", error);
      });
  }, []);

  return null;
}
