import { AccountRouteContent } from "@/app/_components/pages/account-content";
export async function generateMetadata({ params }: { params: Promise<{ reportId: string }> }) { return { title: `举报 ${(await params).reportId}` }; }
export default async function ReportDetailPage({ params }: { params: Promise<{ reportId: string }> }) { const { reportId } = await params; return <AccountRouteContent path={`/me/reports/${reportId}`} query={{}} />; }
