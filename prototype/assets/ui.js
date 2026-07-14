(function () {
  const esc = (value = "") => String(value).replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
  const icons = {
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    home: '<path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    nodes: '<circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><path d="M12 7v4M6.7 17.8l3.6-4.6M17.3 17.8l-3.6-4.6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
    pen: '<path d="m4 20 4-.8L19 8.2 15.8 5 4.8 16zM14.5 6.5l3 3"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.5a5.5 5.5 0 0 0 1.1-8.9z"/>',
    reply: '<path d="m9 17-5-5 5-5M4 12h10a6 6 0 0 1 6 6v1"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>',
    arrow: '<path d="m9 18 6-6-6-6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5c-.8-.8-1.8-1.2-3.1-1.2-1.8 0-3 .9-3 2.2 0 3.5 6.2 1.2 6.2 4.8 0 1.4-1.3 2.4-3.3 2.4-1.4 0-2.7-.5-3.6-1.4M12 5v14"/>',
    trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v2a4 4 0 0 0 4 4M17 6h3v2a4 4 0 0 1-4 4"/>',
    map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15"/>',
    spark: '<path d="m12 3-1.2 4.3a5 5 0 0 1-3.5 3.5L3 12l4.3 1.2a5 5 0 0 1 3.5 3.5L12 21l1.2-4.3a5 5 0 0 1 3.5-3.5L21 12l-4.3-1.2a5 5 0 0 1-3.5-3.5z"/>'
  };
  const icon = (name, cls = "size-5") => `<svg aria-hidden="true" class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icons[name] || icons.arrow}</svg>`;
  const button = (label, options = {}) => {
    const { href, action, kind = "default", size = "md", iconName, extra = "", disabled = false } = options;
    const kinds = { primary: "btn-primary", default: "", soft: "btn-soft", outline: "btn-outline", ghost: "btn-ghost", error: "btn-error", link: "btn-link" };
    const sizes = { sm: "btn-sm", md: "", lg: "btn-lg" };
    const attrs = `${action ? ` data-action="${esc(action)}"` : ""}${disabled ? ' disabled aria-disabled="true"' : ""}`;
    const content = `${iconName ? icon(iconName) : ""}<span>${esc(label)}</span>`;
    return href ? `<a class="btn ${kinds[kind]} ${sizes[size]} ${extra}" href="${esc(href)}"${attrs}>${content}</a>` : `<button class="btn ${kinds[kind]} ${sizes[size]} ${extra}" type="button"${attrs}>${content}</button>`;
  };
  const panel = ({ title, eyebrow, body = "", footer = "", id = "", extra = "", action = "", bodyClass = "p-4 sm:p-5" }) => `<section${id ? ` id="${id}"` : ""} class="border-2 border-base-content/20 rounded-box overflow-hidden ${extra}">${title || eyebrow || action ? `<header class="flex items-center justify-between gap-4 border-b-2 border-base-content/20 px-4 py-3 sm:px-5"><div>${eyebrow ? `<p class="text-xs font-semibold uppercase tracking-widest opacity-60">${esc(eyebrow)}</p>` : ""}${title ? `<h2 class="text-lg font-bold">${esc(title)}</h2>` : ""}</div>${action}</header>` : ""}<div class="${bodyClass}">${body}</div>${footer ? `<footer class="border-t-2 border-base-content/20 px-4 py-3 sm:px-5">${footer}</footer>` : ""}</section>`;
  const list = (rows, options = {}) => `<ul class="list x2-list ${options.framed === false ? "" : "border-2 border-base-content/20 rounded-box overflow-hidden"} ${options.extra || ""}">${rows.join("")}</ul>`;
  const listRow = (content, options = {}) => `<li class="list-row rounded-none px-4 py-4 sm:px-5 ${options.extra || ""}">${content}</li>`;
  const badge = (label, kind = "default") => `<span class="badge ${kind === "default" ? "badge-outline" : `badge-${kind}`} whitespace-nowrap">${esc(label)}</span>`;
  const alert = (message, kind = "info", title = "") => `<div role="alert" class="alert alert-${kind} alert-soft"><div>${title ? `<p class="font-bold">${esc(title)}</p>` : ""}<p>${esc(message)}</p></div></div>`;
  const field = (label, control, hint = "") => `<fieldset class="fieldset"><legend class="fieldset-legend">${esc(label)}</legend>${control}${hint ? `<p class="label">${esc(hint)}</p>` : ""}</fieldset>`;
  const input = (attrs = "") => `<input class="input validator w-full" ${attrs} />`;
  const textarea = (attrs = "") => `<textarea class="textarea validator min-h-28 w-full" ${attrs}></textarea>`;
  const select = (options, attrs = "") => `<select class="select validator w-full" ${attrs}>${options.map(o => `<option${o.selected ? " selected" : ""}${o.disabled ? " disabled" : ""} value="${esc(Object.prototype.hasOwnProperty.call(o, "value") ? o.value : o.label)}">${esc(o.label)}</option>`).join("")}</select>`;
  const tabs = items => `<div role="tablist" aria-label="页面分区" class="tabs tabs-border overflow-x-auto">${items.map(i => `<a role="tab" class="tab ${i.active ? "tab-active" : ""}" href="${esc(i.href)}" aria-selected="${i.active ? "true" : "false"}">${esc(i.label)}</a>`).join("")}</div>`;
  const pagination = () => `<nav aria-label="分页" class="join"><button class="btn join-item" type="button" aria-label="上一页" data-action="page-prev">上一页</button><button class="btn join-item btn-active" type="button" aria-current="page" data-action="page-1">1</button><button class="btn join-item" type="button" data-action="page-2">2</button><button class="btn join-item" type="button" data-action="page-next">下一页</button></nav>`;
  const avatarProfiles = {
    linmo: ["assets/avatars/user-linmo.svg", "林默的头像"],
    qingyu: ["assets/avatars/user-qingyu.svg", "青屿的头像"],
    ache: ["assets/avatars/user-ache.svg", "阿澈的头像"],
    weekend: ["assets/avatars/user-weekend.svg", "周末写字的头像"],
    "ad-cleaner": ["assets/avatars/user-ad-cleaner.svg", "广告清理机的头像"],
    debater: ["assets/avatars/user-debater.svg", "争论到底的头像"],
    guest: ["assets/avatars/user-guest.svg", "访客头像"],
    "node-product": ["assets/avatars/node-product.svg", "产品设计节点图标"],
    "node-frontend": ["assets/avatars/node-frontend.svg", "前端开发节点图标"],
    "node-operations": ["assets/avatars/node-operations.svg", "社区运营节点图标"],
    "node-writing": ["assets/avatars/node-writing.svg", "写作交流节点图标"],
    "node-life": ["assets/avatars/node-life.svg", "生活方式节点图标"]
  };
  const avatar = (profileKey, size = "w-10", alt = "") => {
    const profile = avatarProfiles[profileKey] || avatarProfiles.guest;
    const heightSize = size.split(/\s+/).map(token => token.replace(/(^|:)w-/, "$1h-")).join(" ");
    return `<div class="avatar ${size} ${heightSize} aspect-square shrink-0 overflow-hidden rounded-full"><div class="h-full w-full overflow-hidden rounded-full"><img class="block h-full w-full aspect-square rounded-full object-cover" src="${esc(profile[0])}" alt="${esc(alt || profile[1])}" width="96" height="96" /></div></div>`;
  };
  const breadcrumb = items => `<nav class="breadcrumbs text-sm" aria-label="面包屑"><ul>${items.map(i => `<li>${i.href ? `<a href="${esc(i.href)}">${esc(i.label)}</a>` : esc(i.label)}</li>`).join("")}</ul></nav>`;
  const table = (head, rows) => `<div class="overflow-x-auto border-2 border-base-content/20 rounded-box"><table class="table"><thead><tr>${head.map(h => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  const skeleton = () => `<div class="space-y-3" aria-busy="true"><div class="skeleton skeleton-text h-5 w-2/3">正在加载</div><div class="skeleton h-20 w-full"></div><div class="skeleton h-20 w-full"></div></div>`;
  const progress = (value, max = 100, label = "进度") => `<div><div class="mb-2 flex items-center justify-between text-sm"><span>${esc(label)}</span><span>${esc(value)} / ${esc(max)}</span></div><progress class="progress w-full" value="${esc(value)}" max="${esc(max)}">${esc(value)}%</progress></div>`;
  const steps = items => `<ul class="steps steps-vertical w-full sm:steps-horizontal">${items.map(item => `<li class="step ${item.active ? "step-primary" : ""}"${item.icon ? ` data-content="${esc(item.icon)}"` : ""}>${esc(item.label)}</li>`).join("")}</ul>`;
  const timeline = items => `<ol class="timeline timeline-vertical timeline-compact">${items.map(item => `<li><div class="timeline-middle">${icon(item.done ? "check" : "spark", "size-4")}</div><div class="timeline-end mb-6"><p class="font-bold">${esc(item.title)}</p><p class="text-sm opacity-65">${esc(item.desc)}</p></div><hr class="bg-base-content/20"/></li>`).join("")}</ol>`;
  const summary = items => `<dl class="grid overflow-hidden rounded-box border-2 border-base-content/20 sm:grid-cols-2 lg:grid-cols-4">${items.map(item => `<div class="p-4 sm:p-5"><dt class="text-sm opacity-60">${esc(item.title)}</dt><dd class="mt-1 text-2xl font-black">${esc(item.value)}</dd>${item.desc ? `<dd class="mt-1 text-xs opacity-60">${esc(item.desc)}</dd>` : ""}</div>`).join("")}</dl>`;
  window.UI = { esc, icon, button, panel, list, listRow, badge, alert, field, input, textarea, select, tabs, pagination, avatar, breadcrumb, table, skeleton, progress, steps, timeline, summary };
})();
