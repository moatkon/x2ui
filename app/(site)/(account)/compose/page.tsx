import { AccountRouteContent } from "@/app/_components/pages/account-content";
import type { QueryParams } from "@/app/_lib/query";
export const metadata = { title: "发布帖子" };
export default async function ComposePage({ searchParams }: { searchParams: Promise<QueryParams> }) { return <AccountRouteContent path="/compose" query={await searchParams} />; }
