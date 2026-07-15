import { NodeProjectPage as NodeProjectContent } from "@/app/_components/pages/nodes-content";
import { nodeMetadata } from "@/app/_lib/metadata";
export async function generateMetadata({ params }: { params: Promise<{ parent: string }> }) { const { parent } = await params; const base = nodeMetadata(parent); return { ...base, title: `${String(base.title ?? "节点")} · 公开共建`, alternates: { canonical: `/nodes/${parent}/project` } }; }
export default async function NodeProjectPage({ params }: { params: Promise<{ parent: string }> }) { const { parent } = await params; return <NodeProjectContent slug={parent} />; }
