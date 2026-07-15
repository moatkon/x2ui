import { SeasonsContent } from "@/app/_components/pages/seasons-content";
import { metadataForPath } from "@/app/_lib/metadata";
const seasons = ["summer-first-reply", "spring-discovery"];
export function generateStaticParams() { return seasons.map((slug) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; return metadataForPath(`/seasons/${slug}`, "社区共建季详情", "查看社区共建季的公开目标、进度与归档成果。"); }
export default async function SeasonPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; return <SeasonsContent path={`/seasons/${slug}`} />; }
