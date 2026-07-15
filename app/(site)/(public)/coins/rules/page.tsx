import { CoinRouteContent } from "@/app/_components/pages/coin-content";
import { metadataForPath } from "@/app/_lib/metadata";
export const metadata = metadataForPath("/coins/rules");
export default function CoinRulesPage() { return <CoinRouteContent path="/coins/rules" />; }
