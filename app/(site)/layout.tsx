import { DemoFeedbackProvider } from "@/app/_components/client/demo-actions";
import { SiteShell } from "@/app/_components/site-shell";

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <DemoFeedbackProvider><SiteShell>{children}</SiteShell></DemoFeedbackProvider>;
}
