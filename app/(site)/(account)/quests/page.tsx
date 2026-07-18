import { QuestsPageContent } from "@/app/_components/pages/journey/quests-page";
import type { QueryParams } from "@/app/_lib/query";
export const metadata = { title: "共建任务板" };
export default async function QuestsPage({ searchParams }: { searchParams: Promise<QueryParams> }) { const cursor = (await searchParams).cursor; return <QuestsPageContent cursor={typeof cursor === "string" ? cursor : undefined} />; }
