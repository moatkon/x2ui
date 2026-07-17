import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicTagPosts, getPublicTags } from "@/app/_server/public-content";
import { PostRows } from "../shared/post-rows";

export async function TagsDirectoryPage() {
  const tags = await getPublicTags();
  return <><h1 className="text-3xl font-black">标签</h1><p className="mt-1 opacity-70">从具体话题进入跨节点讨论。</p><ul className="list x2-list mt-5 rounded-box border-2 border-base-content/20">{tags.map((tag) => <li className="list-row rounded-none" key={tag.slug}><div className="list-col-grow"><Link className="font-bold" href={`/tags/${encodeURIComponent(tag.slug)}`}># {tag.label}</Link><p className="mt-1 text-sm opacity-65">{tag.publicPostCount} 个公开帖子</p></div><span aria-hidden>›</span></li>)}</ul></>;
}

export async function TagPostsPage({ slug }: { slug: string }) {
  const result = await getPublicTagPosts(slug);
  if (!result) notFound();
  return <><h1 className="text-3xl font-black"># {result.tag.label}</h1><p className="mt-1 opacity-70">包含此标签的公开帖子。</p><div className="mt-5"><PostRows posts={result.items} /></div></>;
}
