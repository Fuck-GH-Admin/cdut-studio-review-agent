---
path: apps/electron/src/main/lib/agent-session-ui-projection-publisher.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 30f0d1f4ae5b90d774699a9a7fc4d84389c955c9
sha256: a5366c0b4e27fb68059394287c49a5a4c68bb94c2ac02600dd8e2a53ca9287ce
lines: 50
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-session-ui-projection-publisher.ts

## 1. 结论与边界

**会话 UI 投影发布器**：元数据变更成功后发布规范安全快照（`:18`）；审核 owner 永不出现在普通桌面投影事件面（`:20-21`）；删除发 revision tombstone 防延迟 upsert 复活已删会话（`:39`）。单 EventBus 配置（`:8-11`）。

## 2. 导出与关键符号

`export` 逐条核：4 个导出对象。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `configureAgentSessionProjectionPublisher` | 函数 | `:9` | 配置全局 EventBus（模块级单例 `projectionEventBus`，`:6`） |
| `publishAgentSessionProjection` | 函数 | `:19` | 发 upsert 投影（审核/已删 owner 静默跳过，`:21`） |
| `updateAgentSessionUiMeta` | 函数 | `:30` | `updateAgentSessionMeta` + 发布（原子包装） |
| `publishAgentSessionDeletion` | 函数 | `:40` | 发 delete tombstone（`{operation:'delete', sessionId, revision}`，`:44-49`） |

内部：`emitProjection`（`:13-16`，未初始化抛 "尚未初始化"）。

## 3. 内部逻辑与关键流程

见 §2；要点：upsert 载荷=`buildAgentSessionUiProjection(meta)`（`:25`）；删除守卫 `isReviewOwnedOrDeletedAgentSessionId` 双查（`:21,:43`）；tombstone 携带 revision 供消费方丢弃过期 upsert（注释 `:41-42`）。

## 4. 调用者与调用链

- 入向：`agent-service.ts`（`configure…` `:50`、`publishAgentSessionProjection` `:350,480`——本批文件）；域外 ipc/remote。
- 出向：`./agent-event-bus`（类型）、`./agent-session-manager`（updateAgentSessionMeta/isReviewOwnedOrDeletedAgentSessionId）、`./agent-session-ui-projection`（buildAgentSessionUiProjection）。

## 5. 数据 I/O、读写与副作用

经 EventBus 发事件（副作用归 bus）；经 manager 写元数据。模块级单例状态（`:6`）。

## 6. 分支、失败、取消与恢复

未初始化→抛；审核/已删→静默跳过；无取消。

## 7. 权限与权威状态

审核 owner 隐私边界（fail-closed 双查）；删除 tombstone 为防复活权威信号。

## 8. 修改影响面

投影事件面（桌面/远程消费方）；与 manager 的审核判定连动。

## 9. 测试证据

`NOT_RUN`。直接测试：无（检索 nb-51 10 测试文件 + 全树文件名 grep 本模块 0 命中）；间接：ui 投影形状由 `agent-session-ui-projection` 手册覆盖。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出/守卫/tombstone 语义 | 已证实 | `:1-50` 全文 |
| 无直接测试 | 已证实（否定结论） | 检索范围如 §9 |
| 消费方 tombstone 处理 | 边界 | 域外未核 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出+内部 | §2/§3 | 6-49 | covered |
