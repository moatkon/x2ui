import Link from "next/link";
import { getPublicSeasons } from "@/app/_server/public-content";
import { EmptyState, Notice, PageHeader, Pagination, ProgressBar } from "../../shared/ui";
import { seasonStatusLabel } from "./season-status";

export async function SeasonsDirectoryPage({ cursor }: { cursor?: string }) {
  const page = await getPublicSeasons(cursor);
  const seasons = page.items;

  return (
    <>
      <PageHeader
        title="社区共建季"
        description="围绕一个公开、可验收的社区问题协作，不比较个人排名。"
      />
      <Notice>
        <p>季节结束只停止新增任务，不会清空个人进度、CXP、金币或已获得收藏。</p>
      </Notice>
      {seasons.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            title="暂无共建季"
            description="新的公共共建计划发布后会显示在这里。"
          />
        </div>
      ) : (
        <ul className="list x2-list mt-5 overflow-hidden rounded-box border-2 border-base-content/20">
          {seasons.map((season) => (
            <li className="list-row rounded-none" key={season.slug}>
              <div className="list-col-grow">
                <p className="text-sm opacity-60">{season.scope}</p>
                <Link
                  className="mt-1 block font-bold hover:underline"
                  href={`/seasons/${season.slug}`}
                >
                  {season.title}
                </Link>
                <p className="mt-1 text-sm opacity-65">
                  {seasonStatusLabel[season.status]}
                </p>
                <div className="mt-3">
                  <ProgressBar
                    value={season.progress.accepted}
                    max={Math.max(1, season.progress.target)}
                    label="公共成果进度"
                  />
                </div>
              </div>
              <span aria-hidden>›</span>
            </li>
          ))}
        </ul>
      )}
      {seasons.length ? <div className="mt-5"><Pagination nextCursor={page.nextCursor} href="/seasons" /></div> : null}
    </>
  );
}
