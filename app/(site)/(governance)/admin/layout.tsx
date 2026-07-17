import { requirePageSession } from "@/app/_server/session";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requirePageSession("controller");
  return children;
}
