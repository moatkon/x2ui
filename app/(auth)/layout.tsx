import type { Metadata } from "next";
import { DemoFeedbackProvider } from "@/app/_components/client/demo-actions";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <DemoFeedbackProvider><main id="main-content" className="mx-auto flex min-h-screen max-w-md items-center px-4 py-10">{children}</main></DemoFeedbackProvider>;
}
