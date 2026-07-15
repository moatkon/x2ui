import { CoinRouteContent } from "@/app/_components/pages/coin-content";
import { metadataForPath } from "@/app/_lib/metadata";
export const metadata = metadataForPath("/coins/economy");
export default function CoinEconomyPage() { return <CoinRouteContent path="/coins/economy" />; }
