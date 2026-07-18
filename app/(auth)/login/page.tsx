import { AuthCard } from "@/app/_components/auth/auth-card";
import { LoginForm } from "@/app/_components/auth/login-form";
import type { QueryParams } from "@/app/_lib/query";
export const metadata = { title: "登录" };
export default async function LoginPage({ searchParams }: { searchParams: Promise<QueryParams> }) {
  const requested = (await searchParams).next;
  const returnTo = typeof requested === "string" && requested.startsWith("/") && !requested.startsWith("//")
    ? requested
    : "/";
  return <AuthCard title="欢迎回来" description="登录后继续参与讨论"><LoginForm returnTo={returnTo} /></AuthCard>;
}
