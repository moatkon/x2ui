import { AccountAuthPage } from "@/app/_components/pages/account-content";
import type { QueryParams } from "@/app/_lib/query";
export const metadata = { title: "登录" };
export default async function LoginPage({ searchParams }: { searchParams: Promise<QueryParams> }) {
  const requested = (await searchParams).next;
  const returnTo = typeof requested === "string" && requested.startsWith("/") && !requested.startsWith("//")
    ? requested
    : "/";
  return <AccountAuthPage type="login" returnTo={returnTo} />;
}
