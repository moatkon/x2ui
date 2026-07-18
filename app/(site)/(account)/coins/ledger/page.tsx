import { CoinLedgerPage as CoinLedgerContent } from "@/app/_components/pages/coin/ledger-page";
import type { QueryParams } from "@/app/_lib/query";
export const metadata = { title: "透明账本" };
export default async function CoinLedgerPage({ searchParams }: { searchParams: Promise<QueryParams> }) { const cursor = (await searchParams).cursor; return <CoinLedgerContent cursor={typeof cursor === "string" ? cursor : undefined} />; }
