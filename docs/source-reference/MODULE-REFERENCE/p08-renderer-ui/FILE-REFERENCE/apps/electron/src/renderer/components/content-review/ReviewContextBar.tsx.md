---
path: apps/electron/src/renderer/components/content-review/ReviewContextBar.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e67f8a218d20bf75430afa692f47a9d5568af9f5
sha256: 72542d05f98f28643ada8c6952a84d9fdb8e77a492f82fa3f259fdef896e4b4a
lines: 1
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ReviewContextBar.tsx

## 1. 结论与边界

**re-export 包装**（`apps/electron/src/renderer/components/content-review/ReviewContextBar.tsx:1`）：`export { ReviewContextBar } from './CaseManagerBar'`——组件实现在 `CaseManagerBar.tsx`（同批文件）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ReviewContextBar` | re-export | `:1` | 来自 `./CaseManagerBar` |

## 3. 内部逻辑与关键流程

无（单行 re-export）。

## 4. 调用者与调用链

消费方：审核布局（引用 `ReviewContextBar` 的场景）；实现见 `CaseManagerBar.tsx` 手册。

## 5. 数据 I/O、读写与副作用

无。

## 6. 分支、失败、取消与恢复

不适用。

## 7. 权限与权威状态

无。

## 8. 修改影响面

路径别名稳定即可；实现变更见 `CaseManagerBar`。

## 9. 测试证据

无（re-export）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 单行 re-export | 已证实 | `:1` |
| 实现行为 | 未知 | 见 `CaseManagerBar.tsx` 手册 |

## 11. 覆盖表

| 面 | 状态 |
| --- | --- |
| re-export | covered |
