import { ComposeContent } from "@/app/_components/pages/account/compose-page";
import type { QueryParams } from "@/app/_lib/query";
export const metadata = { title: "发布帖子" };
export default async function ComposePage({ searchParams }: { searchParams: Promise<QueryParams> }) { return <ComposeContent query={await searchParams} />; }
