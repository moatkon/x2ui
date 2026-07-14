(function () {
  const X = window.X2App;
  const { U, state, posts, nodes, coinLedger, quests, mockWrite, link, nodeFromSlug, hashParams, childFromSlug, selectedNodePath, nodeMenuItem, nodeBrowseControl, nodeGuideRail, meta, postRow, pageHeader, sectionTabs, settingsTabs, coinTabs, playTabs, rail, shell } = X;
  const { feedPage, nodesPage, nodePage, postPage, searchPage, tagsPage, userPage, authPage, composePage, quickComposePage, draftsPage, simplePostListPage, notificationsPage, settingsPage, reportsPage, reportFormPage, blockedPage, appealsPage, moderationPage, casePage, auditPage, forbiddenPage, verifyResultPage, authRecoveryPage, reportDetailPage, mePage, changePasswordPage, appealNewPage, appealDetailPage, moderationAppealsPage, coinPage, coinLedgerPage, coinBountiesPage, coinRulesPage, coinBountyDetailPage, coinEconomyPage, coinSettingsPage, coinModerationPage, coinModerationDetailPage, coinControlPage, coinReconciliationPage, coinAdjustmentPage, questRow, playPage, questsPage, questDetailPage, journeyPage, teamsPage, journeyOnboardingPage, contributionsPage, collectionPage, seasonsPage, seasonDetailPage, nodeProjectPage, journeySettingsPage, journeyStatesPage, statesPage, notFoundPage } = X.pages;
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
    return location.pathname === "/" ? "/feed" : location.pathname;
  }
  function navigate(destination, options = {}) {
    const url = new URL(destination, location.href);
    if (url.origin !== location.origin) {
      location.href = url.href;
      return;
    }
    const next = `${url.pathname}${url.search}${url.hash}`;
    const current = `${location.pathname}${location.search}${location.hash}`;
    if (next !== current) history[options.replace ? "replaceState" : "pushState"]({}, "", next);
    render();
    if (url.hash) requestAnimationFrame(() => document.querySelector(url.hash)?.scrollIntoView());
  }
  function render() {
    const route = currentRoute();
    const auth = authRoutes.has(route);
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
    const anchor = e.target.closest("a[href]");
    if (anchor && !target && !anchor.hasAttribute("download") && (!anchor.target || anchor.target === "_self") && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
      const url = new URL(anchor.href, location.href);
      if (url.origin === location.origin && url.pathname.startsWith("/")) {
        e.preventDefault();
        navigate(url.href);
        return;
      }
    }
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
      navigate(`/compose?${params}`);
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
      setTimeout(() => navigate("/feed"), 450);
    }
    if (action === "toggle-auth") { state.loggedIn = !state.loggedIn; localStorage.setItem("x2post-demo-auth", state.loggedIn ? "in" : "out"); toast(state.loggedIn ? "已切换为登录用户" : "已切换为访客", "info"); render(); }
    if (action === "toggle-follow") { if (!requireLogin()) return; state.following = !state.following; toast(state.following ? "已关注" : "已取消关注"); render(); }
    if (action === "toggle-bookmark") { if (!requireLogin()) return; state.bookmarked = !state.bookmarked; void mockWrite(state.bookmarked ? "PUT" : "DELETE", "/users/me/bookmarks/immutable-content").catch(error => toast(error.message, "error")); toast(state.bookmarked ? "已加入收藏" : "已取消收藏"); render(); }
    if (action === "toggle-react") { if (!requireLogin()) return; state.reacted = !state.reacted; void mockWrite(state.reacted ? "PUT" : "DELETE", "/posts/immutable-content/reactions/AGREE").catch(error => toast(error.message, "error")); toast(state.reacted ? "已表达认同" : "已撤销反应"); render(); if (state.reacted) dialog(`<h2 class="text-xl font-bold">已加入聚合信号</h2><p class="mt-2 opacity-70">这个信号可以撤回，不会生成独立内容，也不会获得金币或共建进度。</p><div class="mt-4">${U.alert("补一句你的具体情况，会成为可回复的公开评论；发布前仍需确认。", "info")}</div><div class="modal-action"><button class="btn" type="button" onclick="document.getElementById('app-dialog').close()">只表达认同</button><button class="btn btn-primary" type="button" data-action="signal-add-reason">补一句理由</button></div>`); }
    if (action === "signal-add-reason") { document.getElementById("app-dialog").close(); const editor = document.getElementById("comment-input"); if (editor) { editor.value = "我也有类似感受，具体情况是："; editor.focus(); editor.scrollIntoView({ behavior: "smooth", block: "center" }); } }
    if (action === "open-report") navigate("/report/new");
    if (action === "block-user") dialog(`<h2 class="text-xl font-bold">屏蔽 @linmo？</h2><p class="mt-3 opacity-70">屏蔽后，你们将较少在 Feed、搜索、提及和通知中看到彼此。对方不会收到通知。</p><div class="modal-action"><button class="btn" onclick="document.getElementById('app-dialog').close()">取消</button><button class="btn btn-primary" data-action="confirm-block" onclick="document.getElementById('app-dialog').close()">确认屏蔽</button></div>`);
    if (action === "confirm-block") toast("已屏蔽此用户");
    if (action === "coin-thanks") dialog(`<h2 class="text-xl font-bold">用金币感谢这份贡献？</h2><p class="mt-3 opacity-70">固定成本 2：作者获得 1，另外 1 永久销毁。感谢不会影响排序、曝光或治理权。</p><div class="mt-4">${U.alert("可用余额 286 · 同一内容只能感谢一次 · 每日最多 5 次", "info")}</div><div class="modal-action"><button class="btn" onclick="document.getElementById('app-dialog').close()">取消</button><button class="btn btn-primary" data-action="confirm-coin-thanks" onclick="document.getElementById('app-dialog').close()">确认花费 2</button></div>`);
    if (action === "confirm-coin-thanks") toast("感谢已入账：作者 +1，系统销毁 1");
    if (action === "create-bounty") dialog(`<h2 class="text-xl font-bold">为问题设置悬赏</h2><p class="mt-2 opacity-70">金币进入托管；发布满 24 小时后可采纳，答主获得 80%，20% 销毁。</p><fieldset class="fieldset mt-4"><legend class="fieldset-legend">固定档位</legend><div class="join"><input class="btn join-item" type="radio" name="bounty-amount" aria-label="20" checked/><input class="btn join-item" type="radio" name="bounty-amount" aria-label="50"/><input class="btn join-item" type="radio" name="bounty-amount" aria-label="100"/></div><p class="label">可用余额 286 · 同一帖子只能有一个开放悬赏</p></fieldset><div class="modal-action"><button class="btn" onclick="document.getElementById('app-dialog').close()">取消</button><button class="btn btn-primary" data-action="confirm-bounty" onclick="document.getElementById('app-dialog').close()">确认托管</button></div>`);
    if (action === "confirm-bounty") { toast("悬赏已创建，金币已进入托管"); setTimeout(() => navigate("/coins/bounties"), 400); }
    if (action === "accept-bounty") dialog(`<h2 class="text-xl font-bold">采纳这个回答？</h2>${U.alert("50 托管金币将结算：答主获得 40，系统销毁 10。采纳后用户不能自行撤销。", "warning")}<div class="modal-action"><button class="btn" onclick="document.getElementById('app-dialog').close()">返回检查</button><button class="btn btn-primary" data-action="confirm-accept-bounty" onclick="document.getElementById('app-dialog').close()">确认采纳</button></div>`);
    if (action === "confirm-accept-bounty") toast("悬赏已结算：答主 +40，系统销毁 10");
    if (action === "coin-dispute") toast("已打开金币交易申诉流程", "info");
    if (action.startsWith("reply-")) { if (!requireLogin()) return; const id = action; const box = document.getElementById(id); box.classList.toggle("hidden"); box.innerHTML = box.classList.contains("hidden") ? "" : `${U.field("回复内容", U.textarea('placeholder="回复提交后不能编辑或删除"'))}<div class="mt-2 flex justify-end">${U.button("提交回复", { action: "submit-reply", kind: "primary", size: "sm" })}</div>`; }
    if (action === "submit-comment") { if (!requireLogin()) return; const editor = document.getElementById("comment-input"); if (!editor?.value.trim()) { editor?.focus(); toast("先写下一句真实回应", "info"); return; } dialog(`<h2 class="text-xl font-bold">确认发布这条回应</h2><div class="card card-border mt-4"><div class="card-body"><p class="leading-relaxed">${U.esc(editor.value.trim())}</p></div></div><div class="mt-4">${U.alert("评论提交后不能编辑、删除或撤回。请确认这是你要公开留下的完整内容。", "warning")}</div><div class="modal-action"><button class="btn" type="button" onclick="document.getElementById('app-dialog').close()">返回修改</button><button class="btn btn-primary" type="button" data-action="complete-quick-comment">确认发布回应</button></div>`); return; }
    if (action === "complete-quick-comment") { const editor = document.getElementById("comment-input"); void mockWrite("POST", "/posts/immutable-content/comments", { bodyMarkdown: editor?.value.trim() || "演示回应", confirmedImmutable: true }, { idempotent: true }).catch(error => toast(error.message, "error")); document.getElementById("app-dialog").close(); toast("回应已提交，正在定位到新评论"); }
    if (action === "submit-reply") { if (!requireLogin()) return; toast("已提交，正在定位到新回复"); }
    if (action === "save-draft") toast("草稿已保存");
    if (action === "preview-post") dialog(`<h2 class="text-xl font-bold">帖子预览</h2><p class="mt-3 opacity-70">预览会使用与正式发布相同的安全 Markdown 渲染规则。</p><div class="mt-4 border-y-2 border-base-content/20 py-4"><h3 class="text-2xl font-black">怎样建立一个友善的提问模板</h3><p class="mt-3">先说清背景，再指出已经尝试过什么，最后提出一个可以回应的具体问题。</p></div>`);
    if (action === "confirm-publish") dialog(`<h2 class="text-xl font-bold">确认发布？</h2>${U.alert("发布后不能编辑、删除或撤回。请确认标题、正文、节点与附件无误。", "warning")}<div class="modal-action"><button class="btn" onclick="document.getElementById('app-dialog').close()">返回检查</button><a class="btn btn-primary" href="/posts/immutable-content" onclick="document.getElementById('app-dialog').close()">确认并发布</a></div>`);
    if (["read-all", "save-settings", "revoke-session", "revoke-all", "unblock", "discard-draft", "retry", "toast-react"].includes(action)) toast({ "read-all": "已将全部通知标为已读", "save-settings": "设置已保存", "revoke-session": "设备会话已撤销", "revoke-all": "其他会话已全部撤销", "unblock": "已解除屏蔽", "discard-draft": "草稿已放弃", retry: "正在重新加载", "toast-react": "已表达认同" }[action]);
    if (action.startsWith("read-") && action !== "read-all") toast("已标为已读");
    if (action.startsWith("page-")) toast(action === "page-prev" ? "已经是第一页" : "已切换分页（静态演示）", "info");
    if (action === "submit-report") { void mockWrite("POST", "/reports", { target: { type: "POST", id: "immutable-content" }, reason: "OTHER", details: "静态原型演示举报", evidenceUploadIds: [], truthfulConfirmation: true }, { idempotent: true }).catch(error => toast(error.message, "error")); toast("举报已提交，可在“我的举报”查看进度"); setTimeout(() => navigate("/reports"), 500); }
    if (action === "resume-bookmark") { state.bookmarked = true; toast("原任务已恢复：帖子已收藏"); setTimeout(() => navigate("/posts/immutable-content"), 500); }
    if (action === "change-password") { toast("密码已更新，可检查并撤销其他设备会话"); setTimeout(() => navigate("/settings/sessions"), 500); }
    if (action === "submit-appeal") { toast("申诉已提交"); setTimeout(() => navigate("/appeals/AP-2026-0042"), 500); }
    if (action === "appeal-note") dialog(`<h2 class="text-xl font-bold">补充申诉说明</h2><div class="mt-4">${U.field("补充内容", U.textarea('placeholder="只补充与复核有关的新事实"'))}</div><div class="modal-action"><button class="btn btn-primary" onclick="document.getElementById('app-dialog').close()">保存补充</button></div>`);
    if (action === "new-appeal") dialog(`<h2 class="text-xl font-bold">发起申诉</h2><div class="mt-4">${U.field("关联处置", U.select([{ label: "请选择可申诉记录" }, { label: "帖子锁定 · 7 月 10 日" }, { label: "账户限流 · 5 月 3 日" }]))}${U.field("申诉说明", U.textarea('placeholder="说明你认为需要复核的事实或上下文"'))}</div><div class="modal-action"><button class="btn btn-primary" onclick="document.getElementById('app-dialog').close()">提交申诉</button></div>`);
    if (action.startsWith("moderate-")) toast("已选择治理动作，请填写理由并确认", "info");
    if (action === "moderate-confirm") toast("治理动作已执行并写入审计日志");
    if (action === "start-quest") dialog(`<h2 class="text-xl font-bold">开始共建任务</h2><p class="mt-3 opacity-70">任务会保存来源帖子和进度，但不会自动发布评论、帖子或举报。每周最多激活 3 个任务，最多产生 5 个质量候选事件。</p><div class="modal-action"><button class="btn" onclick="document.getElementById('app-dialog').close()">稍后再说</button><a class="btn btn-primary" href="/posts/immutable-content" onclick="document.getElementById('app-dialog').close()">进入真实主题</a></div>`);
    if (action === "join-team") toast("已提交加入申请；节点协作不会创建私聊或权力等级");
    if (action === "view-team") toast("你已在这个节点协作局中", "info");
    if (action === "finish-onboarding") { toast("旅程偏好已保存"); setTimeout(() => navigate("/quests"), 450); }
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
    if (e.target.dataset.form === "auth") {
      e.preventDefault();
      const type = e.target.dataset.authType;
      const requests = {
        login: ["/auth/sessions", { login: "linmo@example.com", password: "prototype-only" }],
        register: ["/auth/registrations", { userName: "linmo", email: "linmo@example.com", password: "prototype-only" }],
        verify: ["/auth/email-verifications", { token: "mock-verification-token" }],
        forgot: ["/auth/password-reset-deliveries", { email: "linmo@example.com" }],
        reset: ["/auth/password-resets", { token: "mock-reset-token", newPassword: "prototype-only" }]
      };
      const [endpoint, payload] = requests[type] || requests.login;
      void mockWrite("POST", endpoint, payload, { idempotent: true }).then(() => {
        state.loggedIn = type !== "forgot";
        localStorage.setItem("x2post-demo-auth", state.loggedIn ? "in" : "out");
        if (type === "forgot") { toast("如果邮箱已注册，将收到重置说明"); navigate("/verify-email"); }
        else if (type === "verify") { toast("邮箱已验证"); navigate("/verify-email/result"); }
        else if (type === "reset") { toast("密码已更新，请重新登录"); navigate("/login"); }
        else { toast(type === "register" ? "账号已创建，请验证邮箱" : "登录成功，正在恢复来源任务"); navigate(type === "register" ? "/verify-email" : "/auth/recover-task"); }
      }).catch(error => toast(error.message, "error"));
    }
    if (e.target.dataset.form === "search") { e.preventDefault(); toast("已更新搜索结果", "info"); }
  });
  function requireLogin() { if (state.loggedIn) return true; sessionStorage.setItem("x2post-resume", `${location.pathname}${location.search}`); toast("请先登录，来源和输入已保存", "info"); setTimeout(() => navigate("/auth/login"), 350); return false; }
  window.addEventListener("popstate", render);
  render();
})();
