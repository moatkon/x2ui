import { UserProfilePage } from "@/app/_components/pages/user-content";
import { userMetadata } from "@/app/_lib/metadata";
export async function generateMetadata({ params }: { params: Promise<{ userName: string }> }) { return userMetadata((await params).userName); }
export default async function UserPage({ params }: { params: Promise<{ userName: string }> }) { const { userName } = await params; return <UserProfilePage userName={userName} />; }
