import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { RouteContent } from "@/app/_components/route-content";
import { SiteShell } from "@/app/_components/site-shell";
import {
  type CatchAllPageProps,
  isKnownRoute,
  pathFrom,
  shouldNoIndex,
  titleFor,
} from "@/app/_lib/page-routing";
import { posts } from "@/lib/mock-data";

export async function generateMetadata({ params }: CatchAllPageProps): Promise<Metadata> {
  const path = pathFrom((await params).slug);
  const title = titleFor(path);
  const post = path.startsWith("/posts/") ? posts.find((item) => path.endsWith(item.id)) : undefined;
  const description = post?.excerpt ?? "一个内容优先、公开可读、秩序透明的轻量社区。";
  const canonical = path === "/feed" ? "/" : path;
  return {
    title,
    description,
    alternates: { canonical },
    robots: shouldNoIndex(path) ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: { title, description, url: canonical },
  };
}

export default async function Page({ params, searchParams }: CatchAllPageProps) {
  const path = pathFrom((await params).slug);
  const query = await searchParams;
  if (path.startsWith("/user/")) redirect(path.replace("/user/", "/users/"));
  if (!isKnownRoute(path)) notFound();
  return <SiteShell path={path}><RouteContent path={path} query={query} /></SiteShell>;
}
