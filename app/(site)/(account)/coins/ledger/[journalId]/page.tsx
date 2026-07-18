import { CoinJournalDetail } from "@/app/_components/pages/coin/journal-page";

export const metadata = { title: "金币流水详情" };

export default async function CoinJournalPage({
  params,
}: {
  params: Promise<{ journalId: string }>;
}) {
  return <CoinJournalDetail id={(await params).journalId} />;
}
