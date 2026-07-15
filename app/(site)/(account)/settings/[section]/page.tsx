import { notFound } from "next/navigation";
import { AccountRouteContent } from "@/app/_components/pages/account-content";
import { CoinRouteContent } from "@/app/_components/pages/coin-content";
import { JourneyRouteContent } from "@/app/_components/pages/journey-content";
const sections = new Set(["profile", "privacy", "notifications", "security", "sessions", "blocked", "coins", "journey"]);
export async function generateMetadata({ params }: { params: Promise<{ section: string }> }) { return { title: `设置 · ${(await params).section}` }; }
export default async function SettingsSectionPage({ params }: { params: Promise<{ section: string }> }) { const { section } = await params; if (!sections.has(section)) notFound(); const path = `/settings/${section}`; if (section === "coins") return <CoinRouteContent path={path} />; if (section === "journey") return <JourneyRouteContent path={path} />; return <AccountRouteContent path={path} query={{}} />; }
