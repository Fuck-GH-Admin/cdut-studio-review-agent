---
path: apps/electron/src/main/lib/memory-search-router.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4e2e50cbf4b050fb75d50f6168955f658913b1d7
sha256: 7fbba90adb913ca26c7cb6fdbac7b2654e10f793a6e8da13cc54967b0478c9af
lines: 36
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/memory-search-router.ts

## 1. 结论与边界

记忆检索双引擎策略路由器（头注释 :1-6）：`memory-archive-search.ts`（经典 FTS5）**100% 不动**；本路由仅分发+增强引擎异常安全回退，「检索永不失败」。

## 2. 导出与关键符号

导出 2 条（`export` :12/:21）：`MemoryRetrievalEngineType`（:12，'classic'|'hipporag'）、`searchMemoryArchiveRouted(path, query, engineType='classic', topK=5)`（:21-36）。

## 3. 内部逻辑与关键流程

hipporag→`hippoMemoryService.search`，异常 warn+回退经典（:27-34）；classic→`searchMemoryArchive`（:35）。

## 4. 调用者与调用链

入向（子agent 交叉核）：生产唯一 `ipc.ts:429` → 调用 `:4268`（memoryRetrievalEngine=hipporag 设置时）；测试 `memory-search-router.test.ts:5`。出向：`./memory-archive-search`（:8，classic 回退 :32/:35）、`./hippo-memory-service`（:9，:29）。

## 5-7. 数据/分支/权限

二分支+catch 回退；不适用取消/恢复。

## 8. 修改影响面

- 消费面：`ipc.ts:4268`（SEARCH_MEMORY_ARCHIVE 的 hipporag 分支）——检索结果直接回渲染层。
- 依赖面：`memory-archive-search.ts`（经典引擎，「100% 不动」契约）与 `hippo-memory-service.ts`（增强引擎，批外）——任一变更需保持回退语义「检索永不失败」。
- 需同步测试：`memory-search-router.test.ts`（2 用例，批内姊妹手册）；classic 分支与异常回退路径当前未覆盖。

## 9. 测试证据

`memory-search-router.test.ts`（批内，38 行，断言细节见姊妹手册）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 2 条；回退语义 | 已证实 | :21-36 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出+回退 | §2/§3 | :21-36 | covered |
