import { AppealDetailPage as AppealDetailContent } from "@/app/_components/pages/account/appeal-detail-page";
export async function generateMetadata({ params }: { params: Promise<{ appealId: string }> }) { return { title: `申诉 ${(await params).appealId}` }; }
export default async function AppealDetailPage({ params }: { params: Promise<{ appealId: string }> }) { const { appealId } = await params; return <AppealDetailContent id={appealId} />; }
