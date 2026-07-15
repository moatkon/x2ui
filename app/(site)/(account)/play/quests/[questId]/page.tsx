import { permanentRedirect } from "next/navigation";
export default async function PlayQuestAliasPage({ params }: { params: Promise<{ questId: string }> }): Promise<never> { permanentRedirect(`/quests/${(await params).questId}`); }
