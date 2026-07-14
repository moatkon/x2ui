import type { Metadata } from "next";
import { PrototypeRuntime } from "./prototype-runtime";
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
        <a href="#main-content" className="btn btn-sm fixed left-3 top-3 z-50 -translate-y-24 focus:translate-y-0">
          跳到主要内容
        </a>
        {children}
        <div id="toast-region" className="toast toast-end toast-bottom z-50" aria-live="polite" aria-atomic="true" />
        <dialog id="app-dialog" className="modal">
          <div className="modal-box border-2 border-base-content/20">
            <div id="dialog-content" />
            <form method="dialog" className="modal-action">
              <button className="btn">关闭</button>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button aria-label="关闭对话框">关闭</button>
          </form>
        </dialog>
        <PrototypeRuntime />
      </body>
    </html>
  );
}
