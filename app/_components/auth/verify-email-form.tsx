"use client";

import type { FormEvent } from "react";
import { useAuthSubmit } from "./use-auth-submit";

export function VerifyEmailForm({ defaultToken = "" }: { defaultToken?: string }) {
  const mutation = useAuthSubmit({ path: "/auth/email-verifications", successMessage: "邮箱验证成功", redirectTo: "/verify-email/result" });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void mutation.submit({ token: String(new FormData(event.currentTarget).get("token") ?? "") });
  }
  return (
    <form className="space-y-4" onSubmit={submit}>
      <label className="form-control"><span className="label-text mb-2 font-semibold">邮箱验证凭据</span><input className="input w-full" name="token" type="password" defaultValue={defaultToken} required minLength={32} maxLength={2048} autoComplete="one-time-code" /></label>
      <button className="btn btn-primary w-full" disabled={mutation.pending}>{mutation.pending ? <span className="loading loading-spinner loading-sm" /> : null}验证邮箱</button>
    </form>
  );
}
