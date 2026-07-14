# X2Post Web

基于 `prototype/` 高保真迁移的 Next.js 16 + React 19 + daisyUI 5 前端实现。

## 本地运行

```bash
npm install
npm run dev
```

打开 <http://localhost:3000>。生产检查：

```bash
npm run lint
npm run build
npm start
```

## 实现说明

- 全部原型页面使用真实 pathname，可直接访问 `/feed`、`/nodes/product/strategy`、`/posts/immutable-content`、`/coins`、`/journey`、`/moderation/cases` 等路由。
- Feed、节点、帖子、标签、搜索和公开用户等公开内容由 Server Component 输出首屏 HTML；账户、设置、治理与创作页面带 `noindex, nofollow`。
- `/api/v1/*` 提供按 `docs/prototype-api-contracts.md` 组织的 mock Route Handler，覆盖公开查询和主要写交互，并模拟游标、`Idempotency-Key`、`If-Match` 与标准错误结构。
- `robots.txt` 与 `sitemap.xml` 自动生成，公开页面提供 canonical、description 与 Open Graph metadata。
- 页面视觉和交互复用原型的 daisyUI 组件层，并已从 hash router 迁移到 pathname。
- React 页面按领域拆分在 `app/_components/pages/`，公共壳与列表组件位于 `app/_components/`；catch-all 页面仅负责 metadata、校验和分发。
- 浏览器交互脚本拆分为 core、community、account、coin、journey 与 runtime，站内导航通过 History API 原地切换，不再整页刷新闪动。
