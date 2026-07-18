"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type MutationOptions = {
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  body?: unknown;
  ifMatch?: string;
  idempotent?: boolean;
  redirectTo?: string;
};

type Problem = { detail?: string; title?: string };

export function useApiMutation() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function mutate(options: MutationOptions, successMessage: string) {
    setPending(true);
    setError("");
    setSuccess("");
    try {
      const headers = new Headers({ Accept: "application/json" });
      if (options.body !== undefined) {
        headers.set("Content-Type", "application/json");
      }
      if (options.ifMatch) headers.set("If-Match", options.ifMatch);
      if (options.idempotent) headers.set("Idempotency-Key", crypto.randomUUID());
      const response = await fetch(`/api/v1${options.path}`, {
        method: options.method,
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
      });
      if (!response.ok) {
        const problem = await response.json().catch(() => null) as Problem | null;
        throw new Error(problem?.detail ?? problem?.title ?? "操作失败，请稍后重试。");
      }
      setSuccess(successMessage);
      if (options.redirectTo) router.push(options.redirectTo);
      router.refresh();
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "操作失败，请稍后重试。");
      return false;
    } finally {
      setPending(false);
    }
  }

  return { pending, error, success, mutate };
}
