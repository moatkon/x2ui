import Link from "next/link";

const seasons = [
  ["summer-first-reply", "2026 夏 · 让新人得到第一条好回应", "跨节点公共共建 · 进行中"],
  ["spring-discovery", "2026 春 · 公开资料可发现性", "前端开发 × 产品设计 · 已归档"],
] as const;

export function SeasonsContent({ path }: { path: string }) {
  const slug = path.split("/")[2];
  if (!slug) return <><header className="mb-5"><h1 className="text-3xl font-black">社区共建季</h1><p className="mt-1 opacity-70">围绕一个公开、可验收的社区问题协作，不比较个人排名。</p></header><div className="alert alert-info alert-soft mb-5"><p>季节结束只停止新增任务，不会清空个人进度、CXP、金币或已获得收藏。</p></div><ul className="list x2-list rounded-box border-2 border-base-content/20">{seasons.map(([id,title,desc]) => <li className="list-row rounded-none" key={id}><div className="list-col-grow"><Link className="font-bold" href={`/seasons/${id}`}>{title}</Link><p className="mt-1 opacity-65">{desc}</p></div></li>)}</ul></>;
  const past = slug === "spring-discovery";
  return <><div className="breadcrumbs text-sm"><ul><li><Link href="/seasons">社区共建季</Link></li><li>{past ? "2026 春" : "2026 夏"}</li></ul></div><header className="my-4"><h1 className="text-3xl font-black">{past ? "公开资料可发现性" : "让新人得到第一条好回应"}</h1><p className="mt-1 opacity-70">{past ? "已完成 · 成果公开归档" : "进行中 · 跨节点公共共建"}</p></header><section className="rounded-box border-2 border-base-content/20 p-5"><h2 className="text-xl font-bold">公共目标</h2><p className="mt-3 leading-relaxed">{past ? "将高频问题、标准链接与讨论结论整理为公开索引，并让节点入口可以反向抵达这些成果。" : "让发布 24 小时仍无有效回应的新主题，在不制造灌水的前提下获得一条有上下文、有下一步的首响。"}</p><progress className="progress mt-5 w-full" value={past ? 100 : 68} max="100" /></section></>;
}
