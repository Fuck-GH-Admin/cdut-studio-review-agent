---
path: apps/electron/src/renderer/lib/team-layout-mode.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: be228c8d0679ecf6dbafeb753e5688275b2cbc50
sha256: 2f2dd915ff511b3f63b1613fbb982e05217c2a19129a9ae3863119df9fe00e8b
lines: 5
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/team-layout-mode.ts

## 1. 结论与边界

团队工作区布局模式常量模块（5 行）：仅持久化键名、模式类型、默认值三条声明。持久化读写在 `agent-atoms.ts:384-386` 的 `atomWithStorage`，不在本文件。

## 2. 导出与关键符号

常量 2：`TEAM_WORKSPACE_LAYOUT_MODE_STORAGE_KEY='profer-team-layout-mode'`（team-layout-mode.ts:1）、`DEFAULT_TEAM_WORKSPACE_LAYOUT_MODE='files'`（:5）；类型 1：`TeamWorkspaceLayoutMode='files'|'chat'`（:3）；函数 0。无内部符号。

## 3. 内部逻辑与关键流程

本文件不适用，依据：team-layout-mode.ts:1-5 仅有模块级声明，无函数体、无分支、无可执行流程。

## 4. 调用者与调用链

入向：`agent-atoms.ts:16-19` import、`:384-386` 用于 `teamWorkspaceLayoutModeAtom`；测试 `team-layout-mode.test.ts:5`。无其它引用（检索范围：baseline 全树 grep `team-layout-mode|TEAM_WORKSPACE_LAYOUT_MODE`）。出向：无。

## 5. 数据 I/O、读写与副作用

纯常量，无状态无副作用；localStorage 读写在 `agent-atoms.ts:384`，不在本文件。

## 6. 分支、失败、取消与恢复

本文件不适用，依据：team-layout-mode.ts:1-5 无条件分支、无 throw、无返回约定。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。

## 8. 修改影响面

改键名/默认值影响既有用户偏好与新用户初始布局；需同步 `agent-atoms.ts:384-386` 与 `team-layout-mode.test.ts:9-10`。

## 9. 测试证据

`NOT_RUN`（本轮未运行测试，纯静态阅读）。`team-layout-mode.test.ts` 机械计数 `test(`=1；真实断言 :9（`toBe('files')`）、:10（键名）。断言≠运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 条导出声明与类型联合 | 已证实 | team-layout-mode.ts:1-5 全文 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 存储键常量 | §2/§8 | team-layout-mode.ts:1 | covered |
| TeamWorkspaceLayoutMode | §2 | :3 | covered |
| 默认值常量 | §2/§8 | :5 | covered |
