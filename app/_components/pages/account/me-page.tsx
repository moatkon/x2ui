import Link from "next/link";
import { getMeSummary } from "@/app/_server/account-data";
import { PageHeader, Panel } from "../../shared/ui";

export async function MeContent() {
  const me = await getMeSummary();
  return (
    <>
      <PageHeader title="我的主页" description="管理你的内容、关系和待办。" action={<Link className="btn" href={`/users/${encodeURIComponent(me.user.userName)}`}>查看公开主页</Link>} />
      <Panel title={me.user.displayName} footer={<div className="flex flex-wrap gap-2"><Link className="btn" href="/settings/profile">编辑资料</Link><Link className="btn" href="/drafts">草稿 {me.counts.drafts}</Link><Link className="btn" href="/notifications">通知 {me.counts.unreadNotifications}</Link><Link className="btn" href="/bookmarks">收藏 {me.counts.bookmarks}</Link></div>}>
        <div className="flex items-center gap-4"><div className="flex size-16 items-center justify-center rounded-full bg-base-300 text-2xl font-black" aria-hidden>{me.user.displayName.slice(0, 1)}</div><div><p className="text-xl font-black">{me.user.displayName} <span className="text-sm font-normal opacity-60">@{me.user.userName}</span></p><p className="mt-1 opacity-70">{me.emailMasked} · {me.emailVerified ? "邮箱已验证" : "邮箱未验证"}</p></div></div>
        <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{[["草稿", me.counts.drafts], ["通知", me.counts.unreadNotifications], ["收藏", me.counts.bookmarks], ["关注", me.counts.following]].map(([label, value]) => <div key={label}><dt className="text-sm opacity-60">{label}</dt><dd className="text-xl font-bold">{value}</dd></div>)}</dl>
      </Panel>
    </>
  );
}
