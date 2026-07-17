import { requirePageSession } from "@/app/_server/session";

export default async function ModerationLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requirePageSession("moderator");
  return children;
}
