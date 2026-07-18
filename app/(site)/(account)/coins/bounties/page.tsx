import { CoinBountiesPage } from "@/app/_components/pages/coin/bounties-page";
import type { QueryParams } from "@/app/_lib/query";
export const metadata = { title: "问题悬赏" };
export default async function BountiesPage({ searchParams }: { searchParams: Promise<QueryParams> }) { const cursor = (await searchParams).cursor; return <CoinBountiesPage cursor={typeof cursor === "string" ? cursor : undefined} />; }
