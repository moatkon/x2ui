(function () {
  const X = window.X2App;
  const { U, state, posts, nodes, coinLedger, quests, mockWrite, link, nodeFromSlug, hashParams, childFromSlug, selectedNodePath, nodeMenuItem, nodeBrowseControl, nodeGuideRail, meta, postRow, pageHeader, sectionTabs, settingsTabs, coinTabs, playTabs, rail, shell } = X;
  function coinPage() {
    const earnRows = [
      ["内容质量阶梯", "不同可信账户确认达到 3 / 8 / 20 人", "+4 / +6 / +10", "单内容累计最多 20；72 小时待结算"],
      ["社区照护津贴", "被授权的节点照护批次经另一角色质检", "+20", "每周最多 40；不按处置数量计酬"],
      ["感谢与悬赏收入", "来自其他用户已有金币，不增加总发行量", "+1 或 80%", "感谢作者得 1；悬赏采纳按 80/20 结算"]
    ].map(item => U.listRow(`<div class="list-col-grow min-w-0"><p class="font-bold">${item[0]}</p><p class="mt-1 text-sm opacity-65">${item[1]}</p><p class="mt-2 text-xs opacity-55">${item[3]}</p></div>${U.badge(item[2], "success")}`));
    const recent = coinLedger.slice(0, 4).map(tx => U.listRow(`<div class="list-col-grow min-w-0"><p class="font-bold">${tx.type}</p><p class="mt-1 text-sm opacity-65">${tx.detail}</p><p class="mt-2 text-xs opacity-55">${tx.time} · ${tx.id}</p></div><div class="text-right"><p class="font-bold ${tx.amount.startsWith("+") ? "text-success" : ""}">${tx.amount}</p>${U.badge(tx.status, tx.status === "待结算" ? "warning" : "default")}</div>`));
    return pageHeader("金币中心", "用可审计的社区金币确认真实贡献，而不是购买影响力。", U.button("查看透明账本", { href: "/coins/ledger" })) + `<div class="mb-5 border-b-2 border-base-content/20">${coinTabs("wallet")}</div>` + U.alert("金币不可付费购买、不可提现、不可自由转账，也不能换取治理票权或内容曝光。", "info") + `<div class="h-5"></div>${U.summary([{ title: "可用", value: "286", desc: "可感谢、悬赏或兑换纯装饰" }, { title: "待结算", value: "10", desc: "72 小时质量观察期" }, { title: "托管", value: "50", desc: "开放悬赏中" }, { title: "风控保留", value: "5", desc: "预计 72 小时内复核" }])}<div class="h-5"></div>${U.panel({ title: "本周个人系统奖励", body: `${U.progress(42, 60, "已使用额度")}<p class="mt-3 text-sm opacity-65">额度限制系统新增发行，不限制你继续帮助社区。预算用尽后不会透支或暗示继续刷行为。</p>` })}<div class="h-5"></div>${U.panel({ title: "金币来源", body: U.list(earnRows, { framed: false }), bodyClass: "p-0" })}<div class="h-5"></div>${U.panel({ title: "最近变动", action: `<a class="link text-sm" href="/coins/ledger">全部记录</a>`, body: U.list(recent, { framed: false }), bodyClass: "p-0" })}`;
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
    const rows = items.map(item => U.listRow(`<div class="list-col-grow min-w-0"><div class="flex flex-wrap items-center gap-2">${U.badge(item.node)}${U.badge(item.status, item.status === "已结算" ? "success" : "warning")}</div><a class="mt-2 block font-bold hover:underline" href="/coins/bounties/${item.id}">${item.title}</a><p class="mt-2 text-sm opacity-65">${item.id} · ${item.expires}</p></div><div class="text-right"><p class="text-xl font-black">${item.amount}</p><p class="text-xs opacity-60">托管金币</p></div>`));
    return pageHeader("问题悬赏", "用已有金币为真实问题设置固定档位悬赏。", U.button("创建悬赏", { action: "create-bounty", kind: "primary" })) + `<div class="mb-5 border-b-2 border-base-content/20">${coinTabs("bounties")}</div>` + U.alert("悬赏只能选择 20 / 50 / 100；发布 24 小时后才能采纳，采纳时答主获得 80%，20% 销毁。", "info") + `<div class="h-5"></div>${U.list(rows)}`;
  }

  function coinRulesPage() {
    const sources = [["邮箱验证启动金", "30", "终身一次", "基础风控通过后发放"], ["内容质量阶梯", "4 / 6 / 10", "单内容累计 20", "3 / 8 / 20 个可信账户确认"], ["社区照护津贴", "20 / 批", "40 / 周", "另一角色质检，不按处置数量"], ["感谢与悬赏", "1 或 80%", "非系统发行", "来自其他用户已有余额"]];
    const sinks = [["金币感谢", "固定成本 2", "作者获得 1，系统销毁 1"], ["问题悬赏", "20 / 50 / 100", "采纳答主 80%，系统销毁 20%"], ["纯装饰兑换", "固定目录价", "100% 销毁；无功能优势、不可转售"], ["风控冲正", "按原额", "等额反向分录，不改写历史"]];
    return pageHeader("金币经济规则", "发行有预算、流通有摩擦、沉淀有去向、异常可冲正。") + `<div class="mb-5 border-b-2 border-base-content/20">${coinTabs("rules")}</div>` + U.alert("金币是站内不可兑换的社区记账单位，不构成资产、存款、证券、工资或任何兑付承诺。", "warning") + `<div class="h-5"></div>${U.panel({ title: "发行来源", body: U.table(["来源", "建议值", "个人上限", "验证方式"], sources.map(row => row.map(U.esc))) })}<div class="h-5"></div>${U.panel({ title: "使用与沉淀", body: U.table(["用途", "范围", "经济处理"], sinks.map(row => row.map(U.esc))) })}<div class="h-5"></div>${U.panel({ title: "四道经济控制", body: U.steps([{ label: "周预算封顶", active: true, icon: "1" }, { label: "72 小时待结算", active: true, icon: "2" }, { label: "串谋检测", active: true, icon: "3" }, { label: "月度再平衡", active: true, icon: "4" }]), footer: `<p class="text-sm opacity-65">稳定期目标是 28 日净增长率保持在 0–2%；连续两期超过 2% 时先下调发行预算，不通过提高价格掩盖问题。</p>` })}`;
  }

  function coinBountyDetailPage(id) {
    return U.breadcrumb([{ label: "问题悬赏", href: "/coins/bounties" }, { label: id }]) + `<div class="mt-3">${pageHeader(`悬赏 ${id}`, "开放中 · 50 金币托管 · 11 天后到期")}</div>` + U.panel({ title: "关联问题", body: `<a class="text-lg font-bold hover:underline" href="/posts/accessible-ui">如何验证一条无障碍建议来自一手标准？</a><p class="mt-2 opacity-65">前端开发 · 发布 3 天 · 5 个公开回答</p>` }) + `<div class="h-5"></div>${U.panel({ title: "资金与时间线", body: `${U.summary([{ title: "托管", value: "50", desc: "来自发布者可用余额" }, { title: "采纳给答主", value: "40", desc: "80%" }, { title: "系统销毁", value: "10", desc: "20%" }])}<div class="mt-5">${U.timeline([{ title: "悬赏创建", desc: "7 月 10 日 · journal J-77120", done: true }, { title: "最早采纳时间已到", desc: "7 月 11 日 · 已满足 24 小时", done: true }, { title: "等待采纳或到期", desc: "最晚 7 月 24 日自动处理", done: false }])}</div>`, footer: `<div class="flex flex-wrap justify-end gap-2">${U.button("申请复核", { action: "coin-dispute" })}${U.button("采纳回答", { action: "accept-bounty", kind: "primary" })}</div>` })}`;
  }

  function coinEconomyPage() {
    return pageHeader("金币经济透明度", "仅公开汇总供给和系统健康，不公开个人余额与风控阈值。") + U.summary([{ title: "28 日流通量", value: "184,260", desc: "期初 182,040" }, { title: "系统发行", value: "8,420", desc: "含合格启动金" }, { title: "销毁", value: "6,200", desc: "感谢与悬赏" }, { title: "净增长率", value: "1.22%", desc: "目标 0–2%" }]) + `<div class="h-5"></div>${U.panel({ title: "28 日变动", body: U.table(["项目", "本期", "上期", "控制线"], [["验证活跃钱包", "5,218", "5,064", "—"], ["发行 / 销毁", "1.36", "1.28", "≤ 1.50"], ["Top 1% 持有", "18.4%", "18.1%", "< 25%"], ["借贷差异", "0", "0", "必须为 0"]]) })}<div class="h-5"></div>${U.alert("规则版本 v1.0.0 · 生效于 2026-07-01。任何数值调整至少提前 7 日公示。", "info")}`;
  }

  function coinSettingsPage() {
    return pageHeader("金币设置", "管理通知、公开贡献记录和高风险操作保护。") + U.panel({ title: "偏好", body: `<div class="space-y-5"><label class="flex min-h-11 items-center justify-between gap-4"><span><strong>奖励与结算通知</strong><small class="block opacity-65">待结算、入账、冲正和预算状态</small></span><input class="toggle" type="checkbox" checked/></label><label class="flex min-h-11 items-center justify-between gap-4"><span><strong>公开贡献记录</strong><small class="block opacity-65">只展示贡献类型，不显示余额和财富排名</small></span><input class="toggle" type="checkbox"/></label><label class="flex min-h-11 items-center justify-between gap-4"><span><strong>金币消费二次验证</strong><small class="block opacity-65">悬赏和高风险设备始终需要确认</small></span><input class="toggle" type="checkbox" checked/></label></div>`, footer: U.button("保存金币设置", { action: "save-coin-settings", kind: "primary" }) });
  }

  function coinModerationPage() {
    return pageHeader("金币风险案件", "治理人员只能调查并提出建议，不能直接修改余额。") + U.alert("释放、追回或人工调整必须交由独立审批人执行；历史分录不可编辑或删除。", "warning") + `<div class="h-5"></div>${U.table(["案件", "类型", "涉及金额", "SLA", "状态"], [[`<a class="link" href="/moderation/coins/cases/CC-041">CC-041</a>`, "环形互赠", "84", "剩余 18 小时", U.badge("调查中", "warning")], [`<a class="link" href="/moderation/coins/cases/CC-039">CC-039</a>`, "悬赏强关联", "100", "剩余 31 小时", U.badge("待分派")], [`<a class="link" href="/moderation/coins/cases/CC-035">CC-035</a>`, "账户接管", "50", "已完成", U.badge("已释放", "success")]])}`;
  }

  function coinModerationDetailPage(id) {
    return U.breadcrumb([{ label: "金币风险案件", href: "/moderation/coins" }, { label: id }]) + `<div class="mt-3">${pageHeader(`案件 ${id}`, "环形互赠 · 84 金币已转风控保留")}</div>` + U.panel({ title: "证据摘要", body: `<ul class="list-disc space-y-2 pl-5"><li>4 个账户在 18 分钟内形成闭环感谢。</li><li>相关内容的公开语义相似度异常高。</li><li>设备与网络风险存在强关联；具体阈值不对用户公开。</li></ul>` }) + `<div class="h-5"></div>${U.panel({ title: "相关分录", body: U.table(["journal", "时间", "借方", "贷方", "金额"], [["J-8842", "14:06", "USER_HELD:A", "USER_AVAILABLE:A", "24"], ["J-8843", "14:07", "USER_HELD:B", "USER_AVAILABLE:B", "20"], ["J-8844", "14:08", "USER_HELD:C", "USER_AVAILABLE:C", "40"]]), footer: `<div class="flex justify-end gap-2">${U.button("建议释放", { action: "recommend-release" })}${U.button("建议追回", { action: "recommend-recovery", kind: "primary" })}</div>` })}`;
  }

  function coinControlPage() {
    return pageHeader("金币控制台", "Controller 管理预算与规则版本；任何变更都需要独立审批。") + U.summary([{ title: "本期系统预算", value: "62,000", desc: "已使用 71%" }, { title: "待结算", value: "8,420", desc: "72 小时观察期" }, { title: "人工调整", value: "0.04%", desc: "控制线 < 0.10%" }, { title: "规则版本", value: "v1.0.0", desc: "下次复核 7 月 31 日" }]) + `<div class="h-5"></div>${U.panel({ title: "变更申请", body: `${U.field("变更类型", U.select([{ label: "预算上限" }, { label: "奖励参数" }, { label: "沉淀参数" }, { label: "紧急停止" }]))}${U.field("依据与预测影响", U.textarea('placeholder="说明旧值、新值、供给预测和停止条件"'))}`, footer: U.button("提交独立审批", { action: "submit-coin-control", kind: "primary" }) })}<div class="h-5"></div>${U.panel({ title: "待审批人工调整", body: U.list([U.listRow(`<div class="list-col-grow"><a class="font-bold hover:underline" href="/admin/coins/adjustments/ADJ-1042">ADJ-1042 · 平台事故补偿</a><p class="mt-1 text-sm opacity-65">10 金币 · 发起人 Controller D-04</p></div>${U.badge("等待独立审批", "warning")}`)], { framed: false }), bodyClass: "p-0" })}`;
  }

  function coinReconciliationPage() {
    return pageHeader("金币对账与关账", "每日三方核对钱包快照、业务对象和不可变子账。") + U.alert("发现非零借贷差或负可用余额时，立即停止金币写入；核心社区功能继续可用。", "warning") + `<div class="h-5"></div>${U.table(["核对项目", "账面", "支持明细", "差异", "状态"], [["用户四类余额", "184,260", "184,260", "0", U.badge("已核对", "success")], ["累计发行 - 销毁", "184,260", "184,260", "0", U.badge("已核对", "success")], ["开放悬赏托管", "12,840", "12,840", "0", U.badge("已核对", "success")], ["风控保留", "1,142", "1,142", "0", U.badge("待复核", "warning")]])}<div class="mt-5">${U.panel({ title: "7 月关账", body: U.steps([{ label: "冻结快照", active: true }, { label: "调节完成", active: true }, { label: "Controller 复核", active: true }, { label: "独立批准", active: false }]), footer: U.button("提交关账审批", { action: "close-coin-period", kind: "primary" }) })}</div>`;
  }

  function coinAdjustmentPage(id) {
    return U.breadcrumb([{ label: "金币控制台", href: "/admin/coins/control" }, { label: `调整单 ${id}` }]) + `<div class="mt-3">${pageHeader(`人工调整 ${id}`, "平台事故补偿 · 等待独立审批")}</div>` + U.panel({ title: "调整依据", body: `<dl class="grid gap-3 sm:grid-cols-2"><div><dt class="opacity-60">关联事故</dt><dd class="font-bold">INC-2026-0711</dd></div><div><dt class="opacity-60">影响期</dt><dd class="font-bold">2026-07</dd></div><div><dt class="opacity-60">发起人</dt><dd class="font-bold">Controller D-04</dd></div><div><dt class="opacity-60">审批人</dt><dd class="font-bold">待指派（不可同人）</dd></div></dl>` }) + `<div class="h-5"></div>${U.panel({ title: "拟议双重分录", body: U.table(["方向", "科目", "金额"], [["借", "USER_AVAILABLE:U-1042", "10"], ["贷", "SYSTEM_RECOVERY:INC-2026-0711", "10"]]), footer: `<div class="flex justify-end gap-2">${U.button("退回补充", { action: "return-adjustment" })}${U.button("批准并执行", { action: "approve-adjustment", kind: "primary" })}</div>` })}`;
  }


  Object.assign(X.pages, { coinPage, coinLedgerPage, coinBountiesPage, coinRulesPage, coinBountyDetailPage, coinEconomyPage, coinSettingsPage, coinModerationPage, coinModerationDetailPage, coinControlPage, coinReconciliationPage, coinAdjustmentPage });
})();
