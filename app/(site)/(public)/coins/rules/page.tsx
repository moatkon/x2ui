import { CoinRulesPage as CoinRulesContent } from "@/app/_components/pages/coin/rules-page";
import { metadataForPath } from "@/app/_lib/metadata";
import type { QueryParams } from "@/app/_lib/query";
export const metadata = metadataForPath("/coins/rules");
export default async function CoinRulesPage({ searchParams }: { searchParams: Promise<QueryParams> }) { const cursor = (await searchParams).cursor; return <CoinRulesContent cursor={typeof cursor === "string" ? cursor : undefined} />; }
