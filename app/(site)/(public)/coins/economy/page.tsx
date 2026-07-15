import { CoinEconomyPage as CoinEconomyContent } from "@/app/_components/pages/coin-content";
import { metadataForPath } from "@/app/_lib/metadata";
export const metadata = metadataForPath("/coins/economy");
export default function CoinEconomyPage() { return <CoinEconomyContent />; }
