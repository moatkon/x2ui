"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { CommunityNode } from "@/lib/models";
import { ComposeEditorFields } from "./compose/editor-fields";
import { ComposeNodePicker } from "./compose/node-picker";
import { ComposePublishActions } from "./compose/publish-actions";
import { useFeedback } from "./feedback-provider";

type DraftInput = {
  id: string;
  title: string;
  bodyMarkdown: string;
  tagLabels: string[];
  uploadIds: string[];
  version: number;
};

export function ComposeForm({
  nodes,
  compact = false,
  initialNode = "",
  initialChild = "",
  initialDraft,
}: {
  nodes: readonly CommunityNode[];
  compact?: boolean;
  initialNode?: string;
  initialChild?: string;
  initialDraft?: DraftInput;
}) {
  const { notify, open } = useFeedback();
  const router = useRouter();
  const [parentSlug, setParentSlug] = useState(initialNode);
  const [childSlug, setChildSlug] = useState(initialChild);
  const [title, setTitle] = useState(initialDraft?.title ?? "");
  const [body, setBody] = useState(initialDraft?.bodyMarkdown ?? "");
  const [tags, setTags] = useState(initialDraft?.tagLabels.join("，") ?? "");
  const [uploadIds, setUploadIds] = useState<string[]>(initialDraft?.uploadIds ?? []);
  const [draftId, setDraftId] = useState(initialDraft?.id);
  const [draftVersion, setDraftVersion] = useState(initialDraft?.version);
  const [savedAt, setSavedAt] = useState<string>();
  const [pending, setPending] = useState(false);
  const parent = nodes.find((node) => node.slug === parentSlug) ?? nodes[0];
  if (!parent) return null;

  function tagLabels() {
    return [...new Set(tags.split(/[,，]/).map((item) => item.trim()).filter(Boolean))].slice(0, 5);
  }

  async function saveDraft() {
    setPending(true);
    try {
      const childNodeId = parent.children.find((item) => item.slug === childSlug)?.id;
      const response = await fetch(`/api/v1/drafts${draftId ? `/${encodeURIComponent(draftId)}` : ""}`, {
        method: draftId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(draftId ? { "If-Match": `"${draftVersion}"` } : { "Idempotency-Key": crypto.randomUUID() }),
        },
        body: JSON.stringify({
          title,
          bodyMarkdown: body,
          parentNodeId: parent.id,
          childNodeId: childNodeId ?? null,
          tagLabels: tagLabels(),
          uploadIds,
        }),
      });
      if (!response.ok) throw new Error((await response.json().catch(() => null))?.detail ?? "草稿保存失败");
      const saved = (await response.json()) as { id: string; version: number };
      setDraftId(saved.id);
      setDraftVersion(saved.version);
      setSavedAt(new Intl.DateTimeFormat("zh-CN", { timeStyle: "short" }).format(new Date()));
      notify("草稿已保存");
      router.replace(`/compose?draft=${encodeURIComponent(saved.id)}`);
      router.refresh();
    } catch (error) {
      notify(error instanceof Error ? error.message : "草稿保存失败", "error");
    } finally {
      setPending(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!body.trim()) return notify("先写下一段真实内容", "info");
    setPending(true);
    try {
      const response = await fetch(draftId ? `/api/v1/drafts/${encodeURIComponent(draftId)}/publications` : "/api/v1/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
          ...(draftId ? { "If-Match": `"${draftVersion}"` } : {}),
        },
        body: JSON.stringify(draftId ? { confirmedImmutable: true } : {
          title: compact ? null : title.trim(),
          bodyMarkdown: body.trim(),
          parentNodeSlug: parent.slug,
          childNodeSlug: childSlug || null,
          tags: tagLabels(),
          attachmentUploadIds: uploadIds,
          confirmedImmutable: true,
        }),
      });
      if (!response.ok) throw new Error((await response.json().catch(() => null))?.detail ?? "发布失败");
      const created = (await response.json()) as { post?: { id?: string } };
      notify(`已发布到 ${parent.name}${childSlug ? ` / ${parent.children.find((item) => item.slug === childSlug)?.name}` : "（综合）"}`);
      router.push(created.post?.id ? `/posts/${encodeURIComponent(created.post.id)}` : "/");
      router.refresh();
    } catch (error) {
      notify(error instanceof Error ? error.message : "发布失败", "error");
    } finally {
      setPending(false);
    }
  }

  async function preview() {
    setPending(true);
    try {
      const response = await fetch("/api/v1/markdown-previews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown: body, context: "POST" }),
      });
      if (!response.ok) throw new Error((await response.json().catch(() => null))?.detail ?? "预览失败");
      const result = await response.json() as { sanitizedHtml: string; warnings: Array<{ message?: string; code?: string }> };
      open("帖子预览", <div><h3 className="text-xl font-black">{title || "轻发布预览"}</h3><div className="markdown-body mt-3" dangerouslySetInnerHTML={{ __html: result.sanitizedHtml }} />{result.warnings.length ? <ul className="alert alert-warning mt-4">{result.warnings.map((warning, index) => <li key={index}>{warning.message ?? warning.code}</li>)}</ul> : null}</div>);
    } catch (error) {
      notify(error instanceof Error ? error.message : "预览失败", "error");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <ComposeEditorFields compact={compact} title={title} body={body} tags={tags} uploadIds={uploadIds} onTitleChange={setTitle} onBodyChange={setBody} onTagsChange={setTags} onUploadsChange={setUploadIds} />
      <ComposeNodePicker nodes={nodes} parent={parent} childSlug={childSlug} onParentChange={(slug) => { setParentSlug(slug); setChildSlug(""); }} onChildChange={setChildSlug} />
      {compact ? null : <div className="alert alert-info alert-soft"><p>二级节点用于更精准归类；无法判断时可发布到一级节点综合区。父级与子级规则都会在最终确认中展示。</p></div>}
      <ComposePublishActions compact={compact} pending={pending} bodyReady={Boolean(body.trim())} parentSlug={parent.slug} childSlug={childSlug} savedAt={savedAt} draftId={draftId} onSave={saveDraft} onPreview={preview} />
    </form>
  );
}
