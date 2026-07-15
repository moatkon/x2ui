"use client";
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="zh-CN"><body><main className="mx-auto max-w-xl p-8"><h1 className="text-3xl font-black">X2Post 暂时不可用</h1><p className="mt-3">应用遇到了未处理的问题，请重新加载。</p><button className="btn btn-primary mt-5" onClick={reset}>重试</button></main></body></html>;
}
