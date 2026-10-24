---
path: apps/electron/src/renderer/atoms/team-atoms.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b36f3ec53a51bc7011b37224dfde0e64707be4ad
sha256: 0df58850e00a7aacc0f95783f83c817f6601dabb59c50d5624cdf94d3b863503
lines: 12
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/team-atoms.ts

## 1. 结论与边界

**团队 Atoms**（`apps/electron/src/renderer/atoms/team-atoms.ts:1-6`）：Phase 1 管理团队工作区列表；Phase 2 扩展成员/邀请/同步。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `teamWorkspacesAtom` | atom | `:12` | 团队工作区列表 |

## 3. 内部逻辑与关键流程

纯 atom（Phase 1）。

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

1 个导出已证实（`:12`）；Phase 2 扩展未实施（注释标注）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `teamWorkspacesAtom` | `:12` | covered |
