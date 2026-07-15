"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useFeedback } from "./feedback-provider";

export type AuthFormType = "login" | "register" | "verify" | "forgot" | "reset";

const labels: Record<AuthFormType, string> = {
  login: "登录",
  register: "创建账号",
  verify: "验证邮箱",
  forgot: "发送重置说明",
  reset: "更新密码",
};

function requestFor(type: AuthFormType, form: FormData) {
  if (type === "login") return ["/auth/sessions", { login: String(form.get("login") ?? ""), password: String(form.get("password") ?? "") }] as const;
  if (type === "register") return ["/auth/registrations", { userName: String(form.get("userName") ?? ""), email: String(form.get("email") ?? ""), password: String(form.get("password") ?? "") }] as const;
  if (type === "verify") return ["/auth/email-verifications", { token: String(form.get("token") ?? "") }] as const;
  if (type === "forgot") return ["/auth/password-reset-deliveries", { email: String(form.get("email") ?? "") }] as const;
  return ["/auth/password-resets", { token: String(form.get("token") ?? ""), newPassword: String(form.get("password") ?? "") }] as const;
}

export function AuthForm({ type }: { type: AuthFormType }) {
  const { notify } = useFeedback();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const [path, body] = requestFor(type, new FormData(event.currentTarget));
    try {
      const response = await fetch(`/api/v1${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error((await response.json().catch(() => null))?.detail ?? "提交失败");
      notify(type === "forgot" ? "如果邮箱已注册，将收到重置说明" : `${labels[type]}成功`);
      router.push(type === "login" ? "/auth/recover-task" : type === "register" ? "/verify-email" : type === "reset" ? "/login" : "/verify-email/result");
    } catch (error) {
      notify(error instanceof Error ? error.message : "提交失败", "error");
    } finally {
      setPending(false);
    }
  }

  return <form className="space-y-4" onSubmit={submit}>{type === "register" ? <label className="form-control"><span className="label-text mb-2 font-semibold">用户名</span><input className="input w-full" name="userName" defaultValue="linmo" required minLength={3} maxLength={32} autoComplete="username" /></label> : null}{type !== "verify" && type !== "reset" ? <label className="form-control"><span className="label-text mb-2 font-semibold">邮箱{type === "login" ? "或用户名" : ""}</span><input className="input w-full" name={type === "login" ? "login" : "email"} type={type === "login" ? "text" : "email"} defaultValue="linmo@example.com" required autoComplete={type === "login" ? "username" : "email"} /></label> : null}{type === "verify" || type === "reset" ? <input name="token" type="hidden" value={type === "verify" ? "mock-verification-token-20260715" : "mock-password-reset-token-20260715"} /> : null}{["login", "register", "reset"].includes(type) ? <label className="form-control"><span className="label-text mb-2 font-semibold">密码</span><input className="input w-full" name="password" type="password" defaultValue="prototype-only" required minLength={8} maxLength={128} autoComplete={type === "login" ? "current-password" : "new-password"} /></label> : null}<button className="btn btn-primary w-full" disabled={pending}>{pending ? <span className="loading loading-spinner loading-sm" /> : null}{labels[type]}</button>{type === "login" ? <div className="flex justify-between text-sm"><Link className="link" href="/register">创建账号</Link><Link className="link" href="/forgot-password">忘记密码</Link></div> : null}</form>;
}
