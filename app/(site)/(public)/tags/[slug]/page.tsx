import { TagPostsPage } from "@/app/_components/pages/tags/posts-page";
import { metadataForPath } from "@/app/_lib/metadata";
import type { QueryParams } from "@/app/_lib/query";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const slug = decodeURIComponent((await params).slug); return metadataForPath(`/tags/${encodeURIComponent(slug)}`, `标签：${slug}`, `浏览带有“${slug}”标签的公开讨论。`); }
export default async function TagPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<QueryParams> }) { const [{ slug }, query] = await Promise.all([params, searchParams]); const cursor = query.cursor; return <TagPostsPage slug={slug} cursor={typeof cursor === "string" ? cursor : undefined} />; }
