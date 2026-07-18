import { SeasonsDirectoryPage } from "@/app/_components/pages/seasons/directory-page";
import { metadataForPath } from "@/app/_lib/metadata";
import type { QueryParams } from "@/app/_lib/query";
export const metadata = metadataForPath("/seasons");
export default async function SeasonsPage({ searchParams }: { searchParams: Promise<QueryParams> }) { const cursor = (await searchParams).cursor; return <SeasonsDirectoryPage cursor={typeof cursor === "string" ? cursor : undefined} />; }
