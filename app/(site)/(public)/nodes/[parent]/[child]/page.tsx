import { ChildNodePage as ChildNodeContent } from "@/app/_components/pages/nodes/child-page";
import { nodeMetadata } from "@/app/_lib/metadata";
export async function generateMetadata({ params }: { params: Promise<{ parent: string; child: string }> }) { const { parent, child } = await params; return nodeMetadata(parent, child); }
export default async function ChildNodePage({ params, searchParams }: { params: Promise<{ parent: string; child: string }>; searchParams: Promise<{ cursor?: string }> }) { const { parent, child } = await params; return <ChildNodeContent parentSlug={parent} childSlug={child} cursor={(await searchParams).cursor} />; }
