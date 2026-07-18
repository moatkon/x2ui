import { AuthCard } from "@/app/_components/auth/auth-card";
import { ResetPasswordForm } from "@/app/_components/auth/reset-password-form";
import type { QueryParams } from "@/app/_lib/query";
export const metadata = { title: "重置密码" };
export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<QueryParams> }) {
  const token = (await searchParams).token;
  return <AuthCard title="设置新密码" description="新密码会让其他设备上的旧会话失效"><ResetPasswordForm defaultToken={typeof token === "string" ? token : ""} /></AuthCard>;
}
