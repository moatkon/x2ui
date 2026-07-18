import type { MetadataRoute } from "next";
import { getPublicFeed, getPublicNodes, getPublicTags } from "@/app/_server/public-content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL ?? "https://x2post.com";
  const [nodes, feed, tagPage] = await Promise.all([getPublicNodes(), getPublicFeed(), getPublicTags()]);
  const updated = new Date();
  const routes = [
    "",
    "/nodes",
    ...nodes.flatMap((node) => [
      `/nodes/${node.slug}`,
      `/nodes/${node.slug}/project`,
      ...node.children.map((child) => `/nodes/${node.slug}/${child.slug}`),
    ]),
    ...feed.items.map((post) => `/posts/${post.id}`),
    "/tags",
    ...tagPage.items.map((tag) => `/tags/${encodeURIComponent(tag.slug)}`),
    ...[...new Set(feed.items.map((post) => post.author.userName))].flatMap((userName) => [
      `/users/${userName}`,
      `/users/${userName}/posts`,
      `/users/${userName}/comments`,
      `/users/${userName}/followers`,
      `/users/${userName}/following`,
    ]),
    "/coins/rules",
    "/coins/economy",
    "/seasons",
    "/seasons/summer-first-reply",
    "/seasons/spring-discovery",
  ];

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: updated,
    changeFrequency: route.startsWith("/posts/") ? "weekly" : "daily",
    priority: route === "" ? 1 : route.startsWith("/posts/") ? 0.8 : 0.7,
  }));
}
