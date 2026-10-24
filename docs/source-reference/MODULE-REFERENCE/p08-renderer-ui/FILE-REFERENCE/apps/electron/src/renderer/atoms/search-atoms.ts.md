---
path: apps/electron/src/renderer/atoms/search-atoms.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1b366aa59635a2b8867a71047a1adedfd0a8ec0c
sha256: 230baf979a59a7ebefa062eae15e589f9ada1fba0ff3f4bb4637515fff6dfaa0
lines: 10
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/search-atoms.ts

## 1. 结论与边界

**搜索 Dialog 状态 Atoms**（`apps/electron/src/renderer/atoms/search-atoms.ts:1-5`）：全局搜索 Dialog 开关。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `searchDialogOpenAtom` | atom | `:10` | 搜索 Dialog 开关 |

## 3. 内部逻辑与关键流程

纯 atom。

## 4-8. （纯状态，无逻辑/副作用/分支/权限/影响面）

## 4. 调用者与调用链

- 消费方：renderer UI 组件。
- 出向：Jotai。

## 5. 数据 I/O、读写与副作用

纯内存状态（或经注明的持久化）；无 I/O。

## 6. 分支、失败、取消与恢复

N/A（纯状态 atom，无分支逻辑）。

## 7. 权限与权威状态

无身份语义。

## 8. 修改影响面

atom 形状与消费组件耦合。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

1 个导出已证实（`:10`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `searchDialogOpenAtom` | `:10` | covered |
