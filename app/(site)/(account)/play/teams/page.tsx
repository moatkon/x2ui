import { JourneyTeamsPage } from "@/app/_components/pages/journey/projects-page";
import type { QueryParams } from "@/app/_lib/query";
export const metadata = { title: "节点协作" };
export default async function TeamsPage({ searchParams }: { searchParams: Promise<QueryParams> }) { const cursor = (await searchParams).cursor; return <JourneyTeamsPage cursor={typeof cursor === "string" ? cursor : undefined} />; }
