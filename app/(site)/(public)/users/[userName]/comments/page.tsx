import { UserCommentsPage as UserCommentsContent } from "@/app/_components/pages/user-content";
import { userMetadata } from "@/app/_lib/metadata";
export async function generateMetadata({ params }: { params: Promise<{ userName: string }> }) { return userMetadata((await params).userName, "comments"); }
export default async function UserCommentsPage({ params }: { params: Promise<{ userName: string }> }) { const { userName } = await params; return <UserCommentsContent userName={userName} />; }
