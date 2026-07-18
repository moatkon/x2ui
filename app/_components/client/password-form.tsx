"use client";

import type { FormEvent } from "react";
import { useApiMutation } from "./use-api-mutation";

export function PasswordForm() {
  const mutation = useApiMutation();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const newPassword = String(values.get("newPassword") ?? "");
    if (newPassword !== String(values.get("confirmation") ?? "")) {
      form.querySelector<HTMLInputElement>("[name=confirmation]")
        ?.setCustomValidity("两次输入的新密码不一致。");
      form.reportValidity();
      return;
    }
    const ok = await mutation.mutate({
      method: "PUT",
      path: "/users/me/password",
      body: {
        currentPassword: String(values.get("currentPassword") ?? ""),
        newPassword,
      },
      idempotent: true,
      redirectTo: "/settings/sessions",
    }, "密码已更新。");
    if (ok) form.reset();
  }

  return <form className="space-y-4" onSubmit={submit}>
    <input className="input w-full" name="currentPassword" type="password" autoComplete="current-password" placeholder="当前密码" maxLength={128} required />
    <input className="input w-full" name="newPassword" type="password" autoComplete="new-password" placeholder="新密码" minLength={8} maxLength={128} required />
    <p className="text-sm opacity-60">至少 8 位，避免与其他网站重复。</p>
    <input className="input w-full" name="confirmation" type="password" autoComplete="new-password" placeholder="确认新密码" minLength={8} maxLength={128} onChange={(event) => event.currentTarget.setCustomValidity("")} required />
    {mutation.error ? <p className="alert alert-error text-sm" role="alert">{mutation.error}</p> : null}
    <div className="flex justify-end"><button className="btn btn-primary" type="submit" disabled={mutation.pending}>更新密码</button></div>
  </form>;
}
