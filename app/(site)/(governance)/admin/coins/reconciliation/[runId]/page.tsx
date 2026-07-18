import { CoinReconciliationDetail } from "@/app/_components/pages/coin/reconciliation-detail-page";

export const metadata = { title: "金币对账详情" };

export default async function ReconciliationDetailPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  return <CoinReconciliationDetail id={(await params).runId} />;
}
