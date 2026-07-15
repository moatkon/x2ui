import { SearchContent } from "@/app/_components/pages/search-content";
import { metadataForPath } from "@/app/_lib/metadata";
import type { QueryParams } from "@/app/_lib/query";
export const metadata = { ...metadataForPath("/search"), robots: { index: false, follow: true } };
export default async function SearchPage({ searchParams }: { searchParams: Promise<QueryParams> }) { return <SearchContent query={await searchParams} />; }
