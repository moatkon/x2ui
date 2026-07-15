import { CoinBountyDetail } from "@/app/_components/pages/coin-content";
export async function generateMetadata({ params }: { params: Promise<{ bountyId: string }> }) { return { title: `悬赏 ${(await params).bountyId}` }; }
export default async function BountyPage({ params }: { params: Promise<{ bountyId: string }> }) { const { bountyId } = await params; return <CoinBountyDetail id={bountyId} />; }
