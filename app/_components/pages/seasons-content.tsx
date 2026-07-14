import Link from "next/link";
import { Breadcrumbs, Notice, PageHeader, Panel, ProgressBar } from "../shared/ui";

const seasons = [["summer-first-reply", "2026 夏 · 让新人得到第一条好回应", "跨节点公共共建", 68, "进行中 · 还可参与 19 天"], ["spring-discovery", "2026 春 · 公开资料可发现性", "前端开发 × 产品设计", 100, "成果已归档"]] as const;

export function SeasonsContent({ path }: { path: string }) {
  const slug = path.split("/")[2];
  if (!slug) return <><PageHeader title="社区共建季" description="围绕一个公开、可验收的社区问题协作，不比较个人排名。" /><Notice><p>季节结束只停止新增任务，不会清空个人进度、CXP、金币或已获得收藏。</p></Notice><ul className="list x2-list mt-5 overflow-hidden rounded-box border-2 border-base-content/20">{seasons.map(([id, title, scope, value, status]) => <li className="list-row rounded-none" key={id}><div className="list-col-grow"><p className="text-sm opacity-60">{scope}</p><Link className="mt-1 block font-bold hover:underline" href={`/seasons/${id}`}>{title}</Link><p className="mt-1 text-sm opacity-65">{status}</p><div className="mt-3"><ProgressBar value={value} label="公共成果进度" /></div></div><span aria-hidden>›</span></li>)}</ul></>;
  const past = slug === "spring-discovery";
  return <><Breadcrumbs items={[{ label: "社区共建季", href: "/seasons" }, { label: past ? "2026 春" : "2026 夏" }]} /><div className="mt-3"><PageHeader title={past ? "公开资料可发现性" : "让新人得到第一条好回应"} description={past ? "已完成 · 成果公开归档" : "进行中 · 跨节点公共共建"} /></div><Panel title="公共目标" footer={<p className="text-sm opacity-65">验收由节点维护者与随机贡献者共同完成；成员数和个人得分不参与排序。</p>}><p className="leading-relaxed">{past ? "将高频问题、标准链接与讨论结论整理为公开索引，并让节点入口可以反向抵达这些成果。" : "让发布 24 小时仍无有效回应的新主题，在不制造灌水的前提下获得一条有上下文、有下一步的首响。"}</p><div className="mt-5"><ProgressBar value={past ? 100 : 68} label="公共成果进度" /></div></Panel><Panel className="mt-5" title="如何参与" footer={past ? <Link className="btn" href="/nodes/frontend/project">查看归档成果</Link> : <Link className="btn btn-primary" href="/quests">查看可做任务</Link>}><ul className="steps steps-vertical w-full sm:steps-horizontal"><li className="step step-primary">选择真实主题</li><li className="step step-primary">完成公开贡献</li><li className={`step ${past ? "step-primary" : ""}`}>同行质量确认</li><li className={`step ${past ? "step-primary" : ""}`}>成果归档</li></ul></Panel></>;
}
