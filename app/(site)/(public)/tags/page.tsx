import { TagsDirectoryPage } from "@/app/_components/pages/tags/directory-page";
import { metadataForPath } from "@/app/_lib/metadata";
import type { QueryParams } from "@/app/_lib/query";
export const metadata = metadataForPath("/tags");
export default async function TagsPage({ searchParams }: { searchParams: Promise<QueryParams> }) { const cursor = (await searchParams).cursor; return <TagsDirectoryPage cursor={typeof cursor === "string" ? cursor : undefined} />; }
