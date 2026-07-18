import { BlockedPage } from "@/app/_components/pages/account/blocked-page";
import type { QueryParams } from "@/app/_lib/query";
export const metadata = { title: "设置 · 屏蔽列表" };
export default async function Page({ searchParams }: { searchParams: Promise<QueryParams> }) { const cursor = (await searchParams).cursor; return <BlockedPage cursor={typeof cursor === "string" ? cursor : undefined} />; }
