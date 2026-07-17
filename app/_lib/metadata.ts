import type { Metadata } from "next";
import { getPublicNode, getPublicPost, getPublicUser } from "@/app/_server/public-content";

const descriptions: Record<string, string> = {
  "/": "浏览 X2Post 最新公开讨论，按两级节点和标签发现值得参与的内容。",
  "/nodes": "查看 X2Post 的两级社区节点、发帖边界和公开规则。",
  "/search": "搜索 X2Post 的公开帖子、用户、节点和标签。",
  "/tags": "浏览跨节点组织公开讨论的社区标签。",
  "/coins/rules": "查看 X2Post 非货币化社区金币的公开规则和版本边界。",
  "/coins/economy": "查看 X2Post 社区金币发行、销毁与活跃度的公开汇总。",
  "/seasons": "浏览 X2Post 社区共建季、公开目标与归档成果。",
};

const titles: Record<string, string> = {
  "/": "最新帖子",
  "/nodes": "节点目录",
  "/search": "搜索",
  "/tags": "社区标签",
  "/coins/rules": "金币经济规则",
  "/coins/economy": "金币经济透明度",
  "/seasons": "社区共建季",
};

export function metadataForPath(path: string, title = titles[path] ?? "X2Post", description = descriptions[path] ?? "一个内容优先、公开可读、秩序透明的轻量社区。"): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path },
  };
}

export async function postMetadata(id: string): Promise<Metadata> {
  const detail = await getPublicPost(id);
  if (!detail) return { title: "帖子不存在", robots: { index: false, follow: false } };
  return metadataForPath(`/posts/${id}`, detail.post.title, detail.post.excerpt);
}

export async function nodeMetadata(parentSlug: string, childSlug?: string): Promise<Metadata> {
  const result = await getPublicNode(parentSlug, childSlug);
  if (!result || (childSlug && !result.child)) return { title: "节点不存在", robots: { index: false, follow: false } };
  const { parent, child } = result;
  const title = child ? `${parent.name} / ${child.name}` : parent.name;
  const description = child?.description ?? parent.description;
  return metadataForPath(`/nodes/${parentSlug}${childSlug ? `/${childSlug}` : ""}`, title, description);
}

export async function userMetadata(userName: string, section?: string): Promise<Metadata> {
  const profile = await getPublicUser(userName);
  if (!profile) return { title: "用户不存在", robots: { index: false, follow: false } };
  const displayName = profile.user.displayName;
  const sectionTitle: Record<string, string> = { posts: "公开帖子", comments: "公开评论", followers: "粉丝", following: "关注" };
  const title = section ? `${displayName}的${sectionTitle[section] ?? section}` : `${displayName} (@${userName})`;
  return metadataForPath(`/users/${userName}${section ? `/${section}` : ""}`, title, `${displayName} 在 X2Post 的公开资料与社区贡献。`);
}

export const noIndexMetadata: Metadata = { robots: { index: false, follow: false } };
