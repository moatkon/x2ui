"use client";

import type { FormEvent } from "react";
import { useApiMutation } from "./use-api-mutation";

export function AppealSupplementForm({ appealId }: { appealId: string }) {
  const mutation = useApiMutation();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const ok = await mutation.mutate({
      method: "POST",
      path: `/appeals/${encodeURIComponent(appealId)}/supplements`,
      idempotent: true,
      body: {
        statement: String(values.get("statement") ?? ""),
      },
    }, "补充说明已提交。");
    if (ok) form.reset();
  }
  return <form className="space-y-3" onSubmit={submit}>
    <textarea className="textarea min-h-28 w-full" name="statement" maxLength={2000} placeholder="只补充与复核有关的新事实" required />
    {mutation.error ? <p className="alert alert-error text-sm" role="alert">{mutation.error}</p> : null}
    {mutation.success ? <p className="alert alert-success text-sm" role="status">{mutation.success}</p> : null}
    <div className="flex justify-end"><button className="btn btn-primary" type="submit" disabled={mutation.pending}>提交补充</button></div>
  </form>;
}
