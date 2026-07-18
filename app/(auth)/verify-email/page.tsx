import { AuthCard } from "@/app/_components/auth/auth-card";
import { VerifyEmailForm } from "@/app/_components/auth/verify-email-form";
import type { QueryParams } from "@/app/_lib/query";
export const metadata = { title: "验证邮箱" };
export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<QueryParams> }) {
  const token = (await searchParams).token;
  return (
    <AuthCard
      title="验证邮箱"
      description="输入邮件中的一次性验证凭据"
      notice={<p className="alert">验证凭据只会提交到 X2API，不会保存在浏览器存储中。</p>}
    >
      <VerifyEmailForm defaultToken={typeof token === "string" ? token : ""} />
    </AuthCard>
  );
}
