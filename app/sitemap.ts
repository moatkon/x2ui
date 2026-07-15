import type { MetadataRoute } from "next";
import { nodes, posts } from "@/lib/mock-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.SITE_URL ?? "https://x2post.com";
  const updated = new Date("2026-07-14T00:00:00Z");
  const routes = [
    "",
    "/nodes",
    ...nodes.flatMap((node) => [
      `/nodes/${node.slug}`,
      `/nodes/${node.slug}/project`,
      ...node.children.map((child) => `/nodes/${node.slug}/${child.slug}`),
    ]),
    ...posts.map((post) => `/posts/${post.id}`),
    "/tags",
    ...[...new Set(posts.flatMap((post) => post.tags))].map((tag) => `/tags/${encodeURIComponent(tag)}`),
    ...[...new Set(posts.map((post) => post.author.userName))].flatMap((userName) => [
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
