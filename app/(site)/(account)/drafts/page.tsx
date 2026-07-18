import { DraftsContent } from "@/app/_components/pages/account/drafts-page";
import type { QueryParams } from "@/app/_lib/query";
export const metadata = { title: "我的草稿" };
export default async function DraftsPage({ searchParams }: { searchParams: Promise<QueryParams> }) { const cursor = (await searchParams).cursor; return <DraftsContent cursor={typeof cursor === "string" ? cursor : undefined} />; }
