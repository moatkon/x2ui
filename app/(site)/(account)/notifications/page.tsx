import { NotificationsContent } from "@/app/_components/pages/account/notifications-page";
import type { QueryParams } from "@/app/_lib/query";
export const metadata = { title: "通知中心" };
export default async function NotificationsPage({ searchParams }: { searchParams: Promise<QueryParams> }) { const cursor = (await searchParams).cursor; return <NotificationsContent cursor={typeof cursor === "string" ? cursor : undefined} />; }
