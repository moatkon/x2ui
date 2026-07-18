import { JourneyCollectionPage } from "@/app/_components/pages/journey/collection-page";
import type { QueryParams } from "@/app/_lib/query";
export const metadata = { title: "贡献收藏" };
export default async function CollectionPage({ searchParams }: { searchParams: Promise<QueryParams> }) { const cursor = (await searchParams).cursor; return <JourneyCollectionPage cursor={typeof cursor === "string" ? cursor : undefined} />; }
