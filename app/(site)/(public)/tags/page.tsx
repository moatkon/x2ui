import { TagsContent } from "@/app/_components/pages/tags-content";
import { metadataForPath } from "@/app/_lib/metadata";
export const metadata = metadataForPath("/tags");
export default function TagsPage() { return <TagsContent path="/tags" />; }
