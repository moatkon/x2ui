import { SeasonsContent } from "@/app/_components/pages/seasons-content";
import { metadataForPath } from "@/app/_lib/metadata";
export const metadata = metadataForPath("/seasons");
export default function SeasonsPage() { return <SeasonsContent path="/seasons" />; }
