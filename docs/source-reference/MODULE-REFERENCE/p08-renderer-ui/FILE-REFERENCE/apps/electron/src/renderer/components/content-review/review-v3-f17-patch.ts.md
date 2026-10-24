---
path: apps/electron/src/renderer/components/content-review/review-v3-f17-patch.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 91a5644d2fda4cf8adc65207db0c1f3b59794e1a
sha256: 4b6ab67583f2a3f11c947d5550bc4bbe682dab010eb3e7c9a0fb00953a4e151e
lines: 17
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-f17-patch.ts

## 1. 结论与边界

**F17 类型化 patch 生成**（`apps/electron/src/renderer/components/content-review/review-v3-f17-patch.ts:1`）：只生成**经人工确认后**送交现有 Main `UpdateFields` 的 payload——F17 不引入新写通道。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `makeF17FieldPatch` | 函数 | `:5-17` | `(target: T08FieldTarget, value: FieldValue) => {caseFieldValues?/subjectFieldValues?}` |

## 3. 内部逻辑与关键流程

守卫链（`:9-16`）：**类型必须与已发布模板一致**（`:9`，否则「字段类型与已发布模板不匹配」）；`attachment/object/rows` **助手草案禁改**（`:10-11`）；`multi` 空数组拒（`:12`）；`case` scope→`caseFieldValues`（`:14`）；`subject` scope 需 `subjectId`（`:15`）→`subjectFieldValues`（`:16`）。

## 4. 调用者与调用链

- 消费方：F17 助手草案（人工确认后调用）。
- 出向：`./review-v3-t08-suggestion`（`T08FieldTarget`）、`@profer/shared`（`FieldValue`）。

## 5. 数据 I/O、读写与副作用

纯函数；写发生在 Main `UpdateFields`（调用方）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 类型不符 | `:9` | 抛 |
| 附件/对象/行记录 | `:10-11` | 抛（助手禁改） |
| multi 空 | `:12` | 抛 |
| subject 缺 ID | `:15` | 抛 |

## 7. 权限与权威状态

**人工确认前置**（`:1`）；类型锁定已发布模板（`:9`）；复杂字段禁改（`:10-11`）——F17 助手最小权限。

## 8. 修改影响面

- `T08FieldTarget`/`FieldValue` 契约；`UpdateFields` payload 形状。

## 9. 测试证据

`review-v3-f17-patch.test.ts`（27 行，2 用例）直接覆盖。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 个导出、四守卫 | 已证实 | `:5-17` |
| 复杂字段禁改 | 已证实 | `:10-11` |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `makeF17FieldPatch` | `:5-17` | covered |
