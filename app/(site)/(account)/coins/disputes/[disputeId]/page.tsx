import { CoinDisputeDetail } from "@/app/_components/pages/coin/dispute-page";

export const metadata = { title: "金币争议详情" };

export default async function CoinDisputePage({
  params,
}: {
  params: Promise<{ disputeId: string }>;
}) {
  return <CoinDisputeDetail id={(await params).disputeId} />;
}
