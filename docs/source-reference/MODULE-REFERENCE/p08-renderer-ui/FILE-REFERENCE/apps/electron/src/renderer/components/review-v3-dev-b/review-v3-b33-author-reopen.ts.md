---
path: apps/electron/src/renderer/components/review-v3-dev-b/review-v3-b33-author-reopen.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fde0b281a8df90bd65cd1bfe584957f5fbb05938
sha256: 214a4a644feb7475b7e5e3edc36d5c756166fef25740b2e729dbda1f2038a376
lines: 14
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/review-v3-dev-b/review-v3-b33-author-reopen.ts

## 1. 结论与边界

**R33 纯净 B1 ID 查询**（`apps/electron/src/renderer/components/review-v3-dev-b/review-v3-b33-author-reopen.ts:1`）：**只创建纯净 B1 ID 查询，绝不水合不受信的存储 author**（never hydrate untrusted stored author）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `prepareB33PristineReopenLookup` | 函数 | `:5-14` | `(templateId: string) => B1AuthorDocument` |

## 3. 内部逻辑与关键流程

模板 ID 校验（`:6-8`，正则 `^[A-Za-z][A-Za-z0-9._-]{0,79}$`+拒 `.`/`..`，否则 `B_R33_AUTHOR_REOPEN_TEMPLATE_ID_INVALID`）→`emptyB1AuthorDocument()` 空白（`:9`）→`{...structuredClone(blank), templateId}`（`:10`）→`isB1PristineReopenLookup` 校验（`:11`，否则 `B_R33_AUTHOR_REOPEN_NOT_PRISTINE`）→返回查询。

## 4. 调用者与调用链

- 消费方：R33 重开流程。
- 出向：`ReviewV3AuthorWizard`（`emptyB1AuthorDocument`）、`review-v3-author-resume`（`isB1PristineReopenLookup`）、B1 类型。

## 5. 数据 I/O、读写与副作用

纯函数；无写。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 非法 templateId | `:6-8` | 抛 |
| 非纯净 | `:11-12` | 抛 |

## 7. 权限与权威状态

**绝不水合不受信存储 author**（`:1`）——纯净查询红线（test 锁定）。

## 8. 修改影响面

`isB1PristineReopenLookup` 判定口径（author-resume）。

## 9. 测试证据

`review-workspace-write-fence.p06-fix02.test.ts` 不含；全树检索 `prepareB33PristineReopenLookup` 测试命中 0。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 个导出、纯净红线 | 已证实 | `:1-14` |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `prepareB33PristineReopenLookup` | `:5-14` | covered |
