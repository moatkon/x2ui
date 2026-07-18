import Link from "next/link";
import { Panel } from "../shared/ui";

export function RecoveryMessage() {
  return (
    <div className="mx-auto w-full max-w-md">
      <Link className="mb-8 block text-center text-3xl font-black" href="/">X2Post</Link>
      <Panel title="继续浏览" footer={<Link className="btn btn-primary w-full" href="/">返回首页</Link>}>
        <p className="opacity-70">登录已完成。若原操作仍需要执行，请回到对应内容页重新确认，系统不会代替你提交不可逆操作。</p>
      </Panel>
    </div>
  );
}
