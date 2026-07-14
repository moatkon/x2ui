(function () {
  const X = window.X2App;
  const { U, state, posts, nodes, coinLedger, quests, mockWrite, link, nodeFromSlug, hashParams, childFromSlug, selectedNodePath, nodeMenuItem, nodeBrowseControl, nodeGuideRail, meta, postRow, pageHeader, sectionTabs, settingsTabs, coinTabs, playTabs, rail, shell } = X;
  const questRow = quest => U.listRow(`<div class="list-col-grow min-w-0"><div class="flex flex-wrap items-center gap-2">${U.badge(quest.node)}<span class="text-xs opacity-60">${quest.time}</span></div><a class="mt-2 block font-bold hover:underline" href="/quests/${quest.id}">${quest.title}</a><p class="mt-1 text-sm opacity-65">${quest.desc}</p><div class="mt-3">${U.progress(quest.progress, quest.max, "当前进度")}</div></div><div class="text-right">${U.badge(quest.reward, "success")}<p class="mt-2 text-xs opacity-60">${quest.status}</p></div>`);

  function playPage() {
    return pageHeader("社区旅程", "把阅读、回应和整理变成有边界的社区协作旅程。", U.button("继续当前任务", { href: "/quests/first-reply", kind: "primary", iconName: "trophy" })) + `<div class="mb-5 border-b-2 border-base-content/20">${playTabs("hub")}</div>` + U.alert("游戏奖励贡献质量，不奖励发帖数量或在线时长；每周最多激活 3 个任务，离线不会损失进度。", "info") + `<div class="h-5"></div>${U.summary([{ title: "本周共建", value: "4 / 7", desc: "覆盖 3 个节点" }, { title: "确认 CXP", value: "68", desc: "另有 12 待确认" }, { title: "贡献角色", value: "回应者", desc: "下一级：整理者" }])}<div class="h-5"></div>${U.panel({ title: "当前旅程", body: U.steps([{ label: "发现问题", active: true }, { label: "提供回应", active: true }, { label: "获得确认", active: false }, { label: "沉淀成果", active: false }]), footer: `<p class="text-sm opacity-65">每一步都对应真实社区对象；任务完成不会自动发布任何内容。</p>` })}<div class="h-5"></div>${U.panel({ title: "推荐任务", action: `<a class="link text-sm" href="/quests">完整任务板</a>`, body: U.list(quests.slice(0, 2).map(questRow), { framed: false }), bodyClass: "p-0" })}`;
  }

  function questsPage() {
    return pageHeader("共建任务板", "选择能真正帮助某个节点的任务，而不是追求任务数量。") + `<div class="mb-5 border-b-2 border-base-content/20">${playTabs("quests")}</div>` + U.panel({ title: "筛选任务", body: `<div class="grid gap-3 sm:grid-cols-3">${U.select([{ label: "全部节点" }, ...nodes.map(node => ({ label: node.name }))], 'aria-label="筛选节点"')}${U.select([{ label: "全部类型" }, { label: "回应" }, { label: "资料" }, { label: "整理" }, { label: "守望" }], 'aria-label="筛选任务类型"')}${U.select([{ label: "适合我" }, { label: "用时最短" }, { label: "即将结束" }], 'aria-label="任务排序"')}</div>` }) + `<div class="h-5"></div>${U.list(quests.map(questRow))}`;
  }

  function questDetailPage(id) {
    const quest = quests.find(item => item.id === id) || quests[0];
    return U.breadcrumb([{ label: "社区旅程", href: "/journey" }, { label: "任务板", href: "/quests" }, { label: quest.title }]) + `<div class="mt-3">${pageHeader(quest.title, `${quest.node} · ${quest.time} · 完成后 ${quest.reward}`)}</div>` + U.panel({ title: "为什么做", body: `<p class="leading-relaxed">${quest.desc}</p><div class="mt-4">${U.alert("只提交你愿意公开保留的内容。评论提交后不能编辑或删除，任务完成也不会改变这一规则。", "warning")}</div>` }) + `<div class="h-5"></div>${U.panel({ title: "验收路径", body: U.steps([{ label: "阅读节点规则", active: true }, { label: "选择真实主题", active: true }, { label: "提交贡献", active: false }, { label: "质量确认", active: false }]) })}<div class="h-5"></div>${U.panel({ title: "任务清单", body: `<label class="label min-h-11 justify-start gap-3"><input type="checkbox" class="checkbox" checked/><span>已阅读 ${quest.node} 节点规则</span></label><label class="label min-h-11 justify-start gap-3"><input type="checkbox" class="checkbox"/><span>选择一个仍需要帮助的真实主题</span></label><label class="label min-h-11 justify-start gap-3"><input type="checkbox" class="checkbox"/><span>完成贡献并主动提交验收</span></label>`, footer: `<div class="flex flex-wrap justify-end gap-2">${U.button("暂时退出", { href: "/quests" })}${U.button(quest.progress ? "继续任务" : "开始任务", { action: "start-quest", kind: "primary" })}</div>` })}`;
  }

  function journeyPage() {
    const journey = [{ title: "发现者", desc: "理解节点与标签，完成 3 次有目的的阅读", done: true }, { title: "回应者", desc: "完成 5 次被确认的有效回应", done: true }, { title: "整理者", desc: "归纳 2 段分散讨论；当前 1 / 2", done: false }, { title: "守望者", desc: "协助发现风险并给出规则引导", done: false }];
    return pageHeader("成长路径", "记录你如何帮助社区，而不是制造等级压力。") + `<div class="mb-5 border-b-2 border-base-content/20">${playTabs("journey")}</div>` + U.panel({ title: "贡献路径", body: U.timeline(journey) }) + `<div class="h-5"></div>${U.panel({ title: "本周共建记录", body: `<p class="leading-relaxed">你在 3 个不同节点完成了 4 次真实贡献，其中 3 次帮助讨论获得后续回应。周记录只展示贡献类型与社区影响，不公开金币余额或排行榜。</p>`, footer: U.button("查看对应贡献", { href: "/users/linmo/comments" }) })}`;
  }

  function teamsPage() {
    const teams = [{ node: "产品设计", title: "新人问题首响小队", members: "6 / 8 人", goal: "本周帮助 12 个无人回应的新主题", progress: 7, max: 12 }, { node: "前端开发", title: "无障碍资料整理局", members: "8 / 10 人", goal: "完成公开资料索引第一版", progress: 16, max: 24 }, { node: "社区运营", title: "案例归档协作局", members: "4 / 6 人", goal: "整理 5 个真实冷启动案例", progress: 3, max: 5 }];
    const rows = teams.map((team, i) => U.listRow(`<div class="list-col-grow min-w-0"><div class="flex flex-wrap items-center gap-2">${U.badge(team.node)}<span class="text-xs opacity-60">${team.members}</span></div><p class="mt-2 font-bold">${team.title}</p><p class="mt-1 text-sm opacity-65">${team.goal}</p><div class="mt-3">${U.progress(team.progress, team.max, "团队进度")}</div></div>${U.button(i === 0 ? "已加入" : "申请加入", { action: i === 0 ? "view-team" : "join-team", size: "sm", kind: i === 0 ? "soft" : "default" })}`));
    return pageHeader("节点协作", "小队围绕公开成果协作，不建立私聊、权力等级或无限排行。") + `<div class="mb-5 border-b-2 border-base-content/20">${playTabs("teams")}</div>` + U.alert("协作任务、验收规则和进度全部公开；成员可随时退出，不会失去已完成的个人贡献记录。", "info") + `<div class="h-5"></div>${U.list(rows)}`;
  }

  function journeyOnboardingPage() {
    return pageHeader("开启社区旅程", "先选择愿意帮助的方式，再由你决定何时开始。") + U.alert("旅程完全可选。跳过、暂停或休息都不会影响发帖、评论、金币余额或已有贡献记录。", "info") + `<div class="h-5"></div>${U.panel({ title: "选择贡献偏好", body: `<div class="grid gap-3 sm:grid-cols-2"><label class="flex min-h-24 cursor-pointer gap-3 rounded-box border-2 border-base-content/20 p-4"><input class="checkbox checkbox-primary mt-1" type="checkbox" checked/><span><strong>回应具体问题</strong><small class="mt-1 block opacity-65">帮助尚未得到有效首响的真实主题</small></span></label><label class="flex min-h-24 cursor-pointer gap-3 rounded-box border-2 border-base-content/20 p-4"><input class="checkbox checkbox-primary mt-1" type="checkbox"/><span><strong>整理公开资料</strong><small class="mt-1 block opacity-65">将分散讨论沉淀成可复用索引</small></span></label><label class="flex min-h-24 cursor-pointer gap-3 rounded-box border-2 border-base-content/20 p-4"><input class="checkbox checkbox-primary mt-1" type="checkbox"/><span><strong>照护讨论秩序</strong><small class="mt-1 block opacity-65">提醒规则、报告风险，不以处置数量计酬</small></span></label><label class="flex min-h-24 cursor-pointer gap-3 rounded-box border-2 border-base-content/20 p-4"><input class="checkbox checkbox-primary mt-1" type="checkbox" checked/><span><strong>每周轻量参与</strong><small class="mt-1 block opacity-65">最多 3 个激活任务，不设连续签到</small></span></label></div>`, footer: `<div class="flex flex-wrap justify-end gap-2">${U.button("暂时跳过", { href: "/feed" })}${U.button("保存并查看任务", { action: "finish-onboarding", kind: "primary" })}</div>` })}`;
  }

  function contributionsPage() {
    const rows = [
      ["有效首响", "前端开发", "帮助提问者补齐复现条件", "质量已确认", "7 月 12 日"],
      ["讨论整理", "产品设计", "把 9 条评论归纳为 3 个决策点", "待确认", "7 月 11 日"],
      ["规则引导", "社区运营", "为新成员指出节点边界", "质量已确认", "7 月 9 日"]
    ].map(([type, node, impact, status, date]) => U.listRow(`<div class="list-col-grow min-w-0"><div class="flex flex-wrap items-center gap-2">${U.badge(type)}${U.badge(node, "info")}</div><p class="mt-2 font-bold">${impact}</p><p class="mt-1 text-sm opacity-60">${date} · ${status}</p></div><a class="btn btn-sm" href="/posts/immutable-content">查看来源</a>`));
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
    ].map(([title, scope, value, max, status, slug]) => U.listRow(`<div class="list-col-grow min-w-0"><p class="text-sm opacity-60">${scope}</p><a class="mt-1 block font-bold hover:underline" href="/seasons/${slug}">${title}</a><p class="mt-1 text-sm opacity-65">${status}</p><div class="mt-3">${U.progress(value, max, "公共成果进度")}</div></div>${U.icon("arrow")}`));
    return pageHeader("社区共建季", "围绕一个公开、可验收的社区问题协作，不比较个人排名。") + U.alert("季节结束只停止新增任务，不会清空个人进度、CXP、金币或已获得收藏。", "info") + `<div class="h-5"></div>${U.list(rows)}`;
  }

  function seasonDetailPage(slug) {
    const past = slug === "spring-discovery";
    return U.breadcrumb([{ label: "社区共建季", href: "/seasons" }, { label: past ? "2026 春" : "2026 夏" }]) + `<div class="mt-3">${pageHeader(past ? "公开资料可发现性" : "让新人得到第一条好回应", past ? "已完成 · 成果公开归档" : "进行中 · 跨节点公共共建")}</div>` + U.panel({ title: "公共目标", body: `<p class="leading-relaxed">${past ? "将高频问题、标准链接与讨论结论整理为公开索引，并让节点入口可以反向抵达这些成果。" : "让发布 24 小时仍无有效回应的新主题，在不制造灌水的前提下获得一条有上下文、有下一步的首响。"}</p><div class="mt-5">${U.progress(past ? 100 : 68, 100, "公共成果进度")}</div>`, footer: `<p class="text-sm opacity-65">验收由节点维护者与随机贡献者共同完成；成员数和个人得分不参与排序。</p>` }) + `<div class="h-5"></div>${U.panel({ title: "如何参与", body: U.steps([{ label: "选择真实主题", active: true }, { label: "完成公开贡献", active: true }, { label: "同行质量确认", active: past }, { label: "成果归档", active: past }]), footer: past ? U.button("查看归档成果", { href: "/nodes/frontend/project" }) : U.button("查看可做任务", { href: "/quests", kind: "primary" }) })}`;
  }

  function nodeProjectPage(slug) {
    const node = nodeFromSlug(slug) || nodes[0];
    return U.breadcrumb([{ label: "节点", href: "/nodes" }, { label: node.name, href: `/nodes/${node.slug}` }, { label: "公开共建" }]) + `<div class="mt-3">${pageHeader(`${node.name} · 公开共建`, "任务、验收规则、贡献者和最终成果都可追溯。", U.button("申请加入", { action: "join-team", kind: "primary" }))}</div>` + U.alert("加入只订阅协作进度，不创建私聊、身份等级或永久义务；可随时退出。", "info") + `<div class="h-5"></div>${U.summary([{ title: "公共目标", value: "24 条", desc: "可信资料索引" }, { title: "已验收", value: "16 条", desc: "由两类角色确认" }, { title: "开放任务", value: "5", desc: "最多同时领取 1 个" }])}<div class="h-5"></div>${U.panel({ title: "公开任务", body: U.list(quests.slice(0, 2).map(questRow), { framed: false }), bodyClass: "p-0", footer: `<a class="link text-sm" href="/me/contributions">查看我的贡献记录</a>` })}`;
  }

  function journeySettingsPage() {
    return pageHeader("旅程与休息设置", "控制提醒频率、可见性和暂停状态，核心社区功能不受影响。") + U.panel({ title: "健康参与", body: `<div class="space-y-5"><label class="flex min-h-11 items-center justify-between gap-4"><span><strong>每周旅程摘要</strong><small class="block opacity-65">只在有真实进展时发送一次</small></span><input class="toggle" type="checkbox" checked/></label><label class="flex min-h-11 items-center justify-between gap-4"><span><strong>任务推荐</strong><small class="block opacity-65">最多保留 3 个激活任务，可随时替换</small></span><input class="toggle" type="checkbox" checked/></label><label class="flex min-h-11 items-center justify-between gap-4"><span><strong>公开展示路径印记</strong><small class="block opacity-65">隐藏不影响贡献记录和 CXP</small></span><input class="toggle" type="checkbox"/></label><label class="flex min-h-11 items-center justify-between gap-4"><span><strong>暂停旅程</strong><small class="block opacity-65">停止任务与旅程通知，不清空任何进度</small></span><input class="toggle toggle-warning" type="checkbox"/></label></div>`, footer: U.button("保存旅程设置", { action: "save-journey-settings", kind: "primary" }) }) + `<div class="mt-5">${U.alert("需要彻底隐藏游戏层？开启暂停后，共建入口仍可在设置中恢复，Feed、节点、发帖和评论保持可用。", "info")}</div>`;
  }

  function journeyStatesPage() {
    return pageHeader("旅程状态样例", "用于验证空、暂停、待确认与完成状态。") + `<div class="space-y-5">${U.panel({ title: "尚未开启", body: `<p>旅程是可选体验。你可以先正常浏览社区。</p>`, footer: U.button("了解旅程", { href: "/journey/onboarding" }) })}${U.panel({ title: "休息中", body: U.alert("旅程已暂停。任务和提醒停止，已有进度完整保留。", "info"), footer: U.button("管理休息设置", { href: "/settings/journey" }) })}${U.panel({ title: "等待质量确认", body: `<p>贡献已关联真实评论，正在等待同行确认。未确认前不计入 CXP，也不会触发金币候选事件。</p>` })}${U.panel({ title: "本周回顾已生成", body: `<p>你帮助 2 个主题获得了后续回应，并整理了 1 个公开资料条目。</p>`, footer: U.button("查看贡献来源", { href: "/me/contributions", kind: "primary" }) })}</div>`;
  }

  function statesPage() {
    return pageHeader("界面状态验收", "用于开发交接的完整状态样例，不进入产品主导航。") + `<div class="space-y-5">${U.panel({ title: "Loading", body: U.skeleton() })}${U.panel({ title: "Empty", body: `<p>还没有收藏的帖子。</p>`, footer: U.button("浏览最新帖子", { href: "/feed", kind: "primary" }) })}${U.panel({ title: "Partial", body: U.alert("帖子已加载，但作者摘要暂时不可用。", "warning") })}${U.panel({ title: "Error", body: U.alert("加载失败，请检查网络后重试。Request ID: x2p-demo-01", "error"), footer: U.button("重试", { action: "retry" }) })}${U.panel({ title: "Unauthorized / Forbidden / Not Found", body: `<div class="space-y-3">${U.alert("登录后继续，当前输入和来源会保留。", "info")}${U.alert("你没有执行此操作的权限。", "warning")}${U.alert("内容不存在或当前不可见。", "info")}</div>` })}${U.panel({ title: "Rate Limited / Conflict", body: `<div class="space-y-3">${U.alert("操作过于频繁，请在 42 秒后重试。", "warning")}${U.alert("草稿已在另一设备更新。请比较内容后选择保留版本。", "error")}</div>` })}</div>`;
  }

  function notFoundPage() {
    return U.panel({ title: "页面不存在", body: `<h1 class="text-3xl font-black">404</h1><p class="mt-2 opacity-70">链接可能已失效，或内容因隐私原因不可见。</p>`, footer: U.button("返回首页", { href: "/feed", kind: "primary" }) });
  }


  Object.assign(X.pages, { questRow, playPage, questsPage, questDetailPage, journeyPage, teamsPage, journeyOnboardingPage, contributionsPage, collectionPage, seasonsPage, seasonDetailPage, nodeProjectPage, journeySettingsPage, journeyStatesPage, statesPage, notFoundPage });
})();
