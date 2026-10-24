---
path: apps/electron/src/renderer/components/agent/TaskBadge.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b5b5e50743866ae13daa93f656c1f3efa2bd802a
sha256: e27a5e819103a58ef79e177d9a1d89ed5b1377ec5a4ed88175b8797c3c71672b
lines: 116
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/TaskBadge.tsx

## 1. 结论与边界

单个后台任务徽章（文件头 `apps/electron/src/renderer/components/agent/TaskBadge.tsx:1-6`）：显示任务类型/ID/耗时/Spinner，点击滚动到对应实时工具调用。

## 2. 导出与关键符号

`export` 逐条核对：1 个接口 + 1 个组件 = 2 个导出（类/常量 0）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `TaskBadgeProps` | 接口（导出） | 12-17 | `{task,onClick,onStop?,onOutput?}` |
| `TaskBadge` | 组件（导出） | 58-116 | 徽章渲染 |
| `formatElapsed` | 内部 | 27-40 | 紧凑耗时（`30s`/`1m 30s`/`1h 1m`，jdoc 示例 `:22-25`） |
| `shortenId` | 内部 | 49-51 | 前 8 位+`...` |

## 3. 内部逻辑与关键流程

计时双轨（`:59`）：**Shell 任务本地计时器**（1s interval，`:64-73`）；Agent 任务用事件驱动 `elapsedSeconds`（`:75`）。图标分型（Terminal/GitBranch，`:76`）；输出/停止按钮按回调存在渲染（`:92-113`，aria-label 含缩短 ID）。

## 4. 调用者与调用链

入向：Agent 视图任务徽章区（后台任务列表）；测试：本批**无专属测试**（scope 无 `.test.ts`）。出向：`lucide-react`、`@/atoms/agent-atoms`（`BackgroundTask` 类型）。

## 5. 数据 I/O、读写与副作用

渲染+本地 interval 计时器（清理 `:72`）。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| shell vs agent | 计时/图标分型 | 59-76 |
| onStop/onOutput 缺 | 按钮不渲染 | 92,103 |

## 7. 权限与权威状态

耗时权威=Shell 本地计时/Agent 事件计时二分。

## 8. 修改影响面

影响任务徽章交互与计时显示。

## 9. 测试证据

本批**无专属测试**（scope 事实）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 双轨计时语义 | 已证实 | `:59-76` |
| 渲染行为 | 未知 | 未运行 |
| 测试覆盖 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出+helpers | §2,§3 | 12-116 | covered |
| 断言 | §9,§10 | — | unknown |
