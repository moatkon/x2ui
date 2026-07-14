import type { Metadata } from "next";
import { DemoFeedbackProvider } from "./_components/client/demo-actions";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://x2post.com"),
  title: { default: "X2Post · 轻量社区", template: "%s · X2Post" },
  description: "一个内容优先、公开可读、秩序透明的轻量社区。",
  applicationName: "X2Post",
  openGraph: {
    siteName: "X2Post",
    type: "website",
    locale: "zh_CN",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" data-theme="lofi" suppressHydrationWarning>
      <body>
        <DemoFeedbackProvider>
          <a href="#main-content" className="btn btn-sm fixed left-3 top-3 z-50 -translate-y-24 focus:translate-y-0">跳到主要内容</a>
          {children}
        </DemoFeedbackProvider>
      </body>
    </html>
  );
}
