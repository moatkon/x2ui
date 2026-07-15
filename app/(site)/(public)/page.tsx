import { FeedContent } from "@/app/_components/pages/feed-content";
import { metadataForPath } from "@/app/_lib/metadata";
import type { QueryParams } from "@/app/_lib/query";

export const metadata = metadataForPath("/");
export default async function HomePage({ searchParams }: { searchParams: Promise<QueryParams> }) {
  return <FeedContent query={await searchParams} />;
}
