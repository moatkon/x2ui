import Link from "next/link";
import { ActionButton } from "../client/action-button";
import { EmptyState, Notice, PageHeader, Panel } from "../shared/ui";

export function PrototypeStatesContent() {
  return <><PageHeader title="界面状态验收" description="用于开发交接的完整状态样例，不进入产品主导航。" /><div className="space-y-5"><Panel title="Loading"><div className="space-y-3" aria-busy="true"><div className="skeleton h-5 w-2/3" /><div className="skeleton h-20 w-full" /><div className="skeleton h-20 w-full" /></div></Panel><Panel title="Empty"><EmptyState title="还没有收藏的帖子" description="浏览公开内容，并把想稍后继续阅读的帖子加入收藏。" action={<Link className="btn btn-primary" href="/">浏览最新帖子</Link>} /></Panel><Panel title="Partial"><Notice kind="warning"><p>帖子已加载，但作者摘要暂时不可用。</p></Notice></Panel><Panel title="Error"><Notice kind="error"><p>加载失败，请检查网络后重试。Request ID: x2p-demo-01</p></Notice><div className="mt-4"><ActionButton message="正在重新加载">重试</ActionButton></div></Panel><Panel title="Unauthorized / Forbidden / Not Found"><div className="space-y-3"><Notice kind="info"><p>登录后继续，当前输入和来源会保留。</p></Notice><Notice kind="warning"><p>你没有执行此操作的权限。</p></Notice><Notice kind="info"><p>内容不存在或当前不可见。</p></Notice></div></Panel><Panel title="Rate Limited / Conflict"><div className="space-y-3"><Notice kind="warning"><p>操作过于频繁，请在 42 秒后重试。</p></Notice><Notice kind="error"><p>草稿已在另一设备更新。请比较内容后选择保留版本。</p></Notice></div></Panel></div></>;
}
