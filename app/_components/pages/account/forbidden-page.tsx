import Link from "next/link";
import { Notice, Panel } from "../../shared/ui";

export function ForbiddenContent() {
  return <Panel title="没有访问权限" footer={<div className="flex gap-2"><Link className="btn btn-primary" href="/">返回首页</Link><Link className="btn" href="/nodes">查看公开规则</Link></div>}><h1 className="text-3xl font-black">403</h1><p className="mt-2 opacity-70">你的账号没有进入该工作台的权限。公开内容仍可正常浏览。</p><div className="mt-4"><Notice kind="warning"><p>如果你刚获得权限，请重新登录或联系社区管理员确认授权。</p></Notice></div></Panel>;
}
