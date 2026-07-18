import { FollowingContent } from "@/app/_components/pages/account/following-page";
import type { QueryParams } from "@/app/_lib/query";
export const metadata = { title: "关注动态" };
export default async function FollowingPage({ searchParams }: { searchParams: Promise<QueryParams> }) { const cursor = (await searchParams).cursor; return <FollowingContent cursor={typeof cursor === "string" ? cursor : undefined} />; }
