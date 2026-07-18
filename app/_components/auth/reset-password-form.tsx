"use client";

import type { FormEvent } from "react";
import { useAuthSubmit } from "./use-auth-submit";

export function ResetPasswordForm({ defaultToken = "" }: { defaultToken?: string }) {
  const mutation = useAuthSubmit({ path: "/auth/password-resets", successMessage: "密码已更新", redirectTo: "/login" });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    void mutation.submit({ token: String(data.get("token") ?? ""), newPassword: String(data.get("password") ?? "") });
  }
  return (
    <form className="space-y-4" onSubmit={submit}>
      <label className="form-control"><span className="label-text mb-2 font-semibold">密码重置凭据</span><input className="input w-full" name="token" type="password" defaultValue={defaultToken} required minLength={32} maxLength={2048} autoComplete="one-time-code" /></label>
      <label className="form-control"><span className="label-text mb-2 font-semibold">新密码</span><input className="input w-full" name="password" type="password" required minLength={8} maxLength={128} autoComplete="new-password" /></label>
      <button className="btn btn-primary w-full" disabled={mutation.pending}>{mutation.pending ? <span className="loading loading-spinner loading-sm" /> : null}更新密码</button>
    </form>
  );
}
