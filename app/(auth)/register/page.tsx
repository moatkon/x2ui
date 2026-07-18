import { AuthCard } from "@/app/_components/auth/auth-card";
import { RegisterForm } from "@/app/_components/auth/register-form";
export const metadata = { title: "注册" };
export default function RegisterPage() {
  return <AuthCard title="加入 X2Post" description="从一段真诚的自我介绍开始"><RegisterForm /></AuthCard>;
}
