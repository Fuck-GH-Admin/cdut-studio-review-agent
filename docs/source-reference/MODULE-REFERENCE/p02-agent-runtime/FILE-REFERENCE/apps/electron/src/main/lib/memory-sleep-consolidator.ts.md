---
path: apps/electron/src/main/lib/memory-sleep-consolidator.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f2d19bd490d011d6742140197337c38ee37b6bb3
sha256: 1cdacefd973e2957d1908fc2683aef89247d28d1e79f6209985854e14ea7285d
lines: 265
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/memory-sleep-consolidator.ts

## 1. 结论与边界

空闲期睡眠反思整合（头注释 :1-11）：借鉴海马体睡眠巩固——接电+系统空闲时周期扫描 memory-archive，做时间衰减打分、Wikilink 稠密化、同主题聚合，帮助发现可合并/清理的陈旧记忆。**严格红线**（:8-10）：绝不删用户文件/绝不伪造内容，仅统计+可选写索引；定时器必须 `.unref()`、不得模块加载时自动启动。

## 2. 导出与关键符号

导出 2 条（`export` :34/:119）：`MemoryConsolidationResult`（:34-44，统计结果）、`MemorySleepConsolidator` class（:119-265）。内部常量：INDEX_FILE_NAME='index.json'（:19，非 .md 不二次扫描）、MAX_FILE_BYTES 2MB（:21）、MAX_FILES 2000（:23）、DECAY_HALF_LIFE_DAYS=30（:25，`decayWeight=0.5^(ageDays/30)` :24）、DECAYED_THRESHOLD=0.5（:27）、IDLE_THRESHOLD_SEC=300（:29）、DEFAULT_INTERVAL_MS=30min（:31）。内部函数：`collectMarkdownFiles`（:69）、`parseFrontmatterName`（:93）、`parseFirstHeading`（:101）、`extractWikilinks`（:107）。

## 3. 内部逻辑与关键流程

（大纲+关键常量级，265 行）：扫描→打分（衰减权重+Wikilink 稠密度）→聚合统计→可选原子写 index.json（safe-file）；电源/空闲门（powerMonitor :15）；定时器 unref。

## 4. 调用者与调用链

入向（子agent 交叉核）：**0 消费者——孤儿模块**。全树检索（引号路径模式+无引号基名 alternation，apps/+packages/）仅命中自身；无测试。生产装配的是 `longterm-memory/longterm-memory-reflector.ts` 的整合器（index.ts:231/:1059-1060），与本文件无 import 关系。出向：`node:fs`/`node:path`、electron（powerMonitor :249-250 try-catch）、`./safe-file`（:16）。

## 5. 数据 I/O、读写与副作用

读 memory-archive md；可选写 index.json（原子）；定时器（unref）。

## 6. 分支、失败、取消与恢复

读失败跳过（collect 防御）；红线=不删不伪造。不适用取消/恢复。

## 7. 权限与权威状态

红线权威（:8-10）：只读+统计；空闲/接电门（powerMonitor）。

## 8. 修改影响面

- 消费面：**无**（孤儿模块，0 消费者）；若未来接入，装配点应比照 `index.ts:1059-1060` 的 longterm-memory-reflector 整合器。
- 依赖面：`./safe-file`（原子写 index.json）、electron powerMonitor（空闲门，:249-250 try-catch）、memory-archive 目录约定。
- 需同步测试：无专属测试；接入前应补 consolidate 打分/红线（不删不伪造）用例。

## 9. 测试证据

无专属测试文件。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 2 条；红线+衰减常量 | 已证实 | :8-31/:119 |
| 打分/聚合实现逐行 | 推断（大纲+常量级） | :69-263 结构 |
| 孤儿模块（0 消费者） | 已证实（否定） | 全树检索（§4） |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出+红线+常量 | §2/§7 | :8-119 | covered |
| 打分/聚合实现 | §3/§10 | :69-263 | 推断 |
