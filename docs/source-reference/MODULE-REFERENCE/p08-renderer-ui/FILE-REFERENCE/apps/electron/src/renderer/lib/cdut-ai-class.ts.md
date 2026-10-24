---
path: apps/electron/src/renderer/lib/cdut-ai-class.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fe47ce174405fdc5357cdb9c71f0b152c9778a60
sha256: fb546043d7f07ff70e7cb4a566d3af4376cc3c0e472ad9cc75db9962a572db30
lines: 16
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/cdut-ai-class.ts

## 1. 结论与边界

**「AI速课堂」工作区身份判定纯函数**（16 行）：统一渲染层识别口径（slug 或展示名双条件，`cdut-ai-class.ts:4-5`），与主进程 ensureAiClassWorkspace 保持一致。边界：只判定身份，不产生任何副作用。

## 2. 导出与关键符号

导出 1 个函数、0 常量、0 类型：`isAiClassWorkspace`（`cdut-ai-class.ts:11`）。内部符号：无（常量 `CDUT_AI_CLASS_WORKSPACE_SLUG`/`CDUT_AI_CLASS_WORKSPACE_NAME` 来自 `@profer/shared`，`cdut-ai-class.ts:8`）。

## 3. 内部逻辑与关键流程

单函数（`cdut-ai-class.ts:11-16`）：`:14` 空入参（null/undefined）返回 false；`:15` 返回 `workspace.slug === CDUT_AI_CLASS_WORKSPACE_SLUG || workspace.name === CDUT_AI_CLASS_WORKSPACE_NAME`，slug 命中即短路 true，二者皆否返回 false。

## 4. 调用者与调用链

- 入向：`apps/electron/src/renderer/components/agent/AgentView.tsx:138` import、`:962` 调用；`apps/electron/src/renderer/components/app-shell/left-sidebar/use-left-sidebar.ts:109` import、`:319`、`:324` 调用。
- 出向：`@profer/shared` 两常量 + 类型 `AgentWorkspace`（`cdut-ai-class.ts:8`）。
- 动态调用：未知；检索方式——冻结树 grep `isAiClassWorkspace|lib/cdut-ai-class`（*.ts/*.tsx），未见 import()/require()，preload 桥无引用。否定结论范围：apps/electron/src 全树 + apps/electron/test。

## 5. 数据 I/O、读写与副作用

纯函数：无模块级状态，无 DOM/toast/窗口/事件副作用，仅读入参。

## 6. 分支、失败、取消与恢复

`workspace` 为 null/undefined → false（`cdut-ai-class.ts:14`）；slug 或 name 命中 → true，否则 false（`cdut-ai-class.ts:15`）。无 throw、无异步、无取消/恢复路径。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。身份判定口径与主进程 ensureAiClassWorkspace 双条件对齐（`cdut-ai-class.ts:5`）。

## 8. 修改影响面

`AgentView.tsx`（速课堂登录锁定 `:966`、区域锁定 `:968`）与 `use-left-sidebar.ts`（`:319` 工作区集合、`:322-324` 锁定回调）的速课堂专属 UI 判定。

## 9. 测试证据

`NOT_RUN`（本轮未运行测试，纯静态阅读）。直接测试文件：本文件无专属 test（冻结树 grep `isAiClassWorkspace` 未见测试 import）；间接证据：调用方组件测试域外。断言≠运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 双条件判定与空输入分支 | 已证实 | `cdut-ai-class.ts:14-15` |
| 主进程口径一致性 | 推断 | 注释 `cdut-ai-class.ts:5`，主进程实现在域外 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| isAiClassWorkspace | §2/§3/§6 | 11-16 | covered |
