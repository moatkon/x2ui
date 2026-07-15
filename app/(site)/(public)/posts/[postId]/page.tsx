import { PostContent } from "@/app/_components/pages/post-content";
import { postMetadata } from "@/app/_lib/metadata";
import { posts } from "@/lib/mock-data";
export function generateStaticParams() { return posts.map((post) => ({ postId: post.id })); }
export async function generateMetadata({ params }: { params: Promise<{ postId: string }> }) { return postMetadata((await params).postId); }
export default async function PostPage({ params }: { params: Promise<{ postId: string }> }) { const { postId } = await params; return <PostContent postId={postId} />; }
