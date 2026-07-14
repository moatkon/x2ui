import Link from "next/link";
import { knownTags } from "@/app/_lib/page-routing";
import { PostRows } from "../shared/post-rows";

export function TagsContent({ path }: { path: string }) {
  const slug = path.split("/")[2] ? decodeURIComponent(path.split("/")[2]) : "";
  if (!slug) return <><h1 className="text-3xl font-black">标签</h1><p className="mt-1 opacity-70">从具体话题进入跨节点讨论。</p><ul className="list x2-list mt-5 rounded-box border-2 border-base-content/20">{[...knownTags].map((tag) => <li className="list-row rounded-none" key={tag}><Link className="font-bold" href={`/tags/${encodeURIComponent(tag)}`}># {tag}</Link></li>)}</ul></>;
  return <><h1 className="text-3xl font-black"># {slug}</h1><p className="mt-1 opacity-70">包含此标签的公开帖子。</p><div className="mt-5"><PostRows filter={(post) => post.tags.includes(slug)} /></div></>;
}
