import type { MetadataRoute } from "next";
import { nodes, posts } from "@/lib/mock-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://x2post.com";
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
    "/search",
    "/tags",
    ...[...new Set(posts.flatMap((post) => post.tags))].map((tag) => `/tags/${encodeURIComponent(tag)}`),
    ...[...new Set(posts.map((post) => post.author.userName))].map((userName) => `/users/${userName}`),
    "/coins/rules",
    "/coins/economy",
    "/seasons",
  ];

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: updated,
    changeFrequency: route.startsWith("/posts/") ? "weekly" : "daily",
    priority: route === "" ? 1 : route.startsWith("/posts/") ? 0.8 : 0.7,
  }));
}
