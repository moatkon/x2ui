"use client";

import type { FormEvent } from "react";
import type { Enforcement } from "@/app/_server/account-data";
import { useApiMutation } from "./use-api-mutation";

export function AppealForm({ enforcements }: { enforcements: Enforcement[] }) {
  const mutation = useApiMutation();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    await mutation.mutate({
      method: "POST",
      path: "/appeals",
      idempotent: true,
      body: {
        enforcementId: String(values.get("enforcementId") ?? ""),
        reason: String(values.get("reason") ?? ""),
        statement: String(values.get("statement") ?? ""),
      },
      redirectTo: "/appeals",
    }, "申诉已提交。");
  }

  if (enforcements.length === 0) {
    return <p className="alert">当前没有可申诉的处置。</p>;
  }

  return <form className="space-y-4" onSubmit={submit}>
    <label className="form-control">
      <span className="label-text mb-2 font-semibold">关联处置</span>
      <select className="select w-full" name="enforcementId" required>
        {enforcements.map((item) => <option value={item.id} key={item.id}>{item.kind} · {item.subject.label}</option>)}
      </select>
    </label>
    <label className="form-control">
      <span className="label-text mb-2 font-semibold">申诉理由</span>
      <select className="select w-full" name="reason" required defaultValue="">
        <option value="" disabled>请选择申诉理由</option>
        <option value="CONTEXT_MISUNDERSTOOD">上下文理解有误</option>
        <option value="SCOPE_INAPPROPRIATE">处置范围不合适</option>
        <option value="NEW_EVIDENCE">补充新证据</option>
        <option value="OTHER">其他</option>
      </select>
    </label>
    <textarea className="textarea min-h-32 w-full" name="statement" maxLength={2000} placeholder="说明你希望复核的事实与依据" required />
    {mutation.error ? <p className="alert alert-error text-sm" role="alert">{mutation.error}</p> : null}
    <div className="flex justify-end"><button className="btn btn-primary" type="submit" disabled={mutation.pending}>提交申诉</button></div>
  </form>;
}
