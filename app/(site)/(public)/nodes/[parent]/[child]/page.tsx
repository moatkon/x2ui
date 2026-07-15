import { NodesContent } from "@/app/_components/pages/nodes-content";
import { nodeMetadata } from "@/app/_lib/metadata";
export async function generateMetadata({ params }: { params: Promise<{ parent: string; child: string }> }) { const { parent, child } = await params; return nodeMetadata(parent, child); }
export default async function ChildNodePage({ params }: { params: Promise<{ parent: string; child: string }> }) { const { parent, child } = await params; return <NodesContent path={`/nodes/${parent}/${child}`} />; }
