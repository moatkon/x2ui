import { CoinModerationDetail } from "@/app/_components/pages/coin-content";
export async function generateMetadata({ params }: { params: Promise<{ caseId: string }> }) { return { title: `金币风险案件 ${(await params).caseId}` }; }
export default async function CoinModerationCasePage({ params }: { params: Promise<{ caseId: string }> }) { const { caseId } = await params; return <CoinModerationDetail id={caseId} />; }
