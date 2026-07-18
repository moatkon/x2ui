import Link from "next/link";
import type { ReactNode } from "react";

export function AuthCard({
  title,
  description,
  children,
  notice,
}: {
  title: string;
  description: string;
  children: ReactNode;
  notice?: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-md">
      <Link className="mb-8 block text-center text-3xl font-black" href="/">X2Post</Link>
      <section className="overflow-hidden rounded-box border-2 border-base-content/20">
        <header className="border-b-2 border-base-content/20 p-5 text-center">
          <h1 className="text-2xl font-black">{title}</h1>
          <p className="mt-1 opacity-65">{description}</p>
        </header>
        <div className="p-5">
          {notice}
          <div className={notice ? "mt-4" : ""}>{children}</div>
        </div>
      </section>
      <p className="mt-5 text-center text-sm opacity-60">继续即表示你理解：已发布内容不能编辑或删除。</p>
    </div>
  );
}
