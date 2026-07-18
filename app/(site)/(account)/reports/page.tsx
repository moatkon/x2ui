import { ReportsPage as ReportsContent } from "@/app/_components/pages/account/reports-page";
import type { QueryParams } from "@/app/_lib/query";
export const metadata = { title: "我的举报" };
export default async function ReportsPage({ searchParams }: { searchParams: Promise<QueryParams> }) { const cursor = (await searchParams).cursor; return <ReportsContent cursor={typeof cursor === "string" ? cursor : undefined} />; }
