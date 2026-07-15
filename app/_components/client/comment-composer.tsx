"use client";

import { useState, type FormEvent } from "react";
import { useFeedback } from "./feedback-provider";

export function CommentComposer({ postId }: { postId: string }) {
  const { notify } = useFeedback();
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!body.trim()) return;
    setPending(true);
    try {
      const response = await fetch(`/api/v1/posts/${encodeURIComponent(postId)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify({ bodyMarkdown: body.trim(), confirmedImmutable: true }),
      });
      if (!response.ok) throw new Error((await response.json().catch(() => null))?.detail ?? "回应提交失败");
      setBody("");
      notify("回应已提交");
    } catch (error) {
      notify(error instanceof Error ? error.message : "回应提交失败", "error");
    } finally {
      setPending(false);
    }
  }
  const starters = ["补充一个我亲自遇到的例子：", "提供一份可核对的资料（来源 + 我的判断）：", "我想追问一个具体问题：", "我的看法不同，依据是："];
  return <form className="mt-5 overflow-hidden rounded-box border-2 border-base-content/20" onSubmit={submit}><header className="border-b-2 border-base-content/20 px-4 py-3"><h2 className="text-lg font-bold">参与讨论</h2></header><div className="p-4"><p className="text-sm font-bold">不知道怎么开始？先选一个回应起点</p><div className="mt-2 flex flex-wrap gap-2">{["补一个例子", "提供资料", "问一个问题", "不同看法"].map((label, index) => <button className="btn btn-sm" type="button" onClick={() => setBody((current) => current.trim() ? `${current.trim()}\n\n${starters[index]}` : starters[index])} key={label}>{label}</button>)}<button className="btn btn-ghost btn-sm" type="button" onClick={() => setBody("")}>自由回应</button></div><label className="form-control mt-4"><span className="label-text mb-2 font-bold">评论内容</span><textarea className="textarea min-h-28 w-full" value={body} onChange={(event) => setBody(event.target.value)} placeholder="真诚回应，补充你的经验或提出问题" maxLength={2000} required /><span className="label-text-alt mt-1 opacity-60">评论提交后不能编辑或删除。</span></label></div><footer className="flex items-center justify-between gap-3 border-t-2 border-base-content/20 px-4 py-3"><p className="text-sm opacity-65">一句有信息量的回应也可以 · 最多 2,000 字</p><button className="btn btn-primary" disabled={pending}>{pending ? <span className="loading loading-spinner loading-sm" /> : null}提交评论</button></footer></form>;
}
