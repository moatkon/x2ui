"use client";

import type { FormEvent } from "react";
import type { PrivacyPreferences } from "@/app/_server/account-data";
import { useApiMutation } from "./use-api-mutation";

const fields = [
  ["mentionable", "允许出现在提及建议中", "被屏蔽的用户始终看不到你。"],
  ["showFollowing", "展示关注列表", "关闭后仅你自己可见。"],
  ["indexPublicProfile", "搜索引擎收录个人页", "只影响公开个人页。"],
] as const;

export function PrivacySettingsForm({
  preferences,
  etag,
}: {
  preferences: PrivacyPreferences;
  etag?: string;
}) {
  const mutation = useApiMutation();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    await mutation.mutate({
      method: "PATCH",
      path: "/users/me/privacy-preferences",
      ifMatch: etag ?? `"${preferences.version}"`,
      body: Object.fromEntries(fields.map(([name]) => [name, values.has(name)])),
    }, "隐私设置已保存。");
  }

  return <form onSubmit={submit}>
    <div className="space-y-5">
      {fields.map(([name, title, description]) => <label className="flex min-h-11 items-center justify-between gap-4" key={name}>
        <span><strong>{title}</strong><small className="block opacity-65">{description}</small></span>
        <input className="toggle" type="checkbox" name={name} defaultChecked={preferences[name]} />
      </label>)}
    </div>
    {mutation.error ? <p className="alert alert-error mt-5 text-sm" role="alert">{mutation.error}</p> : null}
    {mutation.success ? <p className="alert alert-success mt-5 text-sm" role="status">{mutation.success}</p> : null}
    <div className="mt-5 flex justify-end"><button className="btn btn-primary" type="submit" disabled={mutation.pending}>保存</button></div>
  </form>;
}
