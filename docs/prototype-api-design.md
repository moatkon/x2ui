# X2Post 原型功能与领域 API 设计

> 状态：API 设计基线（依据 `prototype/assets/app.js`，2026-07-14）  
> 目标：覆盖当前原型全部业务页面；API 单一职责、读写分离、领域边界明确。本文不是把页面后端化为“大页面 API”，也不承诺实现尚未评审的金币/旅程能力。

## 1. 结论与现状差距

原型已包含基础社区、认证、账户安全、治理、金币子账和社区旅程六大产品面。生产 API 应按领域资源与命令建模，不应按页面做万能聚合写接口。页面可由 BFF/前端并行组合多个查询，但领域服务各自拥有事实源。

当前 `openapi.json` 是旧后端起点，而不是目标契约。它只有 **11 个 path、11 个 operation**：评论创建/列表，帖子创建/详情/列表，用户详情/帖子/评论，以及登录/登出/注册。它还缺少 `/api/v1`、节点、草稿、互动、搜索、通知、设置、设备会话、举报/申诉/治理、金币、旅程，以及本文规定的幂等、游标、权限和并发语义。不能在这 11 个旧接口上继续堆可选字段或 `actionType`。

必须纠正已有候选：

- 删除候选 `POST /api/v1/moderation/cases/{id}/actions`。可见性、评论锁、用户处置、申诉裁决是四类独立命令和审计资源，见 M06–M09。
- UI 的 `save-settings` 不是 API。资料、隐私、通知、金币、旅程偏好分别 PATCH 自己的资源，分别使用 ETag。
- Controller 不得使用“提交金币控制”宽命令。预算变更、规则版本、人工调整、对账运行、关账申请分别建模；发起、批准、退回分离。
- 不提供 `POST /quests/{id}/settle` 或通用“任务结算”接口。旅程服务消费真实社区事件，CXP、NCP、金币候选各自记账；金币服务独立核验。
- 节点目录是只读领域：无 Node POST/PATCH/DELETE，节点和两层父子关系只由版本化 SQL 维护。
- 已发布帖子、评论不可 PATCH/DELETE/撤回；治理只能改变可见性投影或评论锁，不能改写原文。

## 2. 原型页面与功能覆盖矩阵

“主要 API”引用第 5 节编号。`—` 表示纯前端/验收页面，不需要业务 API。别名共享同一契约，服务端 canonical URL 不复制资源。

| 原型路由（含别名） | 页面/功能 | 主要 API |
|---|---|---|
| `/`, `/feed?node=&subnode=` | 最新 Feed、父/子节点筛选、空态/非法筛选恢复、分页、轻发布入口 | D01, N01–N03 |
| `/nodes` | 两层节点目录、规则、统计 | N01 |
| `/nodes/{parent}` | 父节点聚合、子节点列表、规则、关注 | N02, D01, R05–R06 |
| `/nodes/{parent}/{child}` | 子节点详情、同级切换、帖子、直接关注 | N03, D01, R05–R06 |
| `/nodes/{slug}/project` | 节点公开项目、任务、加入申请 | J14–J17 |
| `/posts/{postId}` | 不可变正文、评论/回复、反应、收藏、感谢、悬赏、举报 | C06–C10b, R01–R04, K05q–K07, S01 |
| `/search?q=&type=` | 帖子/用户/节点/标签独立搜索、两层节点过滤、排序 | D03–D06 |
| `/tags`, `/tags/{slug}` | 标签目录、跨节点帖子 | D07–D08 |
| `/users/{userName}` (`/user/*`) | 公开资料、关注/屏蔽/举报 | P01, R07–R10, S01, S05 |
| `/users/{userName}/posts` | 用户公开帖子 | P02 |
| `/users/{userName}/comments` | 用户公开评论与原帖上下文 | P03 |
| `/users/{userName}/followers` | 粉丝列表 | R09 |
| `/users/{userName}/following` | 关注用户/节点分区 | R10 |
| `/login`, `/auth/login` | 登录与来源任务恢复前置 | A02 |
| `/register`, `/auth/register` | 注册 | A01 |
| `/verify-email`, `/auth/verify` | 验证、重发 | A05–A06 |
| `/verify-email/result` | 验证结果 | A05 |
| `/forgot-password`, `/auth/forgot` | 安全一致的找回响应 | A07 |
| `/reset-password`, `/auth/reset` | 令牌重置并撤销旧会话 | A08 |
| `/auth/recover-task` | 恢复登录前的来源/输入，由客户端持有恢复意图 | A02；随后调用目标动作 API |
| `/me` | 本人概要、统计、快捷入口 | P04 |
| `/quick-compose` | Markdown 轻发布、选择节点、转长文、不可变确认 | C01, C05；转长文仅客户端传值 |
| `/compose?draft=&from=quick` | 草稿、自动保存、节点/标签/附件、预览、发布 | C01–C05, C11–C13 |
| `/drafts` | 草稿列表、新建、继续、放弃 | C01–C04 |
| `/bookmarks` | 收藏列表、取消收藏 | R01–R02 |
| `/following` | 关注用户/节点的时间序 Feed | D02 |
| `/notifications` | 类型/未读筛选、单条已读、全部已读 | O01–O04 |
| `/settings/profile` | 公开资料编辑与冲突恢复 | P05–P06 |
| `/settings/privacy` | 隐私偏好 | P07–P08 |
| `/settings/notifications` | 社区通知偏好 | O05–O06 |
| `/settings/security` | 邮箱验证状态、安全概要 | A03, P04 |
| `/settings/security/password` | 修改密码 | A09 |
| `/settings/sessions` | 会话列表、撤销单个/其他全部 | A03–A04 |
| `/settings/blocked`, `/blocked` | 屏蔽列表、解除屏蔽 | S05–S07 |
| `/report/new` | 举报帖子/评论/用户 | S01 |
| `/reports`, `/me/reports` | 本人举报列表 | S02 |
| `/me/reports/{reportId}` | 举报安全摘要与时间线 | S03 |
| `/appeals` | 本人申诉列表、可申诉处置 | S08, S10 |
| `/appeals/new` | 针对一个处置提交申诉 | S09 |
| `/appeals/{appealId}` | 申诉详情、允许时补充说明 | S10–S11 |
| `/moderation`, `/moderation/cases` | 审核队列、风险/SLA/状态筛选 | M01 |
| `/moderation/cases/{caseId}` | 只读案件上下文和四类独立治理动作 | M02, M06–M08 |
| `/moderation/appeals` | 申诉复核队列 | M03 |
| `/moderation/audit`, `/moderation/audit-logs` | 不可变审计日志 | M04 |
| `/coins` | 四类余额、周额度、最近变动 | K01–K02 |
| `/coins/ledger` | 个人不可变账本筛选/翻页 | K02–K03 |
| `/coins/rules` | 当前规则与版本历史 | K04 |
| `/coins/bounties` | 本人发起/回答/结算/到期悬赏 | K06–K08 |
| `/coins/bounties/{bountyId}` | 托管、时间线、采纳、取消、申诉 | K08–K11 |
| `/coins/economy` | 公共经济透明度与 CSV | K13–K14 |
| `/settings/coins` | 金币通知/展示/二次验证偏好 | K15–K16 |
| `/moderation/coins` | 金币风险案件队列（只调查） | KM01 |
| `/moderation/coins/cases/{caseId}` | 证据、journal、释放或追回建议 | KM02–KM04 |
| `/admin/coins/control` | 预算、规则版本、调整待审批 | KA01–KA08 |
| `/admin/coins/reconciliation` | 对账运行、差异、关账申请 | KA09–KA13 |
| `/admin/coins/adjustments/{id}` | 调整依据/分录，独立批准或退回 | KA06–KA08 |
| `/journey`, `/play` | 共建大厅、摘要、当前旅程、推荐任务 | J01–J03 |
| `/journey/onboarding` | 可选贡献偏好 | J04–J05 |
| `/quests`, `/play/quests` | 任务板筛选 | J02 |
| `/quests/{id}`, `/play/quests/{id}` | 任务详情、开始/继续/暂停/替换 | J03, J06–J09 |
| `/me/progress`, `/play/journey` | 成长路径、周记录 | J10 |
| `/me/contributions` | 可追溯贡献与质量状态 | J11–J12 |
| `/me/collection` | 非交易收藏、逐项展示设置 | J13a, J13 |
| `/play/teams` | 节点协作列表、加入/退出 | J14, J16–J17 |
| `/seasons`, `/seasons/{slug}` | 主题季列表/详情/归档成果 | J18–J19 |
| `/settings/journey` | 摘要/推荐/公开展示偏好；独立暂停/恢复 | J20–J23 |
| `/journey/states`, `/prototype/states` | Loading/Empty/Partial/401/403/404/409/429 等验收样例 | — |
| `/403`, 未匹配路由 | 权限页与安全 404 | —（由各 API 的 403/404 驱动） |

原型交互还包含：主题切换、Drawer/Dropdown/Dialog、登录拦截与任务恢复、分页、回复起句模板、不可变发布确认、草稿冲突、上传失败、金币确认/采纳、旅程休息。纯展示交互不应制造服务端 API；所有真实写入均在下文有独立命令。

## 3. 领域与聚合边界

| 限界上下文 | 聚合/事实源 | 负责 | 明确不负责 |
|---|---|---|---|
| Identity | Account, Session, VerificationChallenge, PasswordReset | 凭证、会话、邮箱验证、会话撤销 | 公开资料、通知偏好 |
| Profile | UserProfile, PrivacyPreferences | 公开/私有 DTO、资料和隐私版本 | 关注、屏蔽、权限角色 |
| Taxonomy | Node（含二级节点）, Tag | 只读分类、规则、发帖能力 | 产品 API 修改节点；关注关系 |
| Content | Draft, Upload, ImmutablePost, ImmutableComment | 草稿可改；发布原文不可变；附件归属 | 可见性处置、奖励结算 |
| Discovery | Feed/Search read models | Feed、搜索、标签聚合投影 | 持有帖子/用户事实 |
| Social Graph | FollowEdge, Bookmark, Reaction | 用户/节点关注、收藏、可撤反应 | 屏蔽（属于 Safety） |
| Notification | Notification, NotificationPreferences | 通知投递、已读游标、社区通知偏好 | 账户安全事件的事实判定 |
| Safety | Report, BlockEdge, Appeal | 举报进度、屏蔽、用户申诉 | 执行审核员处置 |
| Moderation | Case, VisibilityDecision, CommentLockDecision, UserSanction, AppealDecision, AuditEntry | 案件、独立治理决定、不可变审计 | 改写/删除内容；直接改金币 |
| Coin Ledger | WalletAccount, Journal, LedgerEntry, Bounty, CoinDispute | 双重记账、托管、结算、冲正 | 内容排序、治理权、任务质量判定 |
| Coin Risk | CoinRiskCase, ReleaseRecommendation, RecoveryRecommendation | 调查和建议 | 写余额或批准调整 |
| Coin Control | BudgetVersion, RuleVersion, ManualAdjustment, ReconciliationRun, PeriodClose | 预算/规则/对账/关账和双人审批 | 单人发起并批准；更新历史分录 |
| Journey | QuestDefinition, QuestEnrollment, Contribution, CxpEntry, ProjectParticipation, Season | 可选任务、贡献进度、CXP/NCP 投影 | 发布内容；直接结算金币 |

聚合间只传稳定 ID 和版本化事件，不共享可写表。Feed/BFF 可组合公开投影；Coin/Moderation 管理接口必须独立授权与审计。Node 的“关注”是 Social Graph 写入，不破坏 NodeApi 只读约束。

## 4. 通用契约

### 4.1 协议与读写约束

- 目标前缀 `/api/v1`；JSON 字段使用 `camelCase`；时间为 UTC RFC 3339；金额为整数且 `unit=X2_COIN`。
- 第 5 节表格为便于阅读省略公共前缀；其中每一个 `/...` 路径都应解释为 `/api/v1/...`。
- 查询只返回 DTO，不产生业务副作用。Feed/评论/通知/账本用稳定游标：`items,nextCursor,hasMore`；后台队列可 `page,pageSize,total`。
- 写入成功返回被创建资源/最新状态，不返回整页聚合。创建用 `201`，幂等状态设定用 `PUT`，局部配置用 `PATCH`，删除关系用 `DELETE`，高后果决定创建独立子资源用 `POST`。
- 关键创建/高后果命令要求 `Idempotency-Key`：注册、发布、评论、举报、申诉、金币写入、任务开始、治理决定、Controller 申请/审批。相同 key+相同 payload 返回首次结果；相同 key+不同 payload 返回 `409 IDEMPOTENCY_KEY_REUSED`。
- 可编辑资源返回 `ETag`/`version`，PATCH/DELETE 要求 `If-Match`；版本不符返回 `412 VERSION_MISMATCH` 及最新摘要。余额和分录不使用客户端版本覆盖，而在事务内按固定顺序锁账户。
- 统一错误：`{code,message,fieldErrors,requestId,retryAfterSeconds?,currentVersion?}`；区分 401、403、404、409、412、422、429。404 可用于隐私安全隐藏，不泄露资源存在性。
- 匿名公开 DTO 永不包含 `email`、内部角色、风控、私有 viewer state。登录态可附最小 `viewerState` 与 `permissions`，但服务端仍做授权。

### 4.2 权限与语义缩写

以下表中：`公`=匿名可读，`登`=登录，`本人`=资源本人，`审`=内容治理，`币审`=金币调查，`控`=Controller，`批`=独立审批，`审计`=只读审计。`I`=Idempotency-Key，`V`=If-Match，`S`=集合式 PUT/DELETE 天然幂等，`L`=账本事务/唯一业务键，`R`=只读。

关键输入输出只列业务字段；所有响应还含 `requestId`，分页查询还含游标或页码元数据。

## 5. API 目录

### 5.1 Identity（A）与 Profile（P）

| ID | Method / Path | 单一职责与关键输入 → 输出 | 权限 | 语义 |
|---|---|---|---|---|
| A01 | `POST /auth/registrations` | `userName,email,password` → account/verification 状态 | 公 | I；邮箱存在也用安全响应 |
| A02 | `POST /auth/sessions` | `login,password` → access/refresh/session；不接收业务动作 | 公 | I、登录限流 |
| A03 | `GET /auth/sessions` | 当前账号设备会话列表 | 本人 | R |
| A04 | `DELETE /auth/sessions/{sessionId}` | 撤销一个指定会话 | 本人 | S；撤销当前会话需再认证 |
| A04b | `POST /auth/other-session-revocations` | 创建一次“撤销当前会话之外全部会话”的批量撤销记录 | 本人 | I；高风险时再认证 |
| A05 | `POST /auth/email-verifications` | `token` → 验证结果 | 公 | I；token 单次消费 |
| A06 | `POST /auth/email-verification-deliveries` | 请求重发验证邮件 → 脱敏目标/冷却时间 | 登 | I、429 |
| A07 | `POST /auth/password-reset-deliveries` | `email` → 统一安全成功文案 | 公 | I、限流、不枚举账户 |
| A08 | `POST /auth/password-resets` | `token,newPassword` → reset/sessionRevocation 状态 | 公 | I；token 单次消费 |
| A09 | `PUT /users/me/password` | `currentPassword,newPassword` → 修改时间 | 本人 | I；撤销其他会话 |
| A10 | `POST /auth/session-refreshes` | `refreshToken` → 轮换后的 token | 公/持 token | refresh family 防重放 |
| A11 | `DELETE /auth/current-session` | 登出当前会话 | 登 | S |
| P01 | `GET /users/{userName}` | 公开资料、公开统计、最小 viewerState | 公 | R、公开缓存按鉴权隔离 |
| P02 | `GET /users/{userName}/posts` | 该用户公开帖子 | 公 | R、cursor |
| P03 | `GET /users/{userName}/comments` | 公开评论及原帖摘要 | 公 | R、cursor |
| P04 | `GET /users/me/summary` | 私有概要、邮箱验证/内容/关系计数 | 本人 | R、no-store |
| P05 | `GET /users/me/profile` | 可编辑资料和 ETag | 本人 | R |
| P06 | `PATCH /users/me/profile` | 仅 `displayName,bio,location,avatarUploadId` → 最新资料 | 本人 | V；不含隐私/通知 |
| P07 | `GET /users/me/privacy-preferences` | 隐私偏好和 ETag | 本人 | R |
| P08 | `PATCH /users/me/privacy-preferences` | `mentionable,showFollowing,indexPublicProfile` → 最新偏好 | 本人 | V；不含屏蔽关系 |

### 5.2 Taxonomy、Content 与 Discovery（N/C/D）

| ID | Method / Path | 单一职责与关键输入 → 输出 | 权限 | 语义 |
|---|---|---|---|---|
| N01 | `GET /nodes` | 两层节点目录、规则版本、统计 | 公 | R；无写 API |
| N02 | `GET /nodes/{parentSlug}` | 一级节点、子节点摘要、发帖能力 | 公 | R |
| N03 | `GET /nodes/{parentSlug}/children/{childSlug}` | 二级节点详情与继承规则 | 公 | R；严格验证父子归属 |
| C01 | `POST /drafts` | 创建空/带入轻发布内容的草稿 → draft+ETag | 本人 | I |
| C02 | `GET /drafts` | 本人草稿列表 | 本人 | R、cursor |
| C03 | `GET /drafts/{draftId}` / `PATCH /drafts/{draftId}` | 读取；修改标题/正文/节点/标签/附件引用 | 本人 | R/V；仅未发布草稿 |
| C04 | `DELETE /drafts/{draftId}` | 放弃一个未发布草稿 | 本人 | V+S |
| C05 | `POST /drafts/{draftId}/publications` | 将一个草稿原子发布为不可变帖子 → post/location | 本人 | I+V；草稿只可成功发布一次 |
| C06 | `POST /posts` | 直接发布轻内容 `body,nodePath` → immutable post | 本人 | I；服务端验证节点/Markdown |
| C07 | `GET /posts/{postId}` | 帖子正文、作者/节点摘要、计数、权限 | 公 | R |
| C08 | `GET /posts/{postId}/comments` | 顶层评论时间序列表 | 公 | R、cursor |
| C08b | `GET /comments/{commentId}/replies` | 一个根/父评论的直接回复列表 | 公 | R、cursor；返回稳定定位键 |
| C09 | `POST /posts/{postId}/comments` | 创建顶层不可变评论 `body` → comment | 登 | I；锁帖时 409 |
| C10 | `POST /comments/{commentId}/replies` | 创建不可变回复 `body` → reply | 登 | I；根/父上下文服务端固定 |
| C10b | `GET /comments/{commentId}/context` | 获取评论、父链、原帖摘要与可定位游标 | 公 | R；隐藏节点使用安全占位 |
| C11 | `POST /markdown-previews` | 相同白名单渲染 `markdown` → sanitizedHtml/warnings | 登 | 无持久化、限流 |
| C12 | `POST /uploads` | 创建未绑定上传意图 `fileName,size,mime,checksum` → upload URL | 本人 | I；配额/类型校验 |
| C12b | `GET /uploads/{uploadId}` | 查询一个未绑定或已绑定上传的扫描状态 | 本人 | R；不依赖 draft 轮询 |
| C13 | `POST /uploads/{uploadId}/completions` / `DELETE /uploads/{uploadId}` | 完成扫描；或清理未引用上传 | 本人 | I / S；已发布引用不可删 |
| D01 | `GET /feed` | 全站 Feed；`parentNode,childNode,cursor` | 公 | R；无推荐/热门 |
| D02 | `GET /feed/following` | 关注对象时间序 Feed | 登 | R、cursor |
| D03 | `GET /search/posts` | `q,parentNode,childNode,sort,cursor` → 帖子结果 | 公 | R、限流 |
| D04 | `GET /search/users` | `q,cursor` → 公开用户结果 | 公 | R |
| D05 | `GET /search/nodes` | `q` → 只读节点结果 | 公 | R |
| D06 | `GET /search/tags` | `q` → 标签结果 | 公 | R |
| D07 | `GET /tags` | 标签目录/计数 | 公 | R |
| D08 | `GET /tags/{slug}/posts` | 标签下公开帖子 | 公 | R、cursor |

不存在 `PATCH/DELETE /posts/{id}`、`PATCH/DELETE /comments/{id}` 或节点写接口。

### 5.3 Social Graph 与 Notification（R/O）

| ID | Method / Path | 单一职责与关键输入 → 输出 | 权限 | 语义 |
|---|---|---|---|---|
| R01 | `PUT /users/me/bookmarks/{postId}` | 建立一个收藏关系 → viewerState/count | 登 | S |
| R02 | `DELETE /users/me/bookmarks/{postId}` | 删除一个收藏关系 | 登 | S |
| R03 | `PUT /posts/{postId}/reactions/{type}` / `DELETE ...` | 设置/撤销一种帖子反应 | 登 | S；type 枚举 |
| R04 | `PUT /comments/{commentId}/reactions/{type}` / `DELETE ...` | 设置/撤销一种评论反应 | 登 | S |
| R05 | `PUT /users/me/followed-nodes/{nodeId}` | 关注父或子节点 | 登 | S；父关注在读模型中覆盖子节点 |
| R06 | `DELETE /users/me/followed-nodes/{nodeId}` | 取消指定节点关注 | 登 | S；不隐式删其他边 |
| R07 | `PUT /users/me/followed-users/{userName}` | 关注用户 | 登 | S；禁止自关注/被屏蔽关系 |
| R08 | `DELETE /users/me/followed-users/{userName}` | 取消关注用户 | 登 | S |
| R09 | `GET /users/{userName}/followers` | 允许公开的粉丝列表 | 公 | R、cursor/隐私 404 |
| R10 | `GET /users/{userName}/following` | 允许公开的用户/节点分区 | 公 | R、cursor/隐私 404 |
| R11 | `GET /users/me/bookmarks` | 本人收藏帖子 | 本人 | R、cursor |
| O01 | `GET /notifications` | `status,type,cursor` → 通知列表 | 本人 | R |
| O02 | `GET /notifications/unread-count` | 未读数 | 本人 | R |
| O03 | `PUT /notifications/{notificationId}/read-state` | `{read:true}` 设置单条已读 | 本人 | S |
| O04 | `PUT /notifications/read-cursor` | `{readThrough}` 将该时间前通知置已读 | 本人 | S；避免逐条 fan-out |
| O05 | `GET /users/me/notification-preferences` | 社区通知偏好和 ETag | 本人 | R |
| O06 | `PATCH /users/me/notification-preferences` | 每类 channel 开关；安全通知不可关闭 | 本人 | V；不含金币/旅程偏好 |

### 5.4 Safety 与 Moderation（S/M）

| ID | Method / Path | 单一职责与关键输入 → 输出 | 权限 | 语义 |
|---|---|---|---|---|
| S01 | `POST /reports` | `target{type,id},reason,details,evidenceUploadIds` → report | 登 | I；目标+原因窗口去重 |
| S02 | `GET /users/me/reports` | 本人举报列表 | 本人 | R、cursor |
| S03 | `GET /users/me/reports/{reportId}` | 安全目标摘要、状态时间线/结果 | 本人 | R；不泄露审核员/阈值 |
| S04 | `GET /users/me/blocked-users` | 本人屏蔽列表 | 本人 | R、cursor |
| S05 | `PUT /users/me/blocked-users/{userName}` | 建立屏蔽边 | 登 | S；同步 Social read model |
| S06 | `DELETE /users/me/blocked-users/{userName}` | 解除一个屏蔽边 | 本人 | S |
| S07 | `GET /users/me/appealable-enforcements` | 可申诉处置列表 | 本人 | R |
| S08 | `GET /users/me/appeals` | 本人申诉列表 | 本人 | R、cursor |
| S09 | `POST /appeals` | `enforcementId,reason,statement,evidenceUploadIds` → appeal | 本人 | I；一个处置一个有效申诉 |
| S10 | `GET /appeals/{appealId}` | 本人/审核员可见的时间线与决定 | 本人/审 | R |
| S11 | `POST /appeals/{appealId}/supplements` | 追加一次不可变补充说明 | 本人 | I；仅允许状态窗口 |
| M01 | `GET /moderation/cases` | 队列筛选、SLA、优先级 | 审 | R、page |
| M02 | `GET /moderation/cases/{caseId}` | 只读安全上下文/快照/历史/允许命令 | 审 | R |
| M03 | `GET /moderation/appeals` | 申诉复核队列 | 审 | R、page |
| M04 | `GET /moderation/audit-logs` | 不可变审计查询 | 审计 | R、page；不可写 |
| M05 | `POST /moderation/cases/{caseId}/assignments` | 指派审核员 `assigneeId,expectedCaseVersion` | 审 | I+V |
| M06 | `POST /moderation/cases/{caseId}/visibility-decisions` | 仅决定 `targetId,visibility=HIDDEN|VISIBLE,reason,evidenceRefs` | 审 | I+V；不改正文 |
| M07 | `POST /moderation/cases/{caseId}/comment-lock-decisions` | 仅决定 `postId,locked,reason` | 审 | I+V；与可见性分离 |
| M08 | `POST /moderation/cases/{caseId}/user-sanctions` | 仅创建 `kind=WARNING|RATE_LIMIT|MUTE|BAN|RESTORE,scope,expiresAt,reason` | 高权限审 | I+V；动态最小权限 |
| M09 | `POST /moderation/appeals/{appealId}/decisions` | 仅裁决 `outcome=UPHOLD|REVOKE|REPLACE,reason,replacementEnforcement?` | 独立复核审 | I+V；原处置不覆写 |

M06–M09 每次成功都在同一事务或可靠 outbox 中生成不可变 AuditEntry。不能用 `actionType` 将它们重新合并；权限、校验、SLA、影响对象和回滚方式均不同。

### 5.5 Coin 用户账本（K）

| ID | Method / Path | 单一职责与关键输入 → 输出 | 权限 | 语义 |
|---|---|---|---|---|
| K01 | `GET /users/me/coin-wallet` | 四类余额、周系统奖励额度、规则版本 | 本人 | R、no-store |
| K02 | `GET /users/me/coin-journals` | `type,status,cursor` → 本人不可变 journal 摘要 | 本人 | R |
| K03 | `GET /users/me/coin-journals/{journalId}` | 分录、来源、规则版本、申诉能力 | 本人 | R |
| K04 | `GET /coin-rule-versions` / `GET /coin-rule-versions/{version}` | 当前/历史公开规则 | 公 | R、可缓存 |
| K05 | `POST /coin-thanks` | `targetType,targetId` → journal/最新钱包；金额服务端固定 2 | 登 | I+L；唯一目标感谢、日上限 |
| K05q | `GET /coin-thank-quote` | 查询目标感谢资格、固定成本、分配、余额与当日剩余次数 | 登 | R；quote 携带规则版本与禁用原因 |
| K06 | `GET /users/me/coin-bounties` | `role,status,cursor` → 本人相关悬赏 | 本人 | R |
| K07 | `POST /coin-bounties` | `postId,amountTier,expiresAt` → bounty/escrow journal | 登 | I+L；20/50/100、每帖一个开放悬赏 |
| K07q | `GET /coin-bounty-quote` | 查询帖子悬赏资格、档位、余额、采纳/到期约束 | 登 | R；不污染 Content permissions |
| K08 | `GET /coin-bounties/{bountyId}` | 公开问题摘要、合格回答、托管时间线；私人字段按权限 | 公/登 | R |
| K09 | `POST /coin-bounties/{bountyId}/acceptances` | `answerCommentId,expectedBountyVersion` → settlement journals | 发布者 | I+V+L；满 24h、80/20、不可自撤 |
| K10 | `POST /coin-bounties/{bountyId}/cancellations` | `reason,expectedBountyVersion` → refund/sink 结果 | 发布者 | I+V+L；条件服务端判定 |
| K11 | `POST /coin-disputes` | `journalId,statement,evidenceUploadIds` → dispute | 相关用户 | I；不直接冲正 |
| K12 | `GET /coin-disputes/{disputeId}` | 状态、理由类别、SLA、时间线 | 相关用户/币审 | R |
| K13 | `GET /coin-economy/summaries/{period}` | 公开发行/销毁/流通/活跃钱包汇总 | 公 | R、汇总且无个人余额 |
| K14 | `GET /coin-economy/summaries/{period}.csv` | 同一汇总的可访问 CSV | 公 | R |
| K15 | `GET /users/me/coin-preferences` | 金币通知/展示/二次验证偏好 | 本人 | R+ETag |
| K16 | `PATCH /users/me/coin-preferences` | 只更新金币偏好 | 本人 | V；不包含社区通知 |

所有账变由服务端计算；同一业务事件唯一键 `(eventType,sourceId,beneficiaryId,ruleVersion)`。Journal/Entry 只追加，纠错用关联原 journal 的反向分录。事务内固定顺序锁钱包，分录与余额快照同时提交，永不接收客户端余额。

### 5.6 Coin 风险与 Controller（KM/KA）

| ID | Method / Path | 单一职责与关键输入 → 输出 | 权限 | 语义 |
|---|---|---|---|---|
| KM01 | `GET /moderation/coin-cases` | 金币风险队列 | 币审 | R、page |
| KM02 | `GET /moderation/coin-cases/{caseId}` | 证据摘要、关系文字替代、journal、历史 | 币审 | R |
| KM03 | `POST /moderation/coin-cases/{caseId}/release-recommendations` | 仅建议释放 `holdIds,reason,evidenceRefs` | 币审 | I+V；不记账 |
| KM04 | `POST /moderation/coin-cases/{caseId}/recovery-recommendations` | 仅建议追回 `journalIds,reason,evidenceRefs` | 币审 | I+V；不记账 |
| KA01 | `GET /admin/coin-budgets/current` | 当前预算/耗用 | 控/批 | R |
| KA02 | `POST /admin/coin-budget-change-proposals` | 提交预算旧值/新值/预测/生效/停止条件 | 控 | I；发起人不可批 |
| KA02b | `GET /admin/coin-budget-change-proposals` | 按状态读取预算变更提案 | 控/批/审计 | R、page |
| KA03 | `POST /admin/coin-budget-change-proposals/{id}/approvals` | 独立批准一个预算提案 | 批 | I+V；双人分离 |
| KA04 | `GET /admin/coin-rule-versions` | 读取已批准/生效的结构化规则版本 | 控/批/审计 | R、page |
| KA04b | `GET /admin/coin-rule-change-proposals` | 按状态读取规则变更提案 | 控/批/审计 | R、page |
| KA05 | `POST /admin/coin-rule-change-proposals` | 提交完整新规则版本和生效时间 | 控 | I；不得直接覆盖当前版本 |
| KA05b | `POST /admin/coin-rule-change-proposals/{id}/approvals` | 独立批准一个规则版本提案 | 批 | I+V；审批人≠发起人 |
| KA06 | `GET /admin/coin-adjustments/{id}` / `POST /admin/coin-adjustments` | 读取；创建事故补偿调整单和拟议借贷分录 | 控/批；控 | R / I；必须关联事故 |
| KA06b | `GET /admin/coin-adjustments` | 按审批状态读取人工调整单列表 | 控/批/审计 | R、page |
| KA07 | `POST /admin/coin-adjustments/{id}/approvals` | 批准并由账本执行该调整 | 批 | I+V+L；审批人≠发起人 |
| KA08 | `POST /admin/coin-adjustments/{id}/return-requests` | 退回补充，不执行分录 | 批 | I+V；仅改变审批状态 |
| KA09 | `GET /admin/coin-reconciliation-runs` | 日/月对账运行列表 | 控/审计 | R |
| KA10 | `POST /admin/coin-reconciliation-runs` | 启动指定 period/scope 的只读核对 | 控 | I；重复 key 返回原 run |
| KA11 | `GET /admin/coin-reconciliation-runs/{runId}` | 三方核对结果和差异 | 控/审计 | R |
| KA12 | `POST /admin/coin-period-close-requests` | 基于 `reconciliationRunId,period` 提交关账审批 | 控 | I+V；有差异则 409 |
| KA13 | `POST /admin/coin-period-close-requests/{id}/approvals` | 独立批准并锁定期间 | 批 | I+V；关闭后不回写 |
| KA14 | `POST /admin/coin-write-freeze-proposals` | 仅提交金币写冻结范围、依据、复核期限 | 控/系统安全规则 | I；核心社区不冻结 |
| KA14b | `GET /admin/coin-write-freeze-proposals` | 按状态读取金币写冻结提案/自动触发记录 | 控/批/审计 | R、page |
| KA15 | `POST /admin/coin-write-freeze-proposals/{id}/approvals` | 独立批准人工冻结提案；自动安全触发只补不可变记录 | 批 | I+V；72h 内复核 |

预算、规则、写冻结分别有自己的提案与审批资源，不能复用“金币控制审批”。自动安全冻结由不变量触发时可先执行，但必须创建不可变触发记录并在 72 小时内由独立人员复核；它不是混入规则 PATCH 的 `emergency=true`。

### 5.7 Journey（J）

| ID | Method / Path | 单一职责与关键输入 → 输出 | 权限 | 语义 |
|---|---|---|---|---|
| J01 | `GET /journey/summary` | 本周进度、CXP 状态、角色、当前任务 | 本人 | R |
| J02 | `GET /quests` | `node,type,status,sort,cursor` → 可做/已激活任务定义 | 登 | R |
| J03 | `GET /quests/{questId}` | 价值说明、步骤、真实来源、验收与奖励解释 | 登 | R |
| J04 | `GET /users/me/journey-onboarding` | 是否开启和贡献偏好 | 本人 | R+ETag |
| J05 | `PATCH /users/me/journey-onboarding` | 只保存 onboarding 偏好/完成状态 | 本人 | V |
| J06 | `POST /quests/{questId}/enrollments` | 开始一个任务 `sourceId,focusBudget` → enrollment | 登 | I；每周/并发上限 |
| J07 | `POST /quest-enrollments/{id}/pauses` | 暂停一个激活任务 | 本人 | I+V；不损失已完成步骤 |
| J08 | `POST /quest-enrollments/{id}/exits` | 主动退出一个任务 | 本人 | I+V；不回滚已确认贡献 |
| J09 | `POST /quest-enrollments/{id}/replacement-requests` | 请求替换目标/任务 → 新旧 enrollment 关联 | 本人 | I+V；隐藏/锁定目标可用 |
| J10 | `GET /users/me/journey-progress` | 成长路径和周复盘 | 本人 | R |
| J11 | `GET /users/me/contributions` | 可追溯贡献、质量/CXP/NCP 独立状态 | 本人 | R、cursor |
| J12 | `GET /users/me/contributions/{id}` | 来源、验收解释、各账变状态 | 本人 | R；隐藏内容安全降级 |
| J13a | `GET /users/me/collections` | 本人贡献收藏、获得依据与展示状态 | 本人 | R、cursor |
| J13 | `PUT /users/me/collection-displays/{collectionId}` / `DELETE ...` | 逐项展示/隐藏一个收藏 | 本人 | S；不影响排序/CXP |
| J14 | `GET /node-projects` | 可见节点协作列表/筛选 | 登 | R |
| J15 | `GET /nodes/{slug}/projects/current` | 当前公开项目、目标、任务、验收 | 公 | R |
| J16 | `PUT /node-projects/{projectId}/participants/me` | 加入项目及 `displayNamePublic` 偏好 | 登 | S；不创建私聊/等级 |
| J17 | `DELETE /node-projects/{projectId}/participants/me` | 退出项目 | 本人 | S；已完成贡献保留 |
| J18 | `GET /seasons` | 当前/归档主题季 | 公 | R |
| J19 | `GET /seasons/{slug}` | 公共目标、进度、参与路径、归档 | 公 | R |
| J20 | `GET /users/me/journey-preferences` | 摘要/推荐/公开印记偏好 | 本人 | R+ETag |
| J21 | `PATCH /users/me/journey-preferences` | 只更新提醒与展示偏好 | 本人 | V |
| J22 | `POST /users/me/journey-pauses` | 开始休息，可选 `until` → pause | 本人 | I；归档激活任务但不删进度 |
| J23 | `DELETE /users/me/journey-pauses/current` | 恢复旅程 | 本人 | S |

任务清单勾选不是可信结算输入；进度由内容、质量和项目领域事件推导。不存在客户端完成/结算接口，避免“勾选即领奖”和重放作弊。

## 6. 跨域流程与事件

所有跨域事件经 transactional outbox 发布，消费者以 `eventId + consumer` 唯一去重。事件至少含 `eventId,eventType,aggregateId,aggregateVersion,occurredAt,actorId,correlationId,causationId`；不得携带密码、token、草稿正文或不必要敏感原文。

### 6.1 登录后恢复原任务

1. 客户端本地保存 `returnTo`、动作类型和未提交输入；服务端不创建万能 resume command。
2. A02 只建立会话。客户端展示恢复摘要，再调用原目标 API（例如 R01 收藏、C09 评论）。
3. 高后果动作（发布、举报、花金币）必须再次确认；沿用该目标请求自己的 Idempotency-Key。

### 6.2 草稿到不可变发布

1. C03 以 ETag 保存草稿；冲突不静默覆盖。
2. C05 在 Content 事务内验证节点/附件/Markdown并只创建一次 Post，写 `PostPublished` outbox。
3. Discovery 建索引，Notification 处理提及，Journey 只产生潜在贡献上下文；失败均可重放，不回滚已发布原文。

### 6.3 评论、质量确认与旅程账变

1. C09/C10 产生 `CommentPublished`；Journey 将匹配中的 enrollment 标为等待质量事实，不能自行判优。
2. 质量服务产生 `ContributionQualityConfirmed` 或 `Rejected`。
3. Journey 分别追加 `Contribution`、`CxpEntry`、`NcpEntry`；每项状态可独立为 `pending_sync/confirmed/rejected`。
4. 如满足金币候选规则，仅发布 `CoinRewardCandidateCreated`；Coin Ledger 根据规则版本、预算、风险独立接受/延迟/拒绝。CXP 成功不要求金币成功，金币失败不回滚评论。

### 6.4 举报、治理、申诉

1. S01 创建 Report；风险路由器可创建 Moderation Case，原举报人只看到安全状态。
2. M06/M07/M08 各自创建独立决定并发 `ContentVisibilityChanged`、`PostCommentLockChanged`、`UserSanctionChanged`。
3. Content 只更新可见性/锁投影，不改原文；Discovery/Notification/Journey 安全降级。
4. 可申诉处置进入 S07；S09 创建 Appeal；M09 由独立复核人裁决。撤销通过新决定恢复状态，原决定与审计不删除。

### 6.5 金币感谢/悬赏

1. K05/K07/K09 先做权限、规则版本、关系风险、余额与业务唯一键校验。
2. Coin Ledger 事务按固定账户顺序加锁，创建一个平衡 Journal 和至少两条 Entry，同时更新受控余额快照。
3. `CoinJournalPosted` 供通知/透明度投影消费。通知失败不回滚账本；重复请求返回原 journal。
4. 争议 K11 只开调查，不直接冲正；KM 推荐后仍需 Controller/独立审批生成反向 Journal。

### 6.6 治理触发金币保留

`ContentVisibilityChanged(HIDDEN)` 只能触发 Coin Risk 建案/保留建议，内容审核员不能写余额。Coin 根据规则将 pending 转 held；释放 KM03 与追回 KM04 是不同建议，批准执行后追加新 journal。

### 6.7 Controller 变更与关账

预算、规则和人工调整均为“提案 → 独立批准 → 生效/记账”三段式，发起人与审批人不能相同。对账 KA10 只读比对 Journal、钱包快照、业务对象；差异非零阻止 KA12。期间关闭后，后续纠错记入下一期间并披露，不修改已关账数据。

## 7. 状态机与关键不变量

- Draft：`editing -> publishing -> published` 或 `editing -> discarded`；只有 editing 可修改。
- Post/Comment 原文：创建后永不修改；另有 Visibility projection。Post comment lock 与 visibility 是两个版本。
- Report：`submitted -> triaged -> in_review -> resolved`；举报人 DTO 不暴露内部证据。
- Appeal：`submitted -> under_review -> decided`；补充说明只追加。
- Bounty：`open -> accepted|cancelled|expired|held`；accepted 不可由用户撤销。
- QuestEnrollment：`active -> paused|needs_attention|exited|completed`；`completed` 由事件推导，不接受客户端命令。
- Coin：每个 journal 借贷和为零；历史 entry 不 UPDATE/DELETE；可用余额永不为负；同一业务事件最多一个成功 journal。
- 审批：`proposed -> approved|returned|rejected -> executed`；proposer != approver，执行只消费 approved 记录。

## 8. 未决假设与风险

1. **服务拆分未定。** 限界上下文不等于立即拆微服务；建议先模块化单体+独立 schema/outbox，金币账本至少独立事务边界，待流量和团队边界证实后再拆。
2. **质量确认主体未定。** 同行确认、节点维护者和自动风控的权重/申诉 SLA 需要单独规格；在此之前 Journey/金币只做影子事件。
3. **权限矩阵需落表。** `moderator`, `senior_moderator`, `coin_investigator`, `controller`, `independent_approver`, `audit_reader` 必须基于 capability 授权，不能只看角色字符串。
4. **合规数据处理。** “不可编辑删除”仍需覆盖隐私泄露、法定删除请求和证据保全；应是受控合规流程和可审计替代/密封，不得伪装为普通内容编辑。
5. **附件安全。** 需要病毒扫描、内容类型嗅探、私有桶、短期 URL、配额及发布引用锁；附件公开前不得被爬取。
6. **搜索一致性。** 索引是最终一致；发布成功后页面应直读 Content，搜索延迟需可解释。屏蔽/隐藏事件必须高优先级从索引移除。
7. **父节点关注继承。** 当前假设父关注动态覆盖未来子节点、子关注不反向关注父；若增加“静音子节点”，需独立 `muted-node` 关系而非污染 follow edge。
8. **金币法律/会计。** 不可购买/提现/兑法币是假设门槛；任何现实价值、交易或付费能力都会改变监管与账务设计，必须重新评审。
9. **金币一致性。** 任一非零借贷差、负余额或无法解释的三方差异应自动冻结所有金币写入；社区浏览、发帖、申诉继续可用。
10. **旅程范围门。** 无连续签到、掉级、倒计时焦虑、排行榜、自动发布；任务上限和数值仍是待验证配置，但变更需要规则版本。
11. **API 聚合层。** 若性能需要，可建只读 `/page-views/*` BFF，但不得接受写入、不得成为领域事实源，也不得让私有数据进入公开缓存键。
12. **OpenAPI 交付。** 本文需要后续转成新的 `/api/v1` OpenAPI，并为匿名/本人/治理/财务权限、错误码、枚举、分页、ETag、Idempotency-Key 和事件 schema 提供契约测试；不得直接把旧 11 接口改名视为完成。

## 9. 验证清单

- `prototype/assets/app.js` 的 `resolve(route)` 每个业务分支均在第 2 节出现；别名已合并标注。
- 所有 `data-action` 中的真实写动作已映射到独立命令；主题、弹窗、输入模板、重试 Toast 等纯 UI 动作未伪造 API。
- API 目录中无 `/actions`、通用 `/settings` PATCH、Controller 万能命令或客户端 `/settle`。
- Node 无写 API；Post/Comment 无 PATCH/DELETE；治理与金币均保留不可变历史。
- 写接口已标注 I/V/S/L 并发语义，读接口已标注权限和分页方向。
