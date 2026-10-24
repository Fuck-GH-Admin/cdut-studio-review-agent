---
path: apps/electron/src/main/lib/agent-session-ui-projection.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: af7eef6be70af1b0925349ac36521fc4a326cd36
sha256: 7acf33048ef449d959c9cedf787dc091ea0ae6234151fec9f4045e250e8909d4
lines: 57
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-session-ui-projection.ts

## 1. 结论与边界

**私有会话元数据→安全跨设备 UI 快照**的纯映射（`agent-session-ui-projection.ts:8`）。纯函数，无 I/O。

## 2. 导出与关键符号

1 个导出：`buildAgentSessionUiProjection(meta): AgentSessionUiProjection`（`:9`）。返回 schemaVersion:1 + 35 个字段（`:19-56`）：id/revision（`Math.max(0, meta.revision ?? 0)`，`:22`）/title/时间戳/channelId?/modelId?/agentRuntime（`normalizeAgentRuntime` 归一，`:28`）/permissionMode（缺省 `PROFER_DEFAULT_PERMISSION_MODE`，`:29`）/presetId+presetReference（**条件展开 workspaceSlug/presetVersion**，`:10-17`）/thinking/fastMode/study/autoQueue/workspaceId/pinned/archived/draft/parent/root/sourceDelegation/exploration 三元/delegation 三元/automation 二元/interrupted 三元/`completedButUnconfirmed`/`stoppedByUser`。可空字段统一 `?? null`（或 `?? false/true` 缺省）。

## 3. 内部逻辑与关键流程

单函数直映射（§2）；presetReference 嵌套对象按存在性条件展开（避免 undefined 键）。

## 4. 调用者与调用链

- 入向：`agent-session-ui-projection-publisher.ts:4`（本批）。
- 出向：`@profer/shared`（normalizeAgentRuntime/PROFER_DEFAULT_PERMISSION_MODE/类型，域外）。

## 5. 数据 I/O、读写与副作用

无（纯映射）。

## 6. 分支、失败、取消与恢复

不适用（无抛错路径）。

## 7. 权限与权威状态

"安全快照"=只含 UI 需要字段（不含 SDK 私有元数据——如 sdkSessionId/piSessionFile 不在投影内，照实记录）。

## 8. 修改影响面

跨设备 UI 快照 schema（消费方=桌面/远程渲染）；schemaVersion:1 兼容契约。

## 9. 测试证据

`NOT_RUN`。直接测试：无（检索范围同 publisher 手册 §9）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 35 字段映射/缺省/归一 | 已证实 | `:1-57` 全文 |
| 消费方渲染行为 | 边界 | 域外 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出全字段 | §2 | 9-56 | covered |
