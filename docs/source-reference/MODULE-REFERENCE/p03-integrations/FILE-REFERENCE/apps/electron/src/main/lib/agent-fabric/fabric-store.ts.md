---
path: apps/electron/src/main/lib/agent-fabric/fabric-store.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3c24bd31afd190184403bfbe98af7ea642328952
sha256: f3a1cd1a27b88c719738332f353cf9d893de961017b0f505d3b6dedb6e3f5c1b
lines: 182
kind: source
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-fabric/fabric-store.ts

## 1. 结论与边界

**文件持久化适配**（设计文档 §12）：JSON/JSONL 文件风格不用数据库——`tasks/<id>.json`（重写）、`results/<id>.json`、`artifacts.json`、`request-index.json`（requestId→taskId 跨重启幂等）、`events/<id>.jsonl`（追加+游标恢复）（`apps/electron/src/main/lib/agent-fabric/fabric-store.ts:1-11`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `getFabricDataDir` | 函数 | 28-30 | `<configDir>/agent-fabric` |
| `createFileTaskStore` | 函数 | 48-107 | `GatewayTaskStore`（save/get/list/indexRequestId/findByRequestId/saveResult/getResult/saveArtifact/getArtifact/listArtifacts） |
| `createFileEventLog` | 函数 | 111-182 | `TaskEventLog`（append/resumeAfter/listByTask） |

内部：`readJson/writeJson`（`:32-44`）、内存镜像+写穿透（`:55-59`）、启动加载（`:61-75`）。

## 3. 内部逻辑与关键流程

- TaskStore：内存 Map+落盘；`findByRequestId` 经 requestIndex（`:91-94`）。
- EventLog：启动回放 JSONL（**seenEventIds 去重、损坏行跳过、按 eventSequence 排序**，`:117-137`）；`append` 重复 eventId 返回原事件（`:141-142`）、**序列从回放最大值继续递增**（`:145-149` 注释：重启后游标语义不重置）、落盘失败 console.error 不抛（`:160-165`）；`resumeAfter` 游标越界抛 `ProtocolError(VALIDATION_FAILED)`（`:168-176`）。

## 4. 调用者与调用链

入向：`agent-fabric-service.ts:22`、`fabric-server.test.ts:21`、`fabric-store.test.ts:17`。出向：`@profer/agent-fabric`（类型/ProtocolError）、`../config-paths`。

## 5. 数据 I/O 与副作用

读写配置目录 agent-fabric/ 下 JSON/JSONL。

## 6. 分支、失败、取消与恢复

readJson 失败→undefined；事件损坏行跳过不阻断（`:129-131`）；append 落盘失败吞（内存仍有效）。

## 7. 权限与权威状态

幂等索引保障断线重发安全（设计要点）。

## 8. 修改影响面

文件布局是跨重启恢复契约；序列递增语义影响 SSE 游标。

## 9. 测试证据

`fabric-store.test.ts`（3 用例：跨实例恢复/序列不重置/重复 eventId，另篇）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出+恢复/去重/游标语义 | 已证实 | `:1-182` 逐行 |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部导出/恢复链 | §2/§3 | covered |
| 测试/运行 | §9/§10 | unknown（NOT_RUN） |
