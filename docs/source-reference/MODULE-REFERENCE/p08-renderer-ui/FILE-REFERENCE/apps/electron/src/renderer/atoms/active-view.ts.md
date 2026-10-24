---
path: apps/electron/src/renderer/atoms/active-view.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c0e9b000d386463943124c864af558d9cb23dd03
sha256: 765464d3c0efd94b833f478a267de3f6fac55b76bbbeafcc3c977ff33658d411
lines: 17
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/active-view.ts

## 1. 结论与边界

主内容区视图状态原子（头注释 :2-10）：五视图（conversations/planning/agent-skills/cdut-zone/cdut-science）。

## 2. 导出与关键符号

导出 2 条（`export` :14/:17）：`ActiveView` 类型（:14）、`activeViewAtom = atomWithStorage('profer-active-view','conversations')`（:17，localStorage 持久化，刷新保持）。

## 3-7. 不适用

不适用（纯原子声明，无逻辑分支/I/O/权限）——依据：17 行全文核对。

## 4. 调用者与调用链

入向：MainArea/CdutScienceView/PreparationView 等视图路由。出向：jotai/utils。

## 8. 修改影响面

- 消费面：MainArea 视图路由全链。
- 依赖面：localStorage 'profer-active-view' 键。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 2 条；五视图+持久化 | 已证实 | :14-17 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出 | §2 | :14-17 | covered |
