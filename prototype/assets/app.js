(function () {
  const U = window.UI;
  const state = {
    loggedIn: localStorage.getItem("x2post-demo-auth") !== "out",
    theme: localStorage.getItem("x2post-theme") || "lofi",
    following: true,
    bookmarked: false,
    reacted: false,
    notificationFilter: "all"
  };
  document.documentElement.dataset.theme = state.theme;

  const posts = [
    { id: "immutable-content", title: "为什么社区内容需要明确的不可变边界？", excerpt: "当发言不可被悄悄改写，讨论记录会更可信；同时我们也需要隐藏和申诉机制。", author: "林默", user: "linmo", node: "产品设计", slug: "product", subnodeSlug: "strategy", subnodeName: "产品策略", time: "12 分钟前", comments: 28, reacts: 64, tags: ["社区", "治理"] },
    { id: "small-community", title: "一个 2,000 人社区的冷启动复盘", excerpt: "先建立可预期的互动节奏，再谈增长：欢迎帖、每周问答和节点引导员是最有效的三个动作。", author: "青屿", user: "qingyu", node: "社区运营", slug: "operations", subnodeSlug: "launch", subnodeName: "冷启动", time: "1 小时前", comments: 17, reacts: 41, tags: ["冷启动", "运营"] },
    { id: "accessible-ui", title: "给内容社区做无障碍，不只是加 aria-label", excerpt: "从键盘路径、错误恢复到 200% 缩放，分享一套适合内容产品的检查清单。", author: "阿澈", user: "ache", node: "前端开发", slug: "frontend", subnodeSlug: "quality", subnodeName: "性能与无障碍", time: "昨天 21:36", comments: 12, reacts: 33, tags: ["无障碍", "前端"] },
    { id: "writing-routine", title: "如何养成每周输出一篇高质量帖子的习惯", excerpt: "把草稿当作思考工作台：先记录问题，再补证据，最后才写标题。", author: "周末写字", user: "weekend", node: "写作交流", slug: "writing", subnodeSlug: "practice", subnodeName: "写作习惯", time: "周日", comments: 9, reacts: 26, tags: ["写作"] },
    { id: "home-reset", title: "十分钟居家复位：让明天从整洁开始", excerpt: "不追求一次性整理完，用固定顺序收好高频物品，降低第二天的启动阻力。", author: "青屿", user: "qingyu", node: "生活方式", slug: "life", subnodeSlug: "home", subnodeName: "居家与整理", time: "周六", comments: 6, reacts: 19, tags: ["整理", "日常"] },
    { id: "product-node-guide", title: "产品设计节点的提问与发布说明", excerpt: "无法判断更细分类时，可以直接发布到产品设计；管理员会根据需要协助补充二级归属。", author: "林默", user: "linmo", node: "产品设计", slug: "product", subnodeSlug: "", subnodeName: "", time: "7 月 8 日", comments: 4, reacts: 15, tags: ["节点规则"] }
  ];
  const nodes = [
    { slug: "product", name: "产品设计", desc: "讨论产品策略、交互设计与用户研究。", count: 826, followers: 1240, rule: "分享具体问题与上下文，批评方案而非批评个人。", canPost: true, children: [
      { slug: "strategy", name: "产品策略", desc: "定位、路线图、取舍与验证框架。", count: 168, followers: 438, rule: "策略判断请区分事实、假设与待验证指标。", canPost: true },
      { slug: "research", name: "用户研究", desc: "访谈、测试、研究方法与洞察应用。", count: 142, followers: 396, rule: "研究材料必须移除可识别个人信息。", canPost: true },
      { slug: "interaction", name: "交互与原型", desc: "信息架构、任务流程和原型验证。", count: 207, followers: 512, rule: "方案讨论请说明目标用户、任务与约束。", canPost: true },
      { slug: "design-system", name: "设计系统", desc: "组件、设计令牌、规范和协作流程。", count: 154, followers: 471, rule: "分享组件方案时请注明适用范围与无障碍状态。", canPost: true },
      { slug: "growth", name: "增长与实验", desc: "增长模型、实验设计和指标解读。", count: 121, followers: 327, rule: "实验复盘需说明样本、周期和负面影响。", canPost: true }
    ] },
    { slug: "frontend", name: "前端开发", desc: "Web 标准、工程实践、性能与无障碍。", count: 641, followers: 986, rule: "提问请附复现步骤；代码片段需移除敏感信息。", canPost: true, children: [
      { slug: "html-css", name: "HTML/CSS", desc: "语义结构、布局、样式与浏览器标准。", count: 139, followers: 344, rule: "请提供最小复现，并说明目标浏览器范围。", canPost: true },
      { slug: "javascript", name: "JavaScript", desc: "语言特性、浏览器 API 与运行时问题。", count: 148, followers: 416, rule: "代码示例请避免携带密钥和真实用户数据。", canPost: true },
      { slug: "frameworks", name: "框架与应用", desc: "组件框架、路由、状态和应用架构。", count: 132, followers: 389, rule: "请注明框架与版本，并描述已尝试方案。", canPost: true },
      { slug: "engineering", name: "工程与测试", desc: "构建、测试、部署和团队工程实践。", count: 117, followers: 302, rule: "工程方案需说明团队规模和维护成本。", canPost: true },
      { slug: "quality", name: "性能与无障碍", desc: "性能预算、可访问性和质量验证。", count: 105, followers: 361, rule: "结论请附测量环境、标准或复现路径。", canPost: true }
    ] },
    { slug: "operations", name: "社区运营", desc: "社区冷启动、内容机制与健康度治理。", count: 374, followers: 728, rule: "案例请说明规模与阶段，禁止发布未授权用户数据。", canPost: true, children: [
      { slug: "launch", name: "冷启动", desc: "种子成员、首批内容和早期互动节奏。", count: 76, followers: 248, rule: "复盘请说明社区阶段、规模与资源限制。", canPost: true },
      { slug: "content", name: "内容运营", desc: "内容机制、栏目、分发和质量维护。", count: 84, followers: 271, rule: "内容案例请注明授权状态与适用周期。", canPost: true },
      { slug: "member-growth", name: "成员成长", desc: "新手融入、贡献路径与成员支持。", count: 69, followers: 234, rule: "避免用单一活跃指标评价真实成员价值。", canPost: true },
      { slug: "community-health", name: "社区健康", desc: "归属感、冲突恢复与健康度信号。", count: 73, followers: 286, rule: "讨论健康度时不得暴露个体敏感记录。", canPost: true },
      { slug: "governance", name: "治理与安全", desc: "规则、审核、申诉和信任安全机制。", count: 72, followers: 309, rule: "治理案例须匿名化，并区分事实与推测。", canPost: true }
    ] },
    { slug: "writing", name: "写作交流", desc: "用文字整理思考，互相提供真诚反馈。", count: 519, followers: 812, rule: "尊重原创，引用请标明来源。", canPost: true, children: [
      { slug: "nonfiction", name: "非虚构写作", desc: "随笔、报道、传记和真实经验表达。", count: 118, followers: 298, rule: "涉及真实人物时请保护隐私并核对事实。", canPost: true },
      { slug: "creative", name: "创意写作", desc: "小说、诗歌、剧本和想象力练习。", count: 103, followers: 347, rule: "请标注作品原创或改编状态。", canPost: true },
      { slug: "editing", name: "编辑与反馈", desc: "结构调整、文字打磨和作品互评。", count: 96, followers: 315, rule: "反馈应具体、友善，并尊重作者请求的范围。", canPost: true },
      { slug: "knowledge", name: "知识整理", desc: "笔记方法、资料组织与长期知识维护。", count: 111, followers: 362, rule: "引用资料请标出来源与访问时间。", canPost: true },
      { slug: "practice", name: "写作习惯", desc: "写作节奏、练习方法与持续输出。", count: 91, followers: 281, rule: "鼓励分享可持续方法，不制造打卡焦虑。", canPost: true }
    ] },
    { slug: "life", name: "生活方式", desc: "分享让日常更从容的小方法。", count: 291, followers: 536, rule: "不提供高风险医疗或财务建议。", canPost: true, children: [
      { slug: "home", name: "居家与整理", desc: "收纳、清洁、居住体验和日常维护。", count: 64, followers: 231, rule: "分享方法时说明空间、预算等适用条件。", canPost: true },
      { slug: "rhythm", name: "效率与节奏", desc: "时间安排、精力分配和生活节奏。", count: 58, followers: 219, rule: "避免把个人节奏包装成普适标准。", canPost: true },
      { slug: "food-craft", name: "饮食与手作", desc: "家常饮食、烘焙、修补和手工制作。", count: 61, followers: 207, rule: "过敏、工具和食品安全风险请明确提示。", canPost: true },
      { slug: "city-travel", name: "城市与出行", desc: "城市观察、路线和低风险出行经验。", count: 55, followers: 198, rule: "不要公开私人住址或实时精确位置。", canPost: true },
      { slug: "hobbies", name: "兴趣与休闲", desc: "阅读、观影、运动和轻量兴趣交流。", count: 53, followers: 224, rule: "尊重不同偏好，避免无依据的健康承诺。", canPost: true }
    ] }
  ];
  const coinLedger = [
    { id: "TX-0713-204", time: "今天 14:12", type: "质量奖励", detail: "内容获得第 20 位不同可信账户确认", amount: "+10", status: "待结算" },
    { id: "TX-0713-198", time: "今天 11:40", type: "悬赏托管", detail: "为“无障碍资料索引”设置 50 金币悬赏", amount: "-50", status: "托管中" },
    { id: "TX-0712-876", time: "昨天 18:06", type: "质量奖励", detail: "内容获得第 8 位不同可信账户确认", amount: "+6", status: "已入账" },
    { id: "TX-0712-714", time: "昨天 09:20", type: "金币感谢", detail: "感谢青屿的社区冷启动复盘：作者 +1 / 销毁 1", amount: "-2", status: "已结算" },
    { id: "TX-0711-552", time: "7 月 11 日", type: "风险保留", detail: "异常互评复核，预计 72 小时内完成", amount: "5", status: "保留中" }
  ];
  const quests = [
    { id: "first-reply", node: "产品设计", title: "给新人的第一条有效回应", desc: "从 3 个尚未得到回复的新主题中选择一个，提供具体、友善且有信息量的回应。", reward: "贡献进度 +1", progress: 1, max: 3, time: "约 8 分钟", status: "进行中" },
    { id: "source-trail", node: "前端开发", title: "补全无障碍资料路径", desc: "为讨论补充一手标准或官方文档，并说明它解决了什么问题。", reward: "贡献进度 +1", progress: 0, max: 2, time: "约 12 分钟", status: "可开始" },
    { id: "thread-garden", node: "社区运营", title: "整理一段分散讨论", desc: "将已有观点归纳成共识、分歧和待验证问题，不改写任何原始内容。", reward: "贡献进度 +1", progress: 2, max: 4, time: "约 15 分钟", status: "进行中" }
  ];

  const link = (label, href, extra = "") => `<a class="link link-hover ${extra}" href="${href}">${U.esc(label)}</a>`;
  const nodeFromSlug = slug => nodes.find(node => node.slug === slug);
  const hashParams = () => new URLSearchParams((location.hash.split("?")[1] || "").split("#")[0]);
  const childFromSlug = (parent, slug) => parent?.children?.find(child => child.slug === slug);
  const selectedNodePath = () => {
    const params = hashParams();
    const rawParent = params.get("node") || "";
    const rawChild = params.get("subnode") || "";
    const parent = nodeFromSlug(rawParent);
    const child = childFromSlug(parent, rawChild);
    return { parent, child, rawParent, rawChild, invalidParent: Boolean(rawParent && !parent), invalidChild: Boolean(rawChild && !child) };
  };
  const nodeMenuItem = ({ label, href, current = false }) => `<li><a class="min-h-11 whitespace-normal rounded-field px-3 py-2 text-sm font-semibold leading-snug focus-visible:outline-2 focus-visible:outline-offset-2 ${current ? "bg-neutral text-neutral-content" : ""}" href="${href}" ${current ? 'aria-current="page"' : ""}>${U.esc(label)}</a></li>`;
  const nodeBrowseControl = (activeParent, activeChild) => {
    const items = [{ slug: "", name: "全部" }, ...nodes];
    const primaryMenu = `<div class="px-2 py-2 sm:px-4"><p id="primary-node-nav-title" class="px-3 pb-1 text-sm font-bold">按一级节点浏览</p><nav class="w-full" aria-labelledby="primary-node-nav-title"><ul class="menu menu-horizontal flex w-full flex-wrap gap-1 px-0">${items.map(item => nodeMenuItem({ label: item.name, href: item.slug ? `#/feed?node=${item.slug}` : "#/feed", current: item.slug === (activeParent?.slug || "") })).join("")}</ul></nav></div>`;
    const secondaryMenu = activeParent ? `<div class="border-t-2 border-base-content/20 px-2 py-3 sm:px-4"><p id="secondary-node-nav-title" class="px-3 pb-1 text-sm font-bold">${U.esc(activeParent.name)}下的主题</p><nav class="w-full" aria-labelledby="secondary-node-nav-title"><ul class="menu menu-horizontal flex w-full flex-wrap gap-1 px-0">${nodeMenuItem({ label: `全部${activeParent.name}`, href: `#/feed?node=${activeParent.slug}`, current: !activeChild })}${activeParent.children.map(child => nodeMenuItem({ label: child.name, href: `#/feed?node=${activeParent.slug}&subnode=${child.slug}`, current: activeChild?.slug === child.slug })).join("")}</ul></nav></div>` : "";
    return U.panel({ title: "浏览帖子", action: `<a class="link text-sm whitespace-nowrap" href="#/nodes">全部节点</a>`, body: `${primaryMenu}${secondaryMenu}`, bodyClass: "p-0" });
  };
  const nodeGuideRail = () => U.panel({ title: "内容如何组织", body: `<p class="text-sm leading-relaxed opacity-75"><strong>一级节点</strong>划定长期讨论空间，<strong>子节点</strong>细分稳定主题，<strong>标签</strong>描述跨节点话题。先查看两级规则，再决定关注或发布。</p>`, footer: `<a class="link text-sm font-semibold" href="#/nodes">了解全部 ${nodes.length} 个一级节点</a>` });
  const meta = p => `<div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm opacity-70"><a class="link link-hover" href="#/users/${p.user}">${U.esc(p.author)}</a><span aria-hidden="true">·</span><a class="link link-hover" href="#/nodes/${p.slug}">${U.esc(p.node)}</a>${p.subnodeSlug ? `<span aria-hidden="true">/</span><a class="link link-hover" href="#/nodes/${p.slug}/${p.subnodeSlug}">${U.esc(p.subnodeName)}</a>` : ""}<span aria-hidden="true">·</span><span>${U.esc(p.time)}</span></div>`;
  const postRow = p => U.listRow(`${U.avatar(p.user, "w-10", `${p.author}的头像`)}<div class="list-col-grow min-w-0"><a class="text-base font-bold leading-snug hover:underline" href="#/posts/${p.id}">${U.esc(p.title)}</a><p class="mt-1 line-clamp-2 opacity-75">${U.esc(p.excerpt)}</p><div class="mt-2">${meta(p)}</div></div><div class="col-start-2 row-start-2 mt-2 flex shrink-0 items-center gap-3 justify-self-start text-sm sm:col-start-3 sm:row-start-1 sm:mt-0 sm:flex-col sm:items-end sm:justify-self-end sm:self-start"><span>💬 ${p.comments}</span><span>♡ ${p.reacts}</span></div>`, { extra: "grid-cols-[auto_minmax(0,1fr)] sm:grid-cols-[auto_minmax(0,1fr)_auto]" });
  const pageHeader = (title, description, action = "") => `<header class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h1 class="text-2xl font-black tracking-tight sm:text-3xl">${U.esc(title)}</h1>${description ? `<p class="mt-1 max-w-2xl opacity-70">${U.esc(description)}</p>` : ""}</div>${action}</header>`;
  const sectionTabs = (active) => U.tabs([
    { label: "公开资料", href: "#/users/linmo", active: active === "profile" },
    { label: "帖子", href: "#/users/linmo/posts", active: active === "posts" },
    { label: "评论", href: "#/users/linmo/comments", active: active === "comments" },
    { label: "关注", href: "#/users/linmo/following", active: active === "following" },
    { label: "粉丝", href: "#/users/linmo/followers", active: active === "followers" }
  ]);
  const settingsTabs = active => U.tabs([
    ["profile", "资料"], ["privacy", "隐私"], ["notifications", "通知"], ["security", "安全"], ["sessions", "设备会话"]
  ].map(([key, label]) => ({ label, href: `#/settings/${key}`, active: active === key })));
  const coinTabs = active => U.tabs([
    ["wallet", "我的金币", "#/coins"], ["ledger", "透明账本", "#/coins/ledger"], ["bounties", "问题悬赏", "#/coins/bounties"], ["rules", "经济规则", "#/coins/rules"]
  ].map(([key, label, href]) => ({ label, href, active: active === key })));
  const playTabs = active => U.tabs([
    ["hub", "共建大厅", "#/journey"], ["quests", "任务板", "#/quests"], ["journey", "成长路径", "#/me/progress"], ["teams", "节点协作", "#/nodes/product/project"]
  ].map(([key, label, href]) => ({ label, href, active: active === key })));

  function rail(route) {
    if (route.startsWith("/coins")) return `${U.panel({ title: "经济边界", body: `<p class="text-sm leading-relaxed opacity-75">金币不可购买、提现或兑换法币，也不赋予治理票权。所有变动都进入不可变双重记账子账本。</p>`, footer: `<div class="flex gap-4"><a class="link text-sm" href="#/coins/rules">完整规则</a><a class="link text-sm" href="#/settings/coins">金币设置</a><a class="link text-sm" href="#/coins/economy">经济透明度</a></div>` })}<div class="h-4"></div>${U.panel({ title: "本周状态", body: `${U.progress(42, 60, "个人系统奖励额度")}<p class="mt-3 text-sm opacity-65">已获得 42，剩余 18；周一重置奖励额度，不清空余额。</p>` })}`;
    if (route.startsWith("/play") || route.startsWith("/journey") || route.startsWith("/quests") || route.startsWith("/seasons") || route === "/me/progress" || route === "/me/contributions" || route === "/me/collection") return `${U.panel({ title: "健康参与", body: `<p class="text-sm leading-relaxed opacity-75">每周最多激活 3 个任务。没有签到断裂、掉级或过期未领损失，离线不会扣除进度。</p>`, footer: `<a class="link text-sm" href="#/settings/journey">旅程与休息设置</a>` })}<div class="h-4"></div>${U.panel({ title: "本周旅程", body: `${U.progress(4, 7, "完成节点")}<p class="mt-3 text-sm opacity-65">再完成 3 个不同类型的真实贡献，即可生成私人周复盘。</p>` })}`;
    if (route.startsWith("/nodes/")) {
      const parts = route.split("/");
      const n = nodeFromSlug(parts[2]) || nodes[0];
      const child = childFromSlug(n, parts[3]);
      return U.panel({ title: child ? `${n.name} / ${child.name}规则` : `${n.name}规则`, body: `<p class="leading-relaxed">${U.esc(n.rule)}</p>${child ? `<p class="mt-3 border-t-2 border-base-content/20 pt-3 leading-relaxed"><strong>子节点补充：</strong>${U.esc(child.rule)}</p>` : ""}<div class="mt-4 flex items-center justify-between gap-3 text-sm"><span>${child ? `${child.followers} 人直接关注` : `${n.followers} 人关注`}</span>${U.button(state.following ? "已关注" : "关注节点", { action: "toggle-follow", size: "sm", kind: state.following ? "soft" : "default" })}</div>`, footer: `<a class="link text-sm" href="#/nodes">查看全部节点</a>` });
    }
    if (route === "/quick-compose") return "";
    if (route.startsWith("/compose") || route.startsWith("/drafts")) {
      return `${U.panel({ title: "发布须知", body: U.alert("轻内容和长帖发布后都不能编辑、删除或撤回。发布前请完成确认。", "warning") })}<div class="h-4"></div>${U.panel({ title: "AI 辅助边界", body: `<p class="text-sm leading-relaxed opacity-75">AI 只能整理你已经写下的原意，不补充事实、不代替判断、不自动发布。采用后会公开标注“AI 协助整理”。</p>` })}<div class="h-4"></div>${U.panel({ title: "草稿状态", body: `<p class="font-semibold">已自动保存</p><p class="mt-1 text-sm opacity-65">今天 14:32 · 本地演示</p>` })}`;
    }
    const accountRail = !state.loggedIn
      ? U.panel({ eyebrow: "欢迎来到", title: "X2Post", body: `<p class="leading-relaxed opacity-75">一个内容优先、公开可读、秩序透明的轻量社区。</p><div class="mt-5 grid grid-cols-2 gap-2">${U.button("登录", { href: "#/login" })}${U.button("注册", { href: "#/register", kind: "primary" })}</div>` })
      : `${U.panel({ title: "我的 X2Post", body: `<div class="flex items-center gap-3">${U.avatar("linmo", "w-12", "林默的头像")}<div class="min-w-0"><a class="font-bold hover:underline" href="#/me">林默</a><p class="text-sm opacity-65">产品设计 · 上海</p></div></div><dl class="mt-4 grid grid-cols-3 gap-2 text-center"><div><dt class="text-xs opacity-60">未读</dt><dd class="font-bold">6</dd></div><div><dt class="text-xs opacity-60">草稿</dt><dd class="font-bold">3</dd></div><div><dt class="text-xs opacity-60">关注</dt><dd class="font-bold">48</dd></div></dl>`, footer: `<div class="flex flex-wrap gap-x-4 gap-y-2 text-sm">${link("主页", "#/me")}${link("通知", "#/notifications")}${link("草稿", "#/drafts")}</div>` })}<div class="h-4"></div>${U.panel({ title: "社区安全", body: `<p class="text-sm leading-relaxed opacity-75">不舒服的互动可以举报或屏蔽。每个举报都会留下进度记录。</p><a class="link mt-3 inline-block text-sm" href="#/reports">查看我的举报</a>` })}`;
    return route === "/feed" ? `${accountRail}<div class="h-4"></div>${nodeGuideRail()}` : accountRail;
  }

  function shell(content, route, options = {}) {
    if (options.auth) return `<main id="main-content" class="mx-auto flex min-h-screen max-w-md items-center px-4 py-10">${content}</main>`;
    const nav = [
      ["首页", "#/feed", "home", route === "/feed"], ["节点", "#/nodes", "nodes", route.startsWith("/nodes")], ["关注", "#/following", "heart", route === "/following"], ["金币", "#/coins", "coin", route.startsWith("/coins")], ["共建", "#/journey", "trophy", route.startsWith("/journey") || route.startsWith("/quests") || route.startsWith("/seasons") || route === "/me/progress" || route === "/me/contributions" || route === "/me/collection"], ["搜索", "#/search", "search", route === "/search"]
    ];
    const desktopNav = `<ul class="menu menu-horizontal gap-1 px-1">${nav.map(([label, href, i, active]) => `<li><a href="${href}" class="${active ? "menu-active" : ""}">${U.icon(i)}${label}</a></li>`).join("")}</ul>`;
    const mobileNav = `<ul class="menu min-h-full w-80 border-r-2 border-base-content/20 bg-base-100 p-4"><li class="menu-title">浏览 X2Post</li>${nav.map(([label, href, i, active]) => `<li><a href="${href}" class="${active ? "menu-active" : ""}" data-close-drawer>${U.icon(i)}${label}</a></li>`).join("")}<li class="menu-title mt-3">我的</li><li><a href="#/bookmarks" data-close-drawer>${U.icon("bookmark")}收藏</a></li><li><a href="#/notifications" data-close-drawer>${U.icon("bell")}通知</a></li><li><a href="#/settings/profile" data-close-drawer>${U.icon("user")}设置</a></li></ul>`;
    const userMenu = `<details class="dropdown dropdown-end"><summary class="btn btn-ghost" aria-label="打开用户菜单">${U.avatar(state.loggedIn ? "linmo" : "guest", "w-8", state.loggedIn ? "林默的头像" : "访客头像")}<span class="hidden sm:inline">${state.loggedIn ? "林默" : "访客"}</span></summary><ul class="menu dropdown-content z-20 mt-2 max-h-[80vh] w-60 overflow-y-auto border-2 border-base-content/20 bg-base-100 p-2"><li><a href="${state.loggedIn ? "#/me" : "#/login"}">${state.loggedIn ? "我的主页" : "登录"}</a></li>${state.loggedIn ? `<li><a href="#/coins">金币与账本</a></li><li><a href="#/journey">共建旅程</a></li><li><a href="#/bookmarks">我的收藏</a></li><li><a href="#/drafts">我的草稿</a></li><li><a href="#/me/reports">举报进度</a></li><li><a href="#/settings/blocked">屏蔽列表</a></li><li><a href="#/appeals">我的申诉</a></li><li><a href="#/settings/profile">设置</a></li><li class="menu-title">治理</li><li><a href="#/moderation/cases">治理工作台</a></li><li><a href="#/moderation/coins">金币风险案件</a></li><li><a href="#/moderation/audit-logs">审计日志</a></li><li class="menu-title">Controller</li><li><a href="#/admin/coins/control">金币控制台</a></li><li><a href="#/admin/coins/reconciliation">对账与关账</a></li>` : `<li><a href="#/register">注册</a></li>`}<li><button type="button" data-action="toggle-auth">切换为${state.loggedIn ? "访客" : "登录用户"}</button></li></ul></details>`;
    return `<div class="drawer"><input id="site-drawer" type="checkbox" class="drawer-toggle"/><div class="drawer-content min-h-screen"><header class="sticky top-0 z-30 border-b-2 border-base-content/20 bg-base-100"><div class="navbar mx-auto max-w-7xl px-3 sm:px-5"><div class="navbar-start"><label for="site-drawer" class="btn btn-ghost btn-square lg:hidden" aria-label="打开导航">${U.icon("menu")}</label><a class="ml-1 text-xl font-black tracking-tight sm:text-2xl" href="#/feed" aria-label="X2Post 首页">X2Post</a></div><nav class="navbar-center hidden lg:block" aria-label="主导航">${desktopNav}</nav><div class="navbar-end gap-1">${state.loggedIn ? U.button("轻发布", { href: "#/quick-compose", kind: "primary", iconName: "pen", extra: "hidden sm:inline-flex" }) : U.button("登录", { href: "#/login", extra: "hidden sm:inline-flex" })}<label class="btn btn-ghost btn-square" aria-label="切换深浅主题">${U.icon("moon")}<input type="checkbox" class="toggle sr-only" data-action="theme" ${state.theme === "night" ? "checked" : ""}/></label>${userMenu}</div></div></header><div class="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-6 lg:py-8"><main id="main-content" class="min-w-0">${content}</main><aside class="min-w-0" aria-label="页面辅助信息">${rail(route)}</aside></div><footer class="mt-10 border-t-2 border-base-content/20"><div class="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-sm opacity-70 sm:flex-row sm:items-center sm:justify-between"><p>© 2026 X2Post · 认真表达，友善回应</p><nav class="flex gap-4" aria-label="页脚"><a class="link" href="#/nodes">社区节点</a><a class="link" href="#/appeals">申诉</a><a class="link" href="#/moderation/cases">治理透明度</a></nav></div></footer></div><div class="drawer-side z-40"><label for="site-drawer" aria-label="关闭导航" class="drawer-overlay"></label>${mobileNav}</div></div>`;
  }

  function feedPage() {
    const { parent, child, invalidParent, invalidChild } = selectedNodePath();
    const quickContextQuery = parent ? `&node=${parent.slug}${child ? `&subnode=${child.slug}` : ""}` : "";
    const visiblePosts = child ? posts.filter(post => post.slug === parent.slug && post.subnodeSlug === child.slug) : parent ? posts.filter(post => post.slug === parent.slug) : posts;
    const listBody = visiblePosts.length
      ? U.list(visiblePosts.map(postRow), { framed: false })
      : `<div class="p-4 sm:p-5">${U.alert("这个子节点暂时没有公开帖子。", "info")}<div class="mt-4 flex flex-wrap gap-2">${U.button("发布内容", { href: `#/quick-compose?node=${parent.slug}&subnode=${child.slug}` })}${U.button("查看子节点", { href: `#/nodes/${parent.slug}/${child.slug}` })}${U.button(`返回全部${parent.name}`, { href: `#/feed?node=${parent.slug}` })}</div></div>`;
    const pathName = child ? `${parent.name} / ${child.name}` : parent?.name || "";
    const title = pathName ? `${pathName} · 最新帖子` : "社区 Feed";
    const summary = pathName ? `<p class="text-sm opacity-65">已显示 ${U.esc(pathName)} · ${visiblePosts.length} 篇演示帖子</p>` : `<p class="text-sm opacity-65">全部节点 · ${posts.length} 篇演示帖子</p>`;
    const recovery = invalidParent ? U.alert("指定的一级节点不存在，已显示全部帖子。", "warning") : invalidChild ? U.alert(`指定的子节点不属于${parent.name}，已显示父节点聚合内容。`, "warning") : "";
    const action = child ? `<a class="link text-sm" href="#/feed?node=${parent.slug}">返回全部${U.esc(parent.name)}</a>` : parent ? `<a class="link text-sm" href="#/feed">清除筛选</a>` : "";
    const quickStart = `<a class="flex min-h-14 items-center rounded-box border-2 border-base-content/20 px-4 font-semibold hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-offset-2" href="#/quick-compose${quickContextQuery ? `?${quickContextQuery.replace(/^&/, "")}` : ""}">写点什么……</a>`;
    return pageHeader("最新帖子", "先从节点缩小范围，再进入一段具体讨论。") + quickStart + `<div class="h-5"></div>` + nodeBrowseControl(parent, child) + (recovery ? `<div class="mt-5">${recovery}</div>` : "") + `<div class="h-5"></div>` + U.panel({ title, action, body: listBody, bodyClass: "p-0", footer: `<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">${summary}${U.pagination()}</div>` });
  }

  function nodesPage() {
    const rows = nodes.map(n => U.listRow(`${U.avatar(`node-${n.slug}`, "w-10", `${n.name}节点图标`)}<div class="list-col-grow min-w-0"><a class="font-bold hover:underline" href="#/nodes/${n.slug}">${U.esc(n.name)}</a><p class="mt-1 opacity-70">${U.esc(n.desc)}</p><p class="mt-2 text-sm opacity-60">${n.count} 个主题 · ${n.followers} 人关注 · ${n.children.length} 个子节点</p><nav class="mt-3" aria-label="${U.esc(n.name)}子节点"><ul class="menu menu-horizontal flex flex-wrap gap-1 px-0">${n.children.map(child => `<li><a class="min-h-11 px-3" href="#/nodes/${n.slug}/${child.slug}">${U.esc(child.name)}</a></li>`).join("")}</ul></nav><div class="mt-2 flex flex-wrap gap-3 text-sm"><a class="link" href="#/feed?node=${n.slug}">浏览父节点聚合</a><span>父级关注覆盖全部子节点</span></div></div><span class="hidden shrink-0 self-center sm:block" aria-hidden="true">${U.icon("arrow")}</span>`));
    return pageHeader("节点目录", "一级节点划定社区边界，子节点细分稳定讨论主题。") + U.alert("子节点只属于一个一级节点；跨节点的具体概念继续使用标签。当前严格支持两层。", "info") + `<div class="h-5"></div>` + U.list(rows);
  }

  function nodePage(parentSlug, childSlug = "") {
    const parent = nodeFromSlug(parentSlug);
    if (!parent) return notFoundPage();
    const child = childFromSlug(parent, childSlug);
    if (childSlug && !child) return notFoundPage();
    const filtered = child ? posts.filter(p => p.slug === parent.slug && p.subnodeSlug === child.slug) : posts.filter(p => p.slug === parent.slug);
    const siblingMenu = `<nav aria-label="${U.esc(parent.name)}子节点"><ul class="menu menu-horizontal flex flex-wrap gap-1 px-0">${nodeMenuItem({ label: `全部${parent.name}`, href: `#/nodes/${parent.slug}`, current: !child })}${parent.children.map(item => nodeMenuItem({ label: item.name, href: `#/nodes/${parent.slug}/${item.slug}`, current: child?.slug === item.slug })).join("")}</ul></nav>`;
    if (child) {
      const emptyChild = `<div>${U.alert("这个子节点还没有公开帖子。", "info")}<div class="mt-4">${U.button("发布内容", { href: `#/quick-compose?node=${parent.slug}&subnode=${child.slug}` })}</div></div>`;
      return U.breadcrumb([{ label: "节点", href: "#/nodes" }, { label: parent.name, href: `#/nodes/${parent.slug}` }, { label: child.name }]) + `<div class="mt-3">${pageHeader(`${parent.name} / ${child.name}`, child.desc, U.button("直接关注子节点", { action: "toggle-follow", kind: "primary" }))}</div>` + U.alert(`关注${parent.name}会自动覆盖当前及未来子节点；只关注${child.name}不会反向关注父节点。`, "info") + `<div class="h-5"></div>${U.panel({ title: "切换同级主题", body: siblingMenu })}<div class="h-5"></div>${U.panel({ title: "适用规则", body: `<div class="space-y-3"><p><strong>${U.esc(parent.name)}通用规则：</strong>${U.esc(parent.rule)}</p><p><strong>${U.esc(child.name)}补充规则：</strong>${U.esc(child.rule)}</p></div>`, footer: `<p class="text-sm opacity-65">${child.followers} 人直接关注 · ${child.count} 个主题 · 可发布</p>` })}<div class="h-5"></div>${U.panel({ title: `${child.name}最新帖子`, body: filtered.length ? U.list(filtered.map(postRow), { framed: false }) : emptyChild, bodyClass: filtered.length ? "p-0" : "p-4 sm:p-5", footer: `<div class="flex flex-wrap items-center justify-between gap-3"><a class="link text-sm" href="#/feed?node=${parent.slug}&subnode=${child.slug}">在 Feed 中浏览</a>${U.pagination()}</div>` })}`;
    }
    const childRows = parent.children.map(item => U.listRow(`<div class="list-col-grow min-w-0"><a class="font-bold hover:underline" href="#/nodes/${parent.slug}/${item.slug}">${U.esc(item.name)}</a><p class="mt-1 text-sm opacity-65">${U.esc(item.desc)}</p></div><span class="text-sm opacity-60">${item.count} 个主题</span>`));
    return U.breadcrumb([{ label: "节点", href: "#/nodes" }, { label: parent.name }]) + `<div class="mt-3">${pageHeader(parent.name, parent.desc, U.button(state.following ? "已关注父节点" : "关注父节点", { action: "toggle-follow", kind: state.following ? "soft" : "primary" }))}</div>` + U.alert(`关注${parent.name}会覆盖全部现有及未来子节点；你仍可以单独静音不感兴趣的子节点。`, "info") + `<div class="h-5"></div>${U.panel({ title: "节点简介", body: `<p class="leading-relaxed">${U.esc(parent.desc)}</p><p class="mt-3 text-sm opacity-65">${parent.followers} 人关注 · ${parent.count} 个聚合主题</p>`, footer: `<p class="text-sm"><strong>通用规则：</strong>${U.esc(parent.rule)}</p>` })}<div class="h-5"></div>${U.panel({ title: `${parent.children.length} 个子节点`, body: U.list(childRows, { framed: false }), bodyClass: "p-0" })}<div class="h-5"></div>${U.panel({ title: "父节点聚合帖子", body: filtered.length ? U.list(filtered.map(postRow), { framed: false }) : U.alert("此节点及其子节点还没有公开帖子。", "info"), bodyClass: filtered.length ? "p-0" : "p-4 sm:p-5", footer: U.pagination() })}`;
  }

  function postPage() {
    const p = posts[0];
    const breadcrumbs = [{ label: "首页", href: "#/feed" }, { label: p.node, href: `#/nodes/${p.slug}` }, ...(p.subnodeSlug ? [{ label: p.subnodeName, href: `#/nodes/${p.slug}/${p.subnodeSlug}` }] : []), { label: "帖子" }];
    const body = `<article><header class="border-b-2 border-base-content/20 px-4 py-5 sm:px-6"><h1 class="text-2xl font-black leading-tight sm:text-3xl">${U.esc(p.title)}</h1><div class="mt-3">${meta(p)}</div></header><div class="markdown-body px-4 py-5 sm:px-6"><p>社区里的表达一旦进入公共讨论，就会成为其他回应的上下文。允许作者随时改写，会让后续回复失去依据，也可能伤害讨论记录的可信度。</p><h2>不可变，不等于不治理</h2><p>原始内容保持不变，同时通过可见性状态处理风险：违规内容可以被隐藏，帖子可以被锁定，用户可以申诉，治理动作则进入不可变审计记录。</p><ul><li>发布前提供草稿、预览和明确确认；</li><li>发布后不提供编辑、删除或撤回入口；</li><li>举报和处置都保留上下文与进度。</li></ul><p>这种边界让创作者在提交前更谨慎，也让参与者知道自己回应的是一份稳定记录。</p></div><footer class="flex flex-wrap items-center gap-2 border-t-2 border-base-content/20 px-4 py-4 sm:px-6">${U.button(state.reacted ? "已认同 65" : "认同 64", { action: "toggle-react", iconName: "heart", kind: state.reacted ? "soft" : "default" })}${U.button(state.bookmarked ? "已收藏" : "收藏", { action: "toggle-bookmark", iconName: "bookmark", kind: state.bookmarked ? "soft" : "default" })}${U.button("金币感谢", { action: "coin-thanks", iconName: "coin" })}${U.button("设置悬赏", { action: "create-bounty" })}${U.button("举报", { action: "open-report", kind: "ghost", iconName: "shield" })}</footer></article>`;
    const commentEditor = state.loggedIn ? U.panel({ title: "参与讨论", body: `<div class="mb-4"><p class="text-sm font-bold">不知道怎么开始？先选一个回应起点</p><div class="mt-2 flex flex-wrap gap-2">${U.button("补一个例子", { action: "reply-starter-example", size: "sm" })}${U.button("提供资料", { action: "reply-starter-resource", size: "sm" })}${U.button("问一个问题", { action: "reply-starter-question", size: "sm" })}${U.button("不同看法", { action: "reply-starter-disagree", size: "sm" })}${U.button("自由回应", { action: "reply-starter-free", size: "sm", kind: "ghost" })}</div></div>${U.field("评论内容", U.textarea('id="comment-input" placeholder="真诚回应，补充你的经验或提出问题" maxlength="2000"'), "评论提交后不能编辑或删除。")}`, footer: `<div class="flex items-center justify-between gap-3"><p class="text-sm opacity-65">一句有信息量的回应也可以 · 最多 2,000 字</p>${U.button("提交评论", { action: "submit-comment", kind: "primary" })}</div>` }) : U.alert("登录后可以评论。我们会保存当前阅读位置并在登录后带你回来。", "info");
    const comments = [
      { name: "青屿", user: "qingyu", time: "8 分钟前", text: "赞同“稳定记录”的说法。是否考虑过作者发现敏感信息后怎么办？", replies: 3 },
      { name: "阿澈", user: "ache", time: "2 分钟前", text: "可以通过受控的合规数据处理通道解决，但不应该伪装成普通编辑能力。", replies: 1 }
    ];
    const commentRows = comments.map((c, i) => U.listRow(`${U.avatar(c.user, "w-10", `${c.name}的头像`)}<div class="list-col-grow min-w-0"><div class="flex flex-wrap items-center gap-2"><a class="font-bold hover:underline" href="#/user/ache">${c.name}</a><span class="text-sm opacity-60">${c.time}</span></div><p class="mt-2 leading-relaxed">${c.text}</p><div class="mt-3 flex flex-wrap items-center gap-2">${U.button(`回应 ${c.replies}`, { action: `reply-${i}`, size: "sm", kind: "ghost", iconName: "reply" })}${U.button("认同", { action: "toast-react", size: "sm", kind: "ghost", iconName: "heart" })}${U.button("金币感谢", { action: "coin-thanks", size: "sm", kind: "ghost", iconName: "coin" })}${U.button("举报", { action: "open-report", size: "sm", kind: "ghost" })}</div><div id="reply-${i}" class="mt-3 hidden pl-4 sm:pl-8"></div></div>`));
    return U.breadcrumb(breadcrumbs) + `<div class="mt-3 border-2 border-base-content/20 rounded-box overflow-hidden">${body}</div><div class="h-5"></div>${commentEditor}<div class="h-5"></div><header class="mb-5"><h2 class="text-2xl font-black tracking-tight">评论</h2><p class="mt-1 opacity-70">共 28 条，按时间排序。</p></header>${U.list(commentRows)}`;
  }

  function searchPage() {
    const qs = `<form class="join w-full" data-form="search"><input class="input join-item w-full" name="q" value="社区治理" aria-label="搜索关键词"/><button class="btn btn-primary join-item" type="submit">搜索</button></form>`;
    const tabs = U.tabs(["帖子", "用户", "节点", "标签"].map((label, i) => ({ label, href: `#/search?type=${i}`, active: i === 0 })));
    const nodeFilters = `<div class="mt-4 grid gap-3 sm:grid-cols-2">${U.field("一级节点", U.select([{ label: "全部一级节点", value: "" }, ...nodes.map(n => ({ label: n.name, value: n.slug }))], 'id="search-primary-node"'))}${U.field("子节点", U.select([{ label: "先选择一级节点", value: "" }], 'id="search-secondary-node" disabled'))}</div><p id="search-node-path" class="mt-2 text-sm opacity-65">当前搜索范围：全部公开节点</p>`;
    return pageHeader("搜索", "在公开帖子、用户、节点和标签中查找。") + U.panel({ title: "搜索 X2Post", body: `${qs}${nodeFilters}<div class="mt-4">${tabs}</div>` }) + `<div class="h-5"></div>${U.panel({ title: "帖子结果 · 12", action: U.select([{ label: "相关度优先" }, { label: "最新发布" }], 'aria-label="结果排序"'), body: U.list(posts.slice(0, 3).map(postRow), { framed: false }), bodyClass: "p-0", footer: U.pagination() })}`;
  }

  function tagsPage(slug) {
    const tags = ["社区", "治理", "冷启动", "运营", "无障碍", "前端", "写作"];
    if (!slug) return pageHeader("标签", "从具体话题进入跨节点讨论。") + U.list(tags.map((t, i) => U.listRow(`<div class="min-w-0"><a class="font-bold hover:underline" href="#/tags/${encodeURIComponent(t)}"># ${t}</a><p class="mt-1 text-sm opacity-65">${18 + i * 7} 个公开帖子</p></div>${U.icon("arrow")}`)));
    return U.breadcrumb([{ label: "标签", href: "#/tags" }, { label: `#${slug}` }]) + `<div class="mt-3">${pageHeader(`# ${slug}`, "包含此标签的公开帖子。")}</div>` + U.list(posts.slice(0, 3).map(postRow));
  }

  function userPage(section = "profile") {
    let content = "";
    if (section === "profile") content = U.panel({ title: "关于", body: `<p class="leading-relaxed">在复杂系统里寻找简单边界。关注社区产品、信任机制与可访问设计。</p><dl class="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4"><div><dt class="opacity-60">加入时间</dt><dd class="font-semibold">2024 年 8 月</dd></div><div><dt class="opacity-60">帖子</dt><dd class="font-semibold">36</dd></div><div><dt class="opacity-60">关注</dt><dd class="font-semibold">48</dd></div><div><dt class="opacity-60">粉丝</dt><dd class="font-semibold">231</dd></div></dl>` });
    if (section === "posts") content = U.list(posts.slice(0, 2).map(postRow));
    if (section === "comments") content = U.list([U.listRow(`<div><a class="font-bold hover:underline" href="#/posts/immutable-content">为什么社区内容需要明确的不可变边界？</a><p class="mt-2">谢谢补充。这里更关键的是把“内容状态”和“原始记录”分开。</p><p class="mt-2 text-sm opacity-60">昨天 18:20</p></div>`), U.listRow(`<div><a class="font-bold hover:underline" href="#/posts/accessible-ui">给内容社区做无障碍</a><p class="mt-2">焦点恢复确实是最容易遗漏的一步。</p><p class="mt-2 text-sm opacity-60">周六</p></div>`)]);
    if (section === "following" || section === "followers") content = U.list([{ name: "青屿", user: "qingyu" }, { name: "阿澈", user: "ache" }, { name: "周末写字", user: "weekend" }].map((person, i) => U.listRow(`${U.avatar(person.user, "w-10", `${person.name}的头像`)}<div class="list-col-grow min-w-0"><a class="font-bold hover:underline" href="#/user/qingyu">${person.name}</a><p class="text-sm opacity-65">${["社区运营", "前端与无障碍", "写作与知识管理"][i]}</p></div><div class="col-start-2 row-start-2 mt-2 justify-self-end sm:col-start-3 sm:row-start-1 sm:mt-0 sm:self-center">${U.button(section === "following" ? "已关注" : "查看", { size: "sm", kind: "soft", href: "#/user/qingyu", extra: "shrink-0" })}</div>`, { extra: "grid-cols-[auto_minmax(0,1fr)] sm:grid-cols-[auto_minmax(0,1fr)_auto]" })));
    return `<div class="border-2 border-base-content/20 rounded-box overflow-hidden"><header class="p-5 sm:p-6"><div class="flex flex-col gap-4 sm:flex-row sm:items-center">${U.avatar("linmo", "w-20", "林默的头像")}<div class="min-w-0 flex-1"><h1 class="text-2xl font-black">林默 <span class="text-base font-normal opacity-60">@linmo</span></h1><p class="mt-1 opacity-70">上海 · 产品设计</p></div><div class="flex flex-wrap gap-2">${U.button(state.following ? "已关注" : "关注", { action: "toggle-follow", kind: state.following ? "soft" : "primary" })}${U.button("屏蔽", { action: "block-user" })}${U.button("举报", { href: "#/report/new", kind: "ghost" })}</div></div></header><div class="border-t-2 border-base-content/20 px-3">${sectionTabs(section)}</div></div><div class="h-5"></div>${content}`;
  }

  function authPage(type) {
    const configs = {
      login: ["欢迎回来", "登录后继续参与讨论", `${U.field("邮箱", U.input('type="email" name="email" placeholder="you@example.com" required'))}${U.field("密码", U.input('type="password" name="password" placeholder="至少 8 位" required minlength="8"'))}`, "登录", "还没有账号？", "注册", "#/auth/register"],
      register: ["加入 X2Post", "从一段真诚的自我介绍开始", `${U.field("用户名", U.input('name="username" placeholder="2–20 个字符" required minlength="2" maxlength="20"'), "公开显示，可在注册后完善资料。")}${U.field("邮箱", U.input('type="email" name="email" placeholder="you@example.com" required'))}${U.field("密码", U.input('type="password" name="password" placeholder="至少 8 位" required minlength="8"'))}`, "创建账号", "已经注册？", "登录", "#/auth/login"],
      verify: ["验证邮箱", "我们已向 li•••@example.com 发送验证链接", U.alert("请在 30 分钟内完成验证。如果没有收到，请检查垃圾邮件。", "info"), "我已完成验证", "链接已失效？", "重新发送", "#/auth/verify"],
      forgot: ["找回密码", "输入注册邮箱，我们会发送重置说明", U.field("邮箱", U.input('type="email" name="email" placeholder="you@example.com" required')), "发送重置邮件", "想起密码了？", "返回登录", "#/auth/login"],
      reset: ["设置新密码", "新密码会让其他设备上的旧会话失效", `${U.field("新密码", U.input('type="password" required minlength="8"'))}${U.field("再次输入", U.input('type="password" required minlength="8"'))}`, "更新密码", "链接有问题？", "重新申请", "#/auth/forgot"]
    };
    const c = configs[type] || configs.login;
    return `<div class="w-full"><a class="mb-8 block text-center text-3xl font-black" href="#/feed">X2Post</a><section class="border-2 border-base-content/20 rounded-box overflow-hidden"><header class="border-b-2 border-base-content/20 p-5 text-center"><h1 class="text-2xl font-black">${c[0]}</h1><p class="mt-1 opacity-65">${c[1]}</p></header><form class="space-y-3 p-5" data-form="auth" data-auth-type="${type}">${c[2]}<button class="btn btn-primary mt-4 w-full" type="submit">${c[3]}</button></form><footer class="border-t-2 border-base-content/20 p-4 text-center text-sm"><span class="opacity-65">${c[4]}</span> <a class="link font-semibold" href="${c[6]}">${c[5]}</a></footer></section><p class="mt-5 text-center text-sm opacity-60">继续即表示你理解：已发布内容不能编辑或删除。</p></div>`;
  }

  function composePage() {
    const params = hashParams();
    const parent = nodeFromSlug(params.get("node")) || nodes[0];
    const child = childFromSlug(parent, params.get("subnode"));
    const fromQuick = params.get("from") === "quick";
    const convertedBody = fromQuick ? sessionStorage.getItem("x2post-quick-to-long") || "" : "";
    const nodeFields = `<div class="grid gap-4 sm:grid-cols-2">${U.field("一级节点（必选）", U.select(nodes.map(n => ({ label: n.name, value: n.slug, selected: n.slug === parent.slug })), 'id="compose-primary-node" name="node" required'))}${U.field("子节点（推荐）", U.select([{ label: `${parent.name}（综合）`, value: "", selected: !child }, ...parent.children.map(item => ({ label: item.name, value: item.slug, selected: item.slug === child?.slug }))], 'id="compose-secondary-node" name="subnode"'))}</div><div id="compose-node-path" class="alert mt-3"><p><strong>发布路径：</strong>${U.esc(parent.name)}${child ? ` / ${U.esc(child.name)}` : "（综合）"}</p></div>`;
    const bodyEditor = `<textarea class="textarea validator min-h-28 w-full" name="body" rows="12" placeholder="提供背景、你的判断和希望大家回应的问题……" required>${U.esc(convertedBody)}</textarea>`;
    return pageHeader("发布帖子", fromQuick ? "轻发布内容已带入，请补充标题后继续完善。" : "先保存为草稿，确认无误后再发布。") + U.panel({ title: "内容草稿", body: `<form class="space-y-4" data-form="compose">${nodeFields}${U.alert("二级节点用于更精准归类；无法判断时可发布到一级节点综合区。父级与子级规则都会在最终确认中展示。", "info")}${U.field("标题", U.input('name="title" placeholder="用一句话说清要讨论的问题" required maxlength="80"'), "最多 80 字")}${U.field("正文（Markdown）", bodyEditor)}${U.field("标签", U.input('name="tags" placeholder="输入后按回车，例如：社区、治理"'), "最多 5 个标签")}${U.field("附件", '<input type="file" class="file-input w-full" aria-describedby="upload-hint"/><p id="upload-hint" class="label">支持 PNG、JPG、PDF，单文件不超过 10MB。</p>')}</form>`, footer: `<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p class="text-sm opacity-65">已自动保存 · 14:32</p><div class="flex flex-wrap gap-2">${U.button("保存草稿", { action: "save-draft" })}${U.button("预览", { action: "preview-post" })}${U.button("确认发布", { action: "confirm-publish", kind: "primary" })}</div></div>` });
  }

  function quickComposePage() {
    const params = hashParams();
    const parent = nodeFromSlug(params.get("node"));
    const child = childFromSlug(parent, params.get("subnode"));
    const nodeLabel = parent ? `${parent.name}${child ? ` / ${child.name}` : "（综合）"}` : "未选择";
    return `<form data-form="quick-compose" data-node="${U.esc(parent?.slug || "")}" data-subnode="${U.esc(child?.slug || "")}" class="mx-auto max-w-2xl space-y-4"><h1 class="sr-only">轻发布</h1><label class="sr-only" for="quick-content">Markdown 内容</label><textarea id="quick-content" class="textarea min-h-64 w-full text-base leading-relaxed" minlength="1" required autofocus placeholder="使用 Markdown 写点什么……"></textarea><div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm"><a class="link link-hover font-semibold" href="#select-node" data-action="quick-open-node-picker">选择节点</a><span id="quick-node-value" class="opacity-60" aria-live="polite">${U.esc(nodeLabel)}</span><span class="opacity-30" aria-hidden="true">·</span><a class="link link-hover font-semibold" href="#/compose?from=quick" data-action="quick-to-long">转为长文</a></div>${U.button("发布", { action: "quick-publish", kind: "primary", extra: "w-full" })}</form>`;
  }

  function draftsPage() {
    const rows = [
      ["怎样建立一个友善的提问模板", "产品设计", "2 分钟前", "68%"], ["社区健康度应该看哪些信号？", "社区运营", "昨天", "42%"], ["未命名草稿", "前端开发", "7 月 8 日", "12%"]
    ].map((d, i) => U.listRow(`<div class="min-w-0 flex-1"><a class="font-bold hover:underline" href="#/compose?draft=${i}">${d[0]}</a><p class="mt-1 text-sm opacity-65">${d[1]} · 保存于 ${d[2]}</p></div>${U.badge(d[3])}<div class="dropdown dropdown-end"><button popovertarget="draft-menu-${i}" style="anchor-name:--draft-${i}" class="btn btn-ghost btn-square" aria-label="草稿操作">${U.icon("more")}</button><ul class="dropdown menu w-40 border-2 border-base-content/20 bg-base-100 p-2" popover id="draft-menu-${i}" style="position-anchor:--draft-${i}"><li><a href="#/compose?draft=${i}">继续编辑</a></li><li><button type="button" data-action="discard-draft">放弃草稿</button></li></ul></div>`));
    return pageHeader("我的草稿", "草稿可在发布前修改或放弃。", U.button("新建草稿", { href: "#/compose", kind: "primary" })) + U.list(rows);
  }

  function simplePostListPage(title, desc, source = posts) {
    return pageHeader(title, desc) + (source.length ? U.list(source.map(postRow)) : U.panel({ title: "暂无内容", body: `<p class="opacity-70">这里还没有内容。</p>` }));
  }

  function notificationsPage() {
    const items = [
      ["青屿回复了你的帖子", "为什么社区内容需要明确的不可变边界？", "5 分钟前", true, "#/posts/immutable-content#comments"],
      ["阿澈提到了你", "给内容社区做无障碍，不只是加 aria-label", "1 小时前", true, "#/posts/accessible-ui"],
      ["你的举报有新进展", "案件 RP-2026-0712 已完成初步审核", "昨天", true, "#/reports"],
      ["青屿关注了你", "现在有 231 人关注你", "周日", false, "#/user/qingyu"],
      ["安全提醒", "新的设备登录了你的 X2Post 账号", "7 月 9 日", false, "#/settings/sessions"]
    ];
    const rows = items.map((n, i) => U.listRow(`<span class="status ${n[3] ? "status-primary" : ""}" aria-label="${n[3] ? "未读" : "已读"}"></span><div class="min-w-0"><a class="font-bold hover:underline" href="${n[4]}" data-action="read-notification">${n[0]}</a><p class="mt-1 opacity-70">${n[1]}</p><p class="mt-2 text-sm opacity-55">${n[2]}</p></div>${n[3] ? U.button("标为已读", { action: `read-${i}`, size: "sm", kind: "ghost" }) : U.badge("已读")}`));
    return pageHeader("通知中心", "回复、提及、关注、治理与账户安全消息。", U.button("全部标为已读", { action: "read-all" })) + U.panel({ title: "通知", action: U.select([{ label: "全部通知" }, { label: "未读" }, { label: "互动" }, { label: "系统" }], 'aria-label="通知筛选"'), body: U.list(rows, { framed: false }), bodyClass: "p-0" });
  }

  function settingsPage(tab) {
    const forms = {
      profile: `${U.field("显示名称", U.input('value="林默" required'))}${U.field("个人简介", U.textarea('rows="4" maxlength="160"'), "公开展示，最多 160 字。")}${U.field("所在地", U.input('value="上海"'))}`,
      privacy: `<div class="space-y-5"><label class="flex min-h-11 items-center justify-between gap-4"><span><strong>允许出现在提及建议中</strong><small class="block opacity-65">被屏蔽的用户始终看不到你。</small></span><input class="toggle" type="checkbox" checked/></label><label class="flex min-h-11 items-center justify-between gap-4"><span><strong>展示关注列表</strong><small class="block opacity-65">关闭后仅你自己可见。</small></span><input class="toggle" type="checkbox" checked/></label><label class="flex min-h-11 items-center justify-between gap-4"><span><strong>搜索引擎收录个人页</strong><small class="block opacity-65">只影响公开个人页。</small></span><input class="toggle" type="checkbox"/></label></div>`,
      notifications: `<div class="space-y-5">${["回复与提及", "新关注", "内容互动", "治理进度", "账户安全"].map((x, i) => `<label class="flex min-h-11 items-center justify-between gap-4"><span><strong>${x}</strong><small class="block opacity-65">${i === 4 ? "安全通知不可完全关闭" : "站内通知与邮件摘要"}</small></span><input class="toggle" type="checkbox" ${i !== 2 ? "checked" : ""} ${i === 4 ? "disabled" : ""}/></label>`).join("")}</div>`,
      security: `${U.alert("账号邮箱：li•••@example.com（已验证）", "info")}<div class="mt-5 divide-y-2 divide-base-content/20"><div class="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p class="font-bold">登录密码</p><p class="text-sm opacity-65">上次修改于 2026 年 4 月 18 日</p></div>${U.button("修改密码", { href: "#/settings/security/password" })}</div><div class="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p class="font-bold">设备会话</p><p class="text-sm opacity-65">当前有 3 个有效会话</p></div>${U.button("管理设备", { href: "#/settings/sessions" })}</div></div>`,
      sessions: U.table(["设备", "位置", "最近活动", "操作"], [["Mac · Chrome（当前）", "上海", "刚刚", U.badge("当前", "success")], ["iPhone · Safari", "上海", "昨天", U.button("撤销", { action: "revoke-session", size: "sm" })], ["Windows · Edge", "杭州", "7 月 4 日", U.button("撤销", { action: "revoke-session", size: "sm" })]])
    };
    const title = { profile: "编辑资料", privacy: "隐私设置", notifications: "通知设置", security: "账户安全", sessions: "设备会话" }[tab] || "设置";
    return pageHeader("设置", "管理公开资料、隐私、通知与账户安全。") + `<div class="mb-5 border-b-2 border-base-content/20">${settingsTabs(tab)}</div>` + U.panel({ title, body: forms[tab] || forms.profile, footer: tab === "sessions" ? U.button("撤销其他全部会话", { action: "revoke-all" }) : U.button("保存更改", { action: "save-settings", kind: "primary" }) });
  }

  function reportsPage() {
    const rows = [["RP-2026-0712", "帖子", "骚扰或人身攻击", "审核中", "warning"], ["RP-2026-0628", "评论", "垃圾信息", "已处理", "success"], ["RP-2026-0511", "用户", "冒充他人", "未违规", "default"]].map(r => U.listRow(`<div class="min-w-0 flex-1"><a class="font-bold hover:underline" href="#/me/reports/${r[0]}">${r[0]}</a><p class="mt-1 text-sm opacity-65">${r[1]} · ${r[2]}</p></div>${U.badge(r[3], r[4])}${U.icon("arrow")}`));
    return pageHeader("我的举报", "查看已提交举报的安全进度，不公开审核人员信息。") + U.list(rows);
  }

  function reportFormPage() {
    return pageHeader("提交举报", "举报用于处理具体风险，不用于表达观点不同。") + U.panel({ title: "被举报内容", body: `<p class="font-bold">为什么社区内容需要明确的不可变边界？</p><p class="mt-1 text-sm opacity-65">帖子 · 林默 · 12 分钟前</p>`, footer: `<a class="link text-sm" href="#/posts/immutable-content">查看公开上下文</a>` }) + `<div class="h-5"></div>` + U.panel({ title: "举报详情", body: `${U.field("原因", U.select([{ label: "请选择原因", value: "" }, { label: "骚扰或人身攻击" }, { label: "仇恨或歧视" }, { label: "垃圾信息" }, { label: "危险或违法内容" }, { label: "侵犯隐私" }, { label: "其他" }], 'required'))}${U.field("补充说明", U.textarea('placeholder="说明具体位置和影响，避免重复粘贴敏感内容" maxlength="1000"'), "最多 1,000 字。")}${U.field("确认", '<label class="label cursor-pointer justify-start gap-3"><input type="checkbox" class="checkbox" required/><span>我确认信息真实，并理解恶意举报可能受到限制。</span></label>')}`, footer: `<div class="flex justify-end gap-2">${U.button("取消", { href: "#/posts/immutable-content" })}${U.button("提交举报", { action: "submit-report", kind: "primary" })}</div>` });
  }

  function blockedPage() {
    const people = [["广告清理机", "已屏蔽于 6 月 28 日", "ad-cleaner"], ["争论到底", "已屏蔽于 5 月 11 日", "debater"]];
    return pageHeader("屏蔽列表", "屏蔽会减少双方在 Feed、搜索、提及和通知中的相互可见。") + U.alert("对方不会收到屏蔽通知。公开内容在必要的讨论上下文中仍可能以安全占位显示。", "info") + `<div class="h-5"></div>` + U.list(people.map(p => U.listRow(`${U.avatar(p[2], "w-10", `${p[0]}的头像`)}<div class="list-col-grow min-w-0"><p class="font-bold">${p[0]}</p><p class="text-sm opacity-65">${p[1]}</p></div><div class="col-start-2 row-start-2 mt-2 justify-self-end sm:col-start-3 sm:row-start-1 sm:mt-0 sm:self-center">${U.button("解除屏蔽", { action: "unblock", size: "sm", extra: "shrink-0" })}</div>`, { extra: "grid-cols-[auto_minmax(0,1fr)] sm:grid-cols-[auto_minmax(0,1fr)_auto]" })));
  }

  function appealsPage() {
    return pageHeader("申诉", "对内容或账户处置提出复核，并持续查看进度。", U.button("发起申诉", { action: "new-appeal", kind: "primary" })) + U.list([U.listRow(`<div class="min-w-0 flex-1"><p class="font-bold">AP-2026-0041 · 帖子锁定</p><p class="mt-1 text-sm opacity-65">提交于 7 月 10 日 · 已补充说明</p></div>${U.badge("复核中", "warning")}${U.icon("arrow")}`), U.listRow(`<div class="min-w-0 flex-1"><p class="font-bold">AP-2026-0018 · 账户限流</p><p class="mt-1 text-sm opacity-65">提交于 5 月 3 日</p></div>${U.badge("已结束", "success")}${U.icon("arrow")}`)]);
  }

  function moderationPage() {
    const rows = [
      ["MC-0713-18", "帖子", "隐私泄露", U.badge("紧急", "error"), "2 分钟前"], ["MC-0713-17", "用户", "骚扰", U.badge("待分派", "warning"), "18 分钟前"], ["MC-0713-16", "评论", "垃圾信息", U.badge("审核中", "info"), "31 分钟前"]
    ].map(r => [link(r[0], `#/moderation/cases/${r[0]}`), r[1], r[2], r[3], r[4]]);
    return pageHeader("审核队列", "按风险与时效处理举报；原始内容不可被改写或删除。") + U.alert("治理动作会进入不可变审计记录。隐藏内容和限制用户都必须填写理由。", "warning") + `<div class="h-5"></div>` + U.table(["案件", "对象", "原因", "状态", "进入队列"], rows);
  }

  function casePage(id) {
    return U.breadcrumb([{ label: "审核队列", href: "#/moderation" }, { label: id }]) + `<div class="mt-3">${pageHeader(`案件 ${id}`, "高风险 · 隐私泄露 · 2 分钟前进入队列")}</div>` + U.panel({ title: "举报上下文", body: `<dl class="grid gap-3 text-sm sm:grid-cols-2"><div><dt class="opacity-60">举报对象</dt><dd class="font-semibold">帖子：城市散步路线分享</dd></div><div><dt class="opacity-60">举报次数</dt><dd class="font-semibold">3 次独立举报</dd></div><div><dt class="opacity-60">当前可见性</dt><dd>${U.badge("已紧急隐藏", "warning")}</dd></div><div><dt class="opacity-60">作者历史</dt><dd class="font-semibold">近 90 天无处置</dd></div></dl><div class="mt-4 border-t-2 border-base-content/20 pt-4"><p class="font-bold">风险摘要</p><p class="mt-2 leading-relaxed">内容可能包含可识别的私人住址。为避免扩散，此原型不展示原文，只保留必要案件上下文。</p></div>` }) + `<div class="h-5"></div>` + U.panel({ title: "治理动作", body: `<div class="grid gap-3 sm:grid-cols-2">${U.button("恢复可见性", { action: "moderate-restore" })}${U.button("保持隐藏", { action: "moderate-hide" })}${U.button("锁定评论", { action: "moderate-lock" })}${U.button("限制用户", { action: "moderate-user" })}</div>${U.field("处置理由", U.textarea('placeholder="说明证据、风险与处置期限" required'))}`, footer: U.button("记录并执行", { action: "moderate-confirm", kind: "primary" }) });
  }

  function auditPage() {
    const rows = [["AL-8891", "保持内容隐藏", "MC-0713-18", "审核员 A-17", "14:42"], ["AL-8890", "紧急隐藏", "MC-0713-18", "系统规则", "14:39"], ["AL-8889", "解除用户限流", "MC-0712-41", "审核员 B-03", "13:17"]].map(r => r.map(U.esc));
    return pageHeader("审计日志", "只读记录所有治理动作、理由与责任主体。") + U.table(["记录", "动作", "案件", "执行者", "时间"], rows);
  }

  function forbiddenPage() {
    return U.panel({ title: "没有访问权限", body: `<h1 class="text-3xl font-black">403</h1><p class="mt-2 opacity-70">你的账号没有进入治理工作台的权限。公开内容仍可正常浏览。</p>${U.alert("如果你刚获得权限，请重新登录或联系社区管理员确认授权。", "warning")}`, footer: `<div class="flex gap-2">${U.button("返回首页", { href: "#/feed", kind: "primary" })}${U.button("查看公开规则", { href: "#/nodes" })}</div>` });
  }

  function verifyResultPage() {
    return `<div class="w-full"><a class="mb-8 block text-center text-3xl font-black" href="#/feed">X2Post</a>${U.panel({ title: "邮箱验证成功", body: `<div class="text-center"><div class="mx-auto flex size-14 items-center justify-center rounded-full border-2 border-success text-success">${U.icon("check", "size-8")}</div><h1 class="mt-4 text-2xl font-black">欢迎加入 X2Post</h1><p class="mt-2 opacity-70">邮箱已验证。接下来将恢复你登录前的任务。</p></div>`, footer: U.button("继续", { href: "#/auth/recover-task", kind: "primary", extra: "w-full" }) })}<div class="mt-4">${U.alert("链接失效或已使用时，此页会安全提示重新发送，不泄露账号信息。", "info")}</div></div>`;
  }

  function authRecoveryPage() {
    return `<div class="w-full"><a class="mb-8 block text-center text-3xl font-black" href="#/feed">X2Post</a>${U.panel({ title: "恢复之前的任务", body: `<div class="flex items-start gap-3"><span class="loading loading-spinner loading-md" aria-hidden="true"></span><div><h1 class="font-bold">已回到原帖子与评论位置</h1><p class="mt-1 opacity-70">你登录前准备收藏帖子。为避免意外操作，请再次确认。</p></div></div><div class="mt-5 border-y-2 border-base-content/20 py-4"><p class="font-bold">为什么社区内容需要明确的不可变边界？</p><p class="mt-1 text-sm opacity-60">来源：帖子详情 · 评论区</p></div>`, footer: `<div class="flex justify-end gap-2">${U.button("取消", { href: "#/posts/immutable-content" })}${U.button("继续收藏", { action: "resume-bookmark", kind: "primary" })}</div>` })}</div>`;
  }

  function reportDetailPage(id) {
    return U.breadcrumb([{ label: "我的举报", href: "#/me/reports" }, { label: id }]) + `<div class="mt-3">${pageHeader(`举报 ${id}`, "仅显示你需要知道的进度，不公开内部审核信息。")}</div>` + U.panel({ title: "目标摘要", body: `<p class="font-bold">为什么社区内容需要明确的不可变边界？</p><p class="mt-1 text-sm opacity-65">帖子 · 举报原因：骚扰或人身攻击</p>` }) + `<div class="h-5"></div>` + U.panel({ title: "处理进度", body: `<ol class="space-y-5"><li class="flex gap-3"><span class="status status-success mt-1"></span><div><p class="font-bold">已提交</p><p class="text-sm opacity-65">7 月 12 日 16:20 · 已生成提交凭证</p></div></li><li class="flex gap-3"><span class="status status-warning mt-1"></span><div><p class="font-bold">审核中</p><p class="text-sm opacity-65">社区团队正在核对上下文</p></div></li><li class="flex gap-3 opacity-55"><span class="status mt-1"></span><div><p class="font-bold">结果</p><p class="text-sm">处理完成后会在此说明结果类别</p></div></li></ol>`, footer: `<a class="link text-sm" href="#/posts/immutable-content">目标仍公开，查看上下文</a>` });
  }

  function mePage() {
    return pageHeader("我的主页", "管理你的内容、关系和待办。", U.button("查看公开主页", { href: "#/users/linmo" })) + U.panel({ title: "林默", body: `<div class="flex items-center gap-4">${U.avatar("linmo", "w-16", "林默的头像")}<div class="min-w-0"><p class="text-xl font-black">林默 <span class="text-sm font-normal opacity-60">@linmo</span></p><p class="mt-1 opacity-70">在复杂系统里寻找简单边界。</p></div></div><dl class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4"><div><dt class="text-sm opacity-60">帖子</dt><dd class="text-xl font-bold">36</dd></div><div><dt class="text-sm opacity-60">评论</dt><dd class="text-xl font-bold">128</dd></div><div><dt class="text-sm opacity-60">关注</dt><dd class="text-xl font-bold">48</dd></div><div><dt class="text-sm opacity-60">粉丝</dt><dd class="text-xl font-bold">231</dd></div></dl>`, footer: `<div class="flex flex-wrap gap-2">${U.button("编辑资料", { href: "#/settings/profile" })}${U.button("草稿 3", { href: "#/drafts" })}${U.button("通知 6", { href: "#/notifications" })}${U.button("收藏", { href: "#/bookmarks" })}</div>` });
  }

  function changePasswordPage() {
    return U.breadcrumb([{ label: "账户安全", href: "#/settings/security" }, { label: "修改密码" }]) + `<div class="mt-3">${pageHeader("修改密码", "更新成功后可以选择撤销其他设备会话。")}</div>` + U.panel({ title: "设置新密码", body: `${U.field("当前密码", U.input('type="password" autocomplete="current-password" required'))}${U.field("新密码", U.input('type="password" autocomplete="new-password" minlength="8" required'), "至少 8 位，避免与其他网站重复。")}${U.field("确认新密码", U.input('type="password" autocomplete="new-password" minlength="8" required'))}`, footer: U.button("更新密码", { action: "change-password", kind: "primary" }) });
  }

  function appealNewPage() {
    return pageHeader("发起申诉", "说明需要复核的事实，不会改写原始处置记录。") + U.panel({ title: "关联处置", body: `<p class="font-bold">帖子锁定 · 2026 年 7 月 10 日</p><p class="mt-1 opacity-70">原因：讨论偏离节点规则，多次出现人身攻击。</p><a class="link mt-3 inline-block text-sm" href="#/nodes/product">查看适用规则</a>` }) + `<div class="h-5"></div>` + U.panel({ title: "申诉说明", body: `${U.field("申诉理由", U.select([{ label: "请选择" }, { label: "上下文理解有误" }, { label: "处置范围不合适" }, { label: "补充新证据" }, { label: "其他" }], "required"))}${U.field("补充说明", U.textarea('placeholder="说明你希望复核的事实与依据" maxlength="2000" required'))}${U.field("附件", '<input type="file" class="file-input w-full"/>', "请勿上传无关个人信息。")}`, footer: U.button("提交申诉", { action: "submit-appeal", kind: "primary" }) });
  }

  function appealDetailPage(id) {
    return U.breadcrumb([{ label: "我的申诉", href: "#/appeals" }, { label: id }]) + `<div class="mt-3">${pageHeader(`申诉 ${id}`, "状态、决定与补充说明会保留在时间线上。")}</div>` + U.panel({ title: "当前状态", body: `${U.alert("申诉正在由另一位治理人员复核。预计 3 个工作日内更新。", "info")}<ol class="mt-5 space-y-4"><li><p class="font-bold">已提交申诉</p><p class="text-sm opacity-60">7 月 10 日 18:42</p></li><li><p class="font-bold">进入复核</p><p class="text-sm opacity-60">7 月 11 日 09:10</p></li></ol>`, footer: U.button("补充说明", { action: "appeal-note" }) });
  }

  function moderationAppealsPage() {
    return pageHeader("申诉处理", "独立复核处置依据，并将决定写入审计日志。") + U.panel({ title: "申诉队列", action: U.select([{ label: "待处理" }, { label: "已处理" }, { label: "全部" }], 'aria-label="申诉筛选"'), body: U.list([U.listRow(`<div class="min-w-0 flex-1"><a class="font-bold hover:underline" href="#/appeals/AP-2026-0041">AP-2026-0041 · 帖子锁定</a><p class="text-sm opacity-65">新证据 · 等待 18 小时</p></div>${U.badge("待复核", "warning")}`), U.listRow(`<div class="min-w-0 flex-1"><a class="font-bold hover:underline" href="#/appeals/AP-2026-0039">AP-2026-0039 · 用户限流</a><p class="text-sm opacity-65">处置范围 · 等待 1 天</p></div>${U.badge("审核中", "info")}`)], { framed: false }), bodyClass: "p-0", footer: U.pagination() });
  }

  function coinPage() {
    const earnRows = [
      ["内容质量阶梯", "不同可信账户确认达到 3 / 8 / 20 人", "+4 / +6 / +10", "单内容累计最多 20；72 小时待结算"],
      ["社区照护津贴", "被授权的节点照护批次经另一角色质检", "+20", "每周最多 40；不按处置数量计酬"],
      ["感谢与悬赏收入", "来自其他用户已有金币，不增加总发行量", "+1 或 80%", "感谢作者得 1；悬赏采纳按 80/20 结算"]
    ].map(item => U.listRow(`<div class="list-col-grow min-w-0"><p class="font-bold">${item[0]}</p><p class="mt-1 text-sm opacity-65">${item[1]}</p><p class="mt-2 text-xs opacity-55">${item[3]}</p></div>${U.badge(item[2], "success")}`));
    const recent = coinLedger.slice(0, 4).map(tx => U.listRow(`<div class="list-col-grow min-w-0"><p class="font-bold">${tx.type}</p><p class="mt-1 text-sm opacity-65">${tx.detail}</p><p class="mt-2 text-xs opacity-55">${tx.time} · ${tx.id}</p></div><div class="text-right"><p class="font-bold ${tx.amount.startsWith("+") ? "text-success" : ""}">${tx.amount}</p>${U.badge(tx.status, tx.status === "待结算" ? "warning" : "default")}</div>`));
    return pageHeader("金币中心", "用可审计的社区金币确认真实贡献，而不是购买影响力。", U.button("查看透明账本", { href: "#/coins/ledger" })) + `<div class="mb-5 border-b-2 border-base-content/20">${coinTabs("wallet")}</div>` + U.alert("金币不可付费购买、不可提现、不可自由转账，也不能换取治理票权或内容曝光。", "info") + `<div class="h-5"></div>${U.summary([{ title: "可用", value: "286", desc: "可感谢、悬赏或兑换纯装饰" }, { title: "待结算", value: "10", desc: "72 小时质量观察期" }, { title: "托管", value: "50", desc: "开放悬赏中" }, { title: "风控保留", value: "5", desc: "预计 72 小时内复核" }])}<div class="h-5"></div>${U.panel({ title: "本周个人系统奖励", body: `${U.progress(42, 60, "已使用额度")}<p class="mt-3 text-sm opacity-65">额度限制系统新增发行，不限制你继续帮助社区。预算用尽后不会透支或暗示继续刷行为。</p>` })}<div class="h-5"></div>${U.panel({ title: "金币来源", body: U.list(earnRows, { framed: false }), bodyClass: "p-0" })}<div class="h-5"></div>${U.panel({ title: "最近变动", action: `<a class="link text-sm" href="#/coins/ledger">全部记录</a>`, body: U.list(recent, { framed: false }), bodyClass: "p-0" })}`;
  }

  function coinLedgerPage() {
    const rows = coinLedger.map(tx => [U.esc(tx.time), `<span class="font-mono text-xs">${tx.id}</span>`, U.esc(tx.type), U.esc(tx.detail), `<strong class="${tx.amount.startsWith("+") ? "text-success" : ""}">${tx.amount}</strong>`, U.badge(tx.status, tx.status === "待结算" ? "warning" : "default")]);
    return pageHeader("透明账本", "每一枚金币都能追溯到来源、去向和结算状态。") + `<div class="mb-5 border-b-2 border-base-content/20">${coinTabs("ledger")}</div>` + U.panel({ title: "筛选记录", body: `<div class="grid gap-3 sm:grid-cols-3">${U.select([{ label: "全部类型" }, { label: "获得" }, { label: "使用" }, { label: "保留/冲正" }], 'aria-label="交易类型"')}${U.select([{ label: "全部状态" }, { label: "已入账" }, { label: "待结算" }, { label: "已冲正" }], 'aria-label="结算状态"')}${U.input('type="search" placeholder="搜索流水号" aria-label="搜索流水号"')}</div>` }) + `<div class="h-5"></div>${U.table(["时间", "流水号", "类型", "说明", "变动", "状态"], rows)}<div class="mt-5">${U.alert("账本只显示本人可见明细；公共经济面板只公开汇总，不暴露个人贡献或风控信息。", "info")}</div>`;
  }

  function coinBountiesPage() {
    const items = [
      { id: "BT-2041", title: "如何验证一条无障碍建议来自一手标准？", node: "前端开发", amount: 50, status: "等待回答", expires: "剩余 11 天" },
      { id: "BT-1998", title: "小型社区如何定义有效首响？", node: "社区运营", amount: 20, status: "已有 3 个回答", expires: "24 小时后可采纳" },
      { id: "BT-1872", title: "发帖前确认如何减少不可逆误操作？", node: "产品设计", amount: 100, status: "已结算", expires: "答主 80 · 销毁 20" }
    ];
    const rows = items.map(item => U.listRow(`<div class="list-col-grow min-w-0"><div class="flex flex-wrap items-center gap-2">${U.badge(item.node)}${U.badge(item.status, item.status === "已结算" ? "success" : "warning")}</div><a class="mt-2 block font-bold hover:underline" href="#/coins/bounties/${item.id}">${item.title}</a><p class="mt-2 text-sm opacity-65">${item.id} · ${item.expires}</p></div><div class="text-right"><p class="text-xl font-black">${item.amount}</p><p class="text-xs opacity-60">托管金币</p></div>`));
    return pageHeader("问题悬赏", "用已有金币为真实问题设置固定档位悬赏。", U.button("创建悬赏", { action: "create-bounty", kind: "primary" })) + `<div class="mb-5 border-b-2 border-base-content/20">${coinTabs("bounties")}</div>` + U.alert("悬赏只能选择 20 / 50 / 100；发布 24 小时后才能采纳，采纳时答主获得 80%，20% 销毁。", "info") + `<div class="h-5"></div>${U.list(rows)}`;
  }

  function coinRulesPage() {
    const sources = [["邮箱验证启动金", "30", "终身一次", "基础风控通过后发放"], ["内容质量阶梯", "4 / 6 / 10", "单内容累计 20", "3 / 8 / 20 个可信账户确认"], ["社区照护津贴", "20 / 批", "40 / 周", "另一角色质检，不按处置数量"], ["感谢与悬赏", "1 或 80%", "非系统发行", "来自其他用户已有余额"]];
    const sinks = [["金币感谢", "固定成本 2", "作者获得 1，系统销毁 1"], ["问题悬赏", "20 / 50 / 100", "采纳答主 80%，系统销毁 20%"], ["纯装饰兑换", "固定目录价", "100% 销毁；无功能优势、不可转售"], ["风控冲正", "按原额", "等额反向分录，不改写历史"]];
    return pageHeader("金币经济规则", "发行有预算、流通有摩擦、沉淀有去向、异常可冲正。") + `<div class="mb-5 border-b-2 border-base-content/20">${coinTabs("rules")}</div>` + U.alert("金币是站内不可兑换的社区记账单位，不构成资产、存款、证券、工资或任何兑付承诺。", "warning") + `<div class="h-5"></div>${U.panel({ title: "发行来源", body: U.table(["来源", "建议值", "个人上限", "验证方式"], sources.map(row => row.map(U.esc))) })}<div class="h-5"></div>${U.panel({ title: "使用与沉淀", body: U.table(["用途", "范围", "经济处理"], sinks.map(row => row.map(U.esc))) })}<div class="h-5"></div>${U.panel({ title: "四道经济控制", body: U.steps([{ label: "周预算封顶", active: true, icon: "1" }, { label: "72 小时待结算", active: true, icon: "2" }, { label: "串谋检测", active: true, icon: "3" }, { label: "月度再平衡", active: true, icon: "4" }]), footer: `<p class="text-sm opacity-65">稳定期目标是 28 日净增长率保持在 0–2%；连续两期超过 2% 时先下调发行预算，不通过提高价格掩盖问题。</p>` })}`;
  }

  function coinBountyDetailPage(id) {
    return U.breadcrumb([{ label: "问题悬赏", href: "#/coins/bounties" }, { label: id }]) + `<div class="mt-3">${pageHeader(`悬赏 ${id}`, "开放中 · 50 金币托管 · 11 天后到期")}</div>` + U.panel({ title: "关联问题", body: `<a class="text-lg font-bold hover:underline" href="#/posts/accessible-ui">如何验证一条无障碍建议来自一手标准？</a><p class="mt-2 opacity-65">前端开发 · 发布 3 天 · 5 个公开回答</p>` }) + `<div class="h-5"></div>${U.panel({ title: "资金与时间线", body: `${U.summary([{ title: "托管", value: "50", desc: "来自发布者可用余额" }, { title: "采纳给答主", value: "40", desc: "80%" }, { title: "系统销毁", value: "10", desc: "20%" }])}<div class="mt-5">${U.timeline([{ title: "悬赏创建", desc: "7 月 10 日 · journal J-77120", done: true }, { title: "最早采纳时间已到", desc: "7 月 11 日 · 已满足 24 小时", done: true }, { title: "等待采纳或到期", desc: "最晚 7 月 24 日自动处理", done: false }])}</div>`, footer: `<div class="flex flex-wrap justify-end gap-2">${U.button("申请复核", { action: "coin-dispute" })}${U.button("采纳回答", { action: "accept-bounty", kind: "primary" })}</div>` })}`;
  }

  function coinEconomyPage() {
    return pageHeader("金币经济透明度", "仅公开汇总供给和系统健康，不公开个人余额与风控阈值。") + U.summary([{ title: "28 日流通量", value: "184,260", desc: "期初 182,040" }, { title: "系统发行", value: "8,420", desc: "含合格启动金" }, { title: "销毁", value: "6,200", desc: "感谢与悬赏" }, { title: "净增长率", value: "1.22%", desc: "目标 0–2%" }]) + `<div class="h-5"></div>${U.panel({ title: "28 日变动", body: U.table(["项目", "本期", "上期", "控制线"], [["验证活跃钱包", "5,218", "5,064", "—"], ["发行 / 销毁", "1.36", "1.28", "≤ 1.50"], ["Top 1% 持有", "18.4%", "18.1%", "< 25%"], ["借贷差异", "0", "0", "必须为 0"]]) })}<div class="h-5"></div>${U.alert("规则版本 v1.0.0 · 生效于 2026-07-01。任何数值调整至少提前 7 日公示。", "info")}`;
  }

  function coinSettingsPage() {
    return pageHeader("金币设置", "管理通知、公开贡献记录和高风险操作保护。") + U.panel({ title: "偏好", body: `<div class="space-y-5"><label class="flex min-h-11 items-center justify-between gap-4"><span><strong>奖励与结算通知</strong><small class="block opacity-65">待结算、入账、冲正和预算状态</small></span><input class="toggle" type="checkbox" checked/></label><label class="flex min-h-11 items-center justify-between gap-4"><span><strong>公开贡献记录</strong><small class="block opacity-65">只展示贡献类型，不显示余额和财富排名</small></span><input class="toggle" type="checkbox"/></label><label class="flex min-h-11 items-center justify-between gap-4"><span><strong>金币消费二次验证</strong><small class="block opacity-65">悬赏和高风险设备始终需要确认</small></span><input class="toggle" type="checkbox" checked/></label></div>`, footer: U.button("保存金币设置", { action: "save-coin-settings", kind: "primary" }) });
  }

  function coinModerationPage() {
    return pageHeader("金币风险案件", "治理人员只能调查并提出建议，不能直接修改余额。") + U.alert("释放、追回或人工调整必须交由独立审批人执行；历史分录不可编辑或删除。", "warning") + `<div class="h-5"></div>${U.table(["案件", "类型", "涉及金额", "SLA", "状态"], [[`<a class="link" href="#/moderation/coins/cases/CC-041">CC-041</a>`, "环形互赠", "84", "剩余 18 小时", U.badge("调查中", "warning")], [`<a class="link" href="#/moderation/coins/cases/CC-039">CC-039</a>`, "悬赏强关联", "100", "剩余 31 小时", U.badge("待分派")], [`<a class="link" href="#/moderation/coins/cases/CC-035">CC-035</a>`, "账户接管", "50", "已完成", U.badge("已释放", "success")]])}`;
  }

  function coinModerationDetailPage(id) {
    return U.breadcrumb([{ label: "金币风险案件", href: "#/moderation/coins" }, { label: id }]) + `<div class="mt-3">${pageHeader(`案件 ${id}`, "环形互赠 · 84 金币已转风控保留")}</div>` + U.panel({ title: "证据摘要", body: `<ul class="list-disc space-y-2 pl-5"><li>4 个账户在 18 分钟内形成闭环感谢。</li><li>相关内容的公开语义相似度异常高。</li><li>设备与网络风险存在强关联；具体阈值不对用户公开。</li></ul>` }) + `<div class="h-5"></div>${U.panel({ title: "相关分录", body: U.table(["journal", "时间", "借方", "贷方", "金额"], [["J-8842", "14:06", "USER_HELD:A", "USER_AVAILABLE:A", "24"], ["J-8843", "14:07", "USER_HELD:B", "USER_AVAILABLE:B", "20"], ["J-8844", "14:08", "USER_HELD:C", "USER_AVAILABLE:C", "40"]]), footer: `<div class="flex justify-end gap-2">${U.button("建议释放", { action: "recommend-release" })}${U.button("建议追回", { action: "recommend-recovery", kind: "primary" })}</div>` })}`;
  }

  function coinControlPage() {
    return pageHeader("金币控制台", "Controller 管理预算与规则版本；任何变更都需要独立审批。") + U.summary([{ title: "本期系统预算", value: "62,000", desc: "已使用 71%" }, { title: "待结算", value: "8,420", desc: "72 小时观察期" }, { title: "人工调整", value: "0.04%", desc: "控制线 < 0.10%" }, { title: "规则版本", value: "v1.0.0", desc: "下次复核 7 月 31 日" }]) + `<div class="h-5"></div>${U.panel({ title: "变更申请", body: `${U.field("变更类型", U.select([{ label: "预算上限" }, { label: "奖励参数" }, { label: "沉淀参数" }, { label: "紧急停止" }]))}${U.field("依据与预测影响", U.textarea('placeholder="说明旧值、新值、供给预测和停止条件"'))}`, footer: U.button("提交独立审批", { action: "submit-coin-control", kind: "primary" }) })}<div class="h-5"></div>${U.panel({ title: "待审批人工调整", body: U.list([U.listRow(`<div class="list-col-grow"><a class="font-bold hover:underline" href="#/admin/coins/adjustments/ADJ-1042">ADJ-1042 · 平台事故补偿</a><p class="mt-1 text-sm opacity-65">10 金币 · 发起人 Controller D-04</p></div>${U.badge("等待独立审批", "warning")}`)], { framed: false }), bodyClass: "p-0" })}`;
  }

  function coinReconciliationPage() {
    return pageHeader("金币对账与关账", "每日三方核对钱包快照、业务对象和不可变子账。") + U.alert("发现非零借贷差或负可用余额时，立即停止金币写入；核心社区功能继续可用。", "warning") + `<div class="h-5"></div>${U.table(["核对项目", "账面", "支持明细", "差异", "状态"], [["用户四类余额", "184,260", "184,260", "0", U.badge("已核对", "success")], ["累计发行 - 销毁", "184,260", "184,260", "0", U.badge("已核对", "success")], ["开放悬赏托管", "12,840", "12,840", "0", U.badge("已核对", "success")], ["风控保留", "1,142", "1,142", "0", U.badge("待复核", "warning")]])}<div class="mt-5">${U.panel({ title: "7 月关账", body: U.steps([{ label: "冻结快照", active: true }, { label: "调节完成", active: true }, { label: "Controller 复核", active: true }, { label: "独立批准", active: false }]), footer: U.button("提交关账审批", { action: "close-coin-period", kind: "primary" }) })}</div>`;
  }

  function coinAdjustmentPage(id) {
    return U.breadcrumb([{ label: "金币控制台", href: "#/admin/coins/control" }, { label: `调整单 ${id}` }]) + `<div class="mt-3">${pageHeader(`人工调整 ${id}`, "平台事故补偿 · 等待独立审批")}</div>` + U.panel({ title: "调整依据", body: `<dl class="grid gap-3 sm:grid-cols-2"><div><dt class="opacity-60">关联事故</dt><dd class="font-bold">INC-2026-0711</dd></div><div><dt class="opacity-60">影响期</dt><dd class="font-bold">2026-07</dd></div><div><dt class="opacity-60">发起人</dt><dd class="font-bold">Controller D-04</dd></div><div><dt class="opacity-60">审批人</dt><dd class="font-bold">待指派（不可同人）</dd></div></dl>` }) + `<div class="h-5"></div>${U.panel({ title: "拟议双重分录", body: U.table(["方向", "科目", "金额"], [["借", "USER_AVAILABLE:U-1042", "10"], ["贷", "SYSTEM_RECOVERY:INC-2026-0711", "10"]]), footer: `<div class="flex justify-end gap-2">${U.button("退回补充", { action: "return-adjustment" })}${U.button("批准并执行", { action: "approve-adjustment", kind: "primary" })}</div>` })}`;
  }

  const questRow = quest => U.listRow(`<div class="list-col-grow min-w-0"><div class="flex flex-wrap items-center gap-2">${U.badge(quest.node)}<span class="text-xs opacity-60">${quest.time}</span></div><a class="mt-2 block font-bold hover:underline" href="#/quests/${quest.id}">${quest.title}</a><p class="mt-1 text-sm opacity-65">${quest.desc}</p><div class="mt-3">${U.progress(quest.progress, quest.max, "当前进度")}</div></div><div class="text-right">${U.badge(quest.reward, "success")}<p class="mt-2 text-xs opacity-60">${quest.status}</p></div>`);

  function playPage() {
    return pageHeader("社区旅程", "把阅读、回应和整理变成有边界的社区协作旅程。", U.button("继续当前任务", { href: "#/quests/first-reply", kind: "primary", iconName: "trophy" })) + `<div class="mb-5 border-b-2 border-base-content/20">${playTabs("hub")}</div>` + U.alert("游戏奖励贡献质量，不奖励发帖数量或在线时长；每周最多激活 3 个任务，离线不会损失进度。", "info") + `<div class="h-5"></div>${U.summary([{ title: "本周共建", value: "4 / 7", desc: "覆盖 3 个节点" }, { title: "确认 CXP", value: "68", desc: "另有 12 待确认" }, { title: "贡献角色", value: "回应者", desc: "下一级：整理者" }])}<div class="h-5"></div>${U.panel({ title: "当前旅程", body: U.steps([{ label: "发现问题", active: true }, { label: "提供回应", active: true }, { label: "获得确认", active: false }, { label: "沉淀成果", active: false }]), footer: `<p class="text-sm opacity-65">每一步都对应真实社区对象；任务完成不会自动发布任何内容。</p>` })}<div class="h-5"></div>${U.panel({ title: "推荐任务", action: `<a class="link text-sm" href="#/quests">完整任务板</a>`, body: U.list(quests.slice(0, 2).map(questRow), { framed: false }), bodyClass: "p-0" })}`;
  }

  function questsPage() {
    return pageHeader("共建任务板", "选择能真正帮助某个节点的任务，而不是追求任务数量。") + `<div class="mb-5 border-b-2 border-base-content/20">${playTabs("quests")}</div>` + U.panel({ title: "筛选任务", body: `<div class="grid gap-3 sm:grid-cols-3">${U.select([{ label: "全部节点" }, ...nodes.map(node => ({ label: node.name }))], 'aria-label="筛选节点"')}${U.select([{ label: "全部类型" }, { label: "回应" }, { label: "资料" }, { label: "整理" }, { label: "守望" }], 'aria-label="筛选任务类型"')}${U.select([{ label: "适合我" }, { label: "用时最短" }, { label: "即将结束" }], 'aria-label="任务排序"')}</div>` }) + `<div class="h-5"></div>${U.list(quests.map(questRow))}`;
  }

  function questDetailPage(id) {
    const quest = quests.find(item => item.id === id) || quests[0];
    return U.breadcrumb([{ label: "社区旅程", href: "#/journey" }, { label: "任务板", href: "#/quests" }, { label: quest.title }]) + `<div class="mt-3">${pageHeader(quest.title, `${quest.node} · ${quest.time} · 完成后 ${quest.reward}`)}</div>` + U.panel({ title: "为什么做", body: `<p class="leading-relaxed">${quest.desc}</p><div class="mt-4">${U.alert("只提交你愿意公开保留的内容。评论提交后不能编辑或删除，任务完成也不会改变这一规则。", "warning")}</div>` }) + `<div class="h-5"></div>${U.panel({ title: "验收路径", body: U.steps([{ label: "阅读节点规则", active: true }, { label: "选择真实主题", active: true }, { label: "提交贡献", active: false }, { label: "质量确认", active: false }]) })}<div class="h-5"></div>${U.panel({ title: "任务清单", body: `<label class="label min-h-11 justify-start gap-3"><input type="checkbox" class="checkbox" checked/><span>已阅读 ${quest.node} 节点规则</span></label><label class="label min-h-11 justify-start gap-3"><input type="checkbox" class="checkbox"/><span>选择一个仍需要帮助的真实主题</span></label><label class="label min-h-11 justify-start gap-3"><input type="checkbox" class="checkbox"/><span>完成贡献并主动提交验收</span></label>`, footer: `<div class="flex flex-wrap justify-end gap-2">${U.button("暂时退出", { href: "#/quests" })}${U.button(quest.progress ? "继续任务" : "开始任务", { action: "start-quest", kind: "primary" })}</div>` })}`;
  }

  function journeyPage() {
    const journey = [{ title: "发现者", desc: "理解节点与标签，完成 3 次有目的的阅读", done: true }, { title: "回应者", desc: "完成 5 次被确认的有效回应", done: true }, { title: "整理者", desc: "归纳 2 段分散讨论；当前 1 / 2", done: false }, { title: "守望者", desc: "协助发现风险并给出规则引导", done: false }];
    return pageHeader("成长路径", "记录你如何帮助社区，而不是制造等级压力。") + `<div class="mb-5 border-b-2 border-base-content/20">${playTabs("journey")}</div>` + U.panel({ title: "贡献路径", body: U.timeline(journey) }) + `<div class="h-5"></div>${U.panel({ title: "本周共建记录", body: `<p class="leading-relaxed">你在 3 个不同节点完成了 4 次真实贡献，其中 3 次帮助讨论获得后续回应。周记录只展示贡献类型与社区影响，不公开金币余额或排行榜。</p>`, footer: U.button("查看对应贡献", { href: "#/users/linmo/comments" }) })}`;
  }

  function teamsPage() {
    const teams = [{ node: "产品设计", title: "新人问题首响小队", members: "6 / 8 人", goal: "本周帮助 12 个无人回应的新主题", progress: 7, max: 12 }, { node: "前端开发", title: "无障碍资料整理局", members: "8 / 10 人", goal: "完成公开资料索引第一版", progress: 16, max: 24 }, { node: "社区运营", title: "案例归档协作局", members: "4 / 6 人", goal: "整理 5 个真实冷启动案例", progress: 3, max: 5 }];
    const rows = teams.map((team, i) => U.listRow(`<div class="list-col-grow min-w-0"><div class="flex flex-wrap items-center gap-2">${U.badge(team.node)}<span class="text-xs opacity-60">${team.members}</span></div><p class="mt-2 font-bold">${team.title}</p><p class="mt-1 text-sm opacity-65">${team.goal}</p><div class="mt-3">${U.progress(team.progress, team.max, "团队进度")}</div></div>${U.button(i === 0 ? "已加入" : "申请加入", { action: i === 0 ? "view-team" : "join-team", size: "sm", kind: i === 0 ? "soft" : "default" })}`));
    return pageHeader("节点协作", "小队围绕公开成果协作，不建立私聊、权力等级或无限排行。") + `<div class="mb-5 border-b-2 border-base-content/20">${playTabs("teams")}</div>` + U.alert("协作任务、验收规则和进度全部公开；成员可随时退出，不会失去已完成的个人贡献记录。", "info") + `<div class="h-5"></div>${U.list(rows)}`;
  }

  function journeyOnboardingPage() {
    return pageHeader("开启社区旅程", "先选择愿意帮助的方式，再由你决定何时开始。") + U.alert("旅程完全可选。跳过、暂停或休息都不会影响发帖、评论、金币余额或已有贡献记录。", "info") + `<div class="h-5"></div>${U.panel({ title: "选择贡献偏好", body: `<div class="grid gap-3 sm:grid-cols-2"><label class="flex min-h-24 cursor-pointer gap-3 rounded-box border-2 border-base-content/20 p-4"><input class="checkbox checkbox-primary mt-1" type="checkbox" checked/><span><strong>回应具体问题</strong><small class="mt-1 block opacity-65">帮助尚未得到有效首响的真实主题</small></span></label><label class="flex min-h-24 cursor-pointer gap-3 rounded-box border-2 border-base-content/20 p-4"><input class="checkbox checkbox-primary mt-1" type="checkbox"/><span><strong>整理公开资料</strong><small class="mt-1 block opacity-65">将分散讨论沉淀成可复用索引</small></span></label><label class="flex min-h-24 cursor-pointer gap-3 rounded-box border-2 border-base-content/20 p-4"><input class="checkbox checkbox-primary mt-1" type="checkbox"/><span><strong>照护讨论秩序</strong><small class="mt-1 block opacity-65">提醒规则、报告风险，不以处置数量计酬</small></span></label><label class="flex min-h-24 cursor-pointer gap-3 rounded-box border-2 border-base-content/20 p-4"><input class="checkbox checkbox-primary mt-1" type="checkbox" checked/><span><strong>每周轻量参与</strong><small class="mt-1 block opacity-65">最多 3 个激活任务，不设连续签到</small></span></label></div>`, footer: `<div class="flex flex-wrap justify-end gap-2">${U.button("暂时跳过", { href: "#/feed" })}${U.button("保存并查看任务", { action: "finish-onboarding", kind: "primary" })}</div>` })}`;
  }

  function contributionsPage() {
    const rows = [
      ["有效首响", "前端开发", "帮助提问者补齐复现条件", "质量已确认", "7 月 12 日"],
      ["讨论整理", "产品设计", "把 9 条评论归纳为 3 个决策点", "待确认", "7 月 11 日"],
      ["规则引导", "社区运营", "为新成员指出节点边界", "质量已确认", "7 月 9 日"]
    ].map(([type, node, impact, status, date]) => U.listRow(`<div class="list-col-grow min-w-0"><div class="flex flex-wrap items-center gap-2">${U.badge(type)}${U.badge(node, "info")}</div><p class="mt-2 font-bold">${impact}</p><p class="mt-1 text-sm opacity-60">${date} · ${status}</p></div><a class="btn btn-sm" href="#/posts/immutable-content">查看来源</a>`));
    return pageHeader("我的贡献", "从真实社区对象回看你产生的影响，不展示财富或名次。") + U.summary([{ title: "已确认贡献", value: "18", desc: "永久记录" }, { title: "覆盖节点", value: "4", desc: "最近 90 天" }, { title: "待质量确认", value: "2", desc: "不计入已确认 CXP" }]) + `<div class="h-5"></div>${U.list(rows)}`;
  }

  function collectionPage() {
    const rows = [
      ["回应者 · 路径印记", "完成 5 次经质量确认的有效回应", "2026-06-18"],
      ["开放资料索引 · 共建纪念", "参与前端开发节点公开资料第一期", "2026-07-01"],
      ["友善首响 · 展示徽记", "由被帮助者确认 3 次有效首响", "2026-07-08"]
    ].map(([name, desc, date]) => U.listRow(`<div class="flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-base-content/20">${U.icon("spark")}</div><div class="list-col-grow min-w-0"><p class="font-bold">${name}</p><p class="mt-1 text-sm opacity-65">${desc}</p><p class="mt-2 text-xs opacity-55">获得于 ${date}</p></div>${U.button("展示设置", { action: "collection-display", size: "sm" })}`));
    return pageHeader("贡献收藏", "收藏是个人历程的纪念，不提供功能优势，也不能交易。") + U.alert("所有收藏均可隐藏；隐藏不会撤销贡献记录，展示也不会影响内容排序或治理权。", "info") + `<div class="h-5"></div>${U.list(rows)}`;
  }

  function seasonsPage() {
    const rows = [
      ["2026 夏 · 让新人得到第一条好回应", "跨节点公共共建", 68, 100, "进行中 · 还可参与 19 天", "summer-first-reply"],
      ["2026 春 · 公开资料可发现性", "前端开发 × 产品设计", 100, 100, "成果已归档", "spring-discovery"]
    ].map(([title, scope, value, max, status, slug]) => U.listRow(`<div class="list-col-grow min-w-0"><p class="text-sm opacity-60">${scope}</p><a class="mt-1 block font-bold hover:underline" href="#/seasons/${slug}">${title}</a><p class="mt-1 text-sm opacity-65">${status}</p><div class="mt-3">${U.progress(value, max, "公共成果进度")}</div></div>${U.icon("arrow")}`));
    return pageHeader("社区共建季", "围绕一个公开、可验收的社区问题协作，不比较个人排名。") + U.alert("季节结束只停止新增任务，不会清空个人进度、CXP、金币或已获得收藏。", "info") + `<div class="h-5"></div>${U.list(rows)}`;
  }

  function seasonDetailPage(slug) {
    const past = slug === "spring-discovery";
    return U.breadcrumb([{ label: "社区共建季", href: "#/seasons" }, { label: past ? "2026 春" : "2026 夏" }]) + `<div class="mt-3">${pageHeader(past ? "公开资料可发现性" : "让新人得到第一条好回应", past ? "已完成 · 成果公开归档" : "进行中 · 跨节点公共共建")}</div>` + U.panel({ title: "公共目标", body: `<p class="leading-relaxed">${past ? "将高频问题、标准链接与讨论结论整理为公开索引，并让节点入口可以反向抵达这些成果。" : "让发布 24 小时仍无有效回应的新主题，在不制造灌水的前提下获得一条有上下文、有下一步的首响。"}</p><div class="mt-5">${U.progress(past ? 100 : 68, 100, "公共成果进度")}</div>`, footer: `<p class="text-sm opacity-65">验收由节点维护者与随机贡献者共同完成；成员数和个人得分不参与排序。</p>` }) + `<div class="h-5"></div>${U.panel({ title: "如何参与", body: U.steps([{ label: "选择真实主题", active: true }, { label: "完成公开贡献", active: true }, { label: "同行质量确认", active: past }, { label: "成果归档", active: past }]), footer: past ? U.button("查看归档成果", { href: "#/nodes/frontend/project" }) : U.button("查看可做任务", { href: "#/quests", kind: "primary" }) })}`;
  }

  function nodeProjectPage(slug) {
    const node = nodeFromSlug(slug) || nodes[0];
    return U.breadcrumb([{ label: "节点", href: "#/nodes" }, { label: node.name, href: `#/nodes/${node.slug}` }, { label: "公开共建" }]) + `<div class="mt-3">${pageHeader(`${node.name} · 公开共建`, "任务、验收规则、贡献者和最终成果都可追溯。", U.button("申请加入", { action: "join-team", kind: "primary" }))}</div>` + U.alert("加入只订阅协作进度，不创建私聊、身份等级或永久义务；可随时退出。", "info") + `<div class="h-5"></div>${U.summary([{ title: "公共目标", value: "24 条", desc: "可信资料索引" }, { title: "已验收", value: "16 条", desc: "由两类角色确认" }, { title: "开放任务", value: "5", desc: "最多同时领取 1 个" }])}<div class="h-5"></div>${U.panel({ title: "公开任务", body: U.list(quests.slice(0, 2).map(questRow), { framed: false }), bodyClass: "p-0", footer: `<a class="link text-sm" href="#/me/contributions">查看我的贡献记录</a>` })}`;
  }

  function journeySettingsPage() {
    return pageHeader("旅程与休息设置", "控制提醒频率、可见性和暂停状态，核心社区功能不受影响。") + U.panel({ title: "健康参与", body: `<div class="space-y-5"><label class="flex min-h-11 items-center justify-between gap-4"><span><strong>每周旅程摘要</strong><small class="block opacity-65">只在有真实进展时发送一次</small></span><input class="toggle" type="checkbox" checked/></label><label class="flex min-h-11 items-center justify-between gap-4"><span><strong>任务推荐</strong><small class="block opacity-65">最多保留 3 个激活任务，可随时替换</small></span><input class="toggle" type="checkbox" checked/></label><label class="flex min-h-11 items-center justify-between gap-4"><span><strong>公开展示路径印记</strong><small class="block opacity-65">隐藏不影响贡献记录和 CXP</small></span><input class="toggle" type="checkbox"/></label><label class="flex min-h-11 items-center justify-between gap-4"><span><strong>暂停旅程</strong><small class="block opacity-65">停止任务与旅程通知，不清空任何进度</small></span><input class="toggle toggle-warning" type="checkbox"/></label></div>`, footer: U.button("保存旅程设置", { action: "save-journey-settings", kind: "primary" }) }) + `<div class="mt-5">${U.alert("需要彻底隐藏游戏层？开启暂停后，共建入口仍可在设置中恢复，Feed、节点、发帖和评论保持可用。", "info")}</div>`;
  }

  function journeyStatesPage() {
    return pageHeader("旅程状态样例", "用于验证空、暂停、待确认与完成状态。") + `<div class="space-y-5">${U.panel({ title: "尚未开启", body: `<p>旅程是可选体验。你可以先正常浏览社区。</p>`, footer: U.button("了解旅程", { href: "#/journey/onboarding" }) })}${U.panel({ title: "休息中", body: U.alert("旅程已暂停。任务和提醒停止，已有进度完整保留。", "info"), footer: U.button("管理休息设置", { href: "#/settings/journey" }) })}${U.panel({ title: "等待质量确认", body: `<p>贡献已关联真实评论，正在等待同行确认。未确认前不计入 CXP，也不会触发金币候选事件。</p>` })}${U.panel({ title: "本周回顾已生成", body: `<p>你帮助 2 个主题获得了后续回应，并整理了 1 个公开资料条目。</p>`, footer: U.button("查看贡献来源", { href: "#/me/contributions", kind: "primary" }) })}</div>`;
  }

  function statesPage() {
    return pageHeader("界面状态验收", "用于开发交接的完整状态样例，不进入产品主导航。") + `<div class="space-y-5">${U.panel({ title: "Loading", body: U.skeleton() })}${U.panel({ title: "Empty", body: `<p>还没有收藏的帖子。</p>`, footer: U.button("浏览最新帖子", { href: "#/feed", kind: "primary" }) })}${U.panel({ title: "Partial", body: U.alert("帖子已加载，但作者摘要暂时不可用。", "warning") })}${U.panel({ title: "Error", body: U.alert("加载失败，请检查网络后重试。Request ID: x2p-demo-01", "error"), footer: U.button("重试", { action: "retry" }) })}${U.panel({ title: "Unauthorized / Forbidden / Not Found", body: `<div class="space-y-3">${U.alert("登录后继续，当前输入和来源会保留。", "info")}${U.alert("你没有执行此操作的权限。", "warning")}${U.alert("内容不存在或当前不可见。", "info")}</div>` })}${U.panel({ title: "Rate Limited / Conflict", body: `<div class="space-y-3">${U.alert("操作过于频繁，请在 42 秒后重试。", "warning")}${U.alert("草稿已在另一设备更新。请比较内容后选择保留版本。", "error")}</div>` })}</div>`;
  }

  function notFoundPage() {
    return U.panel({ title: "页面不存在", body: `<h1 class="text-3xl font-black">404</h1><p class="mt-2 opacity-70">链接可能已失效，或内容因隐私原因不可见。</p>`, footer: U.button("返回首页", { href: "#/feed", kind: "primary" }) });
  }

  const authRoutes = new Set(["/auth/login", "/auth/register", "/auth/verify", "/auth/forgot", "/auth/reset", "/login", "/register", "/verify-email", "/verify-email/result", "/forgot-password", "/reset-password", "/auth/recover-task"]);
  function resolve(route) {
    if (route === "/" || route === "/feed") return feedPage();
    if (route === "/nodes") return nodesPage();
    if (/^\/nodes\/[^/]+\/project$/.test(route)) return nodeProjectPage(route.split("/")[2]);
    if (route.startsWith("/nodes/")) { const parts = route.split("/"); return nodePage(parts[2], parts[3] || ""); }
    if (route.startsWith("/posts/")) return postPage();
    if (route === "/search") return searchPage();
    if (route === "/tags") return tagsPage();
    if (route.startsWith("/tags/")) return tagsPage(decodeURIComponent(route.split("/")[2]));
    if (route.startsWith("/users/") || route.startsWith("/user/")) return userPage(route.split("/")[3] || "profile");
    if (route === "/me") return mePage();
    if (route === "/quick-compose") return quickComposePage();
    if (route === "/compose") return composePage();
    if (route === "/drafts") return draftsPage();
    if (route === "/bookmarks") return simplePostListPage("我的收藏", "保存下来，稍后继续阅读。", posts.slice(0, 2));
    if (route === "/following") return simplePostListPage("关注 Feed", "来自你关注的用户和节点，按时间排序。", posts.slice(1));
    if (route === "/notifications") return notificationsPage();
    if (route === "/coins") return coinPage();
    if (route === "/coins/ledger") return coinLedgerPage();
    if (route === "/coins/rules") return coinRulesPage();
    if (route === "/coins/bounties") return coinBountiesPage();
    if (route.startsWith("/coins/bounties/")) return coinBountyDetailPage(route.split("/")[3]);
    if (route === "/coins/economy") return coinEconomyPage();
    if (route === "/journey") return playPage();
    if (route === "/journey/onboarding") return journeyOnboardingPage();
    if (route === "/journey/states") return journeyStatesPage();
    if (route === "/quests") return questsPage();
    if (route.startsWith("/quests/")) return questDetailPage(route.split("/")[2]);
    if (route === "/me/progress") return journeyPage();
    if (route === "/me/contributions") return contributionsPage();
    if (route === "/me/collection") return collectionPage();
    if (route === "/seasons") return seasonsPage();
    if (route.startsWith("/seasons/")) return seasonDetailPage(route.split("/")[2]);
    if (route === "/play") return playPage();
    if (route === "/play/quests") return questsPage();
    if (route.startsWith("/play/quests/")) return questDetailPage(route.split("/")[3]);
    if (route === "/play/journey") return journeyPage();
    if (route === "/play/teams") return teamsPage();
    if (route === "/settings/blocked" || route === "/blocked") return blockedPage();
    if (route === "/settings/coins") return coinSettingsPage();
    if (route === "/settings/journey") return journeySettingsPage();
    if (route === "/settings/security/password") return changePasswordPage();
    if (route.startsWith("/settings/")) return settingsPage(route.split("/")[2]);
    if (route === "/reports" || route === "/me/reports") return reportsPage();
    if (route.startsWith("/me/reports/")) return reportDetailPage(route.split("/")[3]);
    if (route === "/report/new") return reportFormPage();
    if (route === "/appeals") return appealsPage();
    if (route === "/appeals/new") return appealNewPage();
    if (route.startsWith("/appeals/")) return appealDetailPage(route.split("/")[2]);
    if (route === "/moderation" || route === "/moderation/cases") return moderationPage();
    if (route.startsWith("/moderation/cases/")) return casePage(route.split("/")[3]);
    if (route === "/moderation/appeals") return moderationAppealsPage();
    if (route === "/moderation/coins") return coinModerationPage();
    if (route.startsWith("/moderation/coins/cases/")) return coinModerationDetailPage(route.split("/")[4]);
    if (route === "/moderation/audit" || route === "/moderation/audit-logs") return auditPage();
    if (route === "/admin/coins/control") return coinControlPage();
    if (route === "/admin/coins/reconciliation") return coinReconciliationPage();
    if (route.startsWith("/admin/coins/adjustments/")) return coinAdjustmentPage(route.split("/")[4]);
    if (route === "/403") return forbiddenPage();
    if (route === "/prototype/states") return statesPage();
    if (route === "/verify-email/result") return verifyResultPage();
    if (route === "/auth/recover-task") return authRecoveryPage();
    if (route === "/login" || route === "/auth/login") return authPage("login");
    if (route === "/register" || route === "/auth/register") return authPage("register");
    if (route === "/verify-email" || route === "/auth/verify") return authPage("verify");
    if (route === "/forgot-password" || route === "/auth/forgot") return authPage("forgot");
    if (route === "/reset-password" || route === "/auth/reset") return authPage("reset");
    return notFoundPage();
  }

  function currentRoute() {
    const hash = location.hash.slice(1) || "/feed";
    return hash.split("?")[0].split("#")[0];
  }
  function render() {
    const route = currentRoute();
    const auth = authRoutes.has(route);
    document.title = `${route === "/feed" ? "最新帖子" : "X2Post"} · X2Post`;
    document.querySelector('link[rel="canonical"]').href = `https://x2post.com${route === "/feed" ? "/" : route}`;
    document.querySelector("meta[name=robots]")?.remove();
    if (auth || route.startsWith("/settings") || route.startsWith("/moderation") || route.startsWith("/admin") || route.startsWith("/coins") || route.startsWith("/play") || route.startsWith("/journey") || route.startsWith("/quests") || route === "/quick-compose" || route === "/me/progress" || route === "/me/contributions" || route === "/me/collection" || ["/drafts", "/notifications", "/reports", "/blocked"].includes(route)) {
      const meta = document.createElement("meta"); meta.name = "robots"; meta.content = "noindex,nofollow"; document.head.appendChild(meta);
    }
    document.getElementById("app").innerHTML = shell(resolve(route), route, { auth });
    window.scrollTo(0, 0);
  }

  function toast(message, kind = "success") {
    const region = document.getElementById("toast-region");
    region.innerHTML = `<div class="alert alert-${kind} border-2"><span>${U.esc(message)}</span></div>`;
    setTimeout(() => { region.innerHTML = ""; }, 2800);
  }
  function dialog(html) {
    document.getElementById("dialog-content").innerHTML = html;
    document.getElementById("app-dialog").showModal();
  }

  document.addEventListener("click", e => {
    const close = e.target.closest("[data-close-drawer]");
    if (close) document.getElementById("site-drawer").checked = false;
    const target = e.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;
    if (action.startsWith("reply-starter-")) {
      const editor = document.getElementById("comment-input");
      const starters = { "reply-starter-example": "补充一个我亲自遇到的例子：", "reply-starter-resource": "提供一份可核对的资料（来源 + 我的判断）：", "reply-starter-question": "我想追问一个具体问题：", "reply-starter-disagree": "我的看法不同，依据是：" };
      if (editor) { if (starters[action]) editor.value = editor.value.trim() ? `${editor.value.trim()}\n\n${starters[action]}` : starters[action]; editor.focus(); }
    }
    if (action === "quick-open-node-picker") {
      e.preventDefault();
      const form = document.querySelector('[data-form="quick-compose"]');
      const parent = nodeFromSlug(form?.dataset.node);
      const child = childFromSlug(parent, form?.dataset.subnode);
      const initialParent = parent || nodes[0];
      const primaryOptions = [{ label: "请选择一级节点", value: "", disabled: true, selected: !parent }, ...nodes.map(node => ({ label: node.name, value: node.slug, selected: node.slug === parent?.slug }))];
      const secondaryOptions = [{ label: `${initialParent.name}（综合）`, value: "", selected: !child }, ...initialParent.children.map(node => ({ label: node.name, value: node.slug, selected: node.slug === child?.slug }))];
      dialog(`<h2 class="text-xl font-bold">选择节点</h2><div class="mt-4 grid gap-3 sm:grid-cols-2">${U.field("一级节点", U.select(primaryOptions, 'id="quick-node-primary" aria-label="一级节点" required autofocus'))}${U.field("二级节点", U.select(secondaryOptions, `id="quick-node-secondary" aria-label="二级节点" ${parent ? "" : "disabled"}`))}</div><div class="modal-action"><button class="btn" type="button" onclick="document.getElementById('app-dialog').close()">取消</button><button class="btn btn-primary" type="button" data-action="quick-apply-node">确定</button></div>`);
    }
    if (action === "quick-apply-node") {
      const primary = document.getElementById("quick-node-primary");
      const parent = nodeFromSlug(primary?.value);
      if (!parent) { primary?.reportValidity(); return; }
      const child = childFromSlug(parent, document.getElementById("quick-node-secondary")?.value);
      const form = document.querySelector('[data-form="quick-compose"]');
      form.dataset.node = parent.slug;
      form.dataset.subnode = child?.slug || "";
      document.getElementById("quick-node-value").textContent = `${parent.name}${child ? ` / ${child.name}` : "（综合）"}`;
      document.getElementById("app-dialog").close();
      document.querySelector('[data-action="quick-open-node-picker"]')?.focus();
    }
    if (action === "quick-to-long") {
      e.preventDefault();
      const editor = document.getElementById("quick-content");
      const form = editor?.closest('[data-form="quick-compose"]');
      sessionStorage.setItem("x2post-quick-to-long", editor?.value || "");
      const params = new URLSearchParams({ from: "quick" });
      if (form?.dataset.node) params.set("node", form.dataset.node);
      if (form?.dataset.subnode) params.set("subnode", form.dataset.subnode);
      location.hash = `#/compose?${params}`;
    }
    if (action === "quick-publish") {
      const editor = document.getElementById("quick-content");
      if (!editor?.reportValidity()) return;
      const form = editor.closest('[data-form="quick-compose"]');
      const parent = nodeFromSlug(form?.dataset.node);
      if (!parent) {
        toast("请先选择节点", "info");
        document.querySelector('[data-action="quick-open-node-picker"]')?.focus();
        return;
      }
      const child = childFromSlug(parent, form.dataset.subnode);
      toast(`已发布到 ${parent.name}${child ? ` / ${child.name}` : "（综合）"}`);
      setTimeout(() => location.hash = "#/feed", 450);
    }
    if (action === "toggle-auth") { state.loggedIn = !state.loggedIn; localStorage.setItem("x2post-demo-auth", state.loggedIn ? "in" : "out"); toast(state.loggedIn ? "已切换为登录用户" : "已切换为访客", "info"); render(); }
    if (action === "toggle-follow") { if (!requireLogin()) return; state.following = !state.following; toast(state.following ? "已关注" : "已取消关注"); render(); }
    if (action === "toggle-bookmark") { if (!requireLogin()) return; state.bookmarked = !state.bookmarked; toast(state.bookmarked ? "已加入收藏" : "已取消收藏"); render(); }
    if (action === "toggle-react") { if (!requireLogin()) return; state.reacted = !state.reacted; toast(state.reacted ? "已表达认同" : "已撤销反应"); render(); if (state.reacted) dialog(`<h2 class="text-xl font-bold">已加入聚合信号</h2><p class="mt-2 opacity-70">这个信号可以撤回，不会生成独立内容，也不会获得金币或共建进度。</p><div class="mt-4">${U.alert("补一句你的具体情况，会成为可回复的公开评论；发布前仍需确认。", "info")}</div><div class="modal-action"><button class="btn" type="button" onclick="document.getElementById('app-dialog').close()">只表达认同</button><button class="btn btn-primary" type="button" data-action="signal-add-reason">补一句理由</button></div>`); }
    if (action === "signal-add-reason") { document.getElementById("app-dialog").close(); const editor = document.getElementById("comment-input"); if (editor) { editor.value = "我也有类似感受，具体情况是："; editor.focus(); editor.scrollIntoView({ behavior: "smooth", block: "center" }); } }
    if (action === "open-report") location.hash = "#/report/new";
    if (action === "block-user") dialog(`<h2 class="text-xl font-bold">屏蔽 @linmo？</h2><p class="mt-3 opacity-70">屏蔽后，你们将较少在 Feed、搜索、提及和通知中看到彼此。对方不会收到通知。</p><div class="modal-action"><button class="btn" onclick="document.getElementById('app-dialog').close()">取消</button><button class="btn btn-primary" data-action="confirm-block" onclick="document.getElementById('app-dialog').close()">确认屏蔽</button></div>`);
    if (action === "confirm-block") toast("已屏蔽此用户");
    if (action === "coin-thanks") dialog(`<h2 class="text-xl font-bold">用金币感谢这份贡献？</h2><p class="mt-3 opacity-70">固定成本 2：作者获得 1，另外 1 永久销毁。感谢不会影响排序、曝光或治理权。</p><div class="mt-4">${U.alert("可用余额 286 · 同一内容只能感谢一次 · 每日最多 5 次", "info")}</div><div class="modal-action"><button class="btn" onclick="document.getElementById('app-dialog').close()">取消</button><button class="btn btn-primary" data-action="confirm-coin-thanks" onclick="document.getElementById('app-dialog').close()">确认花费 2</button></div>`);
    if (action === "confirm-coin-thanks") toast("感谢已入账：作者 +1，系统销毁 1");
    if (action === "create-bounty") dialog(`<h2 class="text-xl font-bold">为问题设置悬赏</h2><p class="mt-2 opacity-70">金币进入托管；发布满 24 小时后可采纳，答主获得 80%，20% 销毁。</p><fieldset class="fieldset mt-4"><legend class="fieldset-legend">固定档位</legend><div class="join"><input class="btn join-item" type="radio" name="bounty-amount" aria-label="20" checked/><input class="btn join-item" type="radio" name="bounty-amount" aria-label="50"/><input class="btn join-item" type="radio" name="bounty-amount" aria-label="100"/></div><p class="label">可用余额 286 · 同一帖子只能有一个开放悬赏</p></fieldset><div class="modal-action"><button class="btn" onclick="document.getElementById('app-dialog').close()">取消</button><button class="btn btn-primary" data-action="confirm-bounty" onclick="document.getElementById('app-dialog').close()">确认托管</button></div>`);
    if (action === "confirm-bounty") { toast("悬赏已创建，金币已进入托管"); setTimeout(() => location.hash = "#/coins/bounties", 400); }
    if (action === "accept-bounty") dialog(`<h2 class="text-xl font-bold">采纳这个回答？</h2>${U.alert("50 托管金币将结算：答主获得 40，系统销毁 10。采纳后用户不能自行撤销。", "warning")}<div class="modal-action"><button class="btn" onclick="document.getElementById('app-dialog').close()">返回检查</button><button class="btn btn-primary" data-action="confirm-accept-bounty" onclick="document.getElementById('app-dialog').close()">确认采纳</button></div>`);
    if (action === "confirm-accept-bounty") toast("悬赏已结算：答主 +40，系统销毁 10");
    if (action === "coin-dispute") toast("已打开金币交易申诉流程", "info");
    if (action.startsWith("reply-")) { if (!requireLogin()) return; const id = action; const box = document.getElementById(id); box.classList.toggle("hidden"); box.innerHTML = box.classList.contains("hidden") ? "" : `${U.field("回复内容", U.textarea('placeholder="回复提交后不能编辑或删除"'))}<div class="mt-2 flex justify-end">${U.button("提交回复", { action: "submit-reply", kind: "primary", size: "sm" })}</div>`; }
    if (action === "submit-comment") { if (!requireLogin()) return; const editor = document.getElementById("comment-input"); if (!editor?.value.trim()) { editor?.focus(); toast("先写下一句真实回应", "info"); return; } dialog(`<h2 class="text-xl font-bold">确认发布这条回应</h2><div class="card card-border mt-4"><div class="card-body"><p class="leading-relaxed">${U.esc(editor.value.trim())}</p></div></div><div class="mt-4">${U.alert("评论提交后不能编辑、删除或撤回。请确认这是你要公开留下的完整内容。", "warning")}</div><div class="modal-action"><button class="btn" type="button" onclick="document.getElementById('app-dialog').close()">返回修改</button><button class="btn btn-primary" type="button" data-action="complete-quick-comment">确认发布回应</button></div>`); return; }
    if (action === "complete-quick-comment") { document.getElementById("app-dialog").close(); toast("回应已提交，正在定位到新评论"); }
    if (action === "submit-reply") { if (!requireLogin()) return; toast("已提交，正在定位到新回复"); }
    if (action === "save-draft") toast("草稿已保存");
    if (action === "preview-post") dialog(`<h2 class="text-xl font-bold">帖子预览</h2><p class="mt-3 opacity-70">预览会使用与正式发布相同的安全 Markdown 渲染规则。</p><div class="mt-4 border-y-2 border-base-content/20 py-4"><h3 class="text-2xl font-black">怎样建立一个友善的提问模板</h3><p class="mt-3">先说清背景，再指出已经尝试过什么，最后提出一个可以回应的具体问题。</p></div>`);
    if (action === "confirm-publish") dialog(`<h2 class="text-xl font-bold">确认发布？</h2>${U.alert("发布后不能编辑、删除或撤回。请确认标题、正文、节点与附件无误。", "warning")}<div class="modal-action"><button class="btn" onclick="document.getElementById('app-dialog').close()">返回检查</button><a class="btn btn-primary" href="#/posts/immutable-content" onclick="document.getElementById('app-dialog').close()">确认并发布</a></div>`);
    if (["read-all", "save-settings", "revoke-session", "revoke-all", "unblock", "discard-draft", "retry", "toast-react"].includes(action)) toast({ "read-all": "已将全部通知标为已读", "save-settings": "设置已保存", "revoke-session": "设备会话已撤销", "revoke-all": "其他会话已全部撤销", "unblock": "已解除屏蔽", "discard-draft": "草稿已放弃", retry: "正在重新加载", "toast-react": "已表达认同" }[action]);
    if (action.startsWith("read-") && action !== "read-all") toast("已标为已读");
    if (action.startsWith("page-")) toast(action === "page-prev" ? "已经是第一页" : "已切换分页（静态演示）", "info");
    if (action === "submit-report") { toast("举报已提交，可在“我的举报”查看进度"); setTimeout(() => location.hash = "#/reports", 500); }
    if (action === "resume-bookmark") { state.bookmarked = true; toast("原任务已恢复：帖子已收藏"); setTimeout(() => location.hash = "#/posts/immutable-content", 500); }
    if (action === "change-password") { toast("密码已更新，可检查并撤销其他设备会话"); setTimeout(() => location.hash = "#/settings/sessions", 500); }
    if (action === "submit-appeal") { toast("申诉已提交"); setTimeout(() => location.hash = "#/appeals/AP-2026-0042", 500); }
    if (action === "appeal-note") dialog(`<h2 class="text-xl font-bold">补充申诉说明</h2><div class="mt-4">${U.field("补充内容", U.textarea('placeholder="只补充与复核有关的新事实"'))}</div><div class="modal-action"><button class="btn btn-primary" onclick="document.getElementById('app-dialog').close()">保存补充</button></div>`);
    if (action === "new-appeal") dialog(`<h2 class="text-xl font-bold">发起申诉</h2><div class="mt-4">${U.field("关联处置", U.select([{ label: "请选择可申诉记录" }, { label: "帖子锁定 · 7 月 10 日" }, { label: "账户限流 · 5 月 3 日" }]))}${U.field("申诉说明", U.textarea('placeholder="说明你认为需要复核的事实或上下文"'))}</div><div class="modal-action"><button class="btn btn-primary" onclick="document.getElementById('app-dialog').close()">提交申诉</button></div>`);
    if (action.startsWith("moderate-")) toast("已选择治理动作，请填写理由并确认", "info");
    if (action === "moderate-confirm") toast("治理动作已执行并写入审计日志");
    if (action === "start-quest") dialog(`<h2 class="text-xl font-bold">开始共建任务</h2><p class="mt-3 opacity-70">任务会保存来源帖子和进度，但不会自动发布评论、帖子或举报。每周最多激活 3 个任务，最多产生 5 个质量候选事件。</p><div class="modal-action"><button class="btn" onclick="document.getElementById('app-dialog').close()">稍后再说</button><a class="btn btn-primary" href="#/posts/immutable-content" onclick="document.getElementById('app-dialog').close()">进入真实主题</a></div>`);
    if (action === "join-team") toast("已提交加入申请；节点协作不会创建私聊或权力等级");
    if (action === "view-team") toast("你已在这个节点协作局中", "info");
    if (action === "finish-onboarding") { toast("旅程偏好已保存"); setTimeout(() => location.hash = "#/quests", 450); }
    if (action === "collection-display") dialog(`<h2 class="text-xl font-bold">收藏展示设置</h2><p class="mt-3 opacity-70">是否展示只影响个人主页外观，不影响内容排序、CXP、金币或治理权。</p><div class="modal-action"><button class="btn" onclick="document.getElementById('app-dialog').close()">保持隐藏</button><button class="btn btn-primary" data-action="confirm-collection-display" onclick="document.getElementById('app-dialog').close()">展示在主页</button></div>`);
    if (action === "confirm-collection-display") toast("展示设置已保存");
    if (action === "save-journey-settings") toast("旅程与休息设置已保存");
    if (["save-coin-settings", "recommend-release", "recommend-recovery", "submit-coin-control", "close-coin-period", "return-adjustment", "approve-adjustment"].includes(action)) toast({ "save-coin-settings": "金币设置已保存", "recommend-release": "释放建议已提交独立审批", "recommend-recovery": "追回建议已提交独立审批", "submit-coin-control": "规则变更已提交独立审批", "close-coin-period": "关账包已提交审批", "return-adjustment": "调整单已退回补充", "approve-adjustment": "调整已执行并写入不可变分录" }[action]);
  });

  document.addEventListener("change", e => {
    if (e.target.matches('[data-action="theme"]')) { state.theme = e.target.checked ? "night" : "lofi"; localStorage.setItem("x2post-theme", state.theme); document.documentElement.dataset.theme = state.theme; toast(`已切换为${e.target.checked ? "深色" : "浅色"}主题`, "info"); }
    if (e.target.id === "quick-node-primary") {
      const parent = nodeFromSlug(e.target.value) || nodes[0];
      const secondary = document.getElementById("quick-node-secondary");
      secondary.disabled = false;
      secondary.innerHTML = `<option value="">${U.esc(parent.name)}（综合）</option>${parent.children.map(child => `<option value="${U.esc(child.slug)}">${U.esc(child.name)}</option>`).join("")}`;
    }
    if (e.target.id === "compose-primary-node") {
      const parent = nodeFromSlug(e.target.value) || nodes[0];
      const secondary = document.getElementById("compose-secondary-node");
      secondary.innerHTML = `<option value="">${U.esc(parent.name)}（综合）</option>${parent.children.map(child => `<option value="${U.esc(child.slug)}">${U.esc(child.name)}</option>`).join("")}`;
      document.getElementById("compose-node-path").innerHTML = `<p><strong>发布路径：</strong>${U.esc(parent.name)}（综合）</p>`;
    }
    if (e.target.id === "compose-secondary-node") {
      const parent = nodeFromSlug(document.getElementById("compose-primary-node").value) || nodes[0];
      const child = childFromSlug(parent, e.target.value);
      document.getElementById("compose-node-path").innerHTML = `<p><strong>发布路径：</strong>${U.esc(parent.name)}${child ? ` / ${U.esc(child.name)}` : "（综合）"}</p>`;
    }
    if (e.target.id === "search-primary-node") {
      const parent = nodeFromSlug(e.target.value);
      const secondary = document.getElementById("search-secondary-node");
      if (!parent) {
        secondary.innerHTML = '<option value="">先选择一级节点</option>';
        secondary.disabled = true;
        document.getElementById("search-node-path").textContent = "当前搜索范围：全部公开节点";
      } else {
        secondary.disabled = false;
        secondary.innerHTML = `<option value="">全部${U.esc(parent.name)}</option>${parent.children.map(child => `<option value="${U.esc(child.slug)}">${U.esc(child.name)}</option>`).join("")}`;
        document.getElementById("search-node-path").textContent = `当前搜索范围：${parent.name}`;
      }
    }
    if (e.target.id === "search-secondary-node") {
      const parent = nodeFromSlug(document.getElementById("search-primary-node").value);
      const child = childFromSlug(parent, e.target.value);
      document.getElementById("search-node-path").textContent = `当前搜索范围：${parent?.name || "全部公开节点"}${child ? ` / ${child.name}` : ""}`;
    }
  });
  document.addEventListener("submit", e => {
    if (e.target.dataset.form === "quick-compose") { e.preventDefault(); document.querySelector('[data-action="quick-publish"]')?.click(); }
    if (e.target.dataset.form === "auth") { e.preventDefault(); state.loggedIn = true; localStorage.setItem("x2post-demo-auth", "in"); const type = e.target.dataset.authType; if (type === "forgot") { toast("如果邮箱已注册，将收到重置说明"); location.hash = "#/verify-email"; } else if (type === "verify") { toast("邮箱已验证"); location.hash = "#/verify-email/result"; } else { toast(type === "register" ? "账号已创建，请验证邮箱" : "登录成功，正在恢复来源任务"); location.hash = type === "register" ? "#/verify-email" : "#/auth/recover-task"; } }
    if (e.target.dataset.form === "search") { e.preventDefault(); toast("已更新搜索结果", "info"); }
  });
  function requireLogin() { if (state.loggedIn) return true; sessionStorage.setItem("x2post-resume", location.hash); toast("请先登录，来源和输入已保存", "info"); setTimeout(() => location.hash = "#/auth/login", 350); return false; }
  window.addEventListener("hashchange", render);
  render();
})();
