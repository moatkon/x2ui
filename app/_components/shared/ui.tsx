import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-black tracking-tight sm:text-3xl">{title}</h1>{description ? <p className="mt-1 max-w-2xl opacity-70">{description}</p> : null}</div>{action}</header>;
}

export function Panel({ title, eyebrow, action, children, footer, className = "" }: { title?: string; eyebrow?: string; action?: ReactNode; children: ReactNode; footer?: ReactNode; className?: string }) {
  return <section className={`overflow-hidden rounded-box border-2 border-base-content/20 ${className}`}>{title || eyebrow || action ? <header className="flex items-center justify-between gap-4 border-b-2 border-base-content/20 px-4 py-3 sm:px-5"><div>{eyebrow ? <p className="text-xs font-semibold uppercase tracking-widest opacity-60">{eyebrow}</p> : null}{title ? <h2 className="text-lg font-bold">{title}</h2> : null}</div>{action}</header> : null}<div className="p-4 sm:p-5">{children}</div>{footer ? <footer className="border-t-2 border-base-content/20 px-4 py-3 sm:px-5">{footer}</footer> : null}</section>;
}

export function Notice({ children, kind = "info" }: { children: ReactNode; kind?: "info" | "warning" | "error" | "success" }) {
  return <div role="alert" className={`alert alert-${kind} alert-soft`}><div>{children}</div></div>;
}

export function StatGrid({ items }: { items: Array<{ title: string; value: string | number; description?: string }> }) {
  return <dl className="grid overflow-hidden rounded-box border-2 border-base-content/20 sm:grid-cols-2 lg:grid-cols-4">{items.map((item) => <div className="p-4 sm:p-5" key={item.title}><dt className="text-sm opacity-60">{item.title}</dt><dd className="mt-1 text-2xl font-black">{item.value}</dd>{item.description ? <dd className="mt-1 text-xs opacity-60">{item.description}</dd> : null}</div>)}</dl>;
}

export function PageTabs({ items, label = "页面分区" }: { items: Array<{ label: string; href: string; active?: boolean }>; label?: string }) {
  return <nav role="tablist" aria-label={label} className="tabs tabs-border mb-5 overflow-x-auto">{items.map((item) => <Link role="tab" aria-selected={item.active} className={`tab ${item.active ? "tab-active" : ""}`} href={item.href} key={item.href}>{item.label}</Link>)}</nav>;
}

export function ProgressBar({ value, max = 100, label = "进度" }: { value: number; max?: number; label?: string }) {
  return <div><div className="mb-2 flex items-center justify-between text-sm"><span>{label}</span><span>{value} / {max}</span></div><progress className="progress w-full" value={value} max={max}>{value}%</progress></div>;
}

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return <nav className="breadcrumbs text-sm" aria-label="面包屑"><ul>{items.map((item, index) => <li key={`${item.label}-${index}`}>{item.href ? <Link href={item.href}>{item.label}</Link> : item.label}</li>)}</ul></nav>;
}

export function DataTable({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  return <div className="overflow-x-auto rounded-box border-2 border-base-content/20"><table className="table"><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="rounded-box border-2 border-dashed border-base-content/25 p-8 text-center"><h2 className="text-xl font-bold">{title}</h2><p className="mx-auto mt-2 max-w-lg opacity-65">{description}</p>{action ? <div className="mt-4">{action}</div> : null}</div>;
}

export function Pagination() {
  return <nav aria-label="分页" className="join"><button className="btn join-item" type="button" disabled>上一页</button><button className="btn btn-active join-item" type="button" aria-current="page">1</button><button className="btn join-item" type="button">2</button><button className="btn join-item" type="button">下一页</button></nav>;
}
