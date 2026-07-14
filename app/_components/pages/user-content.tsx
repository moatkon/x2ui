import Link from "next/link";
import { comments, currentUser, posts } from "@/lib/mock-data";
import { Avatar } from "../shared/avatar";
import { PostRows } from "../shared/post-rows";

const sections = [["profile","公开资料"],["posts","帖子"],["comments","评论"],["following","关注"],["followers","粉丝"]] as const;

export function UserContent({ path }: { path: string }) {
  const [, , userName, section = "profile"] = path.split("/");
  const userPosts = posts.filter((post) => post.author.userName === userName);
  const displayName = userPosts[0]?.author.displayName ?? currentUser.displayName;
  return <><header className="flex items-center gap-4"><Avatar name={displayName} image={`user-${userName}`} /><div><h1 className="text-3xl font-black">{displayName}</h1><p className="opacity-60">@{userName} · 上海</p></div></header><nav className="tabs tabs-border mt-5 overflow-x-auto" aria-label="用户公开分区">{sections.map(([key,label]) => <Link className={`tab ${section === key ? "tab-active" : ""}`} href={`/users/${userName}${key === "profile" ? "" : `/${key}`}`} key={key}>{label}</Link>)}</nav>{section === "profile" ? <><p className="mt-5 leading-relaxed">{userName === currentUser.userName ? currentUser.bio : "认真参与社区讨论，持续分享可复用的经验。"}</p><dl className="mt-5 grid grid-cols-2 overflow-hidden rounded-box border-2 border-base-content/20 sm:grid-cols-4">{Object.entries(currentUser.stats).map(([key, value]) => <div className="p-4" key={key}><dt className="text-sm opacity-60">{key}</dt><dd className="text-2xl font-black">{value}</dd></div>)}</dl></> : null}{section === "posts" ? <div className="mt-5"><PostRows filter={(post) => post.author.userName === userName} /></div> : null}{section === "comments" ? <ul className="list x2-list mt-5 rounded-box border-2 border-base-content/20">{comments.map((comment) => <li className="list-row rounded-none" key={comment.id}><div><Link className="font-bold" href="/posts/immutable-content">为什么社区内容需要明确的不可变边界？</Link><p className="mt-2">{comment.bodyMarkdown}</p></div></li>)}</ul> : null}{section === "following" || section === "followers" ? <ul className="list x2-list mt-5 rounded-box border-2 border-base-content/20">{posts.slice(0,3).map((post) => <li className="list-row rounded-none" key={post.author.userName}><Avatar name={post.author.displayName} image={`user-${post.author.userName}`} /><Link className="font-bold" href={`/users/${post.author.userName}`}>{post.author.displayName}</Link></li>)}</ul> : null}</>;
}
