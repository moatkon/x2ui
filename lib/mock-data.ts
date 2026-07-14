export type PostSummary = {
  id: string;
  title: string;
  excerpt: string;
  bodyMarkdown: string;
  author: { userName: string; displayName: string };
  nodePath: { parentSlug: string; parentName: string; childSlug?: string; childName?: string };
  createdAt: string;
  createdLabel: string;
  commentCount: number;
  reactionCount: number;
  tags: string[];
};

export type CommunityNode = {
  id: string;
  slug: string;
  name: string;
  description: string;
  postCount: number;
  followerCount: number;
  rule: string;
  children: Array<{
    id: string;
    slug: string;
    name: string;
    description: string;
    postCount: number;
    followerCount: number;
    rule: string;
  }>;
};

export const posts: PostSummary[] = [
  {
    id: "immutable-content",
    title: "为什么社区内容需要明确的不可变边界？",
    excerpt: "当发言不可被悄悄改写，讨论记录会更可信；同时我们也需要隐藏和申诉机制。",
    bodyMarkdown: "社区里的表达一旦进入公共讨论，就会成为其他回应的上下文。允许作者随时改写，会让后续回复失去依据，也可能伤害讨论记录的可信度。\n\n## 不可变，不等于不治理\n\n原始内容保持不变，同时通过可见性状态处理风险：违规内容可以被隐藏，帖子可以被锁定，用户可以申诉，治理动作则进入不可变审计记录。",
    author: { userName: "linmo", displayName: "林默" },
    nodePath: { parentSlug: "product", parentName: "产品设计", childSlug: "strategy", childName: "产品策略" },
    createdAt: "2026-07-14T15:20:00Z",
    createdLabel: "12 分钟前",
    commentCount: 28,
    reactionCount: 64,
    tags: ["社区", "治理"],
  },
  {
    id: "small-community",
    title: "一个 2,000 人社区的冷启动复盘",
    excerpt: "先建立可预期的互动节奏，再谈增长：欢迎帖、每周问答和节点引导员是最有效的三个动作。",
    bodyMarkdown: "先建立可预期的互动节奏，再谈增长。",
    author: { userName: "qingyu", displayName: "青屿" },
    nodePath: { parentSlug: "operations", parentName: "社区运营", childSlug: "launch", childName: "冷启动" },
    createdAt: "2026-07-14T14:32:00Z",
    createdLabel: "1 小时前",
    commentCount: 17,
    reactionCount: 41,
    tags: ["冷启动", "运营"],
  },
  {
    id: "accessible-ui",
    title: "给内容社区做无障碍，不只是加 aria-label",
    excerpt: "从键盘路径、错误恢复到 200% 缩放，分享一套适合内容产品的检查清单。",
    bodyMarkdown: "无障碍要覆盖完整任务路径，而不是只补充一个属性。",
    author: { userName: "ache", displayName: "阿澈" },
    nodePath: { parentSlug: "frontend", parentName: "前端开发", childSlug: "quality", childName: "性能与无障碍" },
    createdAt: "2026-07-13T13:36:00Z",
    createdLabel: "昨天 21:36",
    commentCount: 12,
    reactionCount: 33,
    tags: ["无障碍", "前端"],
  },
  {
    id: "writing-routine",
    title: "如何养成每周输出一篇高质量帖子的习惯",
    excerpt: "把草稿当作思考工作台：先记录问题，再补证据，最后才写标题。",
    bodyMarkdown: "先记录问题，再补证据，最后才写标题。",
    author: { userName: "weekend", displayName: "周末写字" },
    nodePath: { parentSlug: "writing", parentName: "写作交流", childSlug: "practice", childName: "写作习惯" },
    createdAt: "2026-07-12T09:00:00Z",
    createdLabel: "周日",
    commentCount: 9,
    reactionCount: 26,
    tags: ["写作"],
  },
  {
    id: "home-reset",
    title: "十分钟居家复位：让明天从整洁开始",
    excerpt: "不追求一次性整理完，用固定顺序收好高频物品，降低第二天的启动阻力。",
    bodyMarkdown: "用固定顺序收好高频物品，降低第二天的启动阻力。",
    author: { userName: "qingyu", displayName: "青屿" },
    nodePath: { parentSlug: "life", parentName: "生活方式", childSlug: "home", childName: "居家与整理" },
    createdAt: "2026-07-11T09:00:00Z",
    createdLabel: "周六",
    commentCount: 6,
    reactionCount: 19,
    tags: ["整理", "日常"],
  },
];

const child = (id: string, slug: string, name: string, description: string, rule: string) => ({
  id,
  slug,
  name,
  description,
  postCount: 100 + id.length * 3,
  followerCount: 260 + id.length * 7,
  rule,
});

export const nodes: CommunityNode[] = [
  {
    id: "node-product",
    slug: "product",
    name: "产品设计",
    description: "讨论产品策略、交互设计与用户研究。",
    postCount: 826,
    followerCount: 1240,
    rule: "分享具体问题与上下文，批评方案而非批评个人。",
    children: [
      child("node-product-strategy", "strategy", "产品策略", "定位、路线图、取舍与验证框架。", "策略判断请区分事实、假设与待验证指标。"),
      child("node-product-research", "research", "用户研究", "访谈、测试、研究方法与洞察应用。", "研究材料必须移除可识别个人信息。"),
      child("node-product-interaction", "interaction", "交互与原型", "信息架构、任务流程和原型验证。", "方案讨论请说明目标用户、任务与约束。"),
      child("node-product-system", "design-system", "设计系统", "组件、设计令牌、规范和协作流程。", "分享组件方案时请注明适用范围与无障碍状态。"),
      child("node-product-growth", "growth", "增长与实验", "增长模型、实验设计和指标解读。", "实验复盘需说明样本、周期和负面影响。"),
    ],
  },
  {
    id: "node-frontend",
    slug: "frontend",
    name: "前端开发",
    description: "Web 标准、工程实践、性能与无障碍。",
    postCount: 641,
    followerCount: 986,
    rule: "提问请附复现步骤；代码片段需移除敏感信息。",
    children: [
      child("node-fe-css", "html-css", "HTML/CSS", "语义结构、布局、样式与浏览器标准。", "请提供最小复现，并说明目标浏览器范围。"),
      child("node-fe-js", "javascript", "JavaScript", "语言特性、浏览器 API 与运行时问题。", "代码示例请避免携带密钥和真实用户数据。"),
      child("node-fe-frameworks", "frameworks", "框架与应用", "组件框架、路由、状态和应用架构。", "请注明框架与版本，并描述已尝试方案。"),
      child("node-fe-engineering", "engineering", "工程与测试", "构建、测试、部署和团队工程实践。", "工程方案需说明团队规模和维护成本。"),
      child("node-fe-quality", "quality", "性能与无障碍", "性能预算、可访问性和质量验证。", "结论请附测量环境、标准或复现路径。"),
    ],
  },
  {
    id: "node-operations",
    slug: "operations",
    name: "社区运营",
    description: "社区冷启动、内容机制与健康度治理。",
    postCount: 374,
    followerCount: 728,
    rule: "案例请说明规模与阶段，禁止发布未授权用户数据。",
    children: [child("node-ops-launch", "launch", "冷启动", "种子成员、首批内容和早期互动节奏。", "复盘请说明社区阶段、规模与资源限制。")],
  },
  {
    id: "node-writing",
    slug: "writing",
    name: "写作交流",
    description: "用文字整理思考，互相提供真诚反馈。",
    postCount: 519,
    followerCount: 812,
    rule: "尊重原创，引用请标明来源。",
    children: [child("node-writing-practice", "practice", "写作习惯", "写作节奏、练习方法与持续输出。", "鼓励分享可持续方法，不制造打卡焦虑。")],
  },
  {
    id: "node-life",
    slug: "life",
    name: "生活方式",
    description: "分享让日常更从容的小方法。",
    postCount: 291,
    followerCount: 536,
    rule: "不提供高风险医疗或财务建议。",
    children: [child("node-life-home", "home", "居家与整理", "收纳、清洁、居住体验和日常维护。", "分享方法时说明空间、预算等适用条件。")],
  },
];

export const comments = [
  { id: "comment-1", author: { userName: "qingyu", displayName: "青屿" }, bodyMarkdown: "赞同“稳定记录”的说法。是否考虑过作者发现敏感信息后怎么办？", createdAt: "2026-07-14T15:24:00Z", replyCount: 3 },
  { id: "comment-2", author: { userName: "ache", displayName: "阿澈" }, bodyMarkdown: "可以通过受控的合规数据处理通道解决，但不应该伪装成普通编辑能力。", createdAt: "2026-07-14T15:30:00Z", replyCount: 1 },
];

export const currentUser = {
  id: "user-linmo",
  userName: "linmo",
  displayName: "林默",
  bio: "关注内容社区、产品策略与可信治理。",
  location: "上海",
  stats: { postCount: 24, commentCount: 186, followerCount: 329, followingCount: 48 },
};

export const cursorPage = <T>(items: T[]) => ({ items, nextCursor: null, hasMore: false });
