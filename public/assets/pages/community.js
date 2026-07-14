(function () {
  const X = window.X2App;
  const { U, state, posts, nodes, coinLedger, quests, mockWrite, link, nodeFromSlug, hashParams, childFromSlug, selectedNodePath, nodeMenuItem, nodeBrowseControl, nodeGuideRail, meta, postRow, pageHeader, sectionTabs, settingsTabs, coinTabs, playTabs, rail, shell } = X;
  function feedPage() {
    const { parent, child, invalidParent, invalidChild } = selectedNodePath();
    const quickContextQuery = parent ? `&node=${parent.slug}${child ? `&subnode=${child.slug}` : ""}` : "";
    const visiblePosts = child ? posts.filter(post => post.slug === parent.slug && post.subnodeSlug === child.slug) : parent ? posts.filter(post => post.slug === parent.slug) : posts;
    const listBody = visiblePosts.length
      ? U.list(visiblePosts.map(postRow), { framed: false })
      : `<div class="p-4 sm:p-5">${U.alert("这个子节点暂时没有公开帖子。", "info")}<div class="mt-4 flex flex-wrap gap-2">${U.button("发布内容", { href: `/quick-compose?node=${parent.slug}&subnode=${child.slug}` })}${U.button("查看子节点", { href: `/nodes/${parent.slug}/${child.slug}` })}${U.button(`返回全部${parent.name}`, { href: `/feed?node=${parent.slug}` })}</div></div>`;
    const pathName = child ? `${parent.name} / ${child.name}` : parent?.name || "";
    const title = pathName ? `${pathName} · 最新帖子` : "社区 Feed";
    const summary = pathName ? `<p class="text-sm opacity-65">已显示 ${U.esc(pathName)} · ${visiblePosts.length} 篇演示帖子</p>` : `<p class="text-sm opacity-65">全部节点 · ${posts.length} 篇演示帖子</p>`;
    const recovery = invalidParent ? U.alert("指定的一级节点不存在，已显示全部帖子。", "warning") : invalidChild ? U.alert(`指定的子节点不属于${parent.name}，已显示父节点聚合内容。`, "warning") : "";
    const action = child ? `<a class="link text-sm" href="/feed?node=${parent.slug}">返回全部${U.esc(parent.name)}</a>` : parent ? `<a class="link text-sm" href="/feed">清除筛选</a>` : "";
    const quickStart = `<a class="flex min-h-14 items-center rounded-box border-2 border-base-content/20 px-4 font-semibold hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-offset-2" href="/quick-compose${quickContextQuery ? `?${quickContextQuery.replace(/^&/, "")}` : ""}">写点什么……</a>`;
    return pageHeader("最新帖子", "先从节点缩小范围，再进入一段具体讨论。") + quickStart + `<div class="h-5"></div>` + nodeBrowseControl(parent, child) + (recovery ? `<div class="mt-5">${recovery}</div>` : "") + `<div class="h-5"></div>` + U.panel({ title, action, body: listBody, bodyClass: "p-0", footer: `<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">${summary}${U.pagination()}</div>` });
  }

  function nodesPage() {
    const rows = nodes.map(n => U.listRow(`${U.avatar(`node-${n.slug}`, "w-10", `${n.name}节点图标`)}<div class="list-col-grow min-w-0"><a class="font-bold hover:underline" href="/nodes/${n.slug}">${U.esc(n.name)}</a><p class="mt-1 opacity-70">${U.esc(n.desc)}</p><p class="mt-2 text-sm opacity-60">${n.count} 个主题 · ${n.followers} 人关注 · ${n.children.length} 个子节点</p><nav class="mt-3" aria-label="${U.esc(n.name)}子节点"><ul class="menu menu-horizontal flex flex-wrap gap-1 px-0">${n.children.map(child => `<li><a class="min-h-11 px-3" href="/nodes/${n.slug}/${child.slug}">${U.esc(child.name)}</a></li>`).join("")}</ul></nav><div class="mt-2 flex flex-wrap gap-3 text-sm"><a class="link" href="/feed?node=${n.slug}">浏览父节点聚合</a><span>父级关注覆盖全部子节点</span></div></div><span class="hidden shrink-0 self-center sm:block" aria-hidden="true">${U.icon("arrow")}</span>`));
    return pageHeader("节点目录", "一级节点划定社区边界，子节点细分稳定讨论主题。") + U.alert("子节点只属于一个一级节点；跨节点的具体概念继续使用标签。当前严格支持两层。", "info") + `<div class="h-5"></div>` + U.list(rows);
  }

  function nodePage(parentSlug, childSlug = "") {
    const parent = nodeFromSlug(parentSlug);
    if (!parent) return notFoundPage();
    const child = childFromSlug(parent, childSlug);
    if (childSlug && !child) return notFoundPage();
    const filtered = child ? posts.filter(p => p.slug === parent.slug && p.subnodeSlug === child.slug) : posts.filter(p => p.slug === parent.slug);
    const siblingMenu = `<nav aria-label="${U.esc(parent.name)}子节点"><ul class="menu menu-horizontal flex flex-wrap gap-1 px-0">${nodeMenuItem({ label: `全部${parent.name}`, href: `/nodes/${parent.slug}`, current: !child })}${parent.children.map(item => nodeMenuItem({ label: item.name, href: `/nodes/${parent.slug}/${item.slug}`, current: child?.slug === item.slug })).join("")}</ul></nav>`;
    if (child) {
      const emptyChild = `<div>${U.alert("这个子节点还没有公开帖子。", "info")}<div class="mt-4">${U.button("发布内容", { href: `/quick-compose?node=${parent.slug}&subnode=${child.slug}` })}</div></div>`;
      return U.breadcrumb([{ label: "节点", href: "/nodes" }, { label: parent.name, href: `/nodes/${parent.slug}` }, { label: child.name }]) + `<div class="mt-3">${pageHeader(`${parent.name} / ${child.name}`, child.desc, U.button("直接关注子节点", { action: "toggle-follow", kind: "primary" }))}</div>` + U.alert(`关注${parent.name}会自动覆盖当前及未来子节点；只关注${child.name}不会反向关注父节点。`, "info") + `<div class="h-5"></div>${U.panel({ title: "切换同级主题", body: siblingMenu })}<div class="h-5"></div>${U.panel({ title: "适用规则", body: `<div class="space-y-3"><p><strong>${U.esc(parent.name)}通用规则：</strong>${U.esc(parent.rule)}</p><p><strong>${U.esc(child.name)}补充规则：</strong>${U.esc(child.rule)}</p></div>`, footer: `<p class="text-sm opacity-65">${child.followers} 人直接关注 · ${child.count} 个主题 · 可发布</p>` })}<div class="h-5"></div>${U.panel({ title: `${child.name}最新帖子`, body: filtered.length ? U.list(filtered.map(postRow), { framed: false }) : emptyChild, bodyClass: filtered.length ? "p-0" : "p-4 sm:p-5", footer: `<div class="flex flex-wrap items-center justify-between gap-3"><a class="link text-sm" href="/feed?node=${parent.slug}&subnode=${child.slug}">在 Feed 中浏览</a>${U.pagination()}</div>` })}`;
    }
    const childRows = parent.children.map(item => U.listRow(`<div class="list-col-grow min-w-0"><a class="font-bold hover:underline" href="/nodes/${parent.slug}/${item.slug}">${U.esc(item.name)}</a><p class="mt-1 text-sm opacity-65">${U.esc(item.desc)}</p></div><span class="text-sm opacity-60">${item.count} 个主题</span>`));
    return U.breadcrumb([{ label: "节点", href: "/nodes" }, { label: parent.name }]) + `<div class="mt-3">${pageHeader(parent.name, parent.desc, U.button(state.following ? "已关注父节点" : "关注父节点", { action: "toggle-follow", kind: state.following ? "soft" : "primary" }))}</div>` + U.alert(`关注${parent.name}会覆盖全部现有及未来子节点；你仍可以单独静音不感兴趣的子节点。`, "info") + `<div class="h-5"></div>${U.panel({ title: "节点简介", body: `<p class="leading-relaxed">${U.esc(parent.desc)}</p><p class="mt-3 text-sm opacity-65">${parent.followers} 人关注 · ${parent.count} 个聚合主题</p>`, footer: `<p class="text-sm"><strong>通用规则：</strong>${U.esc(parent.rule)}</p>` })}<div class="h-5"></div>${U.panel({ title: `${parent.children.length} 个子节点`, body: U.list(childRows, { framed: false }), bodyClass: "p-0" })}<div class="h-5"></div>${U.panel({ title: "父节点聚合帖子", body: filtered.length ? U.list(filtered.map(postRow), { framed: false }) : U.alert("此节点及其子节点还没有公开帖子。", "info"), bodyClass: filtered.length ? "p-0" : "p-4 sm:p-5", footer: U.pagination() })}`;
  }

  function postPage() {
    const p = posts[0];
    const breadcrumbs = [{ label: "首页", href: "/feed" }, { label: p.node, href: `/nodes/${p.slug}` }, ...(p.subnodeSlug ? [{ label: p.subnodeName, href: `/nodes/${p.slug}/${p.subnodeSlug}` }] : []), { label: "帖子" }];
    const body = `<article><header class="border-b-2 border-base-content/20 px-4 py-5 sm:px-6"><h1 class="text-2xl font-black leading-tight sm:text-3xl">${U.esc(p.title)}</h1><div class="mt-3">${meta(p)}</div></header><div class="markdown-body px-4 py-5 sm:px-6"><p>社区里的表达一旦进入公共讨论，就会成为其他回应的上下文。允许作者随时改写，会让后续回复失去依据，也可能伤害讨论记录的可信度。</p><h2>不可变，不等于不治理</h2><p>原始内容保持不变，同时通过可见性状态处理风险：违规内容可以被隐藏，帖子可以被锁定，用户可以申诉，治理动作则进入不可变审计记录。</p><ul><li>发布前提供草稿、预览和明确确认；</li><li>发布后不提供编辑、删除或撤回入口；</li><li>举报和处置都保留上下文与进度。</li></ul><p>这种边界让创作者在提交前更谨慎，也让参与者知道自己回应的是一份稳定记录。</p></div><footer class="flex flex-wrap items-center gap-2 border-t-2 border-base-content/20 px-4 py-4 sm:px-6">${U.button(state.reacted ? "已认同 65" : "认同 64", { action: "toggle-react", iconName: "heart", kind: state.reacted ? "soft" : "default" })}${U.button(state.bookmarked ? "已收藏" : "收藏", { action: "toggle-bookmark", iconName: "bookmark", kind: state.bookmarked ? "soft" : "default" })}${U.button("金币感谢", { action: "coin-thanks", iconName: "coin" })}${U.button("设置悬赏", { action: "create-bounty" })}${U.button("举报", { action: "open-report", kind: "ghost", iconName: "shield" })}</footer></article>`;
    const commentEditor = state.loggedIn ? U.panel({ title: "参与讨论", body: `<div class="mb-4"><p class="text-sm font-bold">不知道怎么开始？先选一个回应起点</p><div class="mt-2 flex flex-wrap gap-2">${U.button("补一个例子", { action: "reply-starter-example", size: "sm" })}${U.button("提供资料", { action: "reply-starter-resource", size: "sm" })}${U.button("问一个问题", { action: "reply-starter-question", size: "sm" })}${U.button("不同看法", { action: "reply-starter-disagree", size: "sm" })}${U.button("自由回应", { action: "reply-starter-free", size: "sm", kind: "ghost" })}</div></div>${U.field("评论内容", U.textarea('id="comment-input" placeholder="真诚回应，补充你的经验或提出问题" maxlength="2000"'), "评论提交后不能编辑或删除。")}`, footer: `<div class="flex items-center justify-between gap-3"><p class="text-sm opacity-65">一句有信息量的回应也可以 · 最多 2,000 字</p>${U.button("提交评论", { action: "submit-comment", kind: "primary" })}</div>` }) : U.alert("登录后可以评论。我们会保存当前阅读位置并在登录后带你回来。", "info");
    const comments = [
      { name: "青屿", user: "qingyu", time: "8 分钟前", text: "赞同“稳定记录”的说法。是否考虑过作者发现敏感信息后怎么办？", replies: 3 },
      { name: "阿澈", user: "ache", time: "2 分钟前", text: "可以通过受控的合规数据处理通道解决，但不应该伪装成普通编辑能力。", replies: 1 }
    ];
    const commentRows = comments.map((c, i) => U.listRow(`${U.avatar(c.user, "w-10", `${c.name}的头像`)}<div class="list-col-grow min-w-0"><div class="flex flex-wrap items-center gap-2"><a class="font-bold hover:underline" href="/user/ache">${c.name}</a><span class="text-sm opacity-60">${c.time}</span></div><p class="mt-2 leading-relaxed">${c.text}</p><div class="mt-3 flex flex-wrap items-center gap-2">${U.button(`回应 ${c.replies}`, { action: `reply-${i}`, size: "sm", kind: "ghost", iconName: "reply" })}${U.button("认同", { action: "toast-react", size: "sm", kind: "ghost", iconName: "heart" })}${U.button("金币感谢", { action: "coin-thanks", size: "sm", kind: "ghost", iconName: "coin" })}${U.button("举报", { action: "open-report", size: "sm", kind: "ghost" })}</div><div id="reply-${i}" class="mt-3 hidden pl-4 sm:pl-8"></div></div>`));
    return U.breadcrumb(breadcrumbs) + `<div class="mt-3 border-2 border-base-content/20 rounded-box overflow-hidden">${body}</div><div class="h-5"></div>${commentEditor}<div class="h-5"></div><header class="mb-5"><h2 class="text-2xl font-black tracking-tight">评论</h2><p class="mt-1 opacity-70">共 28 条，按时间排序。</p></header>${U.list(commentRows)}`;
  }

  function searchPage() {
    const qs = `<form class="join w-full" data-form="search"><input class="input join-item w-full" name="q" value="社区治理" aria-label="搜索关键词"/><button class="btn btn-primary join-item" type="submit">搜索</button></form>`;
    const tabs = U.tabs(["帖子", "用户", "节点", "标签"].map((label, i) => ({ label, href: `/search?type=${i}`, active: i === 0 })));
    const nodeFilters = `<div class="mt-4 grid gap-3 sm:grid-cols-2">${U.field("一级节点", U.select([{ label: "全部一级节点", value: "" }, ...nodes.map(n => ({ label: n.name, value: n.slug }))], 'id="search-primary-node"'))}${U.field("子节点", U.select([{ label: "先选择一级节点", value: "" }], 'id="search-secondary-node" disabled'))}</div><p id="search-node-path" class="mt-2 text-sm opacity-65">当前搜索范围：全部公开节点</p>`;
    return pageHeader("搜索", "在公开帖子、用户、节点和标签中查找。") + U.panel({ title: "搜索 X2Post", body: `${qs}${nodeFilters}<div class="mt-4">${tabs}</div>` }) + `<div class="h-5"></div>${U.panel({ title: "帖子结果 · 12", action: U.select([{ label: "相关度优先" }, { label: "最新发布" }], 'aria-label="结果排序"'), body: U.list(posts.slice(0, 3).map(postRow), { framed: false }), bodyClass: "p-0", footer: U.pagination() })}`;
  }

  function tagsPage(slug) {
    const tags = ["社区", "治理", "冷启动", "运营", "无障碍", "前端", "写作"];
    if (!slug) return pageHeader("标签", "从具体话题进入跨节点讨论。") + U.list(tags.map((t, i) => U.listRow(`<div class="min-w-0"><a class="font-bold hover:underline" href="/tags/${encodeURIComponent(t)}"># ${t}</a><p class="mt-1 text-sm opacity-65">${18 + i * 7} 个公开帖子</p></div>${U.icon("arrow")}`)));
    return U.breadcrumb([{ label: "标签", href: "/tags" }, { label: `#${slug}` }]) + `<div class="mt-3">${pageHeader(`# ${slug}`, "包含此标签的公开帖子。")}</div>` + U.list(posts.slice(0, 3).map(postRow));
  }

  function userPage(section = "profile") {
    let content = "";
    if (section === "profile") content = U.panel({ title: "关于", body: `<p class="leading-relaxed">在复杂系统里寻找简单边界。关注社区产品、信任机制与可访问设计。</p><dl class="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4"><div><dt class="opacity-60">加入时间</dt><dd class="font-semibold">2024 年 8 月</dd></div><div><dt class="opacity-60">帖子</dt><dd class="font-semibold">36</dd></div><div><dt class="opacity-60">关注</dt><dd class="font-semibold">48</dd></div><div><dt class="opacity-60">粉丝</dt><dd class="font-semibold">231</dd></div></dl>` });
    if (section === "posts") content = U.list(posts.slice(0, 2).map(postRow));
    if (section === "comments") content = U.list([U.listRow(`<div><a class="font-bold hover:underline" href="/posts/immutable-content">为什么社区内容需要明确的不可变边界？</a><p class="mt-2">谢谢补充。这里更关键的是把“内容状态”和“原始记录”分开。</p><p class="mt-2 text-sm opacity-60">昨天 18:20</p></div>`), U.listRow(`<div><a class="font-bold hover:underline" href="/posts/accessible-ui">给内容社区做无障碍</a><p class="mt-2">焦点恢复确实是最容易遗漏的一步。</p><p class="mt-2 text-sm opacity-60">周六</p></div>`)]);
    if (section === "following" || section === "followers") content = U.list([{ name: "青屿", user: "qingyu" }, { name: "阿澈", user: "ache" }, { name: "周末写字", user: "weekend" }].map((person, i) => U.listRow(`${U.avatar(person.user, "w-10", `${person.name}的头像`)}<div class="list-col-grow min-w-0"><a class="font-bold hover:underline" href="/user/qingyu">${person.name}</a><p class="text-sm opacity-65">${["社区运营", "前端与无障碍", "写作与知识管理"][i]}</p></div><div class="col-start-2 row-start-2 mt-2 justify-self-end sm:col-start-3 sm:row-start-1 sm:mt-0 sm:self-center">${U.button(section === "following" ? "已关注" : "查看", { size: "sm", kind: "soft", href: "/user/qingyu", extra: "shrink-0" })}</div>`, { extra: "grid-cols-[auto_minmax(0,1fr)] sm:grid-cols-[auto_minmax(0,1fr)_auto]" })));
    return `<div class="border-2 border-base-content/20 rounded-box overflow-hidden"><header class="p-5 sm:p-6"><div class="flex flex-col gap-4 sm:flex-row sm:items-center">${U.avatar("linmo", "w-20", "林默的头像")}<div class="min-w-0 flex-1"><h1 class="text-2xl font-black">林默 <span class="text-base font-normal opacity-60">@linmo</span></h1><p class="mt-1 opacity-70">上海 · 产品设计</p></div><div class="flex flex-wrap gap-2">${U.button(state.following ? "已关注" : "关注", { action: "toggle-follow", kind: state.following ? "soft" : "primary" })}${U.button("屏蔽", { action: "block-user" })}${U.button("举报", { href: "/report/new", kind: "ghost" })}</div></div></header><div class="border-t-2 border-base-content/20 px-3">${sectionTabs(section)}</div></div><div class="h-5"></div>${content}`;
  }


  Object.assign(X.pages, { feedPage, nodesPage, nodePage, postPage, searchPage, tagsPage, userPage });
})();
