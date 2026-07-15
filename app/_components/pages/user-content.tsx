import Link from "next/link";
import { notFound } from "next/navigation";
import { comments, currentUser, posts } from "@/lib/mock-data";
import { ActionButton } from "../client/demo-actions";
import { Avatar } from "../shared/avatar";
import { PostRows } from "../shared/post-rows";
import { PageTabs, Panel } from "../shared/ui";

const sections = [["profile", "公开资料"], ["posts", "帖子"], ["comments", "评论"], ["following", "关注"], ["followers", "粉丝"]] as const;

export function UserContent({ path }: { path: string }) {
  const [, , userName, section = "profile"] = path.split("/");
  const userPosts = posts.filter((post) => post.author.userName === userName);
  const knownUser = userName === currentUser.userName || posts.some((post) => post.author.userName === userName);
  if (!knownUser) notFound();
  const displayName = userPosts[0]?.author.displayName ?? currentUser.displayName;
  return <><section className="overflow-hidden rounded-box border-2 border-base-content/20"><header className="p-5 sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center"><Avatar name={displayName} image={`user-${userName}`} sizeClass="size-20" /><div className="min-w-0 flex-1"><h1 className="text-2xl font-black">{displayName} <span className="text-base font-normal opacity-60">@{userName}</span></h1><p className="mt-1 opacity-70">上海 · 产品设计</p></div><div className="flex flex-wrap gap-2"><ActionButton message={`已关注${displayName}`}>关注</ActionButton><ActionButton dialogTitle={`屏蔽 @${userName}？`} dialogBody={<p>屏蔽后，你们将较少在 Feed、搜索、提及和通知中看到彼此。对方不会收到通知。</p>}>屏蔽</ActionButton><Link className="btn btn-ghost" href="/report/new">举报</Link></div></div></header><div className="border-t-2 border-base-content/20 px-3"><PageTabs items={sections.map(([key, label]) => ({ label, href: `/users/${userName}${key === "profile" ? "" : `/${key}`}`, active: section === key }))} label="用户公开分区" /></div></section><div className="mt-5"><UserSection section={section} userName={userName} /></div></>;
}

function UserSection({ section, userName }: { section: string; userName: string }) {
  if (section === "profile") return <Panel title="关于"><p className="leading-relaxed">在复杂系统里寻找简单边界。关注社区产品、信任机制与可访问设计。</p><dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">{[["加入时间", "2024 年 8 月"], ["帖子", "36"], ["关注", "48"], ["粉丝", "231"]].map(([label, value]) => <div key={label}><dt className="opacity-60">{label}</dt><dd className="font-semibold">{value}</dd></div>)}</dl></Panel>;
  if (section === "posts") return <PostRows filter={(post) => post.author.userName === userName} />;
  if (section === "comments") return <ul className="list x2-list overflow-hidden rounded-box border-2 border-base-content/20">{comments.map((comment, index) => <li className="list-row rounded-none" key={comment.id}><div><Link className="font-bold hover:underline" href={index ? "/posts/accessible-ui" : "/posts/immutable-content"}>{index ? "给内容社区做无障碍" : "为什么社区内容需要明确的不可变边界？"}</Link><p className="mt-2">{index ? "焦点恢复确实是最容易遗漏的一步。" : "谢谢补充。这里更关键的是把“内容状态”和“原始记录”分开。"}</p><p className="mt-2 text-sm opacity-60">{index ? "周六" : "昨天 18:20"}</p></div></li>)}</ul>;
  const people = [["青屿", "qingyu", "社区运营"], ["阿澈", "ache", "前端与无障碍"], ["周末写字", "weekend", "写作与知识管理"]];
  return <ul className="list x2-list overflow-hidden rounded-box border-2 border-base-content/20">{people.map(([name, user, description]) => <li className="list-row rounded-none" key={user}><Avatar name={name} image={`user-${user}`} /><div className="list-col-grow"><Link className="font-bold hover:underline" href={`/users/${user}`}>{name}</Link><p className="text-sm opacity-65">{description}</p></div><Link className="btn btn-soft btn-sm" href={`/users/${user}`}>{section === "following" ? "已关注" : "查看"}</Link></li>)}</ul>;
}
