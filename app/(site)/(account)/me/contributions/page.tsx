import { JourneyContributionsPage } from "@/app/_components/pages/journey/contributions-page";
import type { QueryParams } from "@/app/_lib/query";
export const metadata = { title: "我的贡献" };
export default async function ContributionsPage({ searchParams }: { searchParams: Promise<QueryParams> }) { const cursor = (await searchParams).cursor; return <JourneyContributionsPage cursor={typeof cursor === "string" ? cursor : undefined} />; }
