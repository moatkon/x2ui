"use client";

import { AttachmentUploader } from "../attachment-uploader";

export function ComposeEditorFields({
  compact,
  title,
  body,
  tags,
  uploadIds,
  onTitleChange,
  onBodyChange,
  onTagsChange,
  onUploadsChange,
}: {
  compact: boolean;
  title: string;
  body: string;
  tags: string;
  uploadIds: string[];
  onTitleChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onTagsChange: (value: string) => void;
  onUploadsChange: (value: string[]) => void;
}) {
  return (
    <>
      {compact ? null : (
        <label className="form-control">
          <span className="label-text mb-2 font-semibold">标题</span>
          <input className="input w-full" value={title} onChange={(event) => onTitleChange(event.target.value)} placeholder="用一句话说清要讨论的问题" maxLength={80} required />
          <span className="label-text-alt mt-1 opacity-60">最多 80 字</span>
        </label>
      )}
      <label className="form-control">
        <span className="label-text mb-2 font-semibold">{compact ? "Markdown 内容" : "正文（Markdown）"}</span>
        <textarea className={`textarea w-full ${compact ? "min-h-64" : "min-h-72"}`} value={body} onChange={(event) => onBodyChange(event.target.value)} placeholder={compact ? "使用 Markdown 写点什么……" : "提供背景、你的判断和希望大家回应的问题……"} maxLength={20_000} required />
      </label>
      {compact ? null : (
        <>
          <label className="form-control">
            <span className="label-text mb-2 font-semibold">标签</span>
            <input className="input w-full" value={tags} onChange={(event) => onTagsChange(event.target.value)} placeholder="用逗号分隔，例如：社区，治理" />
            <span className="label-text-alt mt-1 opacity-60">最多 5 个标签</span>
          </label>
          <label className="form-control">
            <span className="label-text mb-2 font-semibold">附件</span>
            <AttachmentUploader uploadIds={uploadIds} onChange={onUploadsChange} />
          </label>
        </>
      )}
    </>
  );
}
