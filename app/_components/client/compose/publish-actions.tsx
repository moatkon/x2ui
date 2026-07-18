"use client";

import Link from "next/link";

export function ComposePublishActions({
  compact,
  pending,
  bodyReady,
  parentSlug,
  childSlug,
  savedAt,
  draftId,
  onSave,
  onPreview,
}: {
  compact: boolean;
  pending: boolean;
  bodyReady: boolean;
  parentSlug: string;
  childSlug: string;
  savedAt?: string;
  draftId?: string;
  onSave: () => void;
  onPreview: () => void;
}) {
  return (
    <>
      <p className="text-sm opacity-65">
        {compact ? "发布后不能编辑、删除或撤回；请在提交前确认内容与节点。" : savedAt ? `草稿已于 ${savedAt} 保存到服务器` : draftId ? "正在编辑服务器草稿" : "尚未保存草稿"}
      </p>
      <div className="flex flex-wrap justify-end gap-2">
        {compact ? <Link className="btn" href={`/compose?node=${parentSlug}${childSlug ? `&subnode=${childSlug}` : ""}`}>转为长文</Link> : <button className="btn" type="button" onClick={onSave} disabled={pending}>保存草稿</button>}
        <button className="btn" type="button" onClick={onPreview} disabled={pending || !bodyReady}>预览</button>
        <button className="btn btn-primary" disabled={pending}>{pending ? <span className="loading loading-spinner loading-sm" /> : null}{compact ? "发布" : "确认发布"}</button>
      </div>
    </>
  );
}
