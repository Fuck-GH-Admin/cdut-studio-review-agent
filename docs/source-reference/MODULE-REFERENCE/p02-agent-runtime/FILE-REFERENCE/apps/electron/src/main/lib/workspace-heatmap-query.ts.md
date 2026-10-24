---
path: apps/electron/src/main/lib/workspace-heatmap-query.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5c9492c7027484cac8c491794e53ad44db9c7a24
sha256: 20e91025031aa08cb93d586dbf3e51feaf1cdfcfa8cdc6c65bced90289546da4
lines: 23
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/workspace-heatmap-query.ts

## 1. 结论与边界

查询**普通工作区**的每日 Token 消耗；统一承载 IPC 与远程 WS 的工作区校验、会话筛选和 DTO 映射口径（注释 `apps/electron/src/main/lib/workspace-heatmap-query.ts:5-7`）。薄文件（23 行）单函数。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数 = 1 个导出（类/接口/常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `loadWorkspaceHeatmapDaily` | 函数（导出） | 9-23 | `(workspaceId)=>HeatmapDailyEntry[]` | 团队/缺失工作区→`[]` |

## 3. 内部逻辑与关键流程

`:9-23`：`getAgentWorkspace(workspaceId)` 不存在或 `type==='team'` → `[]`（团队工作区不在此口径）；`listAgentSessions(true)` 按 `workspaceId` 过滤并映射 `{id,createdAt,updatedAt,archived}` DTO；委托 `getWorkspaceHeatmapDaily(workspaceId, sessions)`（`./workspace-heatmap-service`）。

## 4. 调用者与调用链

入向：IPC 与远程 WS 共用入口（`loadWorkspaceHeatmapDaily`）；测试：`workspace-heatmap-query.test.ts`（42 行，本批）。出向：`./agent-session-manager.ts:1`、`./agent-workspace-manager.ts:2`、`./workspace-heatmap-service.ts:3`。

## 5. 数据 I/O、读写与副作用

只读：工作区/会话列表/热力数据（经依赖模块）；无写/副作用。

## 6. 分支、失败、取消与恢复

仅一分支：缺失/团队工作区→`[]`（`:11-12`）。无抛错/取消概念。

## 7. 权限与权威状态

口径权威=本函数（IPC/WS 一致）；团队工作区显式排除（不泄露跨工作区统计）。

## 8. 修改影响面

改筛选/DTO 影响热力图 UI 与远程 API 一致性；影响 `workspace-heatmap-query.test.ts`。

## 9. 测试证据

直接测试：`workspace-heatmap-query.test.ts`（42 行，详见其手册）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 团队工作区排除 | 已证实 | `:11-12` |
| DTO 口径统一 | 已证实 | `:14-21` |
| 热力数据算法 | 未知 | 文件外 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `loadWorkspaceHeatmapDaily` | §3 | 9-23 | covered |
| 算法层 | §10 | — | unknown |
