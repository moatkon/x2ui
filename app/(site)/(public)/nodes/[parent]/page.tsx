import { ParentNodePage } from "@/app/_components/pages/nodes-content";
import { nodeMetadata } from "@/app/_lib/metadata";
export async function generateMetadata({ params }: { params: Promise<{ parent: string }> }) { return nodeMetadata((await params).parent); }
export default async function NodePage({ params }: { params: Promise<{ parent: string }> }) { const { parent } = await params; return <ParentNodePage slug={parent} />; }
