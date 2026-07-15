import { AccountRouteContent } from "@/app/_components/pages/account-content";
export async function generateMetadata({ params }: { params: Promise<{ appealId: string }> }) { return { title: `申诉 ${(await params).appealId}` }; }
export default async function AppealDetailPage({ params }: { params: Promise<{ appealId: string }> }) { const { appealId } = await params; return <AccountRouteContent path={`/appeals/${appealId}`} query={{}} />; }
