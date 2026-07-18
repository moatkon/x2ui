import { AppealsPage as AppealsContent } from "@/app/_components/pages/account/appeals-page";
import type { QueryParams } from "@/app/_lib/query";
export const metadata = { title: "我的申诉" };
export default async function AppealsPage({ searchParams }: { searchParams: Promise<QueryParams> }) { const cursor = (await searchParams).cursor; return <AppealsContent cursor={typeof cursor === "string" ? cursor : undefined} />; }
