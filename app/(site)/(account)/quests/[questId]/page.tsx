import { QuestDetailPage } from "@/app/_components/pages/journey/quest-detail-page";
export async function generateMetadata({ params }: { params: Promise<{ questId: string }> }) { return { title: `共建任务 · ${(await params).questId}` }; }
export default async function QuestPage({ params }: { params: Promise<{ questId: string }> }) { const { questId } = await params; return <QuestDetailPage id={questId} />; }
