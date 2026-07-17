# X2UI × X2API 联调与功能验收矩阵

> 更新时间：2026-07-17  
> 契约基线：`prototype-api-contracts.md` 的 157 个业务 operation + 1 个 Observability operation  
> 状态含义：`已接真实数据` 表示 UI 已读取/写入 x2api；`BFF 可达` 只表示同源安全转发已覆盖，不能视为页面功能通过；`演示数据`、`仅提示` 均为未通过。

## 1. 联调基础设施

| 能力 | 当前实现 | 验收点 |
|---|---|---|
| 统一 API 入口 | `/api/v1/[...path]` 覆盖现有 Route Handler 未声明的全部 operation；已有 34 个 Route Handler 在 backend 模式也统一转发 | 任意 SDK path 不再因缺少 Next Route Handler 返回 404 |
| access token | BFF 从 HttpOnly cookie 注入 `Authorization: Bearer`，浏览器 JavaScript 不可读 | DevTools Application 可见 HttpOnly；浏览器响应 JSON 不含 token |
| refresh token | A10 单次轮换；后端 401 时 BFF 最多刷新一次并重放原请求 | 旧 refresh 重放被后端拒绝；不存在无限重试 |
| 登录/登出 | A02 响应 token 被截获并写 cookie；A11 后清 cookie | 登录后回到安全的本地 `next`；登出后私有页跳登录 |
| 公开 SSR | Server Component 直接读取 x2api 公共 GET，使用 Next `revalidate` | HTML 源码包含公开正文/标题；禁用 JS 仍可读 |
| Mock 隔离 | 未设置 `X2API_BASE_URL` 或 `X2API_API_MODE=mock` 时才走本地 Mock | backend 模式不得在失败时静默回退演示数据 |

## 2. 页面 × API × 交互缺口

| 路由（含别名） | 目标 API | SSR | 当前状态 | 可执行验收 | 未通过项 |
|---|---|---:|---|---|---|
| `/`, `/feed` | N01, D01 | 是 | **已接真实数据** | 匿名请求 HTML；父/子筛选；非法 path recovery；空 Feed | 翻页 UI 仍是静态控件 |
| `/nodes` | N01 | 是 | **已接真实数据** | 节点、子节点、统计、规则出现在 HTML | R05/R06 关注仍仅提示 |
| `/nodes/{parent}` | N02, D01, R05/R06 | 是 | **已接真实读取** | 规则、子节点、聚合 Feed、404 | 关注写操作未接 |
| `/nodes/{parent}/{child}` | N03, D01, R05/R06 | 是 | **已接真实读取** | 严格父子路径、规则、Feed、404 | 关注写操作未接 |
| `/nodes/{parent}/project` | J14–J17 | 是 | 演示数据 | 读取项目、任务、参与者；加入/退出后刷新 | 全部未接 |
| `/posts/{postId}` | C07–C10b, R01–R04, K05q–K07, S01 | 是 | **C07/C08/C09/R01/R03 已接** | 正文/评论在 HTML；评论写入后刷新；收藏/反应持久化 | 回复、感谢、悬赏仍为 Dialog 演示；举报目标仍硬编码 |
| `/search` | D03–D06, N01 | 是 | **四类真实读取已接** | 四 tab 各自请求；空态；查询字段校验 | 节点筛选/排序选择器尚未写入查询，cursor 未接 |
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
| `/auth/recover-task` | A02 + 原 operation | 否 | 演示恢复目标 | 登录前意图本地保存、登录后再次确认 | 当前固定帖子/固定收藏 |
| `/me` | P04 | 否 | 演示数据 | 当前用户、计数、安全概要 | 未接 |
| `/quick-compose` | N01, C06 | 否 | **N01/C06 已接** | 轻发布成功返回真实 postId 并进入 SSR 详情 | 失败字段定位尚未逐字段展示 |
| `/compose` | C01–C05, C11–C13 | 否 | C06 直接发布；草稿/附件仅 UI | 自动保存、ETag 冲突、上传扫描、预览、发布 | 草稿完整链路未接 |
| `/drafts` | C01–C04 | 否 | 演示数据、仅提示 | 列表、新建、继续、放弃、412 | 全部未接 |
| `/bookmarks` | R11/R02 | 否 | 演示读取 | 收藏持久化、取消、空态 | 列表/取消未接 |
| `/following` | D02 | 否 | 演示读取 | 登录读取、cursor、屏蔽投影一致 | 未接 |
| `/notifications` | O01–O04 | 否 | 演示数据、仅提示 | 筛选、单条/批量已读、deepLink | 全部未接 |
| `/settings/profile` | P05/P06 | 否 | 静态表单、仅提示 | GET ETag、PATCH、412 恢复 | 未接 |
| `/settings/privacy` | P07/P08 | 否 | 静态表单、仅提示 | GET ETag、PATCH、隐私影响公开页 | 未接 |
| `/settings/notifications` | O05/O06 | 否 | 静态表单、仅提示 | GET ETag、独立 PATCH、安全通知不可关 | 未接 |
| `/settings/security` | A03/P04 | 否 | 演示数据 | 邮箱状态、安全摘要 | 未接 |
| `/settings/security/password` | A09 | 否 | 静态输入、仅提示 | 修改密码、错误原密码、撤销其他会话 | 未接 |
| `/settings/sessions` | A03/A04/A04b | 否 | 演示数据、仅提示 | 当前/其他会话、单撤销、批量撤销 | 未接 |
| `/settings/blocked`, `/blocked` | S04–S06 | 否 | 演示数据、仅提示 | 列表、解除、自屏蔽冲突 | 未接 |
| `/report/new` | S01 | 否 | 真实 POST，但固定目标/body | 从来源带真实 target、逐字段校验、幂等 | 表单字段未进入请求 |
| `/reports`, `/me/reports*` | S02/S03 | 否 | 演示数据 | 列表、详情、安全摘要、时间线 | 未接 |
| `/appeals*` | S07–S11 | 否 | 列表演示；S09 可由通用 BFF 到达 | 可申诉处置、提交、详情、补充 | 页面写入未接 |
| `/moderation*` | M01–M09 | 否 | 演示数据、仅提示 | capability、队列、ETag、四类独立动作、审计 | 全部页面未接 |
| `/coins`, `/coins/ledger` | K01–K03 | 否 | 演示数据 | 四余额、journal、分录、cursor | 未接 |
| `/coins/rules`, `/coins/economy` | K04/K13/K14 | 是 | 演示数据 | 规则历史、期间汇总、CSV | 未接 SSR |
| `/coins/bounties*` | K06–K11 | 否 | 演示数据、Dialog | quote、创建、采纳/取消 ETag、争议 | 全部页面未接 |
| `/settings/coins` | K15/K16 | 否 | 静态表单、仅提示 | GET ETag、PATCH | 未接 |
| `/moderation/coins*` | KM01–KM04 | 否 | 演示数据、仅提示 | 调查读取；释放/追回仅建议不记账 | 未接 |
| `/admin/coins/control` | KA01–KA08, KA14/KA15 | 否 | 演示数据、仅提示 | 提案/独立审批隔离、冻结 | 未接 |
| `/admin/coins/reconciliation` | KA09–KA13 | 否 | 演示数据、仅提示 | 对账、差异阻止关账、独立批准 | 未接 |
| `/admin/coins/adjustments/{id}` | KA06–KA08 | 否 | 演示数据、仅提示 | 拟议分录、批准记账、退回 | 未接 |
| `/journey`, `/play` | J01–J03 | 否 | 演示数据 | 周进度、当前/推荐任务 | 未接 |
| `/journey/onboarding` | J04/J05 | 否 | 静态表单、仅提示 | GET ETag、保存偏好 | 未接 |
| `/quests*`, `/play/quests*` | J02/J03/J06–J09 | 否 | 演示数据、仅提示 | 开始、暂停、退出、替换、版本冲突 | 未接 |
| `/me/progress` | J10 | 否 | 演示数据 | 成长路径与周记录 | 未接 |
| `/me/contributions` | J11/J12 | 否 | 演示数据 | 贡献来源、质量及四状态 | 未接 |
| `/me/collection` | J13a/J13p/J13d | 否 | 演示数据、Dialog | 收藏读取、逐项展示/隐藏 | 未接 |
| `/play/teams` | J14/J16/J17 | 否 | 演示数据、仅提示 | 协作列表、加入/退出 | 未接 |
| `/seasons*` | J18/J19 | 是 | 演示数据 | 主题季列表/详情/归档 SSR | 未接 |
| `/settings/journey` | J20–J23 | 否 | 静态表单、仅提示 | 偏好 ETag、暂停/恢复独立 operation | 未接 |
| `/journey/states`, `/prototype/states` | — | 视路由 | 验收样例 | 仅做视觉/可访问状态验收 | 不应调用业务 API |
| `/403`, `not-found` | Problem | 是 | 页面存在 | 403/安全 404/409/429 不泄露资源 | 需真实错误旅程 |

## 3. 测试批次

1. `P0 会话`：A01/A02/A10/A11，cookie 安全属性，登录来源恢复，登出门禁。
2. `P0 公开 SSR`：N01–N03、D01、C07/C08、P01–P03、D03–D08；抓取 HTML 而非只看 hydration 后 DOM。
3. `P0 内容写`：C06/C09、R01–R04；验证数据库持久化后刷新仍存在。
4. `P1 账户`：草稿、通知、资料/偏好、设备、安全、屏蔽、举报、申诉。
5. `P1 金币与治理`：所有写操作分别验证 capability、幂等、ETag 与双人审批。
6. `P1 Journey`：状态机、退出/替换/休息与跨域投影。

任何标为“演示数据”“仅提示”“静态表单”“Dialog”的项目，在替换为真实读写并通过浏览器 + API + 数据库三方验证前，验收结果必须为失败。
