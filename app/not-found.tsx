import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "页面不存在",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main id="main-content" className="mx-auto min-h-screen max-w-2xl px-4 py-16">
      <section className="overflow-hidden rounded-box border-2 border-base-content/20">
        <header className="border-b-2 border-base-content/20 px-5 py-4"><h1 className="text-3xl font-black">404</h1></header>
        <div className="p-5"><p className="opacity-70">链接可能已失效，或内容因隐私原因不可见。</p></div>
        <footer className="border-t-2 border-base-content/20 px-5 py-4"><Link className="btn btn-primary" href="/">返回首页</Link></footer>
      </section>
    </main>
  );
}
