"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { CommunityNode } from "@/lib/mock-data";
import { useFeedback } from "./feedback-provider";

export function ComposeForm({ nodes, compact = false, initialNode = "product", initialChild = "" }: { nodes: readonly CommunityNode[]; compact?: boolean; initialNode?: string; initialChild?: string }) {
  const { notify, open } = useFeedback();
  const router = useRouter();
  const [parentSlug, setParentSlug] = useState(initialNode);
  const [childSlug, setChildSlug] = useState(initialChild);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const parent = nodes.find((node) => node.slug === parentSlug) ?? nodes[0];
  if (!parent) return null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!body.trim()) { notify("先写下一段真实内容", "info"); return; }
    setPending(true);
    try {
      const response = await fetch("/api/v1/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify({ title: compact ? null : title.trim(), bodyMarkdown: body.trim(), parentNodeSlug: parent.slug, childNodeSlug: childSlug || null, confirmedImmutable: true }),
      });
      if (!response.ok) throw new Error((await response.json().catch(() => null))?.detail ?? "发布失败");
      notify(`已发布到 ${parent.name}${childSlug ? ` / ${parent.children.find((item) => item.slug === childSlug)?.name}` : "（综合）"}`);
      router.push("/");
    } catch (error) {
      notify(error instanceof Error ? error.message : "发布失败", "error");
    } finally {
      setPending(false);
    }
  }

  return <form className="space-y-4" onSubmit={submit}>{compact ? null : <label className="form-control"><span className="label-text mb-2 font-semibold">标题</span><input className="input w-full" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="用一句话说清要讨论的问题" maxLength={80} required /><span className="label-text-alt mt-1 opacity-60">最多 80 字</span></label>}<div className="grid gap-4 sm:grid-cols-2"><label className="form-control"><span className="label-text mb-2 font-semibold">一级节点（必选）</span><select className="select w-full" value={parent.slug} onChange={(event) => { setParentSlug(event.target.value); setChildSlug(""); }}>{nodes.map((node) => <option value={node.slug} key={node.id}>{node.name}</option>)}</select></label><label className="form-control"><span className="label-text mb-2 font-semibold">子节点（推荐）</span><select className="select w-full" value={childSlug} onChange={(event) => setChildSlug(event.target.value)}><option value="">{parent.name}（综合）</option>{parent.children.map((child) => <option value={child.slug} key={child.id}>{child.name}</option>)}</select></label></div><div className="alert"><p><strong>发布路径：</strong>{parent.name}{childSlug ? ` / ${parent.children.find((item) => item.slug === childSlug)?.name}` : "（综合）"}</p></div>{compact ? null : <div className="alert alert-info alert-soft"><p>二级节点用于更精准归类；无法判断时可发布到一级节点综合区。父级与子级规则都会在最终确认中展示。</p></div>}<label className="form-control"><span className="label-text mb-2 font-semibold">{compact ? "Markdown 内容" : "正文（Markdown）"}</span><textarea className={`textarea w-full ${compact ? "min-h-64" : "min-h-72"}`} value={body} onChange={(event) => setBody(event.target.value)} placeholder={compact ? "使用 Markdown 写点什么……" : "提供背景、你的判断和希望大家回应的问题……"} maxLength={20_000} required /></label>{compact ? null : <><label className="form-control"><span className="label-text mb-2 font-semibold">标签</span><input className="input w-full" placeholder="输入后按回车，例如：社区、治理" /><span className="label-text-alt mt-1 opacity-60">最多 5 个标签</span></label><label className="form-control"><span className="label-text mb-2 font-semibold">附件</span><input type="file" className="file-input w-full" accept="image/png,image/jpeg,application/pdf" /><span className="label-text-alt mt-1 opacity-60">支持 PNG、JPG、PDF，单文件不超过 10MB。</span></label></>}<p className="text-sm opacity-65">{compact ? "发布后不能编辑、删除或撤回；请在提交前确认内容与节点。" : "已自动保存 · 本地演示"}</p><div className="flex flex-wrap justify-end gap-2">{compact ? <Link className="btn" href={`/compose?node=${parent.slug}${childSlug ? `&subnode=${childSlug}` : ""}`}>转为长文</Link> : <button className="btn" type="button" onClick={() => notify("草稿已保存")}>保存草稿</button>}<button className="btn" type="button" onClick={() => open("帖子预览", <div><h3 className="text-xl font-black">{title || "轻发布预览"}</h3><p className="mt-3 whitespace-pre-wrap">{body || "还没有内容"}</p></div>)}>预览</button><button className="btn btn-primary" disabled={pending}>{pending ? <span className="loading loading-spinner loading-sm" /> : null}{compact ? "发布" : "确认发布"}</button></div></form>;
}
