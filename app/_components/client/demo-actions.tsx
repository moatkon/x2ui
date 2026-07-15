"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { nodes } from "@/lib/mock-data";

type Feedback = { notify: (message: string, kind?: "success" | "info" | "warning" | "error") => void; open: (title: string, body: ReactNode) => void; close: () => void };
const FeedbackContext = createContext<Feedback | null>(null);

export function DemoFeedbackProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; kind: string } | null>(null);
  const [dialog, setDialog] = useState<{ title: string; body: ReactNode } | null>(null);
  const notify = useCallback((message: string, kind: "success" | "info" | "warning" | "error" = "success") => {
    setToast({ message, kind });
    window.setTimeout(() => setToast(null), 2800);
  }, []);
  const value = useMemo(() => ({ notify, open: (title: string, body: ReactNode) => setDialog({ title, body }), close: () => setDialog(null) }), [notify]);
  return <FeedbackContext.Provider value={value}>{children}{toast ? <div className="toast toast-end toast-bottom z-50" aria-live="polite"><div className={`alert alert-${toast.kind} border-2`}><span>{toast.message}</span></div></div> : null}{dialog ? <dialog className="modal modal-open"><div className="modal-box border-2 border-base-content/20"><h2 className="text-xl font-bold">{dialog.title}</h2><div className="mt-3">{dialog.body}</div><div className="modal-action"><button className="btn" type="button" onClick={() => setDialog(null)}>关闭</button></div></div><button className="modal-backdrop" aria-label="关闭对话框" onClick={() => setDialog(null)}>关闭</button></dialog> : null}</FeedbackContext.Provider>;
}

function useFeedback() {
  const value = useContext(FeedbackContext);
  if (!value) throw new Error("Demo actions must be rendered inside DemoFeedbackProvider");
  return value;
}

type ActionButtonProps = {
  children: ReactNode;
  message?: string;
  dialogTitle?: string;
  dialogBody?: ReactNode;
  href?: string;
  className?: string;
  api?: { method: "POST" | "PUT" | "DELETE"; path: string; body?: unknown; idempotent?: boolean };
};

export function ActionButton({ children, message = "操作已完成", dialogTitle, dialogBody, href, className = "btn", api }: ActionButtonProps) {
  const { notify, open } = useFeedback();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const act = async () => {
    if (dialogTitle) { open(dialogTitle, dialogBody ?? <p className="opacity-70">这是基于 API 契约的交互演示。</p>); return; }
    setPending(true);
    try {
      if (api) {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (api.idempotent) headers["Idempotency-Key"] = crypto.randomUUID();
        const response = await fetch(`/api/v1${api.path}`, { method: api.method, headers, body: api.method === "DELETE" ? undefined : JSON.stringify(api.body ?? {}) });
        if (!response.ok) throw new Error((await response.json().catch(() => null))?.detail ?? "Mock API 请求失败");
      }
      notify(message);
      if (href) router.push(href);
    } catch (error) {
      notify(error instanceof Error ? error.message : "操作失败", "error");
    } finally { setPending(false); }
  };
  return <button className={className} type="button" disabled={pending} onClick={act}>{pending ? <span className="loading loading-spinner loading-sm" /> : null}{children}</button>;
}

export function ThemeToggle() {
  const { notify } = useFeedback();
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const stored = localStorage.getItem("x2post-theme") === "night";
    if (inputRef.current) inputRef.current.checked = stored;
    document.documentElement.dataset.theme = stored ? "night" : "lofi";
  }, []);
  return <label className="btn btn-ghost btn-square" aria-label="切换深浅主题"><input ref={inputRef} className="sr-only" type="checkbox" onChange={(event) => { const next = event.target.checked; document.documentElement.dataset.theme = next ? "night" : "lofi"; localStorage.setItem("x2post-theme", next ? "night" : "lofi"); notify(`已切换为${next ? "深色" : "浅色"}主题`, "info"); }} /><span aria-hidden="true">◐</span></label>;
}

export function AuthForm({ type }: { type: "login" | "register" | "verify" | "forgot" | "reset" }) {
  const { notify } = useFeedback();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const labels = { login: "登录", register: "创建账号", verify: "验证邮箱", forgot: "发送重置说明", reset: "更新密码" };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setPending(true);
    const requests = { login: ["/auth/sessions", { login: "linmo@example.com", password: "prototype-only" }], register: ["/auth/registrations", { userName: "linmo", email: "linmo@example.com", password: "prototype-only" }], verify: ["/auth/email-verifications", { token: "mock-verification-token" }], forgot: ["/auth/password-reset-deliveries", { email: "linmo@example.com" }], reset: ["/auth/password-resets", { token: "mock-reset-token", newPassword: "prototype-only" }] } as const;
    const [path, body] = requests[type];
    try {
      const response = await fetch(`/api/v1${path}`, { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify(body) });
      if (!response.ok) throw new Error((await response.json().catch(() => null))?.detail ?? "提交失败");
      notify(type === "forgot" ? "如果邮箱已注册，将收到重置说明" : `${labels[type]}成功`);
      router.push(type === "login" ? "/auth/recover-task" : type === "register" ? "/verify-email" : type === "reset" ? "/login" : "/verify-email/result");
    } catch (error) { notify(error instanceof Error ? error.message : "提交失败", "error"); } finally { setPending(false); }
  };
  return <form className="space-y-4" onSubmit={submit}>{type === "register" ? <label className="form-control"><span className="label-text mb-2 font-semibold">用户名</span><input className="input w-full" name="userName" defaultValue="linmo" required /></label> : null}{type !== "verify" && type !== "reset" ? <label className="form-control"><span className="label-text mb-2 font-semibold">邮箱{type === "login" ? "或用户名" : ""}</span><input className="input w-full" name="email" type={type === "login" ? "text" : "email"} defaultValue="linmo@example.com" required /></label> : null}{["login", "register", "reset"].includes(type) ? <label className="form-control"><span className="label-text mb-2 font-semibold">密码</span><input className="input w-full" name="password" type="password" defaultValue="prototype-only" required minLength={8} /></label> : null}<button className="btn btn-primary w-full" disabled={pending}>{pending ? <span className="loading loading-spinner loading-sm" /> : null}{labels[type]}</button>{type === "login" ? <div className="flex justify-between text-sm"><Link className="link" href="/register">创建账号</Link><Link className="link" href="/forgot-password">忘记密码</Link></div> : null}</form>;
}

export function ComposeForm({ compact = false, initialNode = "product", initialChild = "" }: { compact?: boolean; initialNode?: string; initialChild?: string }) {
  const { notify, open } = useFeedback();
  const router = useRouter();
  const [parentSlug, setParentSlug] = useState(initialNode);
  const [childSlug, setChildSlug] = useState(initialChild);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const parent = nodes.find((node) => node.slug === parentSlug) ?? nodes[0];
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!body.trim()) { notify("先写下一段真实内容", "info"); return; }
    setPending(true);
    try {
      const response = await fetch("/api/v1/posts", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify({ title: compact ? null : title, bodyMarkdown: body, parentNodeSlug: parent.slug, childNodeSlug: childSlug || null, confirmedImmutable: true }) });
      if (!response.ok) throw new Error((await response.json().catch(() => null))?.detail ?? "发布失败");
      notify(`已发布到 ${parent.name}${childSlug ? ` / ${parent.children.find((item) => item.slug === childSlug)?.name}` : "（综合）"}`);
      router.push("/");
    } catch (error) { notify(error instanceof Error ? error.message : "发布失败", "error"); } finally { setPending(false); }
  };
  return <form className="space-y-4" onSubmit={submit}>{compact ? null : <label className="form-control"><span className="label-text mb-2 font-semibold">标题</span><input className="input w-full" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="用一句话说清要讨论的问题" maxLength={80} required /><span className="label-text-alt mt-1 opacity-60">最多 80 字</span></label>}<div className="grid gap-4 sm:grid-cols-2"><label className="form-control"><span className="label-text mb-2 font-semibold">一级节点（必选）</span><select className="select w-full" value={parent.slug} onChange={(event) => { setParentSlug(event.target.value); setChildSlug(""); }}>{nodes.map((node) => <option value={node.slug} key={node.id}>{node.name}</option>)}</select></label><label className="form-control"><span className="label-text mb-2 font-semibold">子节点（推荐）</span><select className="select w-full" value={childSlug} onChange={(event) => setChildSlug(event.target.value)}><option value="">{parent.name}（综合）</option>{parent.children.map((child) => <option value={child.slug} key={child.id}>{child.name}</option>)}</select></label></div><div className="alert"><p><strong>发布路径：</strong>{parent.name}{childSlug ? ` / ${parent.children.find((item) => item.slug === childSlug)?.name}` : "（综合）"}</p></div>{compact ? null : <div className="alert alert-info alert-soft"><p>二级节点用于更精准归类；无法判断时可发布到一级节点综合区。父级与子级规则都会在最终确认中展示。</p></div>}<label className="form-control"><span className="label-text mb-2 font-semibold">{compact ? "Markdown 内容" : "正文（Markdown）"}</span><textarea className={`textarea w-full ${compact ? "min-h-64" : "min-h-72"}`} value={body} onChange={(event) => setBody(event.target.value)} placeholder={compact ? "使用 Markdown 写点什么……" : "提供背景、你的判断和希望大家回应的问题……"} required /></label>{compact ? null : <><label className="form-control"><span className="label-text mb-2 font-semibold">标签</span><input className="input w-full" placeholder="输入后按回车，例如：社区、治理" /><span className="label-text-alt mt-1 opacity-60">最多 5 个标签</span></label><label className="form-control"><span className="label-text mb-2 font-semibold">附件</span><input type="file" className="file-input w-full" /><span className="label-text-alt mt-1 opacity-60">支持 PNG、JPG、PDF，单文件不超过 10MB。</span></label></>}<p className="text-sm opacity-65">{compact ? "发布后不能编辑、删除或撤回；请在提交前确认内容与节点。" : "已自动保存 · 本地演示"}</p><div className="flex flex-wrap justify-end gap-2">{compact ? <Link className="btn" href={`/compose?node=${parent.slug}${childSlug ? `&subnode=${childSlug}` : ""}`}>转为长文</Link> : <button className="btn" type="button" onClick={() => notify("草稿已保存")}>保存草稿</button>}<button className="btn" type="button" onClick={() => open("帖子预览", <div><h3 className="text-xl font-black">{title || "轻发布预览"}</h3><p className="mt-3 whitespace-pre-wrap">{body || "还没有内容"}</p></div>)}>预览</button><button className="btn btn-primary" disabled={pending}>{pending ? <span className="loading loading-spinner loading-sm" /> : null}{compact ? "发布" : "确认发布"}</button></div></form>;
}

export function SettingsForm({ children, message = "设置已保存" }: { children: ReactNode; message?: string }) {
  const { notify } = useFeedback();
  return <form onSubmit={(event) => { event.preventDefault(); notify(message); }}>{children}<div className="mt-5 flex justify-end"><button className="btn btn-primary">保存设置</button></div></form>;
}

export function CommentComposer({ postId }: { postId: string }) {
  const { notify } = useFeedback();
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!body.trim()) return;
    setPending(true);
    try {
      const response = await fetch(`/api/v1/posts/${postId}/comments`, { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify({ bodyMarkdown: body, confirmedImmutable: true }) });
      if (!response.ok) throw new Error((await response.json().catch(() => null))?.detail ?? "回应提交失败");
      setBody(""); notify("回应已提交");
    } catch (error) { notify(error instanceof Error ? error.message : "回应提交失败", "error"); } finally { setPending(false); }
  };
  const starters = ["补充一个我亲自遇到的例子：", "提供一份可核对的资料（来源 + 我的判断）：", "我想追问一个具体问题：", "我的看法不同，依据是："];
  return <form className="mt-5 overflow-hidden rounded-box border-2 border-base-content/20" onSubmit={submit}><header className="border-b-2 border-base-content/20 px-4 py-3"><h2 className="text-lg font-bold">参与讨论</h2></header><div className="p-4"><p className="text-sm font-bold">不知道怎么开始？先选一个回应起点</p><div className="mt-2 flex flex-wrap gap-2">{["补一个例子", "提供资料", "问一个问题", "不同看法"].map((label, index) => <button className="btn btn-sm" type="button" onClick={() => setBody((current) => current.trim() ? `${current.trim()}\n\n${starters[index]}` : starters[index])} key={label}>{label}</button>)}<button className="btn btn-ghost btn-sm" type="button" onClick={() => setBody("")}>自由回应</button></div><label className="form-control mt-4"><span className="label-text mb-2 font-bold">评论内容</span><textarea className="textarea min-h-28 w-full" value={body} onChange={(event) => setBody(event.target.value)} placeholder="真诚回应，补充你的经验或提出问题" maxLength={2000} required /><span className="label-text-alt mt-1 opacity-60">评论提交后不能编辑或删除。</span></label></div><footer className="flex items-center justify-between gap-3 border-t-2 border-base-content/20 px-4 py-3"><p className="text-sm opacity-65">一句有信息量的回应也可以 · 最多 2,000 字</p><button className="btn btn-primary" disabled={pending}>提交评论</button></footer></form>;
}

export function SearchNodeFilters() {
  const [parentSlug, setParentSlug] = useState("");
  const [childSlug, setChildSlug] = useState("");
  const parent = nodes.find((node) => node.slug === parentSlug);
  const child = parent?.children.find((item) => item.slug === childSlug);
  return <div><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="form-control"><span className="label-text mb-2 font-semibold">一级节点</span><select className="select w-full" value={parentSlug} onChange={(event) => { setParentSlug(event.target.value); setChildSlug(""); }}><option value="">全部一级节点</option>{nodes.map((node) => <option value={node.slug} key={node.id}>{node.name}</option>)}</select></label><label className="form-control"><span className="label-text mb-2 font-semibold">子节点</span><select className="select w-full" value={childSlug} disabled={!parent} onChange={(event) => setChildSlug(event.target.value)}><option value="">{parent ? `全部${parent.name}` : "先选择一级节点"}</option>{parent?.children.map((item) => <option value={item.slug} key={item.id}>{item.name}</option>)}</select></label></div><p className="mt-2 text-sm opacity-65">当前搜索范围：{parent?.name ?? "全部公开节点"}{child ? ` / ${child.name}` : ""}</p></div>;
}
