import { NodesContent } from "@/app/_components/pages/nodes-content";
import { metadataForPath } from "@/app/_lib/metadata";
export const metadata = metadataForPath("/nodes");
export default function NodesPage() { return <NodesContent path="/nodes" />; }
