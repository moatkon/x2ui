"use client";

import { useState, type FormEvent } from "react";
import { useAuthSubmit } from "./use-auth-submit";

export function ForgotPasswordForm() {
  const mutation = useAuthSubmit({ path: "/auth/password-reset-deliveries", successMessage: "如果邮箱已注册，将收到重置说明" });
  const [submitted, setSubmitted] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const ok = await mutation.submit({ email: String(new FormData(event.currentTarget).get("email") ?? "") });
    if (ok) setSubmitted(true);
  }
  return (
    <form className="space-y-4" onSubmit={submit}>
      <label className="form-control"><span className="label-text mb-2 font-semibold">注册邮箱</span><input className="input w-full" name="email" type="email" required autoComplete="email" /></label>
      {submitted ? <p className="alert alert-success text-sm">如果该邮箱已注册，重置说明已经发送。</p> : null}
      <button className="btn btn-primary w-full" disabled={mutation.pending}>{mutation.pending ? <span className="loading loading-spinner loading-sm" /> : null}发送重置说明</button>
    </form>
  );
}
