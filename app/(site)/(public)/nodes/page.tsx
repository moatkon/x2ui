import { NodeDirectoryPage } from "@/app/_components/pages/nodes/directory-page";
import { metadataForPath } from "@/app/_lib/metadata";
export const metadata = metadataForPath("/nodes");
export default function NodesPage() { return <NodeDirectoryPage />; }
