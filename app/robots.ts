import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.SITE_URL ?? "https://x2post.com";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/settings/", "/moderation/", "/admin/", "/me/", "/compose", "/quick-compose", "/drafts", "/bookmarks", "/notifications", "/reports", "/appeals", "/login", "/register"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
