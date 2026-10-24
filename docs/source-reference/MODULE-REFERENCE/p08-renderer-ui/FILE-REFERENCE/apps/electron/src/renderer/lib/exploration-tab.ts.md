---
path: apps/electron/src/renderer/lib/exploration-tab.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b0aaa2f3f271ff39b77fcbf38c650cf04713d40e
sha256: 3adc5abda0405d64cddd9ac956e409f6c150004b5d9a3ac546f1758417dcafea
lines: 59
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/exploration-tab.ts

## 1. 结论与边界

**探索分支 Tab 化入口**（59 行）：Pi `/tree` fork 分支从"文件面板内嵌第二个 AgentView"迁为父会话上下文内的会话 Tab（type:'agent'+parentSessionId 血缘，`:2-9`）；关闭 Tab 只关展示（branch artifact 持久化在主进程 meta）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `openExplorationBranchTab` | `:27-59` | `(store, parentSessionId, branch, {autoGroup?}) => sessionId`：openTab→可选自动并排组合（父左分支右、焦点在分支 `:23-24`）→`activateTabWithSideEffects` 统一激活 |

内部：`JotaiStore:18`（ReturnType<typeof useStore> 推导）。

## 3. 内部逻辑与关键流程

openTab 写 tabsAtom→autoGroup 时（父 Tab 存在且双方未入组）createGroup+replaceTabGroup→统一激活（同步 currentAgentSessionId/workspace/前台所有权 `:55-56`）。

## 4. 调用者与调用链

探索分支创建/重开流程（fork 动作）；出向 `@/atoms/tab-atoms`、`@/atoms/tab-group-atoms`、`@/lib/tab-activation`。

## 5. 数据 I/O、读写与副作用

Jotai store 读写（tabs/tabGroups）。

## 6. 分支、失败、取消与恢复

autoGroup 三条件守卫（父存在+双方未入组）；用户已有布局不动（`:24`）。

## 7. 权限与权威状态

- **血缘契约**（`:5`）：parentSessionId 记录 fork 来源。
- **"关闭只关展示"**（`:9`）：持久化权威在主进程 meta。

## 8. 修改影响面

改入口影响探索分支体验；tab-group 组合契约联动 tab-atoms。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件/血缘/并排契约 | 已证实 | 59 行全读 |
| tab-atoms/tab-activation 实现 | 未知 | 不在本批 |
| 实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；依赖/实效 unknown。
