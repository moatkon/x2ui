import { UserFollowingPage as UserFollowingContent } from "@/app/_components/pages/users/following-page";
import { userMetadata } from "@/app/_lib/metadata";
import type { QueryParams } from "@/app/_lib/query";
export async function generateMetadata({ params }: { params: Promise<{ userName: string }> }) { return userMetadata((await params).userName, "following"); }
export default async function UserFollowingPage({ params, searchParams }: { params: Promise<{ userName: string }>; searchParams: Promise<QueryParams> }) { const [{ userName }, query] = await Promise.all([params, searchParams]); const cursor = query.cursor; return <UserFollowingContent userName={userName} cursor={typeof cursor === "string" ? cursor : undefined} />; }
