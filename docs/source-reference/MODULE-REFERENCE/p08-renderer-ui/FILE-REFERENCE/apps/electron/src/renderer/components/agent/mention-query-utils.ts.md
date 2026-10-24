---
path: apps/electron/src/renderer/components/agent/mention-query-utils.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 64b9de56d1a20124843050b8b84362e9c589438b
sha256: f3ee5d98e975f96e7cb89acac635fa8daea47eb93b7a0029b1a110aa848fa179
lines: 217
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/mention-query-utils.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

mention 查询工具层（217 行）：工作区能力/文件快照双缓存（30s TTL）；快照内本地过滤排序（不每键 IPC）；双组配额封顶保代表性；**最新查询胜出**（被替换调用立即空值，旧请求晚回不更新 UI，`createLatestQueryRunner` 注释 :196）。

## 2. 导出与关键符号

常量：`MENTION_DEBOUNCE_MS=35`/`MAX_MENTION_ITEMS=50`/`MAX_FILE_MENTION_ITEMS=200`（:18-20）。

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `invalidateWorkspaceCapabilitiesCache` | 25-32 | 代际+1；slug 或全清 |
| `invalidateFileSnapshotCache` | 34-37 | 全清 |
| `getMentionCacheGeneration` | 39-41 | 代际读取 |
| `getCachedWorkspaceCapabilities` | 43-53 | Promise 也缓存（防并发重复读，注释 :22-24） |
| `createFileSnapshotKey` | 61-63 | 路径归一（去重+排序）后 JSON 键 |
| `getCachedFileSnapshot` | 68-83 | 首次激活取有限快照（searchWorkspaceFiles limit 2000） |
| `filterFileSnapshot` | 138-149 | 本地过滤/排序/封顶 |
| `limitMentionGroups` | 151-155 | 双组配额封顶 |
| `limitFileMentionResult` | 157-167 | null→空结构 |
| `createLatestQueryRunner` | 170-217 | 去抖+最新胜出 |

内部：`TimedCacheEntry`（:7-10）、`normalizePaths`（:55-57）、`fuzzyMatch`（:85-98，前缀/包含/子序列三级）、`sortEntries`（:100-110，前缀优先→dir 优先→路径短优先）、`capGroups`（:112-135，比例配额+至少各 1 代表+总上限硬约束）。

## 3. 内部逻辑与关键流程

1. **缓存**（:43-83）：TTL 内返回缓存 Promise；失败删缓存重抛；文件快照键含 root/additional/session 三组归一路径。
2. **过滤**（:138-149）：query 小写→双组 fuzzyMatch→sortEntries→capGroups；返回 `total`=未封顶命中数。
3. **`createLatestQueryRunner`**（:170-217）：sequence 递增；pending/active 均以 emptyValue 提前 resolve；去抖后执行，结果仅当 `currentSequence===sequence` 才返回真值（旧结果丢弃）；同步 throw/异步 reject→emptyValue。

## 4. 调用者与调用链

入向：`mention-suggestions.tsx`（工厂 items 钩子）、文件 mention 弹层组件。出向：`window.electronAPI`（getWorkspaceCapabilities/searchWorkspaceFiles，:46/:73）、`@profer/shared` 类型。

## 5. 数据 I/O、读写与副作用

经 electronAPI IPC 读能力/文件清单；内存缓存；无写盘。

## 6. 分支、失败、取消与恢复

IPC 失败→缓存删除+抛（调用方 catch 回空）；被替换查询→空值立即 resolve；不抛未捕获。

## 7. 权限与权威状态

- 结果新鲜度权威：代际/sequence 双闸防旧结果污染 UI（:39-41/:170-217）。
- 配额权威：`capGroups` 永不超总上限且尽量保双组代表（:112-135）。无 sender/role 检查。

## 8. 修改影响面

文件/Skill/MCP/会话 mention 性能与新鲜度。同测：`mention-query-utils.test.ts`（6 用例）。

## 9. 测试证据

直接测试 `mention-query-utils.test.ts`（6 用例 / 1 describe；纯函数+真异步；NOT_RUN）：
1. `:12-17` 快照键对等价目录组合稳定（去重+排序）。
2. `:19-31` 快照本地过滤排序（'age'→agent.md，无 IPC）。
3. `:33-42` 封顶保双组各 1（limit 2）。
4. `:44-62` 偏斜组总上限硬约束（1999+1→200；limit 1→1）。
5. `:64-75` 被替换的在途查询立即空值（不等旧 promise）。
6. `:77-85` 只有最新去抖查询返回真值（old→''、new→'new'）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 10 导出/内部符号/行号 | 已证实 | 逐行核对 |
| 最新胜出/配额/键稳定 | 已证实 | 测试族逐条 |
| 真实 IPC 行为 | 未知 | NOT_RUN（electronAPI mock 边界外） |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `createLatestQueryRunner` | §3.3/§9 | 170-217 | covered |
| `filterFileSnapshot`/`capGroups` | §3.2/§9 | 112-149 | covered |
| `createFileSnapshotKey` | §3.1/§9 | 61-63 | covered |
| 双缓存 TTL/失效 | §3.1 | 25-83 | covered（未测） |
