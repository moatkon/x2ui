"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useAuthSubmit } from "./use-auth-submit";

export function LoginForm({ returnTo = "/" }: { returnTo?: string }) {
  const mutation = useAuthSubmit({ path: "/auth/sessions", successMessage: "登录成功", redirectTo: returnTo });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    void mutation.submit({ login: String(data.get("login") ?? ""), password: String(data.get("password") ?? "") });
  }
  return (
    <form className="space-y-4" onSubmit={submit}>
      <label className="form-control"><span className="label-text mb-2 font-semibold">邮箱或用户名</span><input className="input w-full" name="login" required autoComplete="username" /></label>
      <label className="form-control"><span className="label-text mb-2 font-semibold">密码</span><input className="input w-full" name="password" type="password" required minLength={8} maxLength={128} autoComplete="current-password" /></label>
      <button className="btn btn-primary w-full" disabled={mutation.pending}>{mutation.pending ? <span className="loading loading-spinner loading-sm" /> : null}登录</button>
      <div className="flex justify-between text-sm"><Link className="link" href="/register">创建账号</Link><Link className="link" href="/forgot-password">忘记密码</Link></div>
    </form>
  );
}
