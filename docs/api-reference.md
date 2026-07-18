# X2Post API 接口文档总览

> 版本：1.0.0
> 基线日期：2026-07-15
> 适用范围：当前 Next.js 网站的 79 个页面、全部公开 SSR 内容、登录账户功能、内容治理、金币账本与社区旅程。
> API Base URL：`https://<host>/api/v1`

## 1. 文档组成与优先级

本项目的 API 文档由三部分组成，三者共同构成完整交付物：

1. 本文：接入方式、实现状态、验收方式与常用完整示例。
2. [`prototype-api-design.md`](./prototype-api-design.md)：79 个页面到领域 API 的覆盖矩阵、聚合边界、状态机和跨域流程。
3. [`prototype-api-contracts.md`](./prototype-api-contracts.md)：157 个业务 operation + 1 个 Observability operation 的逐字段契约、全部 DTO、枚举、入参位置、成功响应、错误码、权限、幂等、并发和字段验证规则。

冲突优先级：字段契约 > 领域设计 > 页面实现。前端不提供运行时 Mock；所有服务端事实必须来自 X2API。

## 2. 功能覆盖结论

| 功能域 | 网站能力 | 契约范围 |
|---|---|---|
| Identity / Profile | 注册、登录、邮箱验证、密码找回、token 轮换、设备会话、资料与隐私 | A01–A11、P01–P08 |
| Taxonomy / Content | 两级节点、轻发布、长文草稿、附件、不可变帖子、评论与回复 | N01–N03、C01–C13b |
| Discovery / Social | Feed、关注 Feed、四类搜索、标签、收藏、反应、用户/节点关注 | D01–D08、R01–R11 |
| Notification | 通知列表、未读数、单条/批量已读、通知偏好 | O01–O06 |
| Safety / Moderation | 举报、屏蔽、申诉、案件、可见性、锁评、用户处置、审计 | S01–S11、M01–M09 |
| Coin Ledger | 四类余额、不可变分录、感谢、悬赏、争议、公开经济汇总、金币偏好 | K01–K16 |
| Coin Risk / Control | 风险调查、释放/追回建议、预算、规则、人工调整、对账、关账、写冻结 | KM01–KM04、KA01–KA15 |
| Journey | Onboarding、任务、暂停/退出/替换、成长、贡献、收藏、协作、主题季、休息 | J01–J23 |
| Observability | Web Vitals 上报 | `/api/observability/web-vitals`，不属于业务 `/api/v1` |

纯客户端功能不创建业务 API：主题切换、菜单开关、Dialog/Drawer、输入起句模板、预览对话框和本地任务恢复意图。所有会改变服务端事实的按钮都必须落到字段契约中的独立写 operation。

## 3. 当前实现状态

当前浏览器通过唯一同源 BFF `app/api/v1/[...path]/route.ts` 访问全部 `/api/v1/**` operation；公开 SSR Server Component 直接读取 X2API 公共 GET。`X2API_BASE_URL` 是必填启动配置，缺失时立即失败，禁止静默降级或回退静态业务数据。

### 3.1 会话桥接

- A02/A10 返回的 access token 与 refresh token 仅写入 HttpOnly、SameSite cookie，不向浏览器 JavaScript 暴露。
- BFF 为私有请求注入 Bearer access token；收到 401 时最多执行一次 A10 轮换并重放原业务请求。
- A11 成功或刷新失败时清理本地会话 cookie。
- 所有非安全方法校验精确同源 Origin，防止跨站请求伪造。

### 3.2 页面接入状态

逐页面 operation、SSR、读写状态和验收项以 [`frontend-backend-integration-matrix.md`](./frontend-backend-integration-matrix.md) 为准。未接能力只能显示明确不可用或真实空态，禁止伪造成功提示。

## 4. 认证与权限

### 4.1 Security scheme

```http
Authorization: Bearer <accessToken>
```

- access token 最长 15 分钟；refresh token 最长 30 天并由 A10 每次轮换。
- 公开 operation 在 OpenAPI 中必须显式 `security: []`。
- 可选 viewer state 的公开 operation 使用 `security: [{ bearerAuth: [] }, {}]`。
- 本人、治理、币审、Controller、独立审批和审计分别按 capability 校验，不能只依赖前端路由或角色字符串。
- 密码、token、Authorization、上传签名和完整私有证据不得进入 URL、日志、Web Vitals、Problem detail 或审计 reason。

### 4.2 Capability

| capability | 允许范围 |
|---|---|
| `authenticated` | 登录用户的社区写操作 |
| `moderation.case.read/write` | 普通治理案件读取/对应独立决定 |
| `moderation.sanction.high_risk` | 高风险用户处置 |
| `moderation.appeal.independent_review` | 独立申诉裁决，必须排除原处置人 |
| `coin.risk.investigate` | 金币风险调查和建议，不可记账 |
| `coin.control.propose` | Controller 提案，不可自批 |
| `coin.control.approve` | 独立审批，不可批准自己的提案 |
| `audit.read` | 不可变审计只读查询 |

## 5. 请求通用规范

### 5.1 必要 headers

```http
Content-Type: application/json
Accept: application/json
X-Request-Id: 019c7d3e-7e72-7f57-8dd5-a3dfab28b613
Idempotency-Key: 019c7d3e-7e72-7f57-8dd5-a3dfab28b613
If-Match: "7"
```

- `Idempotency-Key` 仅在契约标记 I 的 operation 强制，16..128 个 ASCII 字符。
- `If-Match` 仅在标记 V 的 operation 强制，必须是最近一次 GET 返回的强 ETag。
- JSON object 是封闭对象；任何未声明字段都返回 422。
- JSON body 默认最大 64 KiB；附件通过上传意图直传对象存储。
- 所有字符串、数字、数组、枚举、格式、条件必填和跨字段关系均按字段契约 1.1、1.2、2.7 校验。

### 5.2 分页

```json
{
  "items": [],
  "nextCursor": "eyJjcmVhdGVkQXQiOiIyMDI2LTA3LTE1VDA5OjMwOjAwWiIsImlkIjoicG9zdC0xIn0",
  "hasMore": true
}
```

`hasMore=true` 时 `nextCursor` 必填；`hasMore=false` 时必须省略。游标绑定用户、筛选和排序，不能跨查询复用。

## 6. 响应和错误

所有响应包含 `X-Request-Id`。创建资源返回 201 和 `Location`，异步受理返回 202，成功删除返回无 body 的 204。

```json
{
  "type": "https://x2post.com/problems/validation-failed",
  "title": "Validation Failed",
  "status": 422,
  "code": "VALIDATION_FAILED",
  "detail": "请求字段不符合接口契约",
  "instance": "/api/v1/posts",
  "requestId": "019c7d3e-7e72-7f57-8dd5-a3dfab28b613",
  "fieldErrors": [
    {
      "field": "childNodeSlug",
      "code": "NODE_PATH_NOT_FOUND",
      "message": "子节点不属于所选一级节点"
    }
  ]
}
```

`fieldErrors` 必须使用稳定机器码，前端不得依赖中文 message 做逻辑判断。安全 404 对“资源不存在”和“无权知道其存在”使用相同结构、状态和相近时延。

## 7. 关键完整示例

### 7.1 登录 A02

```http
POST /api/v1/auth/sessions
Content-Type: application/json
Idempotency-Key: 019c7d3e-7e72-7f57-8dd5-a3dfab28b613

{"login":"linmo@example.com","password":"<redacted>"}
```

成功返回 201 `AuthSessionResult`。失败统一返回 `INVALID_CREDENTIALS`，不能区分用户名不存在、邮箱不存在或密码错误。

### 7.2 当前页面直接发布 C06

```http
POST /api/v1/posts
Authorization: Bearer <accessToken>
Content-Type: application/json
Idempotency-Key: 019c7d55-73fd-777d-bb3d-4c3953ca82fa

{
  "title": "给内容社区做无障碍，不只是加 aria-label",
  "bodyMarkdown": "无障碍要覆盖完整任务路径，而不是只补充一个属性。",
  "parentNodeSlug": "frontend",
  "childNodeSlug": "quality",
  "tags": ["无障碍", "前端"],
  "attachmentUploadIds": [],
  "confirmedImmutable": true
}
```

关键验证：title 非空推导 `LONG`；child 必须属于 parent；tags NFC 规范化后去重；attachment 必须归本人且 CLEAN；confirmedImmutable 必须严格等于 true。成功返回 201 `PostDetail` 和 `Location: /posts/{postId}`。

轻发布使用同一接口但 `title:null`；它推导为 `QUICK`。不接受客户端传 `contentKind`，防止 title 与类型矛盾。

### 7.3 带版本的资料更新 P06

```http
PATCH /api/v1/users/me/profile
Authorization: Bearer <accessToken>
Content-Type: application/json
If-Match: "7"

{"displayName":"林默","bio":"在复杂系统里寻找简单边界。","location":null}
```

PATCH 至少一项；只有 location/avatar 允许显式 null 清空。成功返回完整 `EditableProfile` 和新 ETag；版本冲突返回 412 并带 `currentVersion/currentEtag`。

### 7.4 金币悬赏 K07

先调用 K07q 获取短期 quote，再提交：

```json
{
  "postId": "accessible-ui",
  "amountTier": 50,
  "quoteId": "quote-bounty-01",
  "expiresAt": "2026-07-29T10:00:00Z"
}
```

服务端验证帖子所有权、quote 过期、规则版本、余额、档位和到期区间；客户端不能提交 answerer/sink 金额或钱包余额。账本事务必须同时写平衡分录和余额快照。

### 7.5 治理可见性决定 M06

```json
{
  "targetType": "POST",
  "targetId": "immutable-content",
  "visibility": "HIDDEN",
  "reason": "内容包含可识别私人住址，先隐藏并等待独立复核。",
  "evidenceRefs": ["snapshot:case-2026-0715:1"]
}
```

请求同时要求 `Idempotency-Key` 与 `If-Match`。它只能改变可见性投影，不能修改或删除原文；成功必须原子写入 `AuditEntry`。锁评、用户处置和申诉裁决必须分别调用 M07、M08、M09。

## 8. 字段验证实现要求

后端每个 operation 必须按以下顺序验证，且契约测试逐层覆盖：

1. HTTPS、method、Content-Type、body 大小和 JSON object 根节点。
2. 认证有效性、session/token 状态、capability 和资源归属。
3. headers：Idempotency-Key、If-Match、X-Request-Id。
4. 未知字段、字段类型、null/缺省、长度、范围、pattern、format、enum。
5. 数组数量、元素、重复值和顺序约束。
6. 跨字段条件、父子关系、状态机、时间窗口和业务唯一键。
7. 并发版本、幂等重放、账务锁与双人审批隔离。
8. 响应 DTO、公开/私有数据隔离、缓存 header 和审计/outbox。

验证器不得做会隐藏用户错误的隐式转换：不把 `"42"` 转成 42，不把 `"true"` 转成 true，不自动截断字符串，不修复非法枚举，不把未知字段丢弃。

## 9. 后端交付验收门槛

- 157 个业务 operation 和 1 个 Observability operation 均能从 OpenAPI 3.1 生成请求/响应 schema，所有 object 都是封闭 schema。
- 每个 operation 至少有：成功、未认证/无权限、逐字段非法、业务冲突、幂等重放、版本冲突（如适用）契约测试。
- 每个请求字段至少覆盖：缺失、null、错误类型、边界最小/最大、越界、非法 format/enum；每个响应字段至少覆盖必填、类型、null、枚举和数据隔离。
- 公开 SSR 页面依赖的 N/D/C/P/J/K 公共 GET 可匿名调用、可缓存且不包含 viewer 私有字段。
- 本人、治理、财务接口全部 `no-store`，越权统一 403 或安全 404，不泄露资源存在性。
- Post/Comment 原文无 PATCH/DELETE；Node 无产品写 API；账本和审计只追加；Controller 发起人与审批人必须不同。
- CI 必须运行 OpenAPI lint、请求/响应 schema 测试、权限矩阵测试、状态机测试、幂等/并发测试和页面覆盖矩阵检查。

## 10. 前后端联调顺序

建议按依赖和当前页面价值分批交付：

1. N/D/C/P/R/O：公开 SSR、Feed、帖子、评论、搜索、用户、收藏、关注、通知。
2. A + Profile/Settings：生产认证、设备会话、资料与各领域偏好。
3. S/M：举报、屏蔽、申诉和治理审计。
4. K/KM/KA：独立账本、悬赏、风险和 Controller 双人审批。
5. J：旅程、项目、主题季和跨域 outbox 投影。

每批必须先合入字段 schema 和契约测试，再接数据库/服务实现，最后接入前端；不得让前端从临时响应反推生产字段。
