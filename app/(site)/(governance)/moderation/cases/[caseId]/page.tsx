import { ModerationRouteContent } from "@/app/_components/pages/moderation-content";
export async function generateMetadata({ params }: { params: Promise<{ caseId: string }> }) { return { title: `治理案件 ${(await params).caseId}` }; }
export default async function ModerationCasePage({ params }: { params: Promise<{ caseId: string }> }) { const { caseId } = await params; return <ModerationRouteContent path={`/moderation/cases/${caseId}`} />; }
