import Link from "next/link";
import { Panel } from "../shared/ui";

export function VerifyResult() {
  return (
    <div className="mx-auto w-full max-w-md">
      <Link className="mb-8 block text-center text-3xl font-black" href="/">X2Post</Link>
      <Panel title="邮箱验证成功" footer={<Link className="btn btn-primary w-full" href="/login">登录</Link>}>
        <div className="text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full border-2 border-success text-2xl text-success">✓</div>
          <h1 className="mt-4 text-2xl font-black">邮箱已验证</h1>
          <p className="mt-2 opacity-70">现在可以使用已创建的账号登录。</p>
        </div>
      </Panel>
    </div>
  );
}
