"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useFeedback } from "./feedback-provider";

type ActionButtonProps = {
  children: ReactNode;
  message?: string;
  dialogTitle?: string;
  dialogBody?: ReactNode;
  href?: string;
  className?: string;
  api?: { method: "POST" | "PUT" | "DELETE"; path: string; body?: unknown; idempotent?: boolean };
};

export function ActionButton({ children, message = "操作已完成", dialogTitle, dialogBody, href, className = "btn", api }: ActionButtonProps) {
  const { notify, open } = useFeedback();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function act() {
    if (dialogTitle) {
      open(dialogTitle, dialogBody ?? <p className="opacity-70">这是基于 API 契约的交互演示。</p>);
      return;
    }
    setPending(true);
    try {
      if (api) {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (api.idempotent) headers["Idempotency-Key"] = crypto.randomUUID();
        const response = await fetch(`/api/v1${api.path}`, {
          method: api.method,
          headers,
          body: api.method === "DELETE" ? undefined : JSON.stringify(api.body ?? {}),
        });
        if (!response.ok) throw new Error((await response.json().catch(() => null))?.detail ?? "API 请求失败");
      }
      notify(message);
      if (href) router.push(href);
      else if (api) router.refresh();
    } catch (error) {
      notify(error instanceof Error ? error.message : "操作失败", "error");
    } finally {
      setPending(false);
    }
  }

  return <button className={className} type="button" disabled={pending} onClick={act}>{pending ? <span className="loading loading-spinner loading-sm" /> : null}{children}</button>;
}
