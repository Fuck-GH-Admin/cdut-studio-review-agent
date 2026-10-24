---
path: apps/electron/src/renderer/components/review-v3-dev-b/review-v3-route-view.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 82726b802ee1c1d40e7566075232ea80b24843aa
sha256: 07ba2e43c2a97f1a2bc612794c0a7c7a56f6247ea4a9f6b305e6cb6c901d56ab
lines: 71
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/review-v3-dev-b/review-v3-route-view.ts

## 1. 结论与边界

**B3 路由视图（仅展示）**（`apps/electron/src/renderer/components/review-v3-dev-b/review-v3-route-view.ts:1`）：**选择是技术提案，永不是 Case 写入**；`authority: 'technical-candidate-only'`（`:14-15`，**无 Renderer 结果可升格正式 Case 创建**）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `B3RouteView` | interface | `:6-16` | `{heading, guidance, remainingSeconds, eligible, held, suggested, canInterrupt, authority:'technical-candidate-only'}` |
| `buildB3RouteView` | 函数 | `:17-71` | `(state, catalog) => B3RouteView` |

| `filterB3Catalog` | 函数 | `:55-62` | 目录过滤 |
| `requireB3VisibleManualChoice` | 函数 | `:63-71` | 可见人工选择必需断言 |
## 3. 内部逻辑与关键流程

`buildB3RouteView`（`:17-71`）：输入校验（`:21`）；catalog 按 `templateId+templateVersion` 去重（`:28-29`）；`availability==='authorized-for-technical-selection'`→eligible、`'candidate-held'`→held（`:31-32`）；suggested=chosen 匹配（`:34-36`）；status→文案对（`:38-40`+续）——「未匹配」明示**不在倒计时后随意选取**（`:40`）。

## 4. 调用者与调用链

- 消费方：B3 路由 UI。
- 出向：B3 类型（主进程 adapter）。

## 5. 数据 I/O、读写与副作用

纯投影；无写（红线 `:1`）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 输入非法 | `:21` | `B3_VIEW_INPUT_INVALID` |
| 缺字段项 | `:26-27` | 跳过 |
| 未匹配 | `:40` | 不随意选取（人工确认） |

## 7. 权限与权威状态

**`technical-candidate-only`**（`:14-15`）——无 Renderer 结果升格 Case；技术提案红线（`:1`）。

## 8. 修改影响面

- `B3RouteState.status` 文案对；availability 分类。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 个导出、technical-candidate-only 红线 | 已证实 | `:1-71` |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 4 个导出 | `:6-71` | covered |
