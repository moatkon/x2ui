import type { QueryParams } from "@/app/_lib/page-routing";
import { FeedContent } from "./pages/feed-content";
import { NodesContent, NodeProjectContent } from "./pages/nodes-content";
import { PostContent } from "./pages/post-content";
import { UserContent } from "./pages/user-content";
import { SearchContent } from "./pages/search-content";
import { TagsContent } from "./pages/tags-content";
import { SeasonsContent } from "./pages/seasons-content";
import { AccountRouteContent } from "./pages/account-content";
import { CoinRouteContent } from "./pages/coin-content";
import { JourneyRouteContent } from "./pages/journey-content";
import { ModerationRouteContent } from "./pages/moderation-content";
import { PrototypeStatesContent } from "./pages/prototype-states-content";

export function RouteContent({ path, query }: { path: string; query: QueryParams }) {
  if (path === "/feed") return <FeedContent query={query} />;
  if (/^\/nodes\/[^/]+\/project$/.test(path)) return <NodeProjectContent path={path} />;
  if (path === "/nodes" || path.startsWith("/nodes/")) return <NodesContent path={path} />;
  if (path.startsWith("/posts/")) return <PostContent path={path} />;
  if (path.startsWith("/users/") || path.startsWith("/user/")) return <UserContent path={path} />;
  if (path === "/search") return <SearchContent query={query} />;
  if (path.startsWith("/tags")) return <TagsContent path={path} />;
  if (path === "/seasons" || path.startsWith("/seasons/")) return <SeasonsContent path={path} />;
  if (path === "/coins" || path.startsWith("/coins/") || path === "/settings/coins" || path.startsWith("/moderation/coins") || path.startsWith("/admin/coins")) return <CoinRouteContent path={path} />;
  if (path === "/journey" || path.startsWith("/journey/") || path === "/quests" || path.startsWith("/quests/") || path === "/play" || path.startsWith("/play/") || path === "/me/progress" || path === "/me/contributions" || path === "/me/collection" || path === "/settings/journey") return <JourneyRouteContent path={path} />;
  if (path === "/moderation" || path.startsWith("/moderation/")) return <ModerationRouteContent path={path} />;
  if (path === "/prototype/states") return <PrototypeStatesContent />;
  return <AccountRouteContent path={path} query={query} />;
}
