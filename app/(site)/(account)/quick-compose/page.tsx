import { AccountRouteContent } from "@/app/_components/pages/account-content";
import type { QueryParams } from "@/app/_lib/query";
export const metadata = { title: "轻发布" };
export default async function QuickComposePage({ searchParams }: { searchParams: Promise<QueryParams> }) { return <AccountRouteContent path="/quick-compose" query={await searchParams} />; }
