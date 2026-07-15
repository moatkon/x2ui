"use client";
import { useEffect } from "react";
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <section className="rounded-box border-2 border-error/40 p-6" role="alert"><h1 className="text-2xl font-black">页面暂时无法显示</h1><p className="mt-2 opacity-70">请稍后重试。{error.digest ? `错误编号：${error.digest}` : ""}</p><button className="btn btn-primary mt-5" onClick={reset}>重新加载</button></section>;
}
