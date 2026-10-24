---
path: apps/electron/src/renderer/components/agent/ExplorationBranchBar.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 62fc25e12b2e80885f89e8a00cc77406bab5630b
sha256: 2c3fa68ed8e2f339a332a0d20898080670245c56176c343f3880e6e82e26119e
lines: 161
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/ExplorationBranchBar.tsx

## 1. 结论与边界

**探索分支条**（`apps/electron/src/renderer/components/agent/ExplorationBranchBar.tsx:3-10`）：探索分支从右侧面板内嵌迁为顶栏 Tab 后，来源标注+「带回主线」动作移到分支会话视图顶部（30px 细条）。「带回主线」把分支最新结论作为 `&session:` 引用写入父会话草稿。**分支血缘从会话 meta 派生**（`explorationParentSessionId`/`explorationSourceMessageId`/`explorationSourceLabel`，`:9-10`），不再依赖运行时 Map。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ExplorationBranchBar` | 组件 | `:141-161` | `{branchSessionId}`；meta 血缘完整才渲染，否则 null（`:140`） |

## 3. 内部逻辑与关键流程

- meta 血缘三字段派生分支信息（`:9-10`）；缺任一→不渲染（`:140`）。
- 「带回主线」：分支结论→`&session:` 引用→父会话草稿。

## 4. 调用者与调用链

- 消费方：探索分支 Tab 会话视图。
- 出向：会话 meta/草稿写入。

## 5. 数据 I/O、读写与副作用

经草稿写入（父会话）；无直写存储。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| meta 血缘不完整 | `:140` | 返回 null |
| 带回主线 | — | 写父草稿引用 |

## 7. 权限与权威状态

血缘**从 meta 派生**（`:9-10`）是权威来源（不依赖运行时 Map）；引用语义（`&session:`）。

## 8. 修改影响面

- meta 三字段契约；`&session:` 引用格式。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 个导出、meta 血缘/带回主线 | 已证实 | `:3-161` |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `ExplorationBranchBar` | `:141-161` | covered |
| 血缘派生 | `:9-10` | covered |
