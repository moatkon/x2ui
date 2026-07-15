import { TagPostsPage } from "@/app/_components/pages/tags-content";
import { metadataForPath } from "@/app/_lib/metadata";
import { posts } from "@/lib/mock-data";
export function generateStaticParams() { return [...new Set(posts.flatMap((post) => post.tags))].map((slug) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const slug = decodeURIComponent((await params).slug); return metadataForPath(`/tags/${encodeURIComponent(slug)}`, `标签：${slug}`, `浏览带有“${slug}”标签的公开讨论。`); }
export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; return <TagPostsPage slug={slug} />; }
