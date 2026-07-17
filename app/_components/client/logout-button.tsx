"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFeedback } from "./feedback-provider";

export function LogoutButton() {
  const router = useRouter();
  const { notify } = useFeedback();
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);
    try {
      const response = await fetch("/api/v1/auth/current-session", { method: "DELETE" });
      if (!response.ok && response.status !== 401) {
        const problem = await response.json().catch(() => null);
        throw new Error(problem?.detail ?? "退出登录失败");
      }
      router.replace("/login");
      router.refresh();
    } catch (error) {
      notify(error instanceof Error ? error.message : "退出登录失败", "error");
      setPending(false);
    }
  }

  return <button type="button" disabled={pending} onClick={logout}>{pending ? "正在退出…" : "退出登录"}</button>;
}
