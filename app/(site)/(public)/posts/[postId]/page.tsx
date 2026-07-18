import { PostContent } from "@/app/_components/pages/post-content";
import { postMetadata } from "@/app/_lib/metadata";
import type { QueryParams } from "@/app/_lib/query";
export async function generateMetadata({ params }: { params: Promise<{ postId: string }> }) { return postMetadata((await params).postId); }
export default async function PostPage({ params, searchParams }: { params: Promise<{ postId: string }>; searchParams: Promise<QueryParams> }) { const [{ postId }, query] = await Promise.all([params, searchParams]); const cursor = query.cursor; const replyTo = query.replyTo; const replyCursor = query.replyCursor; return <PostContent postId={postId} cursor={typeof cursor === "string" ? cursor : undefined} replyTo={typeof replyTo === "string" ? replyTo : undefined} replyCursor={typeof replyCursor === "string" ? replyCursor : undefined} />; }
