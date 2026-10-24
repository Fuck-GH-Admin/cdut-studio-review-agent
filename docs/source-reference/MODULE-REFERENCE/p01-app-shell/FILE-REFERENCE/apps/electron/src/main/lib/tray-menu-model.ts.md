---
path: apps/electron/src/main/lib/tray-menu-model.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4c1119e4f33e4d8099a8d4342f9354d5decc2634
sha256: 9e1dd5a7b2f1dfa23c70fa0c2615980662d9ed8b80dac72c4a950afa327c8bc8
lines: 61
kind: source
package: p01-app-shell
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/tray-menu-model.ts

## 1. 结论与边界

托盘菜单数据模型（61 行）：把会话列表/工作区/运行中集合裁剪成托盘三段（running/recent/more）。纯计算，不碰托盘 UI。

**边界**：托盘渲染在 `tray.ts`（跨批）；可见性判定 `isVisibleAgentSession` 来自 `@profer/shared`（跨批）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `TRAY_RECENT_LIMIT` | 常量（导出） | 3 | `= 3` | recent 段条数 |
| `TRAY_MORE_LIMIT` | 常量（导出） | 4 | `= 10` | 非运行会话总取前 10 |
| `TrayRecentSessionItem` | 接口（导出） | 6-10 | `{id, title, subtitle}` | 条目 |
| `TrayMenuModel` | 接口（导出） | 12-16 | `{runningSessions, recentSessions, moreSessions}` | 三段模型 |
| `createTrayMenuModel` | 函数（导出） | 35-61 | `(sessions, workspaces, runningSessionIds = new Set()) => TrayMenuModel` | 裁剪主入口 |

内部：`getWorkspaceLabel`（`:18-22`）、`toRecentSessionItem`（`:24-33`）。导出合计 5。

## 3. 内部逻辑与关键流程

1. `getWorkspaceLabel`（`:18-22`）：无 `workspaceId` → `'未选择工作区'`；查不到工作区 → `'未知工作区'`；否则工作区名。
2. `toRecentSessionItem`（`:24-33`）：title `trim() || '未命名会话'`（`:30`）；subtitle=工作区标签。
3. `createTrayMenuModel`（`:35-61`）：过滤 `isVisibleAgentSession` 且（未归档或运行中）（`:41-43`）；按 `updatedAt` 降序（`:45`）；running 全量（`:47-49`）；非运行取前 `TRAY_MORE_LIMIT`(10)（`:51-54`）再切 3+7（recent 3、more 余量，`:58-59`）。

## 4. 调用者与调用链

入向（全冻结树检索 `tray-menu-model`）：`main/tray.ts:7`（`createTrayMenuModel`+`TrayRecentSessionItem` 类型）。出向：`@profer/shared`（`:1`）。

## 5. 数据 I/O、读写与副作用

无（不适用，依据：纯计算）。

## 6. 分支、失败、取消与恢复

分支：工作区标签三分支（`:19-21`）；过滤/排序/切片（`:41-59`）；无 throw（不适用）。

## 7. 权限与权威状态

无权限分支（不适用）。可见性权威=`isVisibleAgentSession`（跨批 shared）。

## 8. 修改影响面

`tray.ts` 托盘菜单内容；3/10 上限是 UI 契约；空标题兜底文案用户可见。

## 9. 测试证据

直接测试：**无**（全冻结树检索 `tray-menu-model` 无测试命中；检索范围=baseline/source 全树）。

`NOT_RUN`：本轮未运行任何测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出/过滤排序切片/标签三分支 | 已证实 | `:1-61` 全文逐行 |
| 调用方=tray.ts:7 | 已证实 | 全树检索（§4） |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 常量/类型/内部两函数/主入口 | §2/§3 | 3-61 | covered |
