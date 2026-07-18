import { QuickComposeContent } from "@/app/_components/pages/account/quick-compose-page";
import type { QueryParams } from "@/app/_lib/query";
export const metadata = { title: "轻发布" };
export default async function QuickComposePage({ searchParams }: { searchParams: Promise<QueryParams> }) { return <QuickComposeContent query={await searchParams} />; }
