---
path: apps/electron/src/main/lib/agent-fabric/fabric-store.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c7631068b0facb0fb2d559a0f3b5bd51768bf3a7
sha256: 9c65968c5d63cf8a43b3923e941d432b0a7a011b83a4b1ce8651bd1f2c12458d
lines: 107
kind: test
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-fabric/fabric-store.test.ts

## 1. 测试目标

文件持久化适配测试（头注释 `apps/electron/src/main/lib/agent-fabric/fabric-store.test.ts:1-4`）：任务/结果/事件/requestId 索引跨实例（模拟重启）可恢复。mock 边界：临时目录（`:21-27`）；被测 `createFileTaskStore/createFileEventLog`。

## 2. 用例清单

2 describe、3 it：

1. `:59` 任务/结果/产物/requestId 索引新实例可恢复+状态更新持久化（store1→store2→store3 三级）。
2. `:84` 事件追加后新实例可回放且**序列不重置**（e3.eventSequence===3）。
3. `:100` 重复 eventId 不重复追加（返回同一对象、listByTask 长度 1）。

## 3. 真实断言

`:71-79` status RUNNING→findByRequestId→result summary→artifacts 1→COMPLETED 持久化；`:91-97` resumeAfter 2 条、e3 序列 3、三次实例后 ['e1','e2','e3']；`:104-105` dup===first、长度 1。

## 4. 未覆盖与脆弱点

未覆盖：损坏 JSONL 行跳过、resumeAfter 越界抛错、并发写、trim 语义。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例锚点与断言文本 | 已证实 | `:58-106` |
| 运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| 持久化恢复/序列语义/去重 | §3 | covered |
| 异常路径 | §4 | partial |
| 实际运行 | §5 | unknown（NOT_RUN） |
