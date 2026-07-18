"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFeedback } from "../client/feedback-provider";

export function useAuthSubmit({
  path,
  successMessage,
  redirectTo,
}: {
  path: string;
  successMessage: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const { notify } = useFeedback();
  const [pending, setPending] = useState(false);

  async function submit(body: unknown) {
    setPending(true);
    try {
      const response = await fetch(`/api/v1${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error((await response.json().catch(() => null))?.detail ?? "提交失败");
      notify(successMessage);
      if (redirectTo) {
        router.replace(redirectTo);
        router.refresh();
      }
      return true;
    } catch (error) {
      notify(error instanceof Error ? error.message : "提交失败", "error");
      return false;
    } finally {
      setPending(false);
    }
  }

  return { pending, submit };
}
