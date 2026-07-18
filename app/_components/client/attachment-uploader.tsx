"use client";

import { useState } from "react";

type UploadIntent = {
  id: string;
  uploadUrl: string;
  httpMethod: "PUT";
  requiredHeaders: { contentType: string; checksumSha256: string };
  maxBytes: number;
};
type Upload = {
  id: string;
  fileName: string;
  state: "UPLOADING" | "SCANNING" | "CLEAN" | "REJECTED";
  rejectionCode?: string;
};

export function AttachmentUploader({
  uploadIds,
  onChange,
}: {
  uploadIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [items, setItems] = useState<Array<{ id: string; name: string; state: string }>>(
    () => uploadIds.map((id) => ({ id, name: id, state: "已保存" })),
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File) {
    setPending(true);
    setError("");
    try {
      if (file.size > 10_485_760) throw new Error("单个附件不能超过 10 MiB。");
      if (!["image/png", "image/jpeg", "application/pdf"].includes(file.type)) throw new Error("仅支持 PNG、JPEG 和 PDF。");
      const checksumSha256 = await sha256(file);
      const intentResponse = await fetch("/api/v1/uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify({ fileName: file.name, sizeBytes: file.size, mimeType: file.type, checksumSha256 }),
      });
      if (!intentResponse.ok) throw new Error((await intentResponse.json().catch(() => null))?.detail ?? "无法创建上传意图");
      const intent = await intentResponse.json() as UploadIntent;
      const objectResponse = await fetch(intent.uploadUrl, {
        method: intent.httpMethod,
        headers: {
          "Content-Type": intent.requiredHeaders.contentType,
          "X-Checksum-Sha256": intent.requiredHeaders.checksumSha256,
        },
        body: file,
      });
      if (!objectResponse.ok) throw new Error("附件直传失败");
      const etag = objectResponse.headers.get("etag");
      if (!etag) throw new Error("对象存储未返回 ETag，无法完成上传校验");
      const completion = await fetch(`/api/v1/uploads/${encodeURIComponent(intent.id)}/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify({ etag: etag.replaceAll("\"", "") }),
      });
      if (!completion.ok) throw new Error((await completion.json().catch(() => null))?.detail ?? "上传完成校验失败");
      const clean = await waitForScan(intent.id, await completion.json() as Upload);
      if (clean.state !== "CLEAN") throw new Error(`附件未通过安全扫描：${clean.rejectionCode ?? clean.state}`);
      setItems((current) => [...current, { id: intent.id, name: file.name, state: clean.state }]);
      onChange([...uploadIds, intent.id]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "附件上传失败");
    } finally {
      setPending(false);
    }
  }

  async function remove(id: string) {
    const response = await fetch(`/api/v1/uploads/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) {
      setError((await response.json().catch(() => null))?.detail ?? "删除附件失败");
      return;
    }
    setItems((current) => current.filter((item) => item.id !== id));
    onChange(uploadIds.filter((value) => value !== id));
  }

  return <div>
    <input className="file-input w-full" type="file" accept="image/png,image/jpeg,application/pdf" disabled={pending || uploadIds.length >= 8} onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) void upload(file); event.currentTarget.value = ""; }} />
    <p className="mt-1 text-xs opacity-65">PNG、JPEG、PDF；单文件不超过 10 MiB，最多 8 个。只有安全扫描通过的附件才会加入内容。</p>
    {error ? <p className="alert alert-error mt-3 text-sm" role="alert">{error}</p> : null}
    {pending ? <p className="mt-3 text-sm"><span className="loading loading-spinner loading-sm" /> 正在上传并等待安全扫描…</p> : null}
    {items.length ? <ul className="mt-3 space-y-2">{items.map((item) => <li className="flex items-center justify-between gap-3" key={item.id}><span className="truncate">{item.name} · {item.state}</span><button className="btn btn-ghost btn-xs" type="button" onClick={() => void remove(item.id)}>移除</button></li>)}</ul> : null}
  </div>;
}

async function sha256(file: File) {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function waitForScan(id: string, initial: Upload): Promise<Upload> {
  let current = initial;
  for (let attempt = 0; attempt < 20 && current.state === "SCANNING"; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const response = await fetch(`/api/v1/uploads/${encodeURIComponent(id)}`, { cache: "no-store" });
    if (!response.ok) throw new Error("无法读取附件扫描状态");
    current = await response.json() as Upload;
  }
  return current;
}
