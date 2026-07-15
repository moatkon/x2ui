import { UserContent } from "@/app/_components/pages/user-content";
import { userMetadata } from "@/app/_lib/metadata";
export async function generateMetadata({ params }: { params: Promise<{ userName: string }> }) { return userMetadata((await params).userName, "following"); }
export default async function UserFollowingPage({ params }: { params: Promise<{ userName: string }> }) { const { userName } = await params; return <UserContent path={`/users/${userName}/following`} />; }
