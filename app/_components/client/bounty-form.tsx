"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useApiMutation } from "./use-api-mutation";

type Quote = {
  quoteId: string;
  eligible: boolean;
  disabledReasons: string[];
  amountTiers: number[];
  defaultExpiresAt: string;
  answererSharePercent: number;
  sinkPercent: number;
};

export function BountyForm() {
  const postId = useSearchParams().get("postId") ?? "";
  const [quote, setQuote] = useState<Quote>();
  const [loadError, setLoadError] = useState("");
  const mutation = useApiMutation();
  useEffect(() => {
    if (!postId) return;
    fetch(`/api/v1/coin-bounty-quote?postId=${encodeURIComponent(postId)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error((await response.json().catch(() => null))?.detail ?? "无法获取悬赏报价");
        return response.json() as Promise<Quote>;
      })
      .then(setQuote)
      .catch((error) => setLoadError(error instanceof Error ? error.message : "无法获取悬赏报价"));
  }, [postId]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!quote) return;
    const data = new FormData(event.currentTarget);
    await mutation.mutate({
      method: "POST",
      path: "/coin-bounties",
      idempotent: true,
      body: {
        postId,
        amountTier: Number(data.get("amountTier")),
        quoteId: quote.quoteId,
        expiresAt: quote.defaultExpiresAt,
      },
    }, "悬赏已创建。");
  }
  if (!postId) return <p className="alert alert-info">请从自己发布的帖子进入“设置悬赏”。</p>;
  if (loadError) return <p className="alert alert-error">{loadError}</p>;
  if (!quote) return <span className="loading loading-spinner" />;
  if (!quote.eligible) return <p className="alert alert-warning">当前不可创建悬赏：{quote.disabledReasons.join("、")}</p>;
  return <form onSubmit={submit}>
    <p className="mb-4 text-sm opacity-70">答主获得 {quote.answererSharePercent}%，系统沉淀 {quote.sinkPercent}%。</p>
    <div className="join">{quote.amountTiers.map((amount, index) => <label className="btn join-item" key={amount}><input className="radio radio-xs" type="radio" name="amountTier" value={amount} defaultChecked={index === 0} />{amount}</label>)}</div>
    {mutation.error ? <p className="alert alert-error mt-4">{mutation.error}</p> : null}
    {mutation.success ? <p className="alert alert-success mt-4">{mutation.success}</p> : null}
    <div className="mt-4 flex justify-end"><button className="btn btn-primary" type="submit" disabled={mutation.pending}>确认创建</button></div>
  </form>;
}
