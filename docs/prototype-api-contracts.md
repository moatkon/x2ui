# X2Post API 字段级契约（当前网站完整基线）

> 状态：后端实现、Mock、前端联调和契约测试的唯一字段级基线，更新于 2026-07-15。
> 范围：覆盖当前 Next.js 项目全部产品页面与交互。本文把复合 method 行展开为 157 个业务 operation，并定义 1 个 Observability operation；`docs/prototype-api-design.md` 负责领域边界和页面覆盖，若两者冲突，以本文字段契约为准。
> 所有路径均为完整生产路径；禁止 `data:any`、`metadata:any`、通用 `actionType`、万能 page payload 和未声明的请求/响应字段。

## 1. 记法、传输与通用约束

### 1.1 字段记法

`name:type!` 表示必填且不可为 `null`，`name:type?` 表示可省略；只有显式写成 `type|null` 才允许传或返回 `null`。`string(1..80)` 表示按 Unicode code point 计数的长度；`enum[A|B]` 表示大小写敏感闭集；`uuid`、`date`、`date-time`、`uri`、`email` 均采用 OpenAPI 3.1 format。响应未标 `?` 的字段始终存在，集合永不返回 `null`。

基础格式为闭集，所有字段必须命中其中一个格式或操作行内的更严格约束：

| 格式 | 精确校验 |
|---|---|
| `resource-id` | 不透明资源标识，`string(1..80)`，`^[A-Za-z0-9][A-Za-z0-9._:-]{0,79}$`。兼容当前 `immutable-content`、`node-product`、`AP-2026-0041`、`J-77120`；客户端不得解析其业务含义 |
| `uuid` | RFC 4122 UUID，canonical 小写连字符形式；用于 request/event/correlation id，不与业务资源 ID 混用 |
| `slug` | `string(1..64)`，`^[a-z0-9]+(?:-[a-z0-9]+)*$`；Node、Season 使用。Tag 路径段使用 `tag-slug` |
| `tag-slug` | URL decode 后 NFC 规范化，`string(1..40)`；允许中文、字母、数字、`-`、`_`，禁止 `/`、控制字符和双重编码 |
| `user-name` | `string(3..32)`，`^[a-z0-9][a-z0-9_-]{2,31}$`，统一转小写后检查唯一性 |
| `date-time` | RFC 3339 UTC，必须以 `Z` 结尾，毫秒最多 3 位；例 `2026-07-15T09:30:00.000Z` |
| `date` | RFC 3339 full-date，`YYYY-MM-DD` |
| `year-month` | `^[0-9]{4}-(0[1-9]|1[0-2])$` |
| `cursor` | Base64URL 不透明字符串，`string(1..512)`；客户端不得构造或修改 |
| `etag` | 强 ETag，`"<positive-integer-version>"`；弱 ETag 不接受 |
| `money-int` | JSON integer，`0..9007199254740991`；金币禁止小数、负零和字符串数字 |

为消除旧文档中的简写歧义，未显式写范围时执行以下兜底规则：普通 `string!` 为 `string(1..2000)`，普通 `string?` 为省略或 `string(1..2000)`；普通 `int!` 为 JavaScript safe integer `-9007199254740991..9007199254740991`；所有 `count`、`version`、`total`、`size`、`amount` 字段如未另写范围均必须 `>=0`。操作或 DTO 的显式约束优先于兜底规则。

### 1.2 强制请求与响应校验

- 所有 JSON object 均为封闭对象：等价于 JSON Schema 2020-12 的 `additionalProperties:false`。未知字段返回 422 `UNKNOWN_FIELD`，不得静默忽略。
- 请求 `Content-Type` 必须为 `application/json`；默认 body 上限 64 KiB，上传二进制不经过业务 JSON 接口。非法 JSON 返回 400，错误根节点必须是 object，数组/标量根节点返回 400。
- 字符串先验证 UTF-8、拒绝 NUL/C0 控制字符，再做 NFC 规范化；密码、token、Markdown 正文不做 trim 或 Unicode 等价改写。普通枚举、slug、email 周边空白不自动修复，直接 422。
- PATCH 至少包含一个允许字段；省略表示不修改。显式 `null` 仅在操作行写明“可清空”时允许。PUT/POST 请求体即使为空也必须发送 `{}`，DELETE 不接收 body。
- 数组同时校验类型、`minItems/maxItems`、元素 schema 和业务唯一性；`tagLabels`、`uploadIds`、`evidenceUploadIds`、`holdIds`、`journalIds` 不允许重复。
- 服务端在出站前也必须用响应 schema 校验：缺少必填字段、返回 `null`、枚举越界或出现未声明字段均视为服务端契约错误，记录 requestId 并返回 500，不把畸形 payload 发送给前端。
- OpenAPI/JSON Schema 实现必须对请求和响应复用同一 DTO 定义，但公开、本人、治理、财务视图使用不同 schema，不允许通过“序列化时删字段”实现数据隔离。
- 前端表单校验只改善体验，不能替代服务端校验；服务端必须逐字段累积 `fieldErrors`，一次返回所有可确定错误。

### 1.3 通用 headers

| Header | 使用范围 | 类型/约束 |
|---|---|---|
| `Authorization` | 登录接口 | `Bearer <accessToken>`；公开接口可省略；不能用 query token |
| `Idempotency-Key` | 本文标 `I` 的 POST/PUT | 必填，ASCII 16..128；作用域为 actor+operation；保留至少 24h，账务/治理永久保留业务唯一键 |
| `If-Match` | 本文标 `V` 的 PATCH/DELETE/高后果 POST | 必填，强 ETag，例如 `"7"` |
| `ETag` | 可编辑资源 GET/成功写响应 | 聚合版本；禁止用更新时间伪造 |
| `X-Request-Id` | 可选请求、所有响应 | 请求可传 UUID；服务端总返回最终 requestId |
| `Retry-After` | 429/503 | 秒数或 HTTP date |

`Idempotency-Key` 相同且规范化 body 相同：返回首次状态码/body，并加 `Idempotency-Replayed:true`；key 相同但 body 不同：409 `IDEMPOTENCY_KEY_REUSED`。PUT/DELETE 关系操作本身幂等，仍接受 request id，不要求 I。

### 1.4 分页、排序与 Problem Details

`CursorQuery = cursor:cursor?; limit:int(1..100)=20`。`CursorPage<T> = {items:T[]!,nextCursor:cursor?,hasMore:boolean!}`，并强制 `(hasMore=false => nextCursor 省略)`、`(hasMore=true => nextCursor 必填)`。后台 `PageQuery = page:int>=1=1; pageSize:int(1..100)=20`，`NumberPage<T>={items:T[]!,page:int!,pageSize:int!,total:int>=0!}`。游标绑定 actor、筛选和排序条件，换条件后旧游标返回 400 `CURSOR_FILTER_MISMATCH`。

错误使用 `application/problem+json`：

```text
Problem = {
  type:uri!, title:string(1..120)!, status:int(400..599)!, code:ErrorCode!, detail:string(1..2000)!,
  instance:uri!, requestId:uuid!,
  fieldErrors:{field:string(1..200)!,code:string(1..80)!,message:string(1..500)!}[]! maxItems 100,
  retryAfterSeconds:int>=0?, currentVersion:int>=1?, currentEtag:string?
}
```

通用码：`MALFORMED_JSON`(400)、`INVALID_JSON_OBJECT`(400)、`CURSOR_FILTER_MISMATCH`(400)、`AUTH_REQUIRED`(401)、`SESSION_EXPIRED`(401)、`FORBIDDEN`(403)、`RESOURCE_NOT_FOUND`(404)、`STATE_CONFLICT`(409)、`IDEMPOTENCY_KEY_REUSED`(409)、`VERSION_MISMATCH`(412)、`PAYLOAD_TOO_LARGE`(413)、`UNSUPPORTED_MEDIA_TYPE`(415)、`VALIDATION_FAILED`(422)、`UNKNOWN_FIELD`(422)、`RATE_LIMITED`(429)。安全 404 与真实不存在使用相同 body/时延桶；公开响应不含 `existenceHint`。

### 1.5 HTTP、缓存和时间语义

- 所有流量只允许 HTTPS。JSON 使用 UTF-8；成功 JSON 响应必须返回 `Content-Type: application/json; charset=utf-8`，错误返回 `application/problem+json`。
- POST 创建资源返回 `201 + Location`；异步受理返回 `202 + Location`；DELETE 成功返回 204 且没有 body。PUT 关系创建无论此前是否存在都返回当前最终状态；DELETE 已不存在的关系仍返回 204，除非操作行明确要求业务冲突。
- 公开且不含 viewer state 的 GET：`public, s-maxage=60, stale-while-revalidate=300`。本人、认证、治理、财务和带 viewer state 的响应：`private, no-store`。可选鉴权公开 GET 必须 `Vary: Authorization` 或拆分公共/本人投影。
- 服务端生成的所有时间以同一事务时钟为准；请求时间比较容忍最多 5 分钟客户端偏差，但账务、申诉期限、幂等和状态机只使用服务端时间。

## 2. 可复用枚举与 DTO

### 2.1 枚举

| 名称 | 值 |
|---|---|
| `Visibility` | `VISIBLE,HIDDEN` |
| `ContentStatus` | `PUBLISHED,HIDDEN` |
| `ReactionType` | `AGREE`（新增类型必须先版本化契约） |
| `NodeLevel` | `PARENT,CHILD` |
| `NotificationType` | `REPLY,MENTION,FOLLOW,REACTION,REPORT_UPDATE,APPEAL_UPDATE,SECURITY,COIN_REWARD,BOUNTY_UPDATE,COIN_HOLD,JOURNEY_SUMMARY` |
| `ReportTargetType` | `POST,COMMENT,USER` |
| `ReportReason` | `HARASSMENT,HATE,SPAM,DANGEROUS_OR_ILLEGAL,PRIVACY,IMPERSONATION,OTHER` |
| `ReportStatus` | `SUBMITTED,TRIAGED,IN_REVIEW,RESOLVED_NO_VIOLATION,RESOLVED_ACTIONED` |
| `AppealStatus` | `SUBMITTED,UNDER_REVIEW,DECIDED` |
| `SanctionKind` | `WARNING,RATE_LIMIT,MUTE,BAN,RESTORE` |
| `AppealOutcome` | `UPHOLD,REVOKE,REPLACE` |
| `CoinBalanceBucket` | `AVAILABLE,PENDING,ESCROW,HELD` |
| `CoinJournalStatus` | `PENDING,ESCROWED,HELD,SETTLED,BURNED,REFUNDED,REVERSED` |
| `CoinJournalType` | `STARTER_GRANT,QUALITY_REWARD,THANK,BOUNTY_ESCROW,BOUNTY_SETTLEMENT,BOUNTY_REFUND,RISK_HOLD,RELEASE,RECOVERY,MANUAL_ADJUSTMENT,SINK` |
| `BountyStatus` | `OPEN,ACCEPTED,CANCELLED,EXPIRED,HELD` |
| `QuestType` | `REPLY,RESOURCE,CURATION,CARE` |
| `EnrollmentStatus` | `ACTIVE,PAUSED,NEEDS_ATTENTION,EXITED,COMPLETED` |
| `SettlementState` | `NOT_APPLICABLE,PENDING_SYNC,PENDING_QUALITY,CONFIRMED,REJECTED,HELD` |
| `ApprovalStatus` | `PROPOSED,APPROVED,RETURNED,REJECTED,EXECUTED` |

### 2.2 身份、公开内容与关系 DTO

| DTO | 完整字段 |
|---|---|
| `PublicUserSummary` | `id:resource-id!,userName:user-name!,displayName:string(1..40)!,avatarUrl:uri?` |
| `PublicUser` | `user:PublicUserSummary!,bio:string(0..160)!,location:string(0..80)?,joinedAt:date-time!,stats:{postCount:int!,commentCount:int!,followingCount:int!,followerCount:int!}!,viewerState:{following:boolean!,blocked:boolean!}?,permissions:{canFollow:boolean!,canBlock:boolean!,canReport:boolean!}?` |
| `NodeSummary` | `id:resource-id!,slug:slug!,name:string(1..40)!,level:NodeLevel!,parentSlug:slug?,description:string(1..240)!,ruleVersion:string(1..40)!,canPost:boolean!,postCount:int>=0!,followerCount:int>=0!` |
| `NodeDetail` | `node:NodeSummary!,ruleText:string(1..4000)!,children:NodeSummary[]!,inheritance:{parentFollowCoversChildren:boolean!,childFollowCoversParent:boolean!}!,viewerState:{directlyFollowing:boolean!,coveredByParent:boolean!}?` |
| `NodePath` | `parent:NodeSummary!,child:NodeSummary?,displayName:string!` |
| `TagSummary` | `slug:tag-slug!,label:string(1..40)!,publicPostCount:int>=0!` |
| `PostSummary` | `id:resource-id!,title:string(0..80)!,displayTitle:string(1..80)!,excerpt:string(0..280)!,contentKind:enum[QUICK|LONG]!,author:PublicUserSummary!,nodePath:NodePath!,tags:TagSummary[]!,createdAt:date-time!,counts:{comments:int!,reactions:int!,bookmarks:int!}!,status:ContentStatus!,viewerState:{bookmarked:boolean!,reactions:ReactionType[]}?,permissions:{canComment:boolean!,canReport:boolean!}?`；QUICK 的 title 可空，displayTitle 由正文首个纯文本行确定并持久化，列表永远用 displayTitle |
| `PostDetail` | `post:PostSummary!,bodyMarkdown:string(1..50000)!,bodyHtml:string(1..200000)!,commentLock:{locked:boolean!,reasonCategory:string(1..80)?}!,attachments:PublishedAttachment[]! maxItems 8,activeBounty:{id:resource-id!,amount:money-int!,status:BountyStatus!}?,canonicalUrl:uri!` |
| `PublishedAttachment` | `id:resource-id!,fileName:string(1..255)!,mimeType:enum[image/png|image/jpeg|application/pdf]!,sizeBytes:int(1..10485760)!,url:uri!,scanStatus:enum[CLEAN]!` |
| `Comment` | `id:resource-id!,postId:resource-id!,rootCommentId:resource-id!,parentCommentId:resource-id?,anchorKey:string(1..80)!,bodyMarkdown:string(1..2000)!,bodyHtml:string(1..10000)!,author:PublicUserSummary!,createdAt:date-time!,replyCount:int>=0!,reactionCount:int>=0!,status:ContentStatus!,viewerState:{reactions:ReactionType[]! maxItems 10}?,permissions:{canReply:boolean!,canReport:boolean!}?` |
| `CommentContext` | `post:PostSummary!,ancestors:Comment[]!,target:Comment!,location:{topLevelCommentId:resource-id!,topLevelCursor:string!,replyCursor:string?}!` |
| `RelationshipResult` | `subjectId:string!,active:boolean!,effective:boolean!,count:int>=0!,updatedAt:date-time!` |

公开 DTO 只使用上述类型，不得嵌入 email、session、角色、IP、风控分值、余额、未发布草稿或内部 permissions。匿名缓存键与登录 viewer projection 分离，响应加 `Vary: Authorization` 或完全分端点缓存。

### 2.3 私有创作、账户与通知 DTO

| DTO | 完整字段 |
|---|---|
| `Session` | `id:resource-id!,deviceName:string(1..120)!,browser:string(1..120)!,approximateLocation:string(1..120)?,createdAt:date-time!,lastActiveAt:date-time!,current:boolean!,riskState:enum[NORMAL|REAUTH_REQUIRED]!` |
| `AuthSessionResult` | `accessToken:string!,accessExpiresAt:date-time!,refreshToken:string!,refreshExpiresAt:date-time!,session:Session!,user:PublicUserSummary!,emailVerified:boolean!` |
| `MeSummary` | `user:PublicUserSummary!,emailMasked:string!,emailVerified:boolean!,counts:{unreadNotifications:int!,drafts:int!,bookmarks:int!,following:int!}!,security:{activeSessions:int!,passwordChangedAt:date-time?}!` |
| `EditableProfile` | `displayName:string(1..40)!,bio:string(0..160)!,location:string(0..80)?,avatarUploadId:resource-id?,version:int>=1!` |
| `PrivacyPreferences` | `mentionable:boolean!,showFollowing:boolean!,indexPublicProfile:boolean!,version:int!` |
| `Draft` | `id:resource-id!,title:string(0..80)!,bodyMarkdown:string(0..50000)!,nodePath:{parentNodeId:resource-id!,childNodeId:resource-id?}?,tagLabels:string(0..40)[]! maxItems 5,uploadIds:resource-id[]! maxItems 8,status:enum[EDITING|PUBLISHING|PUBLISHED]!,completionPercent:int(0..100)!,createdAt:date-time!,updatedAt:date-time!,publishedPostId:resource-id?,version:int!` |
| `UploadIntent` | `id:resource-id!,uploadUrl:uri!,httpMethod:enum[PUT]!,requiredHeaders:{contentType:string!,checksumSha256:string!}!,expiresAt:date-time!,maxBytes:int!` |
| `Upload` | `id:resource-id!,fileName:string!,mimeType:string!,sizeBytes:int!,checksumSha256:string!,state:enum[UPLOADING|SCANNING|CLEAN|REJECTED]!,rejectionCode:enum[MALWARE|TYPE_MISMATCH|TOO_LARGE]?` |
| `Notification` | `id:resource-id!,type:NotificationType!,title:string(1..120)!,summary:string(0..240)!,createdAt:date-time!,readAt:date-time?,deepLink:{route:string(1..300)! pattern ^/(posts|users|me|reports|appeals|settings|coins|quests|journey)/,anchorKey:string?}!,actor:PublicUserSummary?,subject:{type:enum[POST|COMMENT|REPORT|APPEAL|SESSION|JOURNAL|BOUNTY|JOURNEY]!,id:string!}!`；route 只能是站内相对路径 |
| `NotificationPreferences` | `reply:{inApp:boolean!,emailDigest:boolean!}!,mention:{inApp:boolean!,emailDigest:boolean!}!,follow:{inApp:boolean!,emailDigest:boolean!}!,reaction:{inApp:boolean!,emailDigest:boolean!}!,governance:{inApp:boolean!,emailDigest:boolean!}!,security:{inApp:true,emailDigest:true}!,version:int!` |

### 2.4 Safety 与治理 DTO

| DTO | 完整字段 |
|---|---|
| `SafeTargetSummary` | `type:ReportTargetType!,id:string!,label:string!,author:PublicUserSummary?,createdAt:date-time?,publicUrl:uri?,visibility:Visibility!`（隐藏时 label 为固定安全占位，不返回原文） |
| `Report` | `id:resource-id!,target:SafeTargetSummary!,reason:ReportReason!,details:string(0..1000)!,status:ReportStatus!,submittedAt:date-time!,updatedAt:date-time!,timeline:{status:ReportStatus!,at:date-time!,publicMessage:string!}[]!,resolution:{category:enum[ACTION_TAKEN|NO_VIOLATION]!,message:string!}?` |
| `EnforcementSummary` | `id:resource-id!,kind:enum[VISIBILITY|COMMENT_LOCK|USER_SANCTION]!,subject:SafeTargetSummary!,effectiveAt:date-time!,expiresAt:date-time?,appealDeadline:date-time!,appealable:boolean!` |
| `Appeal` | `id:resource-id!,enforcement:EnforcementSummary!,reason:enum[CONTEXT_MISUNDERSTOOD|SCOPE_INAPPROPRIATE|NEW_EVIDENCE|OTHER]!,statement:string(1..2000)!,status:AppealStatus!,submittedAt:date-time!,updatedAt:date-time!,supplements:{id:resource-id!,statement:string!,createdAt:date-time!}[]!,decision:{outcome:AppealOutcome!,reason:string!,decidedAt:date-time!}?` |
| `ModerationCaseSummary` | `id:resource-id!,target:SafeTargetSummary!,reason:ReportReason!,priority:enum[URGENT|HIGH|NORMAL|LOW]!,status:enum[UNASSIGNED|ASSIGNED|IN_REVIEW|RESOLVED]!,reportCount:int!,enteredAt:date-time!,slaDueAt:date-time!,assignee:PublicUserSummary?,version:int!` |
| `ModerationCase` | `case:ModerationCaseSummary!,riskSummary:string(1..2000)!,contentSnapshot:{snapshotId:resource-id!,sealed:boolean!,body:string?}!,subjectHistory:{kind:string!,at:date-time!,summary:string!}[]!,decisions:{id:resource-id!,decisionType:enum[VISIBILITY|COMMENT_LOCK|USER_SANCTION]!,summary:string!,actor:PublicUserSummary!,createdAt:date-time!}[]!,allowedCommands:{visibility:boolean!,commentLock:boolean!,userSanction:boolean!}!` |
| `AuditEntry` | `id:resource-id!,actor:{id:resource-id!,displayName:string!,capability:string!}!,operation:enum[CASE_ASSIGNMENT|VISIBILITY_DECISION|COMMENT_LOCK_DECISION|USER_SANCTION|APPEAL_DECISION|COIN_RECOMMENDATION|COIN_APPROVAL|PERIOD_CLOSE]!,subjectType:string!,subjectId:string!,reason:string!,requestId:uuid!,correlationId:uuid!,createdAt:date-time!` |
| `VisibilityDecisionResult` | `decisionId:resource-id!,caseId:resource-id!,subjectId:resource-id!,previousVisibility:Visibility!,currentVisibility:Visibility!,effectiveAt:date-time!,auditEntryId:resource-id!,caseVersion:int!` |
| `CommentLockDecisionResult` | `decisionId:resource-id!,caseId:resource-id!,postId:resource-id!,previousLocked:boolean!,currentLocked:boolean!,effectiveAt:date-time!,auditEntryId:resource-id!,caseVersion:int!` |
| `UserSanctionResult` | `sanctionId:resource-id!,caseId:resource-id!,userId:resource-id!,kind:SanctionKind!,scope:enum[POSTING|COMMENTING|ALL_WRITES|ACCOUNT]!,expiresAt:date-time?,effectiveAt:date-time!,auditEntryId:resource-id!,caseVersion:int!` |
| `AppealDecisionResult` | `decisionId:resource-id!,appealId:resource-id!,outcome:AppealOutcome!,resultingEnforcement:EnforcementSummary!,decidedAt:date-time!,auditEntryId:resource-id!,appealVersion:int!` |

治理 DTO 可见原始证据但不得复用为公开 DTO；财务调查只通过 journal ID 关联，不读取无关内容正文。

### 2.5 金币与 Controller DTO

| DTO | 完整字段 |
|---|---|
| `CoinWallet` | `userId:resource-id!,unit:enum[X2_COIN]!,balances:{available:int>=0!,pending:int>=0!,escrow:int>=0!,held:int>=0!}!,weeklyReward:{earned:int>=0!,cap:int>=0!,resetsAt:date-time!}!,ruleVersion:string!,updatedAt:date-time!` |
| `LedgerEntry` | `id:resource-id!,journalId:resource-id!,accountCode:string(1..120)!,direction:enum[DEBIT|CREDIT]!,amount:int>0!,unit:enum[X2_COIN]!` |
| `CoinJournal` | `id:resource-id!,type:CoinJournalType!,status:CoinJournalStatus!,occurredAt:date-time!,amount:int>0!,unit:enum[X2_COIN]!,description:string(1..240)!,ruleVersion:string!,source:{type:enum[POST|COMMENT|BOUNTY|RISK_CASE|INCIDENT|QUEST_EVENT]!,id:string!}!,entries:LedgerEntry[]!,reversalOfJournalId:resource-id?,disputable:boolean!` |
| `Bounty` | `id:resource-id!,post:PostSummary!,owner:PublicUserSummary!,amount:int enum[20|50|100]!,unit:enum[X2_COIN]!,status:BountyStatus!,createdAt:date-time!,acceptAfter:date-time!,expiresAt:date-time!,version:int!,distribution:{answerer:int!,sink:int!}!,eligibleAnswers:{comment:Comment!,eligible:boolean!,ineligibilityCode:string?}[]!,timeline:{state:BountyStatus!,at:date-time!,journalId:resource-id?}[]!` |
| `CoinDispute` | `id:resource-id!,journalId:resource-id!,status:enum[SUBMITTED,IN_REVIEW,RESOLVED]!,reasonCategory:string!,statement:string!,submittedAt:date-time!,reviewDueAt:date-time!,timeline:{state:string!,at:date-time!,publicMessage:string!}[]!` |
| `EconomySummary` | `period:string pattern ^[0-9]{4}-[0-9]{2}$!,openingSupply:int!,issued:int!,sunk:int!,closingSupply:int!,activeWallets:int!,dormancyRate:number(0..1)!,reversals:int!,ruleVersion:string!,publishedAt:date-time!` |
| `CoinPreferences` | `rewardNotifications:boolean!,bountyNotifications:boolean!,holdNotifications:boolean!,showPublicContributions:boolean!,requireReauthForHighRisk:boolean!,version:int!` |
| `CoinRiskCase` | `id:resource-id!,type:enum[CIRCULAR_THANKS,BOUNTY_COLLUSION,ACCOUNT_TAKEOVER,REPLAY]!,status:enum[UNASSIGNED,INVESTIGATING,RECOMMENDED,CLOSED]!,amount:int!,slaDueAt:date-time!,holdIds:resource-id[]!,journalIds:resource-id[]!,evidence:{kind:string!,summary:string!,sourceRef:string!}[]!,history:{state:string!,at:date-time!,actorId:resource-id!}[]!,version:int!` |
| `CoinRuleSet` | `version:string(1..40)!,qualityRewards:{distinctTrustedThreshold:int>0!,amount:int>0!}[] min1!,pendingObservationSeconds:int(0..604800)!,weeklyUserRewardCap:int>=0!,thank:{cost:int>0!,recipientAmount:int>=0!,sinkAmount:int>=0!,dailyCountCap:int>=0!}!,bounty:{amountTiers:int>0[] min1!,acceptDelaySeconds:int>=0!,answererSharePercent:int(0..100)!,sinkPercent:int(0..100)!,defaultDurationDays:int(1..365)!,maxDurationDays:int(1..365)!}!,effectiveAt:date-time!,nonMonetaryNotice:string(20..1000)!`；约束 cost=recipient+sink，两个 percent 合计 100，阈值严格递增 |
| `BudgetChangeProposal` | `id:resource-id!,period:string YYYY-MM!,status:ApprovalStatus!,oldCap:int>=0!,newCap:int>=0!,rationale:string!,impactForecast:string!,effectiveAt:date-time!,stopConditions:string!,proposerId:resource-id!,approverId:resource-id?,version:int!,createdAt:date-time!` |
| `RuleChangeProposal` | `id:resource-id!,status:ApprovalStatus!,currentRuleVersion:string!,proposedRule:CoinRuleSet!,rationale:string!,impactForecast:string!,stopConditions:string!,proposerId:resource-id!,approverId:resource-id?,version:int!,createdAt:date-time!` |
| `WriteFreezeProposal` | `id:resource-id!,status:ApprovalStatus!,scope:enum[ALL_COIN_WRITES|ISSUANCE_ONLY|SPENDING_ONLY]!,rationale:string!,reviewDueAt:date-time!,automaticTrigger:{ruleId:string!,observedMetric:enum[LEDGER_IMBALANCE|NEGATIVE_BALANCE|RECONCILIATION_DIFFERENCE]!,observedValue:int!}?,proposerId:resource-id!,approverId:resource-id?,activatedAt:date-time?,version:int!,createdAt:date-time!` |
| `ManualAdjustment` | `id:resource-id!,incidentId:string!,period:string!,reason:string!,status:ApprovalStatus!,proposerId:resource-id!,approverId:resource-id?,proposedEntries:{accountCode:string!,direction:enum[DEBIT|CREDIT]!,amount:int>0!}[]!,journalId:resource-id?,version:int!,createdAt:date-time!` |
| `ReconciliationRun` | `id:resource-id!,period:string!,scope:enum[DAILY|MONTHLY]!,status:enum[QUEUED,RUNNING,MATCHED,DIFFERENCE,FAILED]!,startedAt:date-time!,finishedAt:date-time?,checks:{name:string!,ledgerValue:int!,businessValue:int!,difference:int!,status:enum[MATCHED,DIFFERENCE]!}[]!,differenceCount:int!,version:int!` |
| `PeriodCloseRequest` | `id:resource-id!,period:string!,reconciliationRunId:resource-id!,status:ApprovalStatus!,proposerId:resource-id!,approverId:resource-id?,closedAt:date-time?,version:int!` |

`LedgerEntry[]` 对用户只返回与本人钱包和系统对手方有关的安全科目；Controller/审计 DTO 才返回完整 accountCode。个人余额、风控证据绝不进入 EconomySummary。

### 2.6 Journey DTO

| DTO | 完整字段 |
|---|---|
| `Quest` | `id:resource-id!,title:string(1..100)!,description:string(1..500)!,node:NodeSummary!,type:QuestType!,estimatedMinutes:int(1..120)!,steps:{id:string!,label:string!,completionSource:enum[CONTENT_EVENT|QUALITY_EVENT|PROJECT_EVENT]!,completed:boolean!}[]!,rewardExplanation:string!,cxpPotential:int>=0!,weeklyExpiresAt:date-time?,sourceOptions:{type:enum[POST|NODE_PROJECT]!,id:string!,label:string!}[]!,status:enum[AVAILABLE,ACTIVE,UNAVAILABLE]!,unavailableReason:string?` |
| `Enrollment` | `id:resource-id!,questId:resource-id!,source:{type:enum[POST|NODE_PROJECT]!,id:string!}!,status:EnrollmentStatus!,startedAt:date-time!,pausedAt:date-time?,completedAt:date-time?,progress:{completedSteps:int!,totalSteps:int!}!,version:int!` |
| `JourneySummary` | `weekStart:date!,weekEnd:date!,completedContributions:int!,targetContributions:int!,coveredNodes:int!,cxp:{confirmed:int!,pending:int!}!,role:{current:string!,next:string?}!,currentEnrollment:Enrollment?,recommendedQuests:Quest[]! maxItems 3` |
| `Contribution` | `id:resource-id!,type:QuestType!,node:NodeSummary!,impact:string!,source:{type:enum[POST|COMMENT|PROJECT_ARTIFACT]!,id:string!,safeLabel:string!,route:string?}!,occurredAt:date-time!,qualityState:SettlementState!,cxpState:SettlementState!,ncpState:SettlementState!,coinCandidateState:SettlementState!` |
| `CollectionItem` | `id:resource-id!,name:string!,description:string!,earnedAt:date-time!,sourceContributionId:resource-id!,displayed:boolean!,iconKey:string!` |
| `NodeProject` | `id:resource-id!,node:NodeSummary!,title:string!,goal:string!,status:enum[OPEN,ARCHIVED]!,memberCount:int!,memberLimit:int!,progress:{accepted:int!,target:int!}!,openTaskCount:int!,participant:boolean!,displayNamePublic:boolean?` |
| `Season` | `slug:string!,title:string!,scope:string!,status:enum[UPCOMING,ACTIVE,ARCHIVED]!,startsAt:date-time!,endsAt:date-time!,progress:{accepted:int!,target:int!}!,goal:string!,acceptanceRule:string!,archiveProjectId:resource-id?` |
| `JourneyPreferences` | `weeklySummary:boolean!,questRecommendations:boolean!,showPathMarks:boolean!,version:int!` |
| `JourneyPause` | `id:resource-id!,startedAt:date-time!,until:date-time?,active:boolean!` |

### 2.7 DTO 条件必填、互斥与一致性校验

下表是字段 schema 之外必须执行的第二层校验。任一约束失败，请求返回 422（字段可修正）或 409（资源状态冲突）；响应失败按 1.2 作为服务端契约错误处理。

| DTO/字段组 | 强制规则 |
|---|---|
| `PublicUserSummary` | `id` 与 `userName` 分别全局稳定；修改显示名不得改变两者。`avatarUrl` 只允许 HTTPS CDN/本站 URL，不允许 `data:`、`javascript:` 或带访问 token |
| `PublicUser.stats` | 四个计数均 `>=0`；匿名响应省略 `viewerState/permissions`，登录且查看本人时 `canFollow=false,canBlock=false` |
| `NodeSummary` | `level=PARENT => parentSlug` 省略；`level=CHILD => parentSlug` 必填。父子 slug 在各自层级唯一，`canPost=false` 时发布接口必须拒绝 |
| `NodeDetail` | `node.level=CHILD => children=[]`；children 每项 `level=CHILD` 且 `parentSlug=node.slug`；`ruleText` 1..4000；viewer 未登录时省略 viewerState |
| `NodePath` | `child` 存在时必须属于 `parent`，`displayName` 必须等于服务端生成的 `parent.name + " / " + child.name`；不得接受客户端 displayName |
| `PostSummary` | `contentKind=QUICK => title=""`，`contentKind=LONG => title` 长度 1..80；`displayTitle` 永远 1..80；三个 counts 均 `>=0`；tags 去重且最多 5 个 |
| `PostDetail` | `bodyHtml` 必须由同版本 Markdown 白名单从 `bodyMarkdown` 生成；附件最多 8 个且全部 CLEAN；`activeBounty` 只在 OPEN/HELD 时存在；canonicalUrl 必须与 post.id 对应 |
| `Comment` | 顶层评论 `parentCommentId` 省略且 `rootCommentId=id`；回复的 `rootCommentId` 指向同帖顶层评论；root/parent/post 必须同一帖子。隐藏评论 `status=HIDDEN` 时公开 DTO 的正文使用固定占位，不返回原文 |
| `CommentContext` | `ancestors` 从根到直接父级严格有序、无环且最多 20 层；target 不得重复出现在 ancestors；所有游标必须能定位到 target |
| `RelationshipResult` | `active` 表示直接关系，`effective` 可包含父节点继承；取消直接子节点关注后若父节点仍关注，允许 `active=false,effective=true` |
| `AuthSessionResult` | access token 有效期 <=15 分钟；refresh token 有效期 <=30 天且每次 A10 单次轮换；两个 expiresAt 必须晚于响应时间 |
| `Session` | 当前账号最多一个 `current=true`；`lastActiveAt>=createdAt`；撤销后不再返回。位置只能是粗粒度城市/地区，不能返回 IP 或经纬度 |
| `Draft` | `completionPercent` 由服务端计算；`EDITING` 才允许 PATCH/DELETE；`PUBLISHED` 必须有 publishedPostId；nodePath 的 child 必须属于 parent；uploadIds 最多 8 且归当前用户 |
| `UploadIntent/Upload` | intent.expiresAt 必须在 5..30 分钟内；完成上传时 size/mime/checksum 必须与意图一致；`state=REJECTED` 时 rejectionCode 必填，其他状态省略 |
| `Notification` | `readAt` 仅在已读时存在；deepLink.route 必须是站内相对路径且经过 allow-list；actor 对系统通知可省略；subject.id 必须是 resource-id；隐藏目标改为安全占位路由 |
| `NotificationPreferences` | `security.inApp` 和 `security.emailDigest` 固定 true，PATCH 不接受这两个字段；其他 channel 叶字段均为 boolean |
| `Report` | resolution 仅在两个 RESOLVED 状态存在；timeline 至少一项且时间非递减，最后一项状态等于顶层 status；target 隐藏时不得包含敏感 label/publicUrl |
| `Appeal` | decision 仅在 `status=DECIDED` 存在；supplements 按 createdAt 升序且只追加；submittedAt<=updatedAt；一个 enforcement 同时最多一个有效 appeal |
| `ModerationCase` | `contentSnapshot.sealed=true` 时 body 省略；allowedCommands 由 capability+状态实时计算，不信任客户端；decisions 只追加、按 createdAt 升序 |
| `UserSanctionResult` | WARNING/RESTORE 不得有 expiresAt；RATE_LIMIT/MUTE/BAN 的临时期限必须在未来且 <=365 天；BAN+ACCOUNT 可无期限，但需要更高 capability |
| `CoinWallet` | 四类余额均为 money-int；`weeklyReward.earned<=cap`；updatedAt 是本次快照事务时间；客户端输入中永不出现任何余额字段 |
| `LedgerEntry/CoinJournal` | 每个 journal 至少 2 条 entry；同一 unit 的 DEBIT 总额等于 CREDIT 总额；journal.amount 为业务展示额，不用于平衡计算；反向分录必须填写 reversalOfJournalId 且不可反向两次 |
| `Bounty` | `amount` 必须属于创建时规则档位；`distribution.answerer+distribution.sink=amount`；`createdAt<acceptAfter<expiresAt`；ACCEPTED 必须有结算 timeline/journal；eligibleAnswers 的 comment.postId 必须等于 bounty.post.id |
| `EconomySummary` | `openingSupply+issued-sunk=closingSupply`；所有供应量 `>=0`；`dormancyRate` 0..1；只允许已结束并发布的 period |
| `CoinRuleSet` | thank.cost=recipientAmount+sinkAmount；bounty 两个 percent 合计 100；amountTiers 去重升序；qualityRewards threshold 严格递增；defaultDurationDays<=maxDurationDays |
| `CoinRiskCase` | amount `>=0`；holdIds/journalIds 去重；推荐资源只能引用本 case 中的 ID；调查角色不能直接写钱包或 journal |
| `ManualAdjustment` | proposedEntries 2..100 条，借贷相等；每个 accountCode 1..120；incidentId+period 唯一；proposerId!=approverId；只有 APPROVED 才能生成 journalId |
| `ReconciliationRun` | 每项 `difference=ledgerValue-businessValue`；`differenceCount` 等于 DIFFERENCE 项数量；MATCHED 要求所有 difference=0；finishedAt 仅终态存在且 >=startedAt |
| `PeriodCloseRequest` | reconciliationRun 必须同 period、MONTHLY、MATCHED；proposerId!=approverId；EXECUTED 才有 closedAt；关账后历史数据不可修改 |
| `Quest` | steps.id 在 quest 内唯一；status=UNAVAILABLE 时 unavailableReason 必填；sourceOptions 至少 1 个才可开始；步骤完成值来自领域事件，客户端不得提交 |
| `Enrollment` | `completedSteps<=totalSteps`；COMPLETED 才有 completedAt；PAUSED 才有 pausedAt；source 必须来自 quest.sourceOptions；每人激活任务数不超过规则上限 |
| `JourneySummary` | weekStart<=weekEnd 且为同一配置周；completedContributions<=targetContributions；currentEnrollment 若存在必须 ACTIVE/PAUSED/NEEDS_ATTENTION；recommendedQuests 最多 3 个且不得重复 |
| `Contribution` | source.route 只能是站内 allow-list；隐藏来源时只保留 safeLabel；quality/CXP/NCP/coin 四个状态独立，任一失败不得回滚已发布内容 |
| `NodeProject` | `memberCount<=memberLimit`、`accepted<=target`；ARCHIVED 不允许加入；participant=false 时省略 displayNamePublic |
| `Season` | `startsAt<endsAt`、`accepted<=target`；ARCHIVED 且产生归档时 archiveProjectId 必填；不返回个人排行榜字段 |

### 2.8 入参字段错误定位

`fieldErrors[].field` 使用 JSON Pointer 风格但省略开头 `/`，数组使用数字下标，例如 `tags.2`、`proposedEntries.1.amount`。同一字段错误顺序固定为：类型 → 必填/null → 长度/范围 → pattern/format → enum → 跨字段 → 资源状态。服务端一次最多返回 100 项；超过时追加 `{field:"$",code:"TOO_MANY_FIELD_ERRORS",message:"字段错误过多"}`。密码、token、Authorization 和正文不得出现在 message、detail 或日志中。

## 3. Operation 契约目录

表内 `—` 表示无 path/query/body，不表示任意数据。`I`/`V` 引用 1.3。成功响应均为 JSON DTO，204 无 body。关键错误除通用错误外列出业务码。所有 path 参数中的 `id`、`postId`、`commentId`、`draftId`、`caseId`、`appealId`、`journalId`、`bountyId`、`questId`、`projectId`、`sessionId` 默认均为 `resource-id`；所有 `userName` 为 `user-name`，所有节点/季路径参数为 `slug`，无需在每行重复。

### 3.1 Identity / Profile

| ID | Operation 与权限 | path/query/header/body | 成功响应 | 关键错误 |
|---|---|---|---|---|
| A01 | `POST /api/v1/auth/registrations` 公 `security:[]` | H:I；B:`{userName:user-name!,email:email!,password:string(8..128)!}`；email 最大 254 字符、转小写域名但不改 local part | 202 `{registrationId:resource-id!,verificationRequired:true!,maskedEmail:string(5..254)!,resendAfterSeconds:int(0..86400)!}` | 409 `USERNAME_TAKEN`; 422 `WEAK_PASSWORD`; email 不枚举 |
| A02 | `POST /api/v1/auth/sessions` 公 `security:[]` | H:I；B:`{login:string(2..254)!,password:string(8..128)!}` | 201 `AuthSessionResult` | 401 `INVALID_CREDENTIALS`; 403 `ACCOUNT_RESTRICTED`; 429 |
| A03 | `GET /api/v1/auth/sessions` 本人 | — | 200 `{items:Session[]!}` | 401 |
| A04 | `DELETE /api/v1/auth/sessions/{sessionId}` 本人 | P:`sessionId:resource-id!`; H:`If-Match?`（撤当前必填） | 204 | 404; 409 `REAUTH_REQUIRED` |
| A04b | `POST /api/v1/auth/other-session-revocations` 本人 | H:I；B:`{currentPassword:string(8..128)?}`（风险态必填） | 201 `{revocationId:resource-id!,revokedCount:int!,completedAt:date-time!}` | 409 `REAUTH_REQUIRED` |
| A05 | `POST /api/v1/auth/email-verifications` 公 `security:[]` | H:I；B:`{token:string(32..2048)!}` | 200 `{verified:true!,verifiedAt:date-time!,alreadyVerified:boolean!}` | 410 `TOKEN_EXPIRED`; 422 `TOKEN_INVALID` |
| A06 | `POST /api/v1/auth/email-verification-deliveries` 登录 | H:I；B:`{}` | 202 `{maskedEmail:string!,resendAfterSeconds:int!}` | 409 `ALREADY_VERIFIED`; 429 |
| A07 | `POST /api/v1/auth/password-reset-deliveries` 公 `security:[]` | H:I；B:`{email:email!}` | 202 `{accepted:true!,message:string!,retryAfterSeconds:int!}` | 429；已注册/未注册响应相同 |
| A08 | `POST /api/v1/auth/password-resets` 公 `security:[]` | H:I；B:`{token:string(32..2048)!,newPassword:string(8..128)!}` | 200 `{passwordChangedAt:date-time!,revokedSessionCount:int!}` | 410 `TOKEN_EXPIRED`; 422 `WEAK_PASSWORD` |
| A09 | `PUT /api/v1/users/me/password` 本人 | H:I；B:`{currentPassword:string!,newPassword:string(8..128)!}` | 200 `{passwordChangedAt:date-time!,revokedOtherSessions:int!}` | 401 `CURRENT_PASSWORD_INVALID`; 422 `WEAK_PASSWORD` |
| A10 | `POST /api/v1/auth/session-refreshes` 公 `security:[]` | H:I；B:`{refreshToken:string(32..4096)!}` | 201 `AuthSessionResult`（refresh token 必轮换） | 401 `REFRESH_REUSED|REFRESH_EXPIRED`，复用时撤销 token family |
| A11 | `DELETE /api/v1/auth/current-session` 登录 | — | 204 | 401 |
| P01 | `GET /api/v1/users/{userName}` 公 `security:[]`/可选 Bearer | P:`userName:user-name!` | 200 `PublicUser` | 安全 404 |
| P02 | `GET /api/v1/users/{userName}/posts` 公 | P:userName；Q:`CursorQuery` | 200 `CursorPage<PostSummary>` | 安全 404 |
| P03 | `GET /api/v1/users/{userName}/comments` 公 | P:userName；Q:`CursorQuery` | 200 `CursorPage<Comment>` | 安全 404 |
| P04 | `GET /api/v1/users/me/summary` 本人 | — | 200 `MeSummary`; `Cache-Control:no-store` | 401 |
| P05 | `GET /api/v1/users/me/profile` 本人 | — | 200 `EditableProfile`; H:ETag | 401 |
| P06 | `PATCH /api/v1/users/me/profile` 本人 | H:V；B:`{displayName:string(1..40)?,bio:string(0..160)?,location:string(0..80)?,avatarUploadId:resource-id?}` 至少一项；显式 `null` 仅允许清空 location/avatar | 200 `EditableProfile`; H:新 ETag | 412; 422 `UPLOAD_NOT_CLEAN` |
| P07 | `GET /api/v1/users/me/privacy-preferences` 本人 | — | 200 `PrivacyPreferences`; H:ETag | 401 |
| P08 | `PATCH /api/v1/users/me/privacy-preferences` 本人 | H:V；B:`{mentionable:boolean?,showFollowing:boolean?,indexPublicProfile:boolean?}` 至少一项 | 200 `PrivacyPreferences`; H:新 ETag | 412 |

认证唯一方案为短期 Bearer access token + 一次性轮换 refresh token。access token 只放 Authorization header；refresh token 只出现在 A02/A10 TLS body 与响应，客户端需进入安全存储。密码、token、Authorization、reset/verify token 禁止进入应用日志、埋点、Problem、URL 和审计详情。所有标“公”的 operation 在 OpenAPI 显式 `security: []`；可选 viewer state 的公开 GET 定义 `security: [{bearerAuth: []}, {}]`。

### 3.2 Node / Content / Discovery

| ID | Operation 与权限 | path/query/header/body | 成功响应 | 关键错误 |
|---|---|---|---|---|
| N01 | `GET /api/v1/nodes` 公 | — | 200 `{items:NodeDetail[]!,taxonomyVersion:string!}` | — |
| N02 | `GET /api/v1/nodes/{slug}` 公 | P:`slug:slug!` | 200 `NodeDetail` | 404 `NODE_NOT_FOUND` |
| N03 | `GET /api/v1/nodes/{slug}/children/{childSlug}` 公 | P:`slug:slug!`,`childSlug:slug!` | 200 `NodeDetail`（children=[]） | 404 `NODE_PATH_NOT_FOUND`，不回退到其他父节点 |
| C01 | `POST /api/v1/drafts` 本人 | H:I；B:`{title:string(0..80)="",bodyMarkdown:string(0..50000)="",parentNodeId:resource-id?,childNodeId:resource-id?,tagLabels:string[] max5=[],uploadIds:resource-id[] max8=[]}` | 201 `Draft`; H:ETag,Location | 422 `INVALID_NODE_PATH|UPLOAD_NOT_CLEAN` |
| C02 | `GET /api/v1/drafts` 本人 | Q:`CursorQuery,status:enum[EDITING|PUBLISHING|PUBLISHED]=EDITING` | 200 `CursorPage<Draft>` | — |
| C03r | `GET /api/v1/drafts/{draftId}` 本人 | P:`draftId:resource-id!` | 200 `Draft`; H:ETag | 404 |
| C03w | `PATCH /api/v1/drafts/{draftId}` 本人 | P:draftId；H:V；B:Draft 可编辑字段，至少一项；字符串 `null` 禁止，childNodeId/avatar 类可显式 null 清空 | 200 `Draft`; H:新 ETag | 409 `DRAFT_NOT_EDITABLE`; 412; 422 |
| C04 | `DELETE /api/v1/drafts/{draftId}` 本人 | P:draftId；H:V | 204 | 409 `DRAFT_ALREADY_PUBLISHED`; 412 |
| C05 | `POST /api/v1/drafts/{draftId}/publications` 本人 | P:draftId；H:I,V；B:`{confirmedImmutable:true!}` | 201 `PostDetail`; H:Location `/posts/{id}` | 409 `ALREADY_PUBLISHED|PUBLISHING`; 422 `TITLE_REQUIRED|BODY_REQUIRED|INVALID_NODE_PATH|ATTACHMENT_REJECTED` |
| C06 | `POST /api/v1/posts` 本人 | H:I；B:`{title:string(1..80)|null!,bodyMarkdown:string(1..20000)!,parentNodeSlug:slug!,childNodeSlug:slug|null!,tags:string(1..40)[] maxItems 5=[],attachmentUploadIds:resource-id[] maxItems 8=[],confirmedImmutable:true!}`；`title=null` 推导 QUICK，否则 LONG；child 非空必须属于 parent | 201 `PostDetail`; H:Location；响应 `post.contentKind` 必须与 title 推导一致 | 422 `INVALID_NODE_PATH|NODE_POSTING_DISABLED|UNSAFE_MARKDOWN|DUPLICATE_TAG|UPLOAD_NOT_CLEAN` |
| C07 | `GET /api/v1/posts/{postId}` 公/可选 Bearer | P:`postId:resource-id!` | 200 `PostDetail` | 安全 404；隐藏时有权限者才读正文 |
| C08 | `GET /api/v1/posts/{postId}/comments` 公 | P:postId；Q:`CursorQuery,sort:enum[OLDEST|NEWEST]=OLDEST` | 200 `CursorPage<Comment>`（仅顶层，parentCommentId=null） | 安全 404 |
| C08b | `GET /api/v1/comments/{commentId}/replies` 公 | P:`commentId:resource-id!`; Q:`CursorQuery` | 200 `CursorPage<Comment>`（直接子级，稳定 createdAt+id 顺序） | 安全 404 |
| C09 | `POST /api/v1/posts/{postId}/comments` 登录 | P:postId；H:I；B:`{bodyMarkdown:string(1..2000)!,confirmedImmutable:true!}` | 201 `Comment`; H:`Location`, `X-Comment-Anchor` | 409 `COMMENTS_LOCKED`; 422 `UNSAFE_MARKDOWN` |
| C10 | `POST /api/v1/comments/{commentId}/replies` 登录 | P:commentId；H:I；B:`{bodyMarkdown:string(1..2000)!,confirmedImmutable:true!}` | 201 `{comment:Comment!,contextLocation:{route:string!,anchorKey:string!,topLevelCursor:string!,replyCursor:string!}!}` | 409 `COMMENTS_LOCKED`; 安全 404 |
| C10b | `GET /api/v1/comments/{commentId}/context` 公 | P:commentId | 200 `CommentContext` | 安全 404；隐藏祖先为占位 Comment，body 为空且 status=HIDDEN |
| C11 | `POST /api/v1/markdown-previews` 登录 | B:`{markdown:string(0..50000)!,context:enum[POST|COMMENT]!}` | 200 `{sanitizedHtml:string!,warnings:{code:string!,message:string!,start:int?,end:int?}[]!}` | 422 `UNSAFE_LINK`; 429 |
| C12 | `POST /api/v1/uploads` 本人 | H:I；B:`{fileName:string(1..255)!,sizeBytes:int(1..10485760)!,mimeType:enum[image/png|image/jpeg|application/pdf]!,checksumSha256:string pattern ^[a-f0-9]{64}$!}` | 201 `UploadIntent` | 413 `FILE_TOO_LARGE`; 415; 429 `UPLOAD_QUOTA_EXCEEDED` |
| C12b | `GET /api/v1/uploads/{uploadId}` 本人 | P:`uploadId:resource-id!` | 200 `Upload`; 扫描未完成建议 `Retry-After` | 404 |
| C13a | `POST /api/v1/uploads/{uploadId}/completions` 本人 | P:`uploadId:resource-id!`; H:I；B:`{etag:string(1..128)!}` | 202 `Upload`（SCANNING）；客户端轮询 C12b | 409 `UPLOAD_INCOMPLETE|CHECKSUM_MISMATCH` |
| C13b | `DELETE /api/v1/uploads/{uploadId}` 本人 | P:uploadId | 204 | 409 `UPLOAD_REFERENCED_BY_PUBLISHED_CONTENT` |
| D01 | `GET /api/v1/feed` 公 | Q:`CursorQuery,parentNode:string?,childNode:string?` | 200 `{page:CursorPage<PostSummary>!,appliedNodePath:NodePath?,recovery:enum[NONE|INVALID_PARENT|INVALID_CHILD]!,taxonomyVersion:string!}` | 400 cursor mismatch；非法节点不报 404，按 recovery 规则降级 |
| D02 | `GET /api/v1/feed/following` 登录 | Q:`CursorQuery` | 200 `CursorPage<PostSummary>` | 401 |
| D03 | `GET /api/v1/search/posts` 公 | Q:`q:string(1..200)!,parentNode:string?,childNode:string?,sort:enum[RELEVANCE|NEWEST]=RELEVANCE,CursorQuery` | 200 `CursorPage<PostSummary>` | 422 `INVALID_NODE_PATH`; 429 |
| D04 | `GET /api/v1/search/users` 公 | Q:`q:string(1..200)!,CursorQuery` | 200 `CursorPage<PublicUserSummary>` | 429 |
| D05 | `GET /api/v1/search/nodes` 公 | Q:`q:string(1..200)!,limit:int(1..50)=20` | 200 `{items:NodeSummary[]!}` | 429 |
| D06 | `GET /api/v1/search/tags` 公 | Q:`q:string(1..200)!,limit:int(1..50)=20` | 200 `{items:TagSummary[]!}` | 429 |
| D07 | `GET /api/v1/tags` 公 | Q:`CursorQuery` | 200 `CursorPage<TagSummary>` | — |
| D08 | `GET /api/v1/tags/{slug}/posts` 公 | P:`slug:string(1..64)!`; Q:`CursorQuery` | 200 `{tag:TagSummary!,page:CursorPage<PostSummary>!}` | 404 |

### 3.3 Social / Notification

| ID | Operation 与权限 | path/query/header/body | 成功响应 | 关键错误 |
|---|---|---|---|---|
| R01 | `PUT /api/v1/users/me/bookmarks/{postId}` 登录 | P:postId；B:`{}` | 200 `RelationshipResult` | 安全 404 |
| R02 | `DELETE /api/v1/users/me/bookmarks/{postId}` 登录 | P:postId | 204 | 安全 404 |
| R03a | `PUT /api/v1/posts/{postId}/reactions/{reactionType}` 登录 | P:postId,`reactionType:ReactionType!`; B:`{}` | 200 `RelationshipResult` | 404; 422 `REACTION_TYPE_UNSUPPORTED` |
| R03b | `DELETE /api/v1/posts/{postId}/reactions/{reactionType}` 登录 | P:postId,reactionType | 204 | 404 |
| R04a | `PUT /api/v1/comments/{commentId}/reactions/{reactionType}` 登录 | P:commentId,reactionType；B:`{}` | 200 `RelationshipResult` | 安全 404 |
| R04b | `DELETE /api/v1/comments/{commentId}/reactions/{reactionType}` 登录 | P:commentId,reactionType | 204 | 安全 404 |
| R05 | `PUT /api/v1/users/me/followed-nodes/{nodeId}` 登录 | P:`nodeId:resource-id!`; B:`{}` | 200 `RelationshipResult` | 404 `NODE_NOT_FOUND` |
| R06 | `DELETE /api/v1/users/me/followed-nodes/{nodeId}` 登录 | P:nodeId | 204 | 404 |
| R07 | `PUT /api/v1/users/me/followed-users/{userName}` 登录 | P:userName；B:`{}` | 200 `RelationshipResult` | 409 `SELF_FOLLOW|BLOCK_RELATION_EXISTS`; 安全 404 |
| R08 | `DELETE /api/v1/users/me/followed-users/{userName}` 登录 | P:userName | 204 | 安全 404 |
| R09 | `GET /api/v1/users/{userName}/followers` 公 | P:userName；Q:CursorQuery | 200 `CursorPage<PublicUserSummary>` | 隐私安全 404 |
| R10 | `GET /api/v1/users/{userName}/following` 公 | P:userName；Q:`CursorQuery,section:enum[USERS|NODES]=USERS` | section USERS: `CursorPage<PublicUserSummary>`；NODES: `CursorPage<NodeSummary>` | 隐私安全 404 |
| R11 | `GET /api/v1/users/me/bookmarks` 本人 | Q:CursorQuery | 200 `CursorPage<PostSummary>` | 401 |
| O01 | `GET /api/v1/notifications` 本人 | Q:`CursorQuery,status:enum[ALL|UNREAD]=ALL,type:NotificationType?` | 200 `CursorPage<Notification>` | 401 |
| O02 | `GET /api/v1/notifications/unread-count` 本人 | — | 200 `{count:int>=0!,asOf:date-time!}` | 401 |
| O03 | `PUT /api/v1/notifications/{notificationId}/read-state` 本人 | P:notificationId；B:`{read:true!}` | 200 `{id:resource-id!,readAt:date-time!,unreadCount:int>=0!}` | 404 |
| O04 | `PUT /api/v1/notifications/read-cursor` 本人 | B:`{readThrough:date-time!}`（不得晚于 serverNow+5m） | 200 `{readThrough:date-time!,markedCount:int!,unreadCount:int!}` | 422 |
| O05 | `GET /api/v1/users/me/notification-preferences` 本人 | — | 200 `NotificationPreferences`; H:ETag | 401 |
| O06 | `PATCH /api/v1/users/me/notification-preferences` 本人 | H:V；B:NotificationPreferences 的非 security 叶字段，至少一项 | 200 `NotificationPreferences`; H:新 ETag | 412; 422 `SECURITY_NOTIFICATION_REQUIRED` |

### 3.4 Safety / Moderation

| ID | Operation 与权限 | path/query/header/body | 成功响应 | 关键错误 |
|---|---|---|---|---|
| S01 | `POST /api/v1/reports` 登录 | H:I；B:`{target:{type:ReportTargetType!,id:string(1..80)!}!,reason:ReportReason!,details:string(0..1000)="",evidenceUploadIds:resource-id[] max5=[],truthfulConfirmation:true!}` | 201 `Report`; H:Location | 409 `DUPLICATE_REPORT`; 422 `EVIDENCE_NOT_CLEAN`; 429 |
| S02 | `GET /api/v1/users/me/reports` 本人 | Q:`CursorQuery,status:ReportStatus?` | 200 `CursorPage<Report>` | 401 |
| S03 | `GET /api/v1/users/me/reports/{reportId}` 本人 | P:`reportId:resource-id!` | 200 `Report` | 安全 404 |
| S04 | `GET /api/v1/users/me/blocked-users` 本人 | Q:CursorQuery | 200 `CursorPage<{user:PublicUserSummary!,blockedAt:date-time!}>` | 401 |
| S05 | `PUT /api/v1/users/me/blocked-users/{userName}` 登录 | P:userName；B:`{}` | 200 `{userName:string!,blocked:true!,blockedAt:date-time!}` | 409 `SELF_BLOCK`; 安全 404 |
| S06 | `DELETE /api/v1/users/me/blocked-users/{userName}` 本人 | P:userName | 204 | 安全 404 |
| S07 | `GET /api/v1/users/me/appealable-enforcements` 本人 | Q:`CursorQuery` | 200 `CursorPage<EnforcementSummary>` | 401 |
| S08 | `GET /api/v1/users/me/appeals` 本人 | Q:`CursorQuery,status:AppealStatus?` | 200 `CursorPage<Appeal>` | 401 |
| S09 | `POST /api/v1/appeals` 本人 | H:I；B:`{enforcementId:resource-id!,reason:enum[CONTEXT_MISUNDERSTOOD|SCOPE_INAPPROPRIATE|NEW_EVIDENCE|OTHER]!,statement:string(1..2000)!,evidenceUploadIds:resource-id[] max5=[]}` | 201 `Appeal`; H:Location | 409 `APPEAL_ALREADY_EXISTS|APPEAL_WINDOW_CLOSED`; 422 |
| S10 | `GET /api/v1/appeals/{appealId}` 本人/审 | P:`appealId:resource-id!` | 200 `Appeal`; 治理调用另加 `internalCaseId:resource-id?` 的专用 governance schema | 安全 404 |
| S11 | `POST /api/v1/appeals/{appealId}/supplements` 本人 | H:I；B:`{statement:string(1..2000)!,evidenceUploadIds:resource-id[] max5=[]}` | 201 `{id:resource-id!,appealId:resource-id!,statement:string!,createdAt:date-time!}` | 409 `SUPPLEMENT_WINDOW_CLOSED` |
| M01 | `GET /api/v1/moderation/cases` 审 | Q:`PageQuery,status:enum[UNASSIGNED|ASSIGNED|IN_REVIEW|RESOLVED]?,priority:enum[URGENT|HIGH|NORMAL|LOW]?,assigneeId:resource-id?,sort:enum[SLA_ASC|ENTERED_DESC]=SLA_ASC` | 200 `NumberPage<ModerationCaseSummary>` | 403 |
| M02 | `GET /api/v1/moderation/cases/{caseId}` 审 | P:`caseId:resource-id!` | 200 `ModerationCase`; H:ETag | 403/404 |
| M03 | `GET /api/v1/moderation/appeals` 独立复核审 | Q:`PageQuery,status:AppealStatus=SUBMITTED,sort:enum[OLDEST|SLA]=SLA` | 200 `NumberPage<Appeal>` | 403 |
| M04 | `GET /api/v1/moderation/audit-logs` 审计 | Q:`PageQuery,operation:AuditEntry.operation?,subjectId:string?,actorId:resource-id?,from:date-time?,to:date-time?` | 200 `NumberPage<AuditEntry>` | 403 |
| M05 | `POST /api/v1/moderation/cases/{caseId}/assignments` 审 | P:caseId；H:I,V；B:`{assigneeId:resource-id!}` | 201 `{assignmentId:resource-id!,caseId:resource-id!,assignee:PublicUserSummary!,assignedAt:date-time!,caseVersion:int!}`; H:新 ETag | 409 `ASSIGNEE_INELIGIBLE`; 412 |
| M06 | `POST /api/v1/moderation/cases/{caseId}/visibility-decisions` 审 | P:caseId；H:I,V；B:`{targetType:enum[POST|COMMENT]!,targetId:resource-id!,visibility:Visibility!,reason:string(10..2000)!,evidenceRefs:string(1..200)[] max20=[]}` | 201 `VisibilityDecisionResult` | 409 `TARGET_NOT_IN_CASE|NO_STATE_CHANGE`; 412 |
| M07 | `POST /api/v1/moderation/cases/{caseId}/comment-lock-decisions` 审 | P:caseId；H:I,V；B:`{postId:resource-id!,locked:boolean!,reason:string(10..2000)!}` | 201 `CommentLockDecisionResult` | 409 `POST_NOT_IN_CASE|NO_STATE_CHANGE`; 412 |
| M08 | `POST /api/v1/moderation/cases/{caseId}/user-sanctions` 高权限审 | P:caseId；H:I,V；B:`{userId:resource-id!,kind:SanctionKind!,scope:enum[POSTING|COMMENTING|ALL_WRITES|ACCOUNT]!,expiresAt:date-time?,reason:string(10..2000)!}`；WARNING/RESTORE 禁止 expiresAt，临时限制必须未来<=365d | 201 `UserSanctionResult` | 403 `CAPABILITY_REQUIRED`; 409 `SANCTION_CONFLICT`; 412 |
| M09 | `POST /api/v1/moderation/appeals/{appealId}/decisions` 独立复核审 | P:appealId；H:I,V；B:`{outcome:AppealOutcome!,reason:string(20..4000)!,replacement:{kind:SanctionKind!,scope:enum[POSTING|COMMENTING|ALL_WRITES|ACCOUNT]!,expiresAt:date-time?}?}`；replacement 仅 REPLACE 必填 | 201 `AppealDecisionResult` | 409 `REVIEWER_NOT_INDEPENDENT|APPEAL_ALREADY_DECIDED`; 412 |

M06、M07、M08、M09 没有共享 action body；四类权限、字段和错误闭集不同。每次成功同时写 `AuditEntry`，响应只返回该决定，不返回“整个案件页面”。

### 3.5 Coin 用户端

| ID | Operation 与权限 | path/query/header/body | 成功响应 | 关键错误 |
|---|---|---|---|---|
| K01 | `GET /api/v1/users/me/coin-wallet` 本人 | — | 200 `CoinWallet`; `Cache-Control:no-store` | 401 |
| K02 | `GET /api/v1/users/me/coin-journals` 本人 | Q:`CursorQuery,type:CoinJournalType?,status:CoinJournalStatus?,from:date-time?,to:date-time?` | 200 `CursorPage<CoinJournal>`（entries=[] 以减小列表） | 422 date range>366d |
| K03 | `GET /api/v1/users/me/coin-journals/{journalId}` 本人 | P:`journalId:resource-id!` | 200 `CoinJournal`（含安全 entries） | 安全 404 |
| K04a | `GET /api/v1/coin-rule-versions` 公 | Q:`CursorQuery` | 200 `CursorPage<CoinRuleSet>`；每项 version/effectiveAt 完整 | — |
| K04b | `GET /api/v1/coin-rule-versions/{version}` 公 | P:`version:string(1..40)!` | 200 `CoinRuleSet` | 404 |
| K05 | `POST /api/v1/coin-thanks` 登录 | H:I；B:`{targetType:enum[POST|COMMENT]!,targetId:resource-id!,quoteId:resource-id!}` | 201 `{journal:CoinJournal!,wallet:CoinWallet!,recipientAmount:int!,sinkAmount:int!}`；金额完全由 quote/rule 计算 | 409 `QUOTE_EXPIRED|ALREADY_THANKED|SELF_THANK|RELATED_ACCOUNT|COIN_WRITES_FROZEN`; 422 `INSUFFICIENT_BALANCE|DAILY_CAP_REACHED|RULE_VERSION_CHANGED` |
| K05q | `GET /api/v1/coin-thank-quote` 登录 | Q:`targetType:enum[POST|COMMENT]!,targetId:resource-id!` | 200 `{quoteId:resource-id!,eligible:boolean!,disabledReasons:enum[ALREADY_THANKED|SELF_THANK|RELATED_ACCOUNT|INSUFFICIENT_BALANCE|DAILY_CAP_REACHED|WRITES_FROZEN][],cost:int!,recipientAmount:int!,sinkAmount:int!,availableBalance:int!,dailyRemaining:int!,ruleVersion:string!,expiresAt:date-time!}` | 安全 404 |
| K06 | `GET /api/v1/users/me/coin-bounties` 本人 | Q:`CursorQuery,role:enum[OWNER|ANSWERER|ALL]=ALL,status:BountyStatus?` | 200 `CursorPage<Bounty>` | 401 |
| K07 | `POST /api/v1/coin-bounties` 登录 | H:I；B:`{postId:resource-id!,amountTier:int>0!,quoteId:resource-id!,expiresAt:date-time?}`；省略 expiresAt 使用 quote 的 defaultExpiresAt | 201 `{bounty:Bounty!,escrowJournal:CoinJournal!,wallet:CoinWallet!}` | 409 `QUOTE_EXPIRED|OPEN_BOUNTY_EXISTS|COIN_WRITES_FROZEN`; 422 `INSUFFICIENT_BALANCE|INVALID_TIER|INVALID_EXPIRY|RULE_VERSION_CHANGED` |
| K07q | `GET /api/v1/coin-bounty-quote` 登录 | Q:`postId:resource-id!` | 200 `{quoteId:resource-id!,eligible:boolean!,disabledReasons:enum[NOT_POST_OWNER|OPEN_BOUNTY_EXISTS|INSUFFICIENT_BALANCE|POST_INELIGIBLE|WRITES_FROZEN][],amountTiers:int[]!,availableBalance:int!,acceptDelaySeconds:int!,earliestAcceptAt:date-time!,defaultExpiresAt:date-time!,minExpiresAt:date-time!,maxExpiresAt:date-time!,answererSharePercent:int!,sinkPercent:int!,ruleVersion:string!,expiresAt:date-time!}`；tiers/percent 来自 `CoinRuleSet` | 安全 404 |
| K08 | `GET /api/v1/coin-bounties/{bountyId}` 公/可选 Bearer | P:`bountyId:resource-id!` | 200 `Bounty`; 匿名省略 eligibleAnswers 的内部 ineligibilityCode | 安全 404 |
| K09 | `POST /api/v1/coin-bounties/{bountyId}/acceptances` 发布者 | P:bountyId；H:I,V；B:`{answerCommentId:resource-id!}` | 201 `{bounty:Bounty!,settlementJournal:CoinJournal!,wallet:CoinWallet!}`；分配按 bounty 固化 ruleVersion 服务端计算 | 409 `ACCEPT_TOO_EARLY|ANSWER_INELIGIBLE|RELATED_ACCOUNT|BOUNTY_NOT_OPEN`; 412 |
| K10 | `POST /api/v1/coin-bounties/{bountyId}/cancellations` 发布者 | P:bountyId；H:I,V；B:`{reason:enum[NO_LONGER_NEEDED|DUPLICATE|MODERATION_HOLD|OTHER]!,statement:string(0..500)=""}` | 201 `{bounty:Bounty!,refundJournal:CoinJournal!,wallet:CoinWallet!}` | 409 `CANCELLATION_NOT_ALLOWED`; 412 |
| K11 | `POST /api/v1/coin-disputes` 相关用户 | H:I；B:`{journalId:resource-id!,reasonCategory:enum[WRONG_RECIPIENT|ACCOUNT_TAKEOVER|RULE_MISAPPLIED|OTHER]!,statement:string(1..2000)!,evidenceUploadIds:resource-id[] max5=[]}` | 201 `CoinDispute` | 409 `DISPUTE_EXISTS|DISPUTE_WINDOW_CLOSED` |
| K12 | `GET /api/v1/coin-disputes/{disputeId}` 相关用户/币审 | P:disputeId | 200 `CoinDispute`；币审通过 KM02 获取证据，不扩展本 DTO | 安全 404 |
| K13 | `GET /api/v1/coin-economy/summaries/{period}` 公 | P:`period:string YYYY-MM!` | 200 `EconomySummary` | 404 `PERIOD_NOT_PUBLISHED` |
| K14 | `GET /api/v1/coin-economy/summaries/{period}.csv` 公 | P:period；H:`Accept:text/csv` | 200 CSV，固定列 `period,openingSupply,issued,sunk,closingSupply,activeWallets,dormancyRate,reversals,ruleVersion,publishedAt` | 404 |
| K15 | `GET /api/v1/users/me/coin-preferences` 本人 | — | 200 `CoinPreferences`; H:ETag | 401 |
| K16 | `PATCH /api/v1/users/me/coin-preferences` 本人 | H:V；B:CoinPreferences 字段任意非空子集，均 boolean，不允许 null | 200 `CoinPreferences`; H:新 ETag | 412 |

### 3.6 Coin Risk / Controller

| ID | Operation 与权限 | path/query/header/body | 成功响应 | 关键错误 |
|---|---|---|---|---|
| KM01 | `GET /api/v1/moderation/coin-cases` 币审 | Q:`PageQuery,status:CoinRiskCase.status?,type:CoinRiskCase.type?,sort:enum[SLA|AMOUNT_DESC]=SLA` | 200 `NumberPage<CoinRiskCase>`（列表 evidence=[]） | 403 |
| KM02 | `GET /api/v1/moderation/coin-cases/{caseId}` 币审 | P:caseId | 200 `CoinRiskCase`; H:ETag | 403/404 |
| KM03 | `POST /api/v1/moderation/coin-cases/{caseId}/release-recommendations` 币审 | P:caseId；H:I,V；B:`{holdIds:resource-id[] min1 max100!,reason:string(20..4000)!,evidenceRefs:string[] max50=[]}` | 201 `{recommendationId:resource-id!,kind:enum[RELEASE]!,status:enum[PROPOSED]!,caseVersion:int!,createdAt:date-time!}` | 409 `HOLD_NOT_IN_CASE`; 412；不产生 journal |
| KM04 | `POST /api/v1/moderation/coin-cases/{caseId}/recovery-recommendations` 币审 | P:caseId；H:I,V；B:`{journalIds:resource-id[] min1 max100!,reason:string(20..4000)!,evidenceRefs:string[] max50=[]}` | 同 KM03，kind=`RECOVERY` | 409 `JOURNAL_NOT_IN_CASE`; 412；不产生 journal |
| KA01 | `GET /api/v1/admin/coin-budgets/current` 控/批 | — | 200 `{period:string!,cap:int!,used:int!,remaining:int!,pending:int!,ruleVersion:string!,version:int!}`; H:ETag | 403 |
| KA02 | `POST /api/v1/admin/coin-budget-change-proposals` 控 | H:I；B:`{period:string YYYY-MM!,newCap:int>=0!,rationale:string(20..4000)!,impactForecast:string(20..4000)!,effectiveAt:date-time!,stopConditions:string(20..2000)!}` | 201 `BudgetChangeProposal`; H:Location,ETag | 409 `OPEN_PROPOSAL_EXISTS`; 422 |
| KA02b | `GET /api/v1/admin/coin-budget-change-proposals` 控/批/审计 | Q:`PageQuery,status:ApprovalStatus?,period:string?` | 200 `NumberPage<BudgetChangeProposal>` | 403 |
| KA03 | `POST /api/v1/admin/coin-budget-change-proposals/{id}/approvals` 批 | P:id；H:I,V；B:`{comment:string(0..2000)=""}` | 201 `BudgetChangeProposal`(APPROVED/EXECUTED); H:新 ETag | 409 `SELF_APPROVAL|NOT_PROPOSED`; 412 |
| KA04 | `GET /api/v1/admin/coin-rule-versions` 控/批/审计 | Q:`PageQuery,effectiveFrom:date-time?,effectiveTo:date-time?` | 200 `NumberPage<CoinRuleSet>` | 403 |
| KA04b | `GET /api/v1/admin/coin-rule-change-proposals` 控/批/审计 | Q:`PageQuery,status:ApprovalStatus?` | 200 `NumberPage<RuleChangeProposal>` | 403 |
| KA05 | `POST /api/v1/admin/coin-rule-change-proposals` 控 | H:I；B:`{proposedRule:CoinRuleSet!,rationale:string(20..4000)!,impactForecast:string(20..4000)!,stopConditions:string(20..2000)!}` | 201 `RuleChangeProposal`; H:ETag | 409 open proposal; 422 `EFFECTIVE_NOTICE_TOO_SHORT|UNBALANCED_DISTRIBUTION|THRESHOLDS_NOT_ASCENDING` |
| KA05b | `POST /api/v1/admin/coin-rule-change-proposals/{id}/approvals` 批 | P:id；H:I,V；B:`{comment:string(0..2000)=""}` | 201 `RuleChangeProposal` | 409 `SELF_APPROVAL`; 412 |
| KA06r | `GET /api/v1/admin/coin-adjustments/{id}` 控/批 | P:id | 200 `ManualAdjustment`; H:ETag | 403/404 |
| KA06w | `POST /api/v1/admin/coin-adjustments` 控 | H:I；B:`{incidentId:string(1..80)!,period:string YYYY-MM!,reason:string(20..4000)!,proposedEntries:{accountCode:string!,direction:enum[DEBIT|CREDIT]!,amount:int>0!}[] min2 max100!}` | 201 `ManualAdjustment`; H:ETag | 422 `UNBALANCED_ENTRIES|INCIDENT_REQUIRED`; 409 duplicate incident adjustment |
| KA06b | `GET /api/v1/admin/coin-adjustments` 控/批/审计 | Q:`PageQuery,status:ApprovalStatus?,period:string?` | 200 `NumberPage<ManualAdjustment>` | 403 |
| KA07 | `POST /api/v1/admin/coin-adjustments/{id}/approvals` 批 | P:id；H:I,V；B:`{comment:string(0..2000)=""}` | 201 `{adjustment:ManualAdjustment!,journal:CoinJournal!}` | 409 `SELF_APPROVAL|NOT_PROPOSED|COIN_WRITES_FROZEN`; 412 |
| KA08 | `POST /api/v1/admin/coin-adjustments/{id}/return-requests` 批 | P:id；H:I,V；B:`{reason:string(10..2000)!}` | 201 `ManualAdjustment`(RETURNED) | 409 `NOT_PROPOSED`; 412 |
| KA09 | `GET /api/v1/admin/coin-reconciliation-runs` 控/审计 | Q:`PageQuery,period:string?,status:ReconciliationRun.status?` | 200 `NumberPage<ReconciliationRun>`（checks=[] 列表） | 403 |
| KA10 | `POST /api/v1/admin/coin-reconciliation-runs` 控 | H:I；B:`{period:string YYYY-MM[-DD]!,scope:enum[DAILY|MONTHLY]!}` | 202 `ReconciliationRun`; H:Location | 409 `RUN_ALREADY_ACTIVE` |
| KA11 | `GET /api/v1/admin/coin-reconciliation-runs/{runId}` 控/审计 | P:runId | 200 `ReconciliationRun`; H:ETag | 404 |
| KA12 | `POST /api/v1/admin/coin-period-close-requests` 控 | H:I；B:`{period:string YYYY-MM!,reconciliationRunId:resource-id!}` | 201 `PeriodCloseRequest`; H:ETag | 409 `RECONCILIATION_DIFFERENCE|RUN_NOT_MATCHED|CLOSE_EXISTS` |
| KA13 | `POST /api/v1/admin/coin-period-close-requests/{id}/approvals` 批 | P:id；H:I,V；B:`{comment:string(0..2000)=""}` | 201 `PeriodCloseRequest`(EXECUTED,closedAt set) | 409 `SELF_APPROVAL|PERIOD_ALREADY_CLOSED`; 412 |
| KA14 | `POST /api/v1/admin/coin-write-freeze-proposals` 控/系统安全 | H:I；B:`{scope:enum[ALL_COIN_WRITES|ISSUANCE_ONLY|SPENDING_ONLY]!,rationale:string(20..4000)!,reviewDueAt:date-time!,automaticTrigger:{ruleId:string!,observedMetric:enum[LEDGER_IMBALANCE|NEGATIVE_BALANCE|RECONCILIATION_DIFFERENCE]!,observedValue:int!}?}` | 201 `WriteFreezeProposal`; automatic trigger 可直接 EXECUTED，其余 PROPOSED | 409 `FREEZE_ALREADY_ACTIVE`; 422 |
| KA14b | `GET /api/v1/admin/coin-write-freeze-proposals` 控/批/审计 | Q:`PageQuery,status:ApprovalStatus?,scope:enum[ALL_COIN_WRITES|ISSUANCE_ONLY|SPENDING_ONLY]?` | 200 `NumberPage<WriteFreezeProposal>` | 403 |
| KA15 | `POST /api/v1/admin/coin-write-freeze-proposals/{id}/approvals` 批 | P:id；H:I,V；B:`{comment:string(0..2000)=""}` | 201 `WriteFreezeProposal`(EXECUTED) | 409 `SELF_APPROVAL|NOT_PROPOSED`; 412 |

Controller GET DTO 可包含完整科目但不可包含密码/token/无关内容正文。任何 approval response 都含 proposer/approver，服务端强制不同主体；拒绝/退回是各自资源，不接受 `decision=...` 通用动作。

### 3.7 Journey

| ID | Operation 与权限 | path/query/header/body | 成功响应 | 关键错误 |
|---|---|---|---|---|
| J01 | `GET /api/v1/journey/summary` 本人 | — | 200 `JourneySummary` | 409 `JOURNEY_NOT_STARTED` 可返回带 onboardingRoute 的 Problem |
| J02 | `GET /api/v1/quests` 登录 | Q:`CursorQuery,node:string?,type:QuestType?,status:enum[AVAILABLE|ACTIVE|ALL]=AVAILABLE,sort:enum[SUITABLE|SHORTEST|ENDING_SOON]=SUITABLE` | 200 `CursorPage<Quest>` | 401 |
| J03 | `GET /api/v1/quests/{questId}` 登录 | P:`questId:resource-id!` | 200 `{quest:Quest!,enrollment:Enrollment?}` | 404 |
| J04 | `GET /api/v1/users/me/journey-onboarding` 本人 | — | 200 `{completed:boolean!,preferences:{reply:boolean!,resource:boolean!,care:boolean!,weeklyLight:boolean!}!,version:int!}`; H:ETag | 401 |
| J05 | `PATCH /api/v1/users/me/journey-onboarding` 本人 | H:V；B:`{completed:boolean?,preferences:{reply:boolean?,resource:boolean?,care:boolean?,weeklyLight:boolean?}?}` 至少一项 | 200 同 J04；H:新 ETag | 412 |
| J06 | `POST /api/v1/quests/{questId}/enrollments` 登录 | P:questId；H:I；B:`{sourceId:string(1..80)!,focusBudget:enum[LIGHT|STANDARD]=LIGHT!}` | 201 `Enrollment`; H:Location,ETag | 409 `ACTIVE_QUEST_LIMIT|QUEST_UNAVAILABLE|SOURCE_INELIGIBLE|ALREADY_ENROLLED` |
| J07 | `POST /api/v1/quest-enrollments/{id}/pauses` 本人 | P:id；H:I,V；B:`{reason:enum[REST|SOURCE_UNAVAILABLE|OTHER]=REST!}` | 201 `Enrollment`(PAUSED); H:新 ETag | 409 `NOT_ACTIVE`; 412 |
| J08 | `POST /api/v1/quest-enrollments/{id}/exits` 本人 | P:id；H:I,V；B:`{reason:enum[REST|NOT_RELEVANT|SOURCE_UNAVAILABLE|OTHER]!}` | 201 `Enrollment`(EXITED) | 409 `ALREADY_TERMINAL`; 412 |
| J09 | `POST /api/v1/quest-enrollments/{id}/replacement-requests` 本人 | P:id；H:I,V；B:`{preferredQuestId:resource-id?,reason:enum[SOURCE_HIDDEN|SOURCE_LOCKED|NOT_RELEVANT|OTHER]!}` | 201 `{oldEnrollment:Enrollment!,newEnrollment:Enrollment!}` | 409 `NO_REPLACEMENT_AVAILABLE`; 412 |
| J10 | `GET /api/v1/users/me/journey-progress` 本人 | Q:`weekStart:date?` | 200 `{path:{role:string!,description:string!,completed:boolean!,current:int!,target:int!}[]!,weeklyReview:{weekStart:date!,weekEnd:date!,summary:string!,contributionIds:resource-id[]!}?}` | 401 |
| J11 | `GET /api/v1/users/me/contributions` 本人 | Q:`CursorQuery,state:SettlementState?,node:string?` | 200 `CursorPage<Contribution>` | 401 |
| J12 | `GET /api/v1/users/me/contributions/{id}` 本人 | P:id | 200 `Contribution` | 安全 404 |
| J13a | `GET /api/v1/users/me/collections` 本人 | Q:CursorQuery | 200 `CursorPage<CollectionItem>` | 401 |
| J13p | `PUT /api/v1/users/me/collection-displays/{collectionId}` 本人 | P:collectionId；B:`{}` | 200 `CollectionItem`(displayed=true) | 404 |
| J13d | `DELETE /api/v1/users/me/collection-displays/{collectionId}` 本人 | P:collectionId | 204 | 404 |
| J14 | `GET /api/v1/node-projects` 登录 | Q:`CursorQuery,node:string?,status:enum[OPEN|ARCHIVED]=OPEN` | 200 `CursorPage<NodeProject>` | 401 |
| J15 | `GET /api/v1/nodes/{slug}/projects/current` 公 | P:slug | 200 `{project:NodeProject!,quests:Quest[]!,acceptanceRule:string!,contributors:{user:PublicUserSummary!,acceptedCount:int!}[]!}` | 404 `NO_CURRENT_PROJECT` |
| J16 | `PUT /api/v1/node-projects/{projectId}/participants/me` 登录 | P:projectId；B:`{displayNamePublic:boolean=false}` | 200 `NodeProject`(participant=true) | 409 `PROJECT_CLOSED|MEMBER_LIMIT_REACHED` |
| J17 | `DELETE /api/v1/node-projects/{projectId}/participants/me` 本人 | P:projectId | 204 | 409 `NOT_PARTICIPATING` |
| J18 | `GET /api/v1/seasons` 公 | Q:`CursorQuery,status:enum[ACTIVE|ARCHIVED|ALL]=ALL` | 200 `CursorPage<Season>` | — |
| J19 | `GET /api/v1/seasons/{slug}` 公 | P:slug | 200 `{season:Season!,steps:{label:string!,completed:boolean!}[]!,availableQuestCount:int!}` | 404 |
| J20 | `GET /api/v1/users/me/journey-preferences` 本人 | — | 200 `JourneyPreferences`; H:ETag | 401 |
| J21 | `PATCH /api/v1/users/me/journey-preferences` 本人 | H:V；B:`{weeklySummary:boolean?,questRecommendations:boolean?,showPathMarks:boolean?}` 至少一项 | 200 `JourneyPreferences`; H:新 ETag | 412 |
| J22 | `POST /api/v1/users/me/journey-pauses` 本人 | H:I；B:`{until:date-time?}`（未来且<=365d，省略=无限期） | 201 `JourneyPause` | 409 `JOURNEY_ALREADY_PAUSED` |
| J23 | `DELETE /api/v1/users/me/journey-pauses/current` 本人 | — | 204 | 409 `JOURNEY_NOT_PAUSED` |

没有 `complete`、`settle`、`claim` operation。Quest.steps.completed、Enrollment.completed、Contribution 四种 settlement state 均由 outbox 事件投影，客户端 checkbox 仅展示。事件 schema：

```text
DomainEvent = {
 eventId:uuid!, eventType:enum[POST_PUBLISHED|COMMENT_PUBLISHED|CONTENT_VISIBILITY_CHANGED|POST_COMMENT_LOCK_CHANGED|CONTRIBUTION_QUALITY_CONFIRMED|CONTRIBUTION_QUALITY_REJECTED|PROJECT_CONTRIBUTION_ACCEPTED|COIN_REWARD_CANDIDATE_CREATED]!,
 aggregateId:string!, aggregateVersion:int!, actorId:resource-id?, occurredAt:date-time!,
 correlationId:uuid!, causationId:uuid!, ruleVersion:string?,
 subject:{type:enum[POST|COMMENT|CONTRIBUTION|PROJECT]!,id:string!}!
}
```

消费者以 `(eventId,consumerName)` 唯一；CXP、NCP、coinCandidate 分别追加状态，部分失败为 `PENDING_SYNC`，不回滚社区内容，也不要求用户重做动作。

### 3.8 Observability（非业务 API）

| ID | Operation 与权限 | path/query/header/body | 成功响应 | 关键错误 |
|---|---|---|---|---|
| OBS01 | `POST /api/observability/web-vitals` 同源匿名 | H:`Content-Type` 仅允许 `application/json` 或 sendBeacon 的 `text/plain;charset=UTF-8`、`Origin` 必须严格等于当前 origin；B:`{id:string(1..128)!,name:enum[CLS|FCP|FID|INP|LCP|TTFB]!,value:number(0..1000000000)!,rating:enum[good|needs-improvement|poor]!,navigationType:enum[navigate|reload|back-forward|back-forward-cache|prerender|restore]!}`；封闭对象，body 最大 2048 bytes，value 必须 finite | 204，无 body；`Cache-Control:no-store` | 400 `MALFORMED_JSON`; 403 `INVALID_REQUEST_ORIGIN`; 413 `PAYLOAD_TOO_LARGE`; 415 `UNSUPPORTED_MEDIA_TYPE`; 422 `VALIDATION_FAILED` |

OBS01 仅采集性能指标，不接收 userId、route query、URL、UA、IP、会话、正文或自定义 metadata。服务端可从受控请求上下文补充粗粒度部署版本，但不得把该接口变成行为埋点。采集失败不得影响页面导航；sendBeacon 与 fetch fallback 使用完全相同的 schema。

## 4. 页面字段级 Coverage Matrix

表内列出页面所有服务端展示字段和写交互；布局、主题、Drawer、起句模板、Dialog 开关属于客户端，不造 API。

| 页面/路由 | 展示字段 ← API.field | 交互字段 → API.field |
|---|---|---|
| Feed `/`,`/feed` | 节点菜单 `N01.items[].node/children/inheritance`；筛选路径/恢复 `D01.appliedNodePath,recovery`；帖子行 `D01.page.items[].{displayTitle,excerpt,author,nodePath,createdAt,counts}` | 节点筛选=query；翻页=cursor；轻发布上下文传 C06 的 parent/child |
| 节点目录 `/nodes` | `N01.items[].{node,children,ruleText,inheritance}` | 仅链接；关注 R05/R06 |
| 父/子节点页 | `N02/N03.node,ruleText,children,inheritance,viewerState`；帖子 `D01.page` | R05/R06；发布路径 C01/C06 |
| 帖子 `/posts/{id}` | `C07.post.{displayTitle,title,author,nodePath,createdAt,counts,tags}`, `bodyHtml,attachments,commentLock,activeBounty`；`C08.items`；按需 `C08b`；感谢对话 K05q；悬赏对话 K07q | 收藏 R01/R02；反应 R03；评论 C09；回复 C10；感谢 K05；悬赏 K07；举报 S01 |
| 评论深链/通知定位 | `C10b.post,ancestors,target,location.{topLevelCursor,replyCursor}`；`O01.items[].deepLink.{route,anchorKey}` | O03 先标已读，再按 deepLink 导航；绝不从通知拼游标 |
| 搜索 `/search` | 各 tab 分别 D03/D04/D05/D06；节点选择 N01；结果字段使用对应公开 DTO | `q,node,sort,cursor`；无统一 search payload |
| 标签 `/tags*` | D07 `TagSummary`; D08 `tag,page.items` | cursor |
| 公开用户 `/users/*` | P01 `PublicUser`；P02/P03；R09/R10 分区 | R07/R08、S05/S06、S01 |
| 登录/注册 | A01 maskedEmail/resend；A02 `AuthSessionResult`; A10 token rotation | A01/A02 bodies；本地 `returnTo` 不入 auth body |
| 邮箱/密码恢复 | A05 verified/alreadyVerified；A06/A07 masked/cooldown；A08/A09 changedAt/revoked count | token 只进 body；不进 URL 日志/Problem |
| `/auth/recover-task` | 客户端本地 `{returnTo,intent,input}` + A02 session；服务端无万能恢复 DTO | 用户再次确认后调用原 R/C/S/K operation，复用该 operation 的 I |
| `/me` | P04 `user,emailMasked,emailVerified,counts,security` | 链接到各领域，不提供 me-page 写 API |
| 轻发布 | 节点 N01；发布结果 C06 `PostDetail` | `bodyMarkdown,parentNodeId,childNodeId,confirmedImmutable` |
| 长编辑器/草稿 | C02/C03 `Draft` 全字段及 ETag；N01；上传 C12/C12b/C13；预览 C11 | C01/C03w/C04/C05；409/412 展示本地与最新 version，不静默覆盖 |
| 收藏/关注 Feed | R11 `PostSummary`; D02 `PostSummary` | R02；关注修改走 R06/R08 |
| 通知 | O01 `type,title,summary,createdAt,readAt,deepLink,actor,subject`; O02 count | O03 单条；O04 readThrough；筛选 query |
| 资料/隐私设置 | P05/P07 全字段+ETag | P06/P08 独立 PATCH；没有 save-settings |
| 通知/金币/旅程设置 | O05、K15、J20 各自 DTO+ETag | O06、K16、J21；休息单独 J22/J23 |
| 安全/设备 | P04 email/security；A03 Session | A04 单会话；A04b 其他全部；A09 密码 |
| 屏蔽列表 | S04 `user,blockedAt` | S05/S06 |
| 举报新建/列表/详情 | 目标摘要来自 C07/C10b/P01；S02/S03 `Report.{reason,status,timeline,resolution,target}` | S01 `target,reason,details,evidence,truthfulConfirmation` |
| 申诉列表/新建/详情 | S07 Enforcement；S08/S10 Appeal 全字段 | S09；S11 只追加补充 |
| 审核队列/案件 | M01 priority/status/reason/SLA；M02 snapshot/history/decisions/allowedCommands+ETag | M05 指派；M06 可见性；M07 锁评；M08 用户处置，四者不共享 body |
| 审核申诉/审计 | M03 Appeal；M04 AuditEntry 的 actor/operation/subject/reason/requestId/time | M09 独立裁决；审计只读 |
| 金币中心/账本 | K01 四余额+周额度；K02/K03 journal 状态/来源/规则/entries | K11 争议；无余额 PATCH |
| 金币规则/透明度 | K04a/b 规则；K13/K14 固定公开汇总/CSV | 仅 period/version/filter |
| 悬赏列表/详情 | K06/K08 `Bounty.{post,amount,status,acceptAfter,expiresAt,distribution,eligibleAnswers,timeline}` | K07 创建、K09 采纳、K10 取消、K11 争议；全部 I，K09/K10 还要 V |
| 金币设置 | K15 `CoinPreferences` | K16 独立 PATCH |
| 金币风险 | KM01/02 type/status/amount/SLA/holdIds/journalIds/evidence/history | KM03 仅释放建议；KM04 仅追回建议；均不记账 |
| Controller 控制台 | KA01 budget；KA02b budget proposals；KA04 rule versions；KA04b rule proposals；KA06b adjustments；KA14b freezes | KA02/KA03 预算；KA05/KA05b 规则；KA14/KA15 冻结，互不复用 |
| 人工调整 | KA06r `ManualAdjustment` 的事故/期间/发起审批人/拟议 entries/status | KA06w 创建；KA07 批准并生成 journal；KA08 退回 |
| 对账/关账 | KA09/KA11 `ReconciliationRun.checks,differenceCount,status`; period close request | KA10 运行；KA12 提交；KA13 独立批准；difference>0 阻止关账 |
| 共建大厅 | J01 周进度/CXP/role/current/recommended | 进入 J03/J06；无结算按钮 |
| Onboarding | J04 completed/preferences+ETag | J05 |
| 任务板/详情 | J02/J03 Quest steps/reward/source/status；Enrollment progress/version | J06 开始；J07 暂停；J08 退出；J09 替换；checkbox 不写服务端 |
| 成长/贡献 | J10 path/review；J11/J12 Contribution impact/source + quality/CXP/NCP/coin 四状态 | 仅筛选/深链；无 settle/claim |
| 贡献收藏 | J13a CollectionItem name/desc/earned/source/displayed | J13p/J13d 单项展示关系 |
| 节点协作/项目 | J14/J15 title/node/member/goal/progress/tasks/participant/acceptance | J16 加入、J17 退出 |
| 主题季 | J18/J19 title/scope/status/dates/progress/goal/acceptance/archive | 进入任务/归档；无个人排行 |
| 旅程状态样例 | J01/J04/J11 的 not-started/paused/pending/completed 状态 | J22/J23；`/prototype/states` 本身无 API |
| 403/404/409/429 | `Problem.{status,code,detail,requestId,retryAfterSeconds,currentVersion}` | retry 使用原 operation；安全 404 不提供存在性线索 |

## 5. Null、缺省、数据隔离与缓存

- 请求字段省略=不修改/使用默认；显式 `null` 只在 operation 明示可清空时允许，否则 422。响应可选字段在“不适用/无权限”时 **omit**；只有业务上“已知为空”且 DTO 标 `?` 时可为 null。数组永远 `[]`。
- 公开层只用 PublicUser/Post/Comment/Node/Tag DTO；本人层可加入 viewer state、emailMasked、草稿、偏好；治理层可读 sealed snapshot/内部 SLA；财务层可读完整科目/证据。禁止把治理/财务 DTO 嵌回公开响应后靠序列化忽略字段。
- 公开无 viewer state 的 GET 可 `public,max-age=60,stale-while-revalidate=30`；带可选 Bearer 的响应 `private` 或 `Vary:Authorization`；本人、治理、财务统一 `Cache-Control:no-store`。
- 安全 404、屏蔽、隐藏必须在 Feed/Search/Notification/Journey 投影中一致；Notification deepLink 若目标已隐藏，导航到安全占位而非泄露原文。

## 6. 静态验收规则

1. 每个第 3 节 operation 有完整 `/api/v1` path、权限、输入位置/类型/约束、成功码/响应 schema、业务错误。
2. 复合设计编号已按 suffix 展开；schema 引用均在第 2 节或 operation 行内定义，无 `any`、自由 metadata、actionType、通用 page payload。
3. OpenAPI 生成时公开 operation 明示 `security:[]`，可选 viewer operation 使用 bearer+anonymous 二选一；旧 OpenAPI 的全局 JWT 不得继承。
4. 契约测试至少覆盖：父子节点不匹配、草稿 412、重复发布、锁帖评论、回复定位、通知深链、安全 404、M06–M09 权限隔离、金币双花/重复 journal/自审批、任务事件重复与部分结算。
