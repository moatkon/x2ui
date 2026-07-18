import { AppealNewPage } from "@/app/_components/pages/account/appeal-new-page";
import type { QueryParams } from "@/app/_lib/query";
export const metadata = { title: "发起申诉" };
export default async function NewAppealPage({ searchParams }: { searchParams: Promise<QueryParams> }) { const cursor = (await searchParams).cursor; return <AppealNewPage cursor={typeof cursor === "string" ? cursor : undefined} />; }
