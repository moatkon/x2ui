import { BookmarksContent } from "@/app/_components/pages/account/bookmarks-page";
import type { QueryParams } from "@/app/_lib/query";
export const metadata = { title: "我的收藏" };
export default async function BookmarksPage({ searchParams }: { searchParams: Promise<QueryParams> }) { const cursor = (await searchParams).cursor; return <BookmarksContent cursor={typeof cursor === "string" ? cursor : undefined} />; }
