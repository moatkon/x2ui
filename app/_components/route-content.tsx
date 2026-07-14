import type { QueryParams } from "@/app/_lib/page-routing";
import { FeedContent } from "./pages/feed-content";
import { NodesContent, NodeProjectContent } from "./pages/nodes-content";
import { PostContent } from "./pages/post-content";
import { UserContent } from "./pages/user-content";
import { SearchContent } from "./pages/search-content";
import { TagsContent } from "./pages/tags-content";
import { CoinEconomyContent, CoinRulesContent } from "./pages/coin-public-content";
import { SeasonsContent } from "./pages/seasons-content";

export function RouteContent({ path, query }: { path: string; query: QueryParams }) {
  if (path === "/feed") return <FeedContent query={query} />;
  if (/^\/nodes\/[^/]+\/project$/.test(path)) return <NodeProjectContent path={path} />;
  if (path === "/nodes" || path.startsWith("/nodes/")) return <NodesContent path={path} />;
  if (path.startsWith("/posts/")) return <PostContent path={path} />;
  if (path.startsWith("/users/") || path.startsWith("/user/")) return <UserContent path={path} />;
  if (path === "/search") return <SearchContent query={query} />;
  if (path.startsWith("/tags")) return <TagsContent path={path} />;
  if (path === "/coins/rules") return <CoinRulesContent />;
  if (path === "/coins/economy") return <CoinEconomyContent />;
  if (path === "/seasons" || path.startsWith("/seasons/")) return <SeasonsContent path={path} />;
  return <div className="skeleton h-80 w-full" aria-label="正在加载交互页面" />;
}
