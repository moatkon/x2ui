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

  const mockWrite = async (method, path, body = {}, options = {}) => {
    const headers = { "Content-Type": "application/json" };
    if (options.idempotent) headers["Idempotency-Key"] = crypto.randomUUID();
    if (options.version) headers["If-Match"] = options.version;
    const response = await fetch(`/api/v1${path}`, { method, headers, body: method === "DELETE" ? undefined : JSON.stringify(body) });
    if (!response.ok) {
      const issue = await response.json().catch(() => ({ message: "Mock API 请求失败" }));
      throw new Error(issue.message || "Mock API 请求失败");
    }
    return response.status === 204 ? null : response.json();
  };

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
  const hashParams = () => new URLSearchParams(location.search);
  const childFromSlug = (parent, slug) => parent?.children?.find(child => child.slug === slug);
  const selectedNodePath = () => {
    const params = hashParams();
    const rawParent = params.get("node") || "";
    const rawChild = params.get("subnode") || "";
    const parent = nodeFromSlug(rawParent);
    const child = childFromSlug(parent, rawChild);
    return { parent, child, rawParent, rawChild, invalidParent: Boolean(rawParent && !parent), invalidChild: Boolean(rawChild && !child) };
  };
  const nodeMenuItem = ({ label, href, current = false }) => `<li><a class="min-h-11 content-center whitespace-normal rounded-field px-3 py-2 text-sm font-semibold leading-snug focus-visible:outline-2 focus-visible:outline-offset-2 ${current ? "bg-neutral text-neutral-content" : ""}" href="${href}" ${current ? 'aria-current="page"' : ""}>${U.esc(label)}</a></li>`;
  const nodeBrowseControl = (activeParent, activeChild) => {
    const items = [{ slug: "", name: "全部" }, ...nodes];
    const primaryMenu = `<div class="px-2 py-2 sm:px-4"><p id="primary-node-nav-title" class="px-3 pb-1 text-sm font-bold">按一级节点浏览</p><nav class="w-full" aria-labelledby="primary-node-nav-title"><ul class="menu menu-horizontal flex w-full flex-wrap gap-1 px-0">${items.map(item => nodeMenuItem({ label: item.name, href: item.slug ? `/feed?node=${item.slug}` : "/feed", current: item.slug === (activeParent?.slug || "") })).join("")}</ul></nav></div>`;
    const secondaryMenu = activeParent ? `<div class="border-t-2 border-base-content/20 px-2 py-3 sm:px-4"><p id="secondary-node-nav-title" class="px-3 pb-1 text-sm font-bold">${U.esc(activeParent.name)}下的主题</p><nav class="w-full" aria-labelledby="secondary-node-nav-title"><ul class="menu menu-horizontal flex w-full flex-wrap gap-1 px-0">${nodeMenuItem({ label: `全部${activeParent.name}`, href: `/feed?node=${activeParent.slug}`, current: !activeChild })}${activeParent.children.map(child => nodeMenuItem({ label: child.name, href: `/feed?node=${activeParent.slug}&subnode=${child.slug}`, current: activeChild?.slug === child.slug })).join("")}</ul></nav></div>` : "";
    return U.panel({ title: "浏览帖子", action: `<a class="link text-sm whitespace-nowrap" href="/nodes">全部节点</a>`, body: `${primaryMenu}${secondaryMenu}`, bodyClass: "p-0" });
  };
  const nodeGuideRail = () => U.panel({ title: "内容如何组织", body: `<p class="text-sm leading-relaxed opacity-75"><strong>一级节点</strong>划定长期讨论空间，<strong>子节点</strong>细分稳定主题，<strong>标签</strong>描述跨节点话题。先查看两级规则，再决定关注或发布。</p>`, footer: `<a class="link text-sm font-semibold" href="/nodes">了解全部 ${nodes.length} 个一级节点</a>` });
  const meta = p => `<div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm opacity-70"><a class="link link-hover" href="/users/${p.user}">${U.esc(p.author)}</a><span aria-hidden="true">·</span><a class="link link-hover" href="/nodes/${p.slug}">${U.esc(p.node)}</a>${p.subnodeSlug ? `<span aria-hidden="true">/</span><a class="link link-hover" href="/nodes/${p.slug}/${p.subnodeSlug}">${U.esc(p.subnodeName)}</a>` : ""}<span aria-hidden="true">·</span><span>${U.esc(p.time)}</span></div>`;
  const postRow = p => U.listRow(`${U.avatar(p.user, "w-10", `${p.author}的头像`)}<div class="list-col-grow min-w-0"><a class="text-base font-bold leading-snug hover:underline" href="/posts/${p.id}">${U.esc(p.title)}</a><p class="mt-1 line-clamp-2 opacity-75">${U.esc(p.excerpt)}</p><div class="mt-2">${meta(p)}</div></div><div class="col-start-2 row-start-2 mt-2 flex shrink-0 items-center gap-3 justify-self-start text-sm sm:col-start-3 sm:row-start-1 sm:mt-0 sm:flex-col sm:items-end sm:justify-self-end sm:self-start"><span>💬 ${p.comments}</span><span>♡ ${p.reacts}</span></div>`, { extra: "grid-cols-[auto_minmax(0,1fr)] sm:grid-cols-[auto_minmax(0,1fr)_auto]" });
  const pageHeader = (title, description, action = "") => `<header class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h1 class="text-2xl font-black tracking-tight sm:text-3xl">${U.esc(title)}</h1>${description ? `<p class="mt-1 max-w-2xl opacity-70">${U.esc(description)}</p>` : ""}</div>${action}</header>`;
  const sectionTabs = (active) => U.tabs([
    { label: "公开资料", href: "/users/linmo", active: active === "profile" },
    { label: "帖子", href: "/users/linmo/posts", active: active === "posts" },
    { label: "评论", href: "/users/linmo/comments", active: active === "comments" },
    { label: "关注", href: "/users/linmo/following", active: active === "following" },
    { label: "粉丝", href: "/users/linmo/followers", active: active === "followers" }
  ]);
  const settingsTabs = active => U.tabs([
    ["profile", "资料"], ["privacy", "隐私"], ["notifications", "通知"], ["security", "安全"], ["sessions", "设备会话"]
  ].map(([key, label]) => ({ label, href: `/settings/${key}`, active: active === key })));
  const coinTabs = active => U.tabs([
    ["wallet", "我的金币", "/coins"], ["ledger", "透明账本", "/coins/ledger"], ["bounties", "问题悬赏", "/coins/bounties"], ["rules", "经济规则", "/coins/rules"]
  ].map(([key, label, href]) => ({ label, href, active: active === key })));
  const playTabs = active => U.tabs([
    ["hub", "共建大厅", "/journey"], ["quests", "任务板", "/quests"], ["journey", "成长路径", "/me/progress"], ["teams", "节点协作", "/nodes/product/project"]
  ].map(([key, label, href]) => ({ label, href, active: active === key })));

  function rail(route) {
    if (route.startsWith("/coins")) return `${U.panel({ title: "经济边界", body: `<p class="text-sm leading-relaxed opacity-75">金币不可购买、提现或兑换法币，也不赋予治理票权。所有变动都进入不可变双重记账子账本。</p>`, footer: `<div class="flex gap-4"><a class="link text-sm" href="/coins/rules">完整规则</a><a class="link text-sm" href="/settings/coins">金币设置</a><a class="link text-sm" href="/coins/economy">经济透明度</a></div>` })}<div class="h-4"></div>${U.panel({ title: "本周状态", body: `${U.progress(42, 60, "个人系统奖励额度")}<p class="mt-3 text-sm opacity-65">已获得 42，剩余 18；周一重置奖励额度，不清空余额。</p>` })}`;
    if (route.startsWith("/play") || route.startsWith("/journey") || route.startsWith("/quests") || route.startsWith("/seasons") || route === "/me/progress" || route === "/me/contributions" || route === "/me/collection") return `${U.panel({ title: "健康参与", body: `<p class="text-sm leading-relaxed opacity-75">每周最多激活 3 个任务。没有签到断裂、掉级或过期未领损失，离线不会扣除进度。</p>`, footer: `<a class="link text-sm" href="/settings/journey">旅程与休息设置</a>` })}<div class="h-4"></div>${U.panel({ title: "本周旅程", body: `${U.progress(4, 7, "完成节点")}<p class="mt-3 text-sm opacity-65">再完成 3 个不同类型的真实贡献，即可生成私人周复盘。</p>` })}`;
    if (route.startsWith("/nodes/")) {
      const parts = route.split("/");
      const n = nodeFromSlug(parts[2]) || nodes[0];
      const child = childFromSlug(n, parts[3]);
      return U.panel({ title: child ? `${n.name} / ${child.name}规则` : `${n.name}规则`, body: `<p class="leading-relaxed">${U.esc(n.rule)}</p>${child ? `<p class="mt-3 border-t-2 border-base-content/20 pt-3 leading-relaxed"><strong>子节点补充：</strong>${U.esc(child.rule)}</p>` : ""}<div class="mt-4 flex items-center justify-between gap-3 text-sm"><span>${child ? `${child.followers} 人直接关注` : `${n.followers} 人关注`}</span>${U.button(state.following ? "已关注" : "关注节点", { action: "toggle-follow", size: "sm", kind: state.following ? "soft" : "default" })}</div>`, footer: `<a class="link text-sm" href="/nodes">查看全部节点</a>` });
    }
    if (route === "/quick-compose") return "";
    if (route.startsWith("/compose") || route.startsWith("/drafts")) {
      return `${U.panel({ title: "发布须知", body: U.alert("轻内容和长帖发布后都不能编辑、删除或撤回。发布前请完成确认。", "warning") })}<div class="h-4"></div>${U.panel({ title: "AI 辅助边界", body: `<p class="text-sm leading-relaxed opacity-75">AI 只能整理你已经写下的原意，不补充事实、不代替判断、不自动发布。采用后会公开标注“AI 协助整理”。</p>` })}<div class="h-4"></div>${U.panel({ title: "草稿状态", body: `<p class="font-semibold">已自动保存</p><p class="mt-1 text-sm opacity-65">今天 14:32 · 本地演示</p>` })}`;
    }
    const accountRail = !state.loggedIn
      ? U.panel({ eyebrow: "欢迎来到", title: "X2Post", body: `<p class="leading-relaxed opacity-75">一个内容优先、公开可读、秩序透明的轻量社区。</p><div class="mt-5 grid grid-cols-2 gap-2">${U.button("登录", { href: "/login" })}${U.button("注册", { href: "/register", kind: "primary" })}</div>` })
      : `${U.panel({ title: "我的 X2Post", body: `<div class="flex items-center gap-3">${U.avatar("linmo", "w-12", "林默的头像")}<div class="min-w-0"><a class="font-bold hover:underline" href="/me">林默</a><p class="text-sm opacity-65">产品设计 · 上海</p></div></div><dl class="mt-4 grid grid-cols-3 gap-2 text-center"><div><dt class="text-xs opacity-60">未读</dt><dd class="font-bold">6</dd></div><div><dt class="text-xs opacity-60">草稿</dt><dd class="font-bold">3</dd></div><div><dt class="text-xs opacity-60">关注</dt><dd class="font-bold">48</dd></div></dl>`, footer: `<div class="flex flex-wrap gap-x-4 gap-y-2 text-sm">${link("主页", "/me")}${link("通知", "/notifications")}${link("草稿", "/drafts")}</div>` })}<div class="h-4"></div>${U.panel({ title: "社区安全", body: `<p class="text-sm leading-relaxed opacity-75">不舒服的互动可以举报或屏蔽。每个举报都会留下进度记录。</p><a class="link mt-3 inline-block text-sm" href="/reports">查看我的举报</a>` })}`;
    return route === "/feed" ? `${accountRail}<div class="h-4"></div>${nodeGuideRail()}` : accountRail;
  }

  function shell(content, route, options = {}) {
    if (options.auth) return `<main id="main-content" class="mx-auto flex min-h-screen max-w-md items-center px-4 py-10">${content}</main>`;
    const nav = [
      ["首页", "/feed", "home", route === "/feed"], ["节点", "/nodes", "nodes", route.startsWith("/nodes")], ["关注", "/following", "heart", route === "/following"], ["金币", "/coins", "coin", route.startsWith("/coins")], ["共建", "/journey", "trophy", route.startsWith("/journey") || route.startsWith("/quests") || route.startsWith("/seasons") || route === "/me/progress" || route === "/me/contributions" || route === "/me/collection"], ["搜索", "/search", "search", route === "/search"]
    ];
    const desktopNav = `<ul class="menu menu-horizontal gap-1 px-1">${nav.map(([label, href, i, active]) => `<li><a href="${href}" class="${active ? "menu-active" : ""}">${U.icon(i)}${label}</a></li>`).join("")}</ul>`;
    const mobileNav = `<ul class="menu min-h-full w-80 border-r-2 border-base-content/20 bg-base-100 p-4"><li class="menu-title">浏览 X2Post</li>${nav.map(([label, href, i, active]) => `<li><a href="${href}" class="${active ? "menu-active" : ""}" data-close-drawer>${U.icon(i)}${label}</a></li>`).join("")}<li class="menu-title mt-3">我的</li><li><a href="/bookmarks" data-close-drawer>${U.icon("bookmark")}收藏</a></li><li><a href="/notifications" data-close-drawer>${U.icon("bell")}通知</a></li><li><a href="/settings/profile" data-close-drawer>${U.icon("user")}设置</a></li></ul>`;
    const userMenu = `<details class="dropdown dropdown-end"><summary class="btn btn-ghost" aria-label="打开用户菜单">${U.avatar(state.loggedIn ? "linmo" : "guest", "w-8", state.loggedIn ? "林默的头像" : "访客头像")}<span class="hidden sm:inline">${state.loggedIn ? "林默" : "访客"}</span></summary><ul class="menu dropdown-content z-20 mt-2 max-h-[80vh] w-60 overflow-y-auto border-2 border-base-content/20 bg-base-100 p-2"><li><a href="${state.loggedIn ? "/me" : "/login"}">${state.loggedIn ? "我的主页" : "登录"}</a></li>${state.loggedIn ? `<li><a href="/coins">金币与账本</a></li><li><a href="/journey">共建旅程</a></li><li><a href="/bookmarks">我的收藏</a></li><li><a href="/drafts">我的草稿</a></li><li><a href="/me/reports">举报进度</a></li><li><a href="/settings/blocked">屏蔽列表</a></li><li><a href="/appeals">我的申诉</a></li><li><a href="/settings/profile">设置</a></li><li class="menu-title">治理</li><li><a href="/moderation/cases">治理工作台</a></li><li><a href="/moderation/coins">金币风险案件</a></li><li><a href="/moderation/audit-logs">审计日志</a></li><li class="menu-title">Controller</li><li><a href="/admin/coins/control">金币控制台</a></li><li><a href="/admin/coins/reconciliation">对账与关账</a></li>` : `<li><a href="/register">注册</a></li>`}<li><button type="button" data-action="toggle-auth">切换为${state.loggedIn ? "访客" : "登录用户"}</button></li></ul></details>`;
    return `<div class="drawer"><input id="site-drawer" type="checkbox" class="drawer-toggle"/><div class="drawer-content min-h-screen"><header class="sticky top-0 z-30 border-b-2 border-base-content/20 bg-base-100"><div class="navbar mx-auto max-w-7xl px-3 sm:px-5"><div class="navbar-start"><label for="site-drawer" class="btn btn-ghost btn-square lg:hidden" aria-label="打开导航">${U.icon("menu")}</label><a class="ml-1 text-xl font-black tracking-tight sm:text-2xl" href="/feed" aria-label="X2Post 首页">X2Post</a></div><nav class="navbar-center hidden lg:block" aria-label="主导航">${desktopNav}</nav><div class="navbar-end gap-1">${state.loggedIn ? U.button("轻发布", { href: "/quick-compose", kind: "primary", iconName: "pen", extra: "hidden sm:inline-flex" }) : U.button("登录", { href: "/login", extra: "hidden sm:inline-flex" })}<label class="btn btn-ghost btn-square" aria-label="切换深浅主题">${U.icon("moon")}<input type="checkbox" class="toggle sr-only" data-action="theme" ${state.theme === "night" ? "checked" : ""}/></label>${userMenu}</div></div></header><div class="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-6 lg:py-8"><main id="main-content" class="min-w-0">${content}</main><aside class="min-w-0" aria-label="页面辅助信息">${rail(route)}</aside></div><footer class="mt-10 border-t-2 border-base-content/20"><div class="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-sm opacity-70 sm:flex-row sm:items-center sm:justify-between"><p>© 2026 X2Post · 认真表达，友善回应</p><nav class="flex gap-4" aria-label="页脚"><a class="link" href="/nodes">社区节点</a><a class="link" href="/appeals">申诉</a><a class="link" href="/moderation/cases">治理透明度</a></nav></div></footer></div><div class="drawer-side z-40"><label for="site-drawer" aria-label="关闭导航" class="drawer-overlay"></label>${mobileNav}</div></div>`;
  }


  window.X2App = { U, state, posts, nodes, coinLedger, quests, mockWrite, link, nodeFromSlug, hashParams, childFromSlug, selectedNodePath, nodeMenuItem, nodeBrowseControl, nodeGuideRail, meta, postRow, pageHeader, sectionTabs, settingsTabs, coinTabs, playTabs, rail, shell, pages: {} };
})();
