import Link from "next/link";
import { getBounty } from "@/app/_server/coin-data";
import { StructuredApiForm } from "../../client/structured-api-form";
import { Breadcrumbs, PageHeader, Panel, StatGrid } from "../../shared/ui";

export async function CoinBountyDetail({ id }: { id: string }) {
  const bounty = await getBounty(id);
  return (
    <>
      <Breadcrumbs items={[{ label: "问题悬赏", href: "/coins/bounties" }, { label: bounty.id }]} />
      <div className="mt-3"><PageHeader title={`悬赏 ${bounty.id}`} description={`${bounty.status} · ${bounty.amount} ${bounty.unit}`} /></div>
      <Panel title="关联问题"><Link className="font-bold" href={`/posts/${encodeURIComponent(bounty.post.id)}`}>{bounty.post.displayTitle || bounty.post.title}</Link></Panel>
      <Panel className="mt-5" title="资金与时间线">
        <StatGrid items={[
          { title: "托管", value: bounty.amount },
          { title: "答主所得", value: bounty.distribution.answerer },
          { title: "系统沉淀", value: bounty.distribution.sink },
          { title: "可选回答", value: bounty.eligibleAnswers.length },
        ]} />
        <ol className="mt-5 space-y-3">
          {bounty.timeline.map((item) => <li key={`${item.state}-${item.at}`}><strong>{item.state}</strong><p className="text-sm opacity-65">{new Date(item.at).toLocaleString("zh-CN")}{item.journalId ? ` · ${item.journalId}` : ""}</p></li>)}
        </ol>
      </Panel>
      {bounty.status === "OPEN" ? (
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Panel title="采纳回答">
            <StructuredApiForm
              path={`/coin-bounties/${encodeURIComponent(bounty.id)}/acceptances`}
              ifMatch={`"${bounty.version}"`}
              fields={[{ name: "answerCommentId", label: "回答", kind: "select", required: true, options: bounty.eligibleAnswers.filter((answer) => answer.eligible).map((answer) => ({ value: answer.comment.id, label: `${answer.comment.author.displayName}：${answer.comment.bodyMarkdown.slice(0, 60)}` })) }]}
              submitLabel="确认采纳"
              confirmation={`采纳后将按规则结算 ${bounty.amount} ${bounty.unit}，确认继续？`}
            />
          </Panel>
          <Panel title="取消悬赏">
            <StructuredApiForm
              path={`/coin-bounties/${encodeURIComponent(bounty.id)}/cancellations`}
              ifMatch={`"${bounty.version}"`}
              fields={[
                { name: "reason", label: "原因", kind: "select", required: true, options: [
                  { value: "NO_LONGER_NEEDED", label: "不再需要" },
                  { value: "DUPLICATE", label: "重复问题" },
                  { value: "MODERATION_HOLD", label: "治理保留" },
                  { value: "OTHER", label: "其他" },
                ] },
                { name: "statement", label: "说明", kind: "textarea", maxLength: 500 },
              ]}
              submitLabel="确认取消"
              confirmation="取消将按服务端规则处理托管金币，确认继续？"
            />
          </Panel>
        </div>
      ) : null}
    </>
  );
}
