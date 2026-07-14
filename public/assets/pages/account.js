(function () {
  const X = window.X2App;
  const { U, state, posts, nodes, coinLedger, quests, mockWrite, link, nodeFromSlug, hashParams, childFromSlug, selectedNodePath, nodeMenuItem, nodeBrowseControl, nodeGuideRail, meta, postRow, pageHeader, sectionTabs, settingsTabs, coinTabs, playTabs, rail, shell } = X;
  function authPage(type) {
    const configs = {
      login: ["欢迎回来", "登录后继续参与讨论", `${U.field("邮箱", U.input('type="email" name="email" placeholder="you@example.com" required'))}${U.field("密码", U.input('type="password" name="password" placeholder="至少 8 位" required minlength="8"'))}`, "登录", "还没有账号？", "注册", "/auth/register"],
      register: ["加入 X2Post", "从一段真诚的自我介绍开始", `${U.field("用户名", U.input('name="username" placeholder="2–20 个字符" required minlength="2" maxlength="20"'), "公开显示，可在注册后完善资料。")}${U.field("邮箱", U.input('type="email" name="email" placeholder="you@example.com" required'))}${U.field("密码", U.input('type="password" name="password" placeholder="至少 8 位" required minlength="8"'))}`, "创建账号", "已经注册？", "登录", "/auth/login"],
      verify: ["验证邮箱", "我们已向 li•••@example.com 发送验证链接", U.alert("请在 30 分钟内完成验证。如果没有收到，请检查垃圾邮件。", "info"), "我已完成验证", "链接已失效？", "重新发送", "/auth/verify"],
      forgot: ["找回密码", "输入注册邮箱，我们会发送重置说明", U.field("邮箱", U.input('type="email" name="email" placeholder="you@example.com" required')), "发送重置邮件", "想起密码了？", "返回登录", "/auth/login"],
      reset: ["设置新密码", "新密码会让其他设备上的旧会话失效", `${U.field("新密码", U.input('type="password" required minlength="8"'))}${U.field("再次输入", U.input('type="password" required minlength="8"'))}`, "更新密码", "链接有问题？", "重新申请", "/auth/forgot"]
    };
    const c = configs[type] || configs.login;
    return `<div class="w-full"><a class="mb-8 block text-center text-3xl font-black" href="/feed">X2Post</a><section class="border-2 border-base-content/20 rounded-box overflow-hidden"><header class="border-b-2 border-base-content/20 p-5 text-center"><h1 class="text-2xl font-black">${c[0]}</h1><p class="mt-1 opacity-65">${c[1]}</p></header><form class="space-y-3 p-5" data-form="auth" data-auth-type="${type}">${c[2]}<button class="btn btn-primary mt-4 w-full" type="submit">${c[3]}</button></form><footer class="border-t-2 border-base-content/20 p-4 text-center text-sm"><span class="opacity-65">${c[4]}</span> <a class="link font-semibold" href="${c[6]}">${c[5]}</a></footer></section><p class="mt-5 text-center text-sm opacity-60">继续即表示你理解：已发布内容不能编辑或删除。</p></div>`;
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
    return `<form data-form="quick-compose" data-node="${U.esc(parent?.slug || "")}" data-subnode="${U.esc(child?.slug || "")}" class="mx-auto max-w-2xl space-y-4"><h1 class="sr-only">轻发布</h1><label class="sr-only" for="quick-content">Markdown 内容</label><textarea id="quick-content" class="textarea min-h-64 w-full text-base leading-relaxed" minlength="1" required autofocus placeholder="使用 Markdown 写点什么……"></textarea><div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm"><a class="link link-hover font-semibold" href="#select-node" data-action="quick-open-node-picker">选择节点</a><span id="quick-node-value" class="opacity-60" aria-live="polite">${U.esc(nodeLabel)}</span><span class="opacity-30" aria-hidden="true">·</span><a class="link link-hover font-semibold" href="/compose?from=quick" data-action="quick-to-long">转为长文</a></div>${U.button("发布", { action: "quick-publish", kind: "primary", extra: "w-full" })}</form>`;
  }

  function draftsPage() {
    const rows = [
      ["怎样建立一个友善的提问模板", "产品设计", "2 分钟前", "68%"], ["社区健康度应该看哪些信号？", "社区运营", "昨天", "42%"], ["未命名草稿", "前端开发", "7 月 8 日", "12%"]
    ].map((d, i) => U.listRow(`<div class="min-w-0 flex-1"><a class="font-bold hover:underline" href="/compose?draft=${i}">${d[0]}</a><p class="mt-1 text-sm opacity-65">${d[1]} · 保存于 ${d[2]}</p></div>${U.badge(d[3])}<div class="dropdown dropdown-end"><button popovertarget="draft-menu-${i}" style="anchor-name:--draft-${i}" class="btn btn-ghost btn-square" aria-label="草稿操作">${U.icon("more")}</button><ul class="dropdown menu w-40 border-2 border-base-content/20 bg-base-100 p-2" popover id="draft-menu-${i}" style="position-anchor:--draft-${i}"><li><a href="/compose?draft=${i}">继续编辑</a></li><li><button type="button" data-action="discard-draft">放弃草稿</button></li></ul></div>`));
    return pageHeader("我的草稿", "草稿可在发布前修改或放弃。", U.button("新建草稿", { href: "/compose", kind: "primary" })) + U.list(rows);
  }

  function simplePostListPage(title, desc, source = posts) {
    return pageHeader(title, desc) + (source.length ? U.list(source.map(postRow)) : U.panel({ title: "暂无内容", body: `<p class="opacity-70">这里还没有内容。</p>` }));
  }

  function notificationsPage() {
    const items = [
      ["青屿回复了你的帖子", "为什么社区内容需要明确的不可变边界？", "5 分钟前", true, "/posts/immutable-content#comments"],
      ["阿澈提到了你", "给内容社区做无障碍，不只是加 aria-label", "1 小时前", true, "/posts/accessible-ui"],
      ["你的举报有新进展", "案件 RP-2026-0712 已完成初步审核", "昨天", true, "/reports"],
      ["青屿关注了你", "现在有 231 人关注你", "周日", false, "/user/qingyu"],
      ["安全提醒", "新的设备登录了你的 X2Post 账号", "7 月 9 日", false, "/settings/sessions"]
    ];
    const rows = items.map((n, i) => U.listRow(`<span class="status ${n[3] ? "status-primary" : ""}" aria-label="${n[3] ? "未读" : "已读"}"></span><div class="min-w-0"><a class="font-bold hover:underline" href="${n[4]}" data-action="read-notification">${n[0]}</a><p class="mt-1 opacity-70">${n[1]}</p><p class="mt-2 text-sm opacity-55">${n[2]}</p></div>${n[3] ? U.button("标为已读", { action: `read-${i}`, size: "sm", kind: "ghost" }) : U.badge("已读")}`));
    return pageHeader("通知中心", "回复、提及、关注、治理与账户安全消息。", U.button("全部标为已读", { action: "read-all" })) + U.panel({ title: "通知", action: U.select([{ label: "全部通知" }, { label: "未读" }, { label: "互动" }, { label: "系统" }], 'aria-label="通知筛选"'), body: U.list(rows, { framed: false }), bodyClass: "p-0" });
  }

  function settingsPage(tab) {
    const forms = {
      profile: `${U.field("显示名称", U.input('value="林默" required'))}${U.field("个人简介", U.textarea('rows="4" maxlength="160"'), "公开展示，最多 160 字。")}${U.field("所在地", U.input('value="上海"'))}`,
      privacy: `<div class="space-y-5"><label class="flex min-h-11 items-center justify-between gap-4"><span><strong>允许出现在提及建议中</strong><small class="block opacity-65">被屏蔽的用户始终看不到你。</small></span><input class="toggle" type="checkbox" checked/></label><label class="flex min-h-11 items-center justify-between gap-4"><span><strong>展示关注列表</strong><small class="block opacity-65">关闭后仅你自己可见。</small></span><input class="toggle" type="checkbox" checked/></label><label class="flex min-h-11 items-center justify-between gap-4"><span><strong>搜索引擎收录个人页</strong><small class="block opacity-65">只影响公开个人页。</small></span><input class="toggle" type="checkbox"/></label></div>`,
      notifications: `<div class="space-y-5">${["回复与提及", "新关注", "内容互动", "治理进度", "账户安全"].map((x, i) => `<label class="flex min-h-11 items-center justify-between gap-4"><span><strong>${x}</strong><small class="block opacity-65">${i === 4 ? "安全通知不可完全关闭" : "站内通知与邮件摘要"}</small></span><input class="toggle" type="checkbox" ${i !== 2 ? "checked" : ""} ${i === 4 ? "disabled" : ""}/></label>`).join("")}</div>`,
      security: `${U.alert("账号邮箱：li•••@example.com（已验证）", "info")}<div class="mt-5 divide-y-2 divide-base-content/20"><div class="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p class="font-bold">登录密码</p><p class="text-sm opacity-65">上次修改于 2026 年 4 月 18 日</p></div>${U.button("修改密码", { href: "/settings/security/password" })}</div><div class="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p class="font-bold">设备会话</p><p class="text-sm opacity-65">当前有 3 个有效会话</p></div>${U.button("管理设备", { href: "/settings/sessions" })}</div></div>`,
      sessions: U.table(["设备", "位置", "最近活动", "操作"], [["Mac · Chrome（当前）", "上海", "刚刚", U.badge("当前", "success")], ["iPhone · Safari", "上海", "昨天", U.button("撤销", { action: "revoke-session", size: "sm" })], ["Windows · Edge", "杭州", "7 月 4 日", U.button("撤销", { action: "revoke-session", size: "sm" })]])
    };
    const title = { profile: "编辑资料", privacy: "隐私设置", notifications: "通知设置", security: "账户安全", sessions: "设备会话" }[tab] || "设置";
    return pageHeader("设置", "管理公开资料、隐私、通知与账户安全。") + `<div class="mb-5 border-b-2 border-base-content/20">${settingsTabs(tab)}</div>` + U.panel({ title, body: forms[tab] || forms.profile, footer: tab === "sessions" ? U.button("撤销其他全部会话", { action: "revoke-all" }) : U.button("保存更改", { action: "save-settings", kind: "primary" }) });
  }

  function reportsPage() {
    const rows = [["RP-2026-0712", "帖子", "骚扰或人身攻击", "审核中", "warning"], ["RP-2026-0628", "评论", "垃圾信息", "已处理", "success"], ["RP-2026-0511", "用户", "冒充他人", "未违规", "default"]].map(r => U.listRow(`<div class="min-w-0 flex-1"><a class="font-bold hover:underline" href="/me/reports/${r[0]}">${r[0]}</a><p class="mt-1 text-sm opacity-65">${r[1]} · ${r[2]}</p></div>${U.badge(r[3], r[4])}${U.icon("arrow")}`));
    return pageHeader("我的举报", "查看已提交举报的安全进度，不公开审核人员信息。") + U.list(rows);
  }

  function reportFormPage() {
    return pageHeader("提交举报", "举报用于处理具体风险，不用于表达观点不同。") + U.panel({ title: "被举报内容", body: `<p class="font-bold">为什么社区内容需要明确的不可变边界？</p><p class="mt-1 text-sm opacity-65">帖子 · 林默 · 12 分钟前</p>`, footer: `<a class="link text-sm" href="/posts/immutable-content">查看公开上下文</a>` }) + `<div class="h-5"></div>` + U.panel({ title: "举报详情", body: `${U.field("原因", U.select([{ label: "请选择原因", value: "" }, { label: "骚扰或人身攻击" }, { label: "仇恨或歧视" }, { label: "垃圾信息" }, { label: "危险或违法内容" }, { label: "侵犯隐私" }, { label: "其他" }], 'required'))}${U.field("补充说明", U.textarea('placeholder="说明具体位置和影响，避免重复粘贴敏感内容" maxlength="1000"'), "最多 1,000 字。")}${U.field("确认", '<label class="label cursor-pointer justify-start gap-3"><input type="checkbox" class="checkbox" required/><span>我确认信息真实，并理解恶意举报可能受到限制。</span></label>')}`, footer: `<div class="flex justify-end gap-2">${U.button("取消", { href: "/posts/immutable-content" })}${U.button("提交举报", { action: "submit-report", kind: "primary" })}</div>` });
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
    ].map(r => [link(r[0], `/moderation/cases/${r[0]}`), r[1], r[2], r[3], r[4]]);
    return pageHeader("审核队列", "按风险与时效处理举报；原始内容不可被改写或删除。") + U.alert("治理动作会进入不可变审计记录。隐藏内容和限制用户都必须填写理由。", "warning") + `<div class="h-5"></div>` + U.table(["案件", "对象", "原因", "状态", "进入队列"], rows);
  }

  function casePage(id) {
    return U.breadcrumb([{ label: "审核队列", href: "/moderation" }, { label: id }]) + `<div class="mt-3">${pageHeader(`案件 ${id}`, "高风险 · 隐私泄露 · 2 分钟前进入队列")}</div>` + U.panel({ title: "举报上下文", body: `<dl class="grid gap-3 text-sm sm:grid-cols-2"><div><dt class="opacity-60">举报对象</dt><dd class="font-semibold">帖子：城市散步路线分享</dd></div><div><dt class="opacity-60">举报次数</dt><dd class="font-semibold">3 次独立举报</dd></div><div><dt class="opacity-60">当前可见性</dt><dd>${U.badge("已紧急隐藏", "warning")}</dd></div><div><dt class="opacity-60">作者历史</dt><dd class="font-semibold">近 90 天无处置</dd></div></dl><div class="mt-4 border-t-2 border-base-content/20 pt-4"><p class="font-bold">风险摘要</p><p class="mt-2 leading-relaxed">内容可能包含可识别的私人住址。为避免扩散，此原型不展示原文，只保留必要案件上下文。</p></div>` }) + `<div class="h-5"></div>` + U.panel({ title: "治理动作", body: `<div class="grid gap-3 sm:grid-cols-2">${U.button("恢复可见性", { action: "moderate-restore" })}${U.button("保持隐藏", { action: "moderate-hide" })}${U.button("锁定评论", { action: "moderate-lock" })}${U.button("限制用户", { action: "moderate-user" })}</div>${U.field("处置理由", U.textarea('placeholder="说明证据、风险与处置期限" required'))}`, footer: U.button("记录并执行", { action: "moderate-confirm", kind: "primary" }) });
  }

  function auditPage() {
    const rows = [["AL-8891", "保持内容隐藏", "MC-0713-18", "审核员 A-17", "14:42"], ["AL-8890", "紧急隐藏", "MC-0713-18", "系统规则", "14:39"], ["AL-8889", "解除用户限流", "MC-0712-41", "审核员 B-03", "13:17"]].map(r => r.map(U.esc));
    return pageHeader("审计日志", "只读记录所有治理动作、理由与责任主体。") + U.table(["记录", "动作", "案件", "执行者", "时间"], rows);
  }

  function forbiddenPage() {
    return U.panel({ title: "没有访问权限", body: `<h1 class="text-3xl font-black">403</h1><p class="mt-2 opacity-70">你的账号没有进入治理工作台的权限。公开内容仍可正常浏览。</p>${U.alert("如果你刚获得权限，请重新登录或联系社区管理员确认授权。", "warning")}`, footer: `<div class="flex gap-2">${U.button("返回首页", { href: "/feed", kind: "primary" })}${U.button("查看公开规则", { href: "/nodes" })}</div>` });
  }

  function verifyResultPage() {
    return `<div class="w-full"><a class="mb-8 block text-center text-3xl font-black" href="/feed">X2Post</a>${U.panel({ title: "邮箱验证成功", body: `<div class="text-center"><div class="mx-auto flex size-14 items-center justify-center rounded-full border-2 border-success text-success">${U.icon("check", "size-8")}</div><h1 class="mt-4 text-2xl font-black">欢迎加入 X2Post</h1><p class="mt-2 opacity-70">邮箱已验证。接下来将恢复你登录前的任务。</p></div>`, footer: U.button("继续", { href: "/auth/recover-task", kind: "primary", extra: "w-full" }) })}<div class="mt-4">${U.alert("链接失效或已使用时，此页会安全提示重新发送，不泄露账号信息。", "info")}</div></div>`;
  }

  function authRecoveryPage() {
    return `<div class="w-full"><a class="mb-8 block text-center text-3xl font-black" href="/feed">X2Post</a>${U.panel({ title: "恢复之前的任务", body: `<div class="flex items-start gap-3"><span class="loading loading-spinner loading-md" aria-hidden="true"></span><div><h1 class="font-bold">已回到原帖子与评论位置</h1><p class="mt-1 opacity-70">你登录前准备收藏帖子。为避免意外操作，请再次确认。</p></div></div><div class="mt-5 border-y-2 border-base-content/20 py-4"><p class="font-bold">为什么社区内容需要明确的不可变边界？</p><p class="mt-1 text-sm opacity-60">来源：帖子详情 · 评论区</p></div>`, footer: `<div class="flex justify-end gap-2">${U.button("取消", { href: "/posts/immutable-content" })}${U.button("继续收藏", { action: "resume-bookmark", kind: "primary" })}</div>` })}</div>`;
  }

  function reportDetailPage(id) {
    return U.breadcrumb([{ label: "我的举报", href: "/me/reports" }, { label: id }]) + `<div class="mt-3">${pageHeader(`举报 ${id}`, "仅显示你需要知道的进度，不公开内部审核信息。")}</div>` + U.panel({ title: "目标摘要", body: `<p class="font-bold">为什么社区内容需要明确的不可变边界？</p><p class="mt-1 text-sm opacity-65">帖子 · 举报原因：骚扰或人身攻击</p>` }) + `<div class="h-5"></div>` + U.panel({ title: "处理进度", body: `<ol class="space-y-5"><li class="flex gap-3"><span class="status status-success mt-1"></span><div><p class="font-bold">已提交</p><p class="text-sm opacity-65">7 月 12 日 16:20 · 已生成提交凭证</p></div></li><li class="flex gap-3"><span class="status status-warning mt-1"></span><div><p class="font-bold">审核中</p><p class="text-sm opacity-65">社区团队正在核对上下文</p></div></li><li class="flex gap-3 opacity-55"><span class="status mt-1"></span><div><p class="font-bold">结果</p><p class="text-sm">处理完成后会在此说明结果类别</p></div></li></ol>`, footer: `<a class="link text-sm" href="/posts/immutable-content">目标仍公开，查看上下文</a>` });
  }

  function mePage() {
    return pageHeader("我的主页", "管理你的内容、关系和待办。", U.button("查看公开主页", { href: "/users/linmo" })) + U.panel({ title: "林默", body: `<div class="flex items-center gap-4">${U.avatar("linmo", "w-16", "林默的头像")}<div class="min-w-0"><p class="text-xl font-black">林默 <span class="text-sm font-normal opacity-60">@linmo</span></p><p class="mt-1 opacity-70">在复杂系统里寻找简单边界。</p></div></div><dl class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4"><div><dt class="text-sm opacity-60">帖子</dt><dd class="text-xl font-bold">36</dd></div><div><dt class="text-sm opacity-60">评论</dt><dd class="text-xl font-bold">128</dd></div><div><dt class="text-sm opacity-60">关注</dt><dd class="text-xl font-bold">48</dd></div><div><dt class="text-sm opacity-60">粉丝</dt><dd class="text-xl font-bold">231</dd></div></dl>`, footer: `<div class="flex flex-wrap gap-2">${U.button("编辑资料", { href: "/settings/profile" })}${U.button("草稿 3", { href: "/drafts" })}${U.button("通知 6", { href: "/notifications" })}${U.button("收藏", { href: "/bookmarks" })}</div>` });
  }

  function changePasswordPage() {
    return U.breadcrumb([{ label: "账户安全", href: "/settings/security" }, { label: "修改密码" }]) + `<div class="mt-3">${pageHeader("修改密码", "更新成功后可以选择撤销其他设备会话。")}</div>` + U.panel({ title: "设置新密码", body: `${U.field("当前密码", U.input('type="password" autocomplete="current-password" required'))}${U.field("新密码", U.input('type="password" autocomplete="new-password" minlength="8" required'), "至少 8 位，避免与其他网站重复。")}${U.field("确认新密码", U.input('type="password" autocomplete="new-password" minlength="8" required'))}`, footer: U.button("更新密码", { action: "change-password", kind: "primary" }) });
  }

  function appealNewPage() {
    return pageHeader("发起申诉", "说明需要复核的事实，不会改写原始处置记录。") + U.panel({ title: "关联处置", body: `<p class="font-bold">帖子锁定 · 2026 年 7 月 10 日</p><p class="mt-1 opacity-70">原因：讨论偏离节点规则，多次出现人身攻击。</p><a class="link mt-3 inline-block text-sm" href="/nodes/product">查看适用规则</a>` }) + `<div class="h-5"></div>` + U.panel({ title: "申诉说明", body: `${U.field("申诉理由", U.select([{ label: "请选择" }, { label: "上下文理解有误" }, { label: "处置范围不合适" }, { label: "补充新证据" }, { label: "其他" }], "required"))}${U.field("补充说明", U.textarea('placeholder="说明你希望复核的事实与依据" maxlength="2000" required'))}${U.field("附件", '<input type="file" class="file-input w-full"/>', "请勿上传无关个人信息。")}`, footer: U.button("提交申诉", { action: "submit-appeal", kind: "primary" }) });
  }

  function appealDetailPage(id) {
    return U.breadcrumb([{ label: "我的申诉", href: "/appeals" }, { label: id }]) + `<div class="mt-3">${pageHeader(`申诉 ${id}`, "状态、决定与补充说明会保留在时间线上。")}</div>` + U.panel({ title: "当前状态", body: `${U.alert("申诉正在由另一位治理人员复核。预计 3 个工作日内更新。", "info")}<ol class="mt-5 space-y-4"><li><p class="font-bold">已提交申诉</p><p class="text-sm opacity-60">7 月 10 日 18:42</p></li><li><p class="font-bold">进入复核</p><p class="text-sm opacity-60">7 月 11 日 09:10</p></li></ol>`, footer: U.button("补充说明", { action: "appeal-note" }) });
  }

  function moderationAppealsPage() {
    return pageHeader("申诉处理", "独立复核处置依据，并将决定写入审计日志。") + U.panel({ title: "申诉队列", action: U.select([{ label: "待处理" }, { label: "已处理" }, { label: "全部" }], 'aria-label="申诉筛选"'), body: U.list([U.listRow(`<div class="min-w-0 flex-1"><a class="font-bold hover:underline" href="/appeals/AP-2026-0041">AP-2026-0041 · 帖子锁定</a><p class="text-sm opacity-65">新证据 · 等待 18 小时</p></div>${U.badge("待复核", "warning")}`), U.listRow(`<div class="min-w-0 flex-1"><a class="font-bold hover:underline" href="/appeals/AP-2026-0039">AP-2026-0039 · 用户限流</a><p class="text-sm opacity-65">处置范围 · 等待 1 天</p></div>${U.badge("审核中", "info")}`)], { framed: false }), bodyClass: "p-0", footer: U.pagination() });
  }


  Object.assign(X.pages, { authPage, composePage, quickComposePage, draftsPage, simplePostListPage, notificationsPage, settingsPage, reportsPage, reportFormPage, blockedPage, appealsPage, moderationPage, casePage, auditPage, forbiddenPage, verifyResultPage, authRecoveryPage, reportDetailPage, mePage, changePasswordPage, appealNewPage, appealDetailPage, moderationAppealsPage });
})();
