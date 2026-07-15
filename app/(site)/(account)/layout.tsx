import type { Metadata } from "next";
import { requirePageSession } from "@/app/_server/session";
export const metadata: Metadata = { robots: { index: false, follow: false } };
export default async function AccountLayout({ children }: Readonly<{ children: React.ReactNode }>) { await requirePageSession(); return children; }
