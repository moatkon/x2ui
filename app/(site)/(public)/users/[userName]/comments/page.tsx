import { UserCommentsPage as UserCommentsContent } from "@/app/_components/pages/users/comments-page";
import { userMetadata } from "@/app/_lib/metadata";
import type { QueryParams } from "@/app/_lib/query";
export async function generateMetadata({ params }: { params: Promise<{ userName: string }> }) { return userMetadata((await params).userName, "comments"); }
export default async function UserCommentsPage({ params, searchParams }: { params: Promise<{ userName: string }>; searchParams: Promise<QueryParams> }) { const [{ userName }, query] = await Promise.all([params, searchParams]); const cursor = query.cursor; return <UserCommentsContent userName={userName} cursor={typeof cursor === "string" ? cursor : undefined} />; }
