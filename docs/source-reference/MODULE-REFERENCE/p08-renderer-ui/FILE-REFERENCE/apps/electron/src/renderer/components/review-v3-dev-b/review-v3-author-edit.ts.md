---
path: apps/electron/src/renderer/components/review-v3-dev-b/review-v3-author-edit.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 07c4bf85fecd344486a93843ee182a7bbac1039d
sha256: 1bf333791fe588fe7c3c64a60ade7416e4a81762492b379766935a8965edde08
lines: 123
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/review-v3-dev-b/review-v3-author-edit.ts

## 1. 结论与边界

**B1 无代码 author 来源引用编辑**（`apps/electron/src/renderer/components/review-v3-dev-b/review-v3-author-edit.ts:1-5`）：所有操作返回新候选文档并**保留精确 Check×target×source 连接**；**不发布模板/不改 CurrentCase**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `renameB1AuthorIdentity` | 函数 | `:12-43` | 重命名 source/field/target |
| `deleteB1AuthorIdentity` | 函数 | `:44-73` | 删除身份 |
| `renameB1AuthorCheckKey` | 函数 | `:74-89` | 重命名 Check key |
| `renameB1TrialKey` | 函数 | `:90-107` | 重命名试填 key |
| `b1AuthorHasUnsavedEdits` | 函数 | `:108-114` | 未保存编辑检测 |
| `nextB1AuthorId` | 函数 | `:115-123` | 生成新 ID |

内部：`codeError`（`:9`，`B1_AUTHOR_EDIT_*`）、`validId`（`:10`，正则）。

## 3. 内部逻辑与关键流程

- 重命名/删除操作**保连接**（`:2-3`）；ID 校验（`:10`）；全部返回新文档（immutable）。
- `nextB1AuthorId`（`:115-123`）：按 prefix 生成唯一 ID。

## 4. 调用者与调用链

- 消费方：ReviewV3AuthorWizard（编辑）。
- 出向：B1 类型。

## 5. 数据 I/O、读写与副作用

纯函数（返回新文档）；不写 CurrentCase（`:4`）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 非法 ID | `:10` | `B1_AUTHOR_EDIT_*` 抛 |

## 7. 权限与权威状态

**不发布模板/不改 CurrentCase**（`:4`）；Check×target×source 连接精确保留（`:2-3`）。

## 8. 修改影响面

- `Identity` 三态；ID 正则。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 个导出、保连接红线 | 已证实 | `:1-123` |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 6 个导出 | `:12-123` | covered |
