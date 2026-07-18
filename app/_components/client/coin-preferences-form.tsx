"use client";

import type { FormEvent } from "react";
import type { CoinPreferences } from "@/app/_server/coin-data";
import { useApiMutation } from "./use-api-mutation";

const fields = [
  ["rewardNotifications", "奖励通知"],
  ["bountyNotifications", "悬赏通知"],
  ["holdNotifications", "风控保留通知"],
  ["showPublicContributions", "公开贡献记录"],
  ["requireReauthForHighRisk", "高风险操作二次验证"],
] as const;

export function CoinPreferencesForm({ value, etag }: { value: CoinPreferences; etag?: string }) {
  const mutation = useApiMutation();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await mutation.mutate({
      method: "PATCH",
      path: "/users/me/coin-preferences",
      ifMatch: etag ?? `"${value.version}"`,
      body: Object.fromEntries(fields.map(([name]) => [name, data.has(name)])),
    }, "金币设置已保存。");
  }
  return <form onSubmit={submit}><div className="space-y-4">{fields.map(([name, label]) => <label className="flex items-center justify-between gap-4" key={name}><strong>{label}</strong><input className="toggle" name={name} type="checkbox" defaultChecked={value[name]} /></label>)}</div>{mutation.error ? <p className="alert alert-error mt-4">{mutation.error}</p> : null}<div className="mt-5 flex justify-end"><button className="btn btn-primary" type="submit" disabled={mutation.pending}>保存</button></div></form>;
}
