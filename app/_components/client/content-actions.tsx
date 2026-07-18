"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useFeedback } from "./feedback-provider";

export function ReplyButton({
  commentId,
  replyCount,
  authorName,
}: {
  commentId: string;
  replyCount: number;
  authorName: string;
}) {
  const router = useRouter();
  const { notify } = useFeedback();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const bodyMarkdown = String(new FormData(event.currentTarget).get("bodyMarkdown") ?? "").trim();
    try {
      const response = await fetch(`/api/v1/comments/${encodeURIComponent(commentId)}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify({ bodyMarkdown, confirmedImmutable: true }),
      });
      if (!response.ok) throw new Error((await response.json().catch(() => null))?.detail ?? "回复失败");
      notify("回复已发布");
      setOpen(false);
      router.refresh();
    } catch (error) {
      notify(error instanceof Error ? error.message : "回复失败", "error");
    } finally {
      setPending(false);
    }
  }

  return <div>
    <button className="btn btn-ghost btn-sm" type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>回应 {replyCount}</button>
    {open ? <form className="mt-3 rounded-box border-2 border-base-content/20 p-3" onSubmit={submit}>
      <label className="form-control"><span className="label-text mb-2 font-semibold">回应 {authorName}</span><textarea className="textarea min-h-28 w-full" name="bodyMarkdown" maxLength={2000} placeholder="回复提交后不能编辑或删除" required /></label>
      <div className="mt-3 flex justify-end gap-2"><button className="btn btn-sm" type="button" onClick={() => setOpen(false)}>取消</button><button className="btn btn-primary btn-sm" type="submit" disabled={pending}>确认发布</button></div>
    </form> : null}
  </div>;
}

type CoinThankQuote = {
  quoteId: string;
  eligible: boolean;
  disabledReasons: string[];
  cost: number;
  recipientAmount: number;
  sinkAmount: number;
  expiresAt: string;
};

export function CoinThankButton({
  targetType,
  targetId,
  className = "btn",
}: {
  targetType: "POST" | "COMMENT";
  targetId: string;
  className?: string;
}) {
  const router = useRouter();
  const { notify } = useFeedback();
  const [pending, setPending] = useState(false);

  async function thank() {
    setPending(true);
    try {
      const params = new URLSearchParams({ targetType, targetId });
      const quoteResponse = await fetch(`/api/v1/coin-thank-quote?${params}`);
      if (!quoteResponse.ok) throw new Error((await quoteResponse.json().catch(() => null))?.detail ?? "无法获取金币报价");
      const quote = await quoteResponse.json() as CoinThankQuote;
      if (!quote.eligible) throw new Error(`当前不可感谢：${quote.disabledReasons.join("、")}`);
      if (!window.confirm(`确认花费 ${quote.cost} 金币？作者获得 ${quote.recipientAmount}，系统沉淀 ${quote.sinkAmount}。`)) return;
      const response = await fetch("/api/v1/coin-thanks", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify({ targetType, targetId, quoteId: quote.quoteId }),
      });
      if (!response.ok) throw new Error((await response.json().catch(() => null))?.detail ?? "金币感谢失败");
      notify("金币感谢已完成");
      router.refresh();
    } catch (error) {
      notify(error instanceof Error ? error.message : "金币感谢失败", "error");
    } finally {
      setPending(false);
    }
  }

  return <button className={className} type="button" disabled={pending} onClick={thank}>{pending ? <span className="loading loading-spinner loading-sm" /> : null}金币感谢</button>;
}
