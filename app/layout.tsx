import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], display: "swap" });
const themeScript = `(function(){try{var t=localStorage.getItem("x2post-theme");if(t==="night"||t==="lofi")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "https://x2post.com"),
  title: { default: "X2Post · 轻量社区", template: "%s · X2Post" },
  description: "一个内容优先、公开可读、秩序透明的轻量社区。",
  applicationName: "X2Post",
  openGraph: {
    siteName: "X2Post",
    type: "website",
    locale: "zh_CN",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "X2Post" }],
  },
  twitter: { card: "summary_large_image", images: ["/opengraph-image"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" data-theme="lofi" suppressHydrationWarning className={geist.className}>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>
        <a href="#main-content" className="btn btn-sm fixed left-3 top-3 z-50 -translate-y-24 focus:translate-y-0">跳到主要内容</a>
        {children}
      </body>
    </html>
  );
}
