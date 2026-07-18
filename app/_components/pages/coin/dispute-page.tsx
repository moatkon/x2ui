import { getCoinDispute } from "@/app/_server/coin-data";
import { Breadcrumbs, PageHeader, Panel } from "../../shared/ui";

export async function CoinDisputeDetail({ id }: { id: string }) {
  const dispute = await getCoinDispute(id);
  return (
    <>
      <Breadcrumbs items={[{ label: "透明账本", href: "/coins/ledger" }, { label: dispute.id }]} />
      <div className="mt-3"><PageHeader title={`金币争议 ${dispute.id}`} description={dispute.status} /></div>
      <Panel title="复核信息">
        <p>{dispute.reasonCategory}</p>
        <p className="mt-3 whitespace-pre-wrap">{dispute.statement}</p>
        <ol className="mt-5 space-y-3">
          {dispute.timeline.map((item, index) => <li key={`${item.state}-${index}`}><strong>{item.state}</strong><p className="text-sm opacity-65">{new Date(item.at).toLocaleString("zh-CN")} · {item.publicMessage}</p></li>)}
        </ol>
      </Panel>
    </>
  );
}
