import { CoinRouteContent } from "@/app/_components/pages/coin-content";
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) { return { title: `金币调整 ${(await params).id}` }; }
export default async function AdjustmentPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <CoinRouteContent path={`/admin/coins/adjustments/${id}`} />; }
