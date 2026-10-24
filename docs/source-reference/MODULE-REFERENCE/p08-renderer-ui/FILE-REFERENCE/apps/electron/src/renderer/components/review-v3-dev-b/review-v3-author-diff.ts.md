---
path: apps/electron/src/renderer/components/review-v3-dev-b/review-v3-author-diff.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 34bdef89fc441910e9ff5b7a2114496faaa53af6
sha256: 1f7efd1a9cce0ac7d26cb9c2c129623fe80c673333288203dde015d6bf8aad96
lines: 80
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/review-v3-dev-b/review-v3-author-diff.ts

## 1. 结论与边界

**B1 author 侧版本对比**（`apps/electron/src/renderer/components/review-v3-dev-b/review-v3-author-diff.ts:1-4`）：**结构审查辅助，不替代 C-owned InstallPlan/UpgradePlan 与持久移除 ACK**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `B1AuthorChangeArea` | type | `:7` | business/source/field/target/module/check/stage/output |
| `B1AuthorChangeKind` | type | `:8` | added/removed/modified |
| `B1AuthorChange` | interface | `:9-13` | `{area, kind, key, …}` |
| `B1AuthorDiff` | interface | `:14-41` | diff 结果 |
| `diffB1AuthorDocuments` | 函数 | `:42-64` | `(saved, draft) => B1AuthorDiff` |
| `assertB1DraftRemovalAcknowledgments` | 函数 | `:65-80` | 移除 ACK 断言 |

| `assertB1CheckDeleteDialogCurrent` | 函数 | `:73-…` | Check 删除对话框当前性断言 |
## 3. 内部逻辑与关键流程

- `diffB1AuthorDocuments`（`:42-64`）：saved/draft 结构对比→change 列表。
- `assertB1DraftRemovalAcknowledgments`（`:65-80`）：**移除需 ACK**（配套 C-owned 持久移除）。

## 4. 调用者与调用链

- 消费方：ReviewV3AuthorWizard（diff 展示）。
- 出向：B1 类型。

## 5. 数据 I/O、读写与副作用

纯函数；无写。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 移除未 ACK | `:65-80` | 断言失败 |

## 7. 权限与权威状态

**不替代 C-owned 计划**（`:2-3`）——diff 仅辅助审查。

## 8. 修改影响面

`B1AuthorChangeArea` 8 域；移除 ACK 口径。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 个导出、移除 ACK | 已证实 | `:7-80` |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 7 个导出 | `:7-80` | covered |
