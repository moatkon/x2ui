"use client";

import type { FormEvent } from "react";
import { useAuthSubmit } from "./use-auth-submit";

export function RegisterForm() {
  const mutation = useAuthSubmit({ path: "/auth/registrations", successMessage: "账号已创建", redirectTo: "/verify-email" });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    void mutation.submit({
      userName: String(data.get("userName") ?? ""),
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
    });
  }
  return (
    <form className="space-y-4" onSubmit={submit}>
      <label className="form-control"><span className="label-text mb-2 font-semibold">用户名</span><input className="input w-full" name="userName" required minLength={3} maxLength={32} autoComplete="username" /></label>
      <label className="form-control"><span className="label-text mb-2 font-semibold">邮箱</span><input className="input w-full" name="email" type="email" required autoComplete="email" /></label>
      <label className="form-control"><span className="label-text mb-2 font-semibold">密码</span><input className="input w-full" name="password" type="password" required minLength={8} maxLength={128} autoComplete="new-password" /></label>
      <button className="btn btn-primary w-full" disabled={mutation.pending}>{mutation.pending ? <span className="loading loading-spinner loading-sm" /> : null}创建账号</button>
    </form>
  );
}
