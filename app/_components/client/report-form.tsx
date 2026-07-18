"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { useApiMutation } from "./use-api-mutation";

const reasons = [
  ["HARASSMENT", "骚扰或人身攻击"],
  ["HATE", "仇恨或歧视"],
  ["SPAM", "垃圾信息"],
  ["DANGEROUS_OR_ILLEGAL", "危险或违法内容"],
  ["PRIVACY", "侵犯隐私"],
  ["IMPERSONATION", "冒充他人"],
  ["OTHER", "其他"],
] as const;

export function ReportForm() {
  const search = useSearchParams();
  const mutation = useApiMutation();
  const targetType = search.get("targetType") ?? "";
  const targetId = search.get("targetId") ?? "";
  const targetReady = targetType.length > 0 && targetId.length > 0;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    await mutation.mutate({
      method: "POST",
      path: "/reports",
      idempotent: true,
      body: {
        target: { type: targetType, id: targetId },
        reason: String(values.get("reason") ?? ""),
        details: String(values.get("details") ?? ""),
        truthfulConfirmation: values.has("truthfulConfirmation"),
      },
      redirectTo: "/reports",
    }, "举报已提交。");
  }

  return <form className="space-y-4" onSubmit={submit}>
    {!targetReady ? <p className="alert alert-warning">缺少举报目标，请从帖子、评论或用户页面重新进入举报流程。</p> : <p className="text-sm opacity-70">目标类型：{targetType} · 目标 ID：{targetId}</p>}
    <label className="form-control">
      <span className="label-text mb-2 font-semibold">原因</span>
      <select className="select w-full" name="reason" required defaultValue="">
        <option value="" disabled>请选择原因</option>
        {reasons.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
      </select>
    </label>
    <label className="form-control">
      <span className="label-text mb-2 font-semibold">补充说明</span>
      <textarea className="textarea min-h-32 w-full" name="details" maxLength={1000} placeholder="说明具体位置和影响，避免重复粘贴敏感内容" />
      <span className="label-text-alt mt-1 opacity-60">最多 1,000 字。</span>
    </label>
    <label className="label cursor-pointer justify-start gap-3">
      <input className="checkbox" name="truthfulConfirmation" type="checkbox" required />
      <span>我确认信息真实，并理解恶意举报可能受到限制。</span>
    </label>
    {mutation.error ? <p className="alert alert-error text-sm" role="alert">{mutation.error}</p> : null}
    <div className="flex justify-end gap-2">
      <Link className="btn" href="/">取消</Link>
      <button className="btn btn-primary" type="submit" disabled={!targetReady || mutation.pending}>提交举报</button>
    </div>
  </form>;
}
