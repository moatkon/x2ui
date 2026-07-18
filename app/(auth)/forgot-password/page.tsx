import { AuthCard } from "@/app/_components/auth/auth-card";
import { ForgotPasswordForm } from "@/app/_components/auth/forgot-password-form";
export const metadata = { title: "找回密码" };
export default function ForgotPasswordPage() {
  return <AuthCard title="找回密码" description="输入注册邮箱，我们会发送重置说明"><ForgotPasswordForm /></AuthCard>;
}
