import { FeedbackProvider } from "@/app/_components/client/feedback-provider";
import { SiteShell } from "@/app/_components/site-shell";

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <FeedbackProvider><SiteShell>{children}</SiteShell></FeedbackProvider>;
}
