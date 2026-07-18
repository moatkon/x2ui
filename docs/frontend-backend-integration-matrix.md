# X2UI × X2API 联调与功能验收矩阵

> 更新时间：2026-07-18
> 契约基线：`prototype-api-contracts.md` 的 157 个业务 operation + 1 个 Observability operation
> 状态含义：`已接真实数据` 表示 UI 已读取/写入 x2api；`BFF 可达` 只表示同源安全转发已覆盖，不能视为页面功能通过。项目不提供运行时 Mock，未接能力必须显示明确不可用或真实空态。

## 1. 联调基础设施

| 能力 | 当前实现 | 验收点 |
|---|---|---|
| 统一 API 入口 | 唯一 `/api/v1/[...path]` Route Handler 透明覆盖全部 operation | 任意 SDK path 不再因缺少 Next Route Handler 返回 404 |
| access token | BFF 从 HttpOnly cookie 注入 `Authorization: Bearer`，浏览器 JavaScript 不可读 | DevTools Application 可见 HttpOnly；浏览器响应 JSON 不含 token |
| refresh token | A10 单次轮换；后端 401 时 BFF 最多刷新一次并重放原请求 | 旧 refresh 重放被后端拒绝；不存在无限重试 |
| 登录/登出 | A02 响应 token 被截获并写 cookie；A11 后清 cookie | 登录后回到安全的本地 `next`；登出后私有页跳登录 |
| 公开 SSR | Server Component 直接读取 x2api 公共 GET，使用 Next `revalidate` | HTML 源码包含公开正文/标题；禁用 JS 仍可读 |
| 后端配置 | `X2API_BASE_URL` 必填；缺失时启动失败；不存在 Mock 或失败回退 | 后端不可达时明确失败，不显示静态业务事实 |

## 2. 页面 × API × 交互缺口

| 路由（含别名） | 目标 API | SSR | 当前状态 | 可执行验收 | 未通过项 |
|---|---|---:|---|---|---|
| `/`, `/feed` | N01, D01 | 是 | **已接真实数据** | 匿名请求 HTML；父/子筛选；非法 path recovery；真实 cursor 翻页；空 Feed | — |
| `/nodes` | N01 | 是 | **已接真实数据** | 节点、子节点、统计、规则出现在 HTML | — |
| `/nodes/{parent}` | N02, D01, R05/R06 | 是 | **已接真实读写** | 规则、子节点、聚合 Feed、cursor、关注、404 | — |
| `/nodes/{parent}/{child}` | N03, D01, R05/R06 | 是 | **已接真实读写** | 严格父子路径、规则、Feed、cursor、关注、404 | — |
| `/nodes/{parent}/project` | J14–J17 | 是 | **已接真实读写** | 读取项目、任务、参与者；加入/退出后刷新 | cursor 不适用 |
| `/posts/{postId}` | C07–C10b, R01–R04, K05q–K07, S01 | 是 | **已接真实读写** | 正文/评论在 HTML；评论/回复、收藏/反应、感谢、悬赏入口、真实举报目标 | — |
| `/search` | D03–D06, N01 | 是 | **四类真实读取已接** | 四 tab 各自请求；节点筛选；相关度/最新排序；真实 cursor；空态 | — |
| `/tags`, `/tags/{slug}` | D07–D08 | 是 | **已接真实读取** | 标签计数、标签 Feed、404、空态 | cursor 未接 |
| `/users/{userName}` | P01, R07/R08, S01/S05/S06 | 是 | **P01/R07/S05 已接** | 公开资料 HTML；关注/屏蔽持久化 | 取消关注/解除屏蔽未按 viewerState 切换；举报表单仍固定 body |
| `/users/{userName}/posts` | P02 | 是 | **已接真实读取** | 用户帖子/空态 | cursor 未接 |
| `/users/{userName}/comments` | P03 | 是 | **已接真实读取** | 评论与原帖深链/空态 | cursor 未接 |
| `/users/{userName}/followers` | R09 | 是 | **已接真实读取** | 隐私安全 404、空态 | cursor 未接 |
| `/users/{userName}/following` | R10 | 是 | **USERS 真实读取已接** | 用户列表、隐私安全 404、空态 | NODES 分区与 cursor 未接 |
| `/login` | A02, A10 | 否 | **已接真实写入/会话** | 成功、错误凭证、限流、`next`、刷新轮换 | 需用数据库测试账号跑 E2E |
| `/register` | A01 | 否 | **已接真实写入** | 重复邮箱安全响应、字段边界、幂等 | 需验证邮件投递替身/测试凭据 |
| `/verify-email*` | A05/A06 | 否 | A05 已接；A06 无按钮 | token 单次消费、过期、重发冷却 | 重发 UI、真实结果读取 |
| `/forgot-password` | A07 | 否 | **已接真实写入** | 不枚举邮箱、限流 | 邮件投递替身 |
| `/reset-password` | A08 | 否 | **已接真实写入** | token 单次消费、旧会话撤销 | 需完整 E2E |
| `/auth/recover-task` | A02 + 原 operation | 否 | **安全中性页** | 不替用户自动提交不可逆操作 | 登录前意图持久化尚未实现 |
| `/me` | P04 | 否 | **已接真实读取** | 当前用户、计数、安全概要 | — |
| `/quick-compose` | N01, C06 | 否 | **N01/C06 已接** | 轻发布成功返回真实 postId 并进入 SSR 详情 | 失败字段定位尚未逐字段展示 |
| `/compose` | C01–C06, C11–C13b | 否 | **草稿、预览、上传与发布已接真实读写** | 保存、加载、ETag 更新；服务端 Markdown 预览；上传意图、直传、完成、扫描、移除；发布绑定 uploadId | 需联调验证对象存储 CORS/ETag 与扫描消费者 |
| `/drafts` | C01–C04 | 否 | **已接真实读写** | 列表、新建、继续、放弃、412 | cursor 未接 |
| `/bookmarks` | R11/R02 | 否 | **已接真实读取** | 收藏持久化、空态 | 列表内取消未接 |
| `/following` | D02 | 否 | **已接真实读取** | 登录读取、屏蔽投影一致 | cursor 未接 |
| `/notifications` | O01–O04 | 否 | **已接真实读写** | 单条/批量已读、deepLink、空态 | 类型筛选 UI 未接 |
| `/settings/profile` | P05/P06 | 否 | **已接真实读写** | GET ETag、PATCH、412 | 冲突使用服务端 Problem 提示 |
| `/settings/privacy` | P07/P08 | 否 | **已接真实读写** | GET ETag、PATCH、隐私影响公开页 | — |
| `/settings/notifications` | O05/O06 | 否 | **已接真实读写** | GET ETag、独立 PATCH、安全通知不可关 | — |
| `/settings/security` | P04 | 否 | **已接真实读取** | 邮箱状态、安全摘要 | — |
| `/settings/security/password` | A09 | 否 | **已接真实写入** | 修改密码、错误原密码 | — |
| `/settings/sessions` | A03/A04/A04b | 否 | **已接真实读写** | 当前/其他会话、单撤销、批量撤销 | — |
| `/settings/blocked`, `/blocked` | S04–S06 | 否 | **已接真实读写** | 列表、解除、空态 | — |
| `/report/new` | S01 | 否 | **已接真实写入** | 来源 target、表单字段、幂等 | 附件证据上传未接 |
| `/reports`, `/me/reports*` | S02/S03 | 否 | **已接真实读取** | 列表、详情、安全摘要、时间线 | cursor 未接 |
| `/appeals*` | S07–S11 | 否 | **已接真实读写** | 可申诉处置、提交、详情、补充 | 附件证据上传未接 |
| `/moderation*` | M01–M09 | 否 | **已接真实读写** | capability、队列、详情、分派、可见性、评论锁定、用户处置、申诉独立复核、审计；全部使用强版本 | — |
| `/coins`, `/coins/ledger` | K01–K03, K11/K12 | 否 | **已接真实读写** | 四余额、journal 列表/详情/分录、争议提交与详情、空态 | 列表 cursor 尚未做 UI 入口 |
| `/coins/rules`, `/coins/economy` | K04/K13/K14 | 是 | **已接真实 SSR** | 规则历史、期间汇总、CSV 下载 | — |
| `/coins/bounties*` | K06–K10 | 否 | **已接真实读写** | quote、创建、列表、详情、强版本采纳/取消 | — |
| `/settings/coins` | K15/K16 | 否 | **已接真实读写** | GET ETag、PATCH | — |
| `/moderation/coins*` | KM01–KM04 | 否 | **已接真实读写** | capability、案件、证据、流水、强版本释放/追回建议 | — |
| `/admin/coins/control` | KA01–KA08, KA14/KA15 | 否 | **已接真实读写** | 当前预算、规则版本、各类提案、人工调整、独立审批/退回、冻结提案 | — |
| `/admin/coins/reconciliation` | KA09–KA13 | 否 | **已接真实读写** | 对账列表/详情、创建、关账申请、强版本独立批准 | — |
| `/admin/coins/adjustments/{id}` | KA06–KA08 | 否 | **已接真实读写** | 调整分录详情、强版本批准/退回 | — |
| `/journey`, `/play` | J01–J03 | 否 | **J01/J02/J03 真实读取** | 周进度、当前/推荐任务 | — |
| `/journey/onboarding` | J04/J05 | 否 | **已接真实读写** | GET ETag、保存偏好 | — |
| `/quests*`, `/play/quests*` | J02/J03/J06–J09 | 否 | **已接真实读写** | 列表、详情、开始、强版本暂停/退出/替换 | — |
| `/me/progress` | J10 | 否 | **已接真实读取** | 成长路径与周记录 | — |
| `/me/contributions` | J11/J12 | 否 | **J11 真实读取** | 贡献来源、质量及四状态 | 详情入口未接 |
| `/me/collection` | J13a/J13p/J13d | 否 | **已接真实读写** | 收藏读取、逐项展示/隐藏 | — |
| `/play/teams` | J14/J16/J17 | 否 | **已接真实读写** | 协作列表、加入/退出 | cursor 未接 |
| `/seasons*` | J18/J19 | 是 | **已接真实 SSR** | 主题季列表/详情/归档 SSR | cursor 未接 |
| `/settings/journey` | J20–J23 | 否 | **已接真实读写** | 偏好 ETag/PATCH、全局暂停/恢复 | — |
| `/journey/states`, `/prototype/states` | — | 视路由 | 验收样例 | 仅做视觉/可访问状态验收 | 不应调用业务 API |
| `/403`, `not-found` | Problem | 是 | 页面存在 | 403/安全 404/409/429 不泄露资源 | 需真实错误旅程 |

## 3. 测试批次

1. `P0 会话`：A01/A02/A10/A11，cookie 安全属性，登录来源恢复，登出门禁。
2. `P0 公开 SSR`：N01–N03、D01、C07/C08、P01–P03、D03–D08；抓取 HTML 而非只看 hydration 后 DOM。
3. `P0 内容写`：C06/C09、R01–R04；验证数据库持久化后刷新仍存在。
4. `P1 账户`：草稿、通知、资料/偏好、设备、安全、屏蔽、举报、申诉。
5. `P1 金币与治理`：所有写操作分别验证 capability、幂等、ETag 与双人审批。
6. `P1 Journey`：状态机、退出/替换/休息与跨域投影。

任何仍标为未接的项目，在替换为真实读写并通过浏览器 + API + 数据库三方验证前，验收结果必须为失败；前端禁止用静态业务事实或伪成功提示代替。
