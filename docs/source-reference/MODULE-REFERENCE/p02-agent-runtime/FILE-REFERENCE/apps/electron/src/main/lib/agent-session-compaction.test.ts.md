---
path: apps/electron/src/main/lib/agent-session-compaction.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 38bc7f00d74dc7188816b1fb097c626b7e7c3b46
sha256: e5cd01a534eca867e9a11393bf901cbca3769750a0da43f5ee35bb1a70c68a10
lines: 220
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-session-compaction.test.ts

## 1. 测试目标

`compactAgentSessionStorage`/`previewAgentSessionCompaction`（`agent-session-compaction.ts:171,137`）：只动超限行、**不丢数据可还原**、幂等备份、预览零写入。bun:test；真实临时目录+electron mock+动态 import 隔离（`:31-40`）；`oversizedLine` 真实形态夹具（顶层 tool_use_result 整页 HTML，`:47-54`）。

## 2. 用例清单

共 **11 个 `test(`**（机械核），四 describe：只动超限行 3（`:69,89,101`）；不丢数据 3（`:114,131,150`）；幂等与备份 3（`:163,177,189`）；预览不写入 2（`:199,212`）。

## 3. 真实断言

- `:82-86` 小行逐字节相同（`after[0]` `toBe(small1)`）+超限行改写后 ≤ MAX。
- `:95-98` 全小行零写入零备份（`backupDir` `toBeUndefined()`+文件不变）。
- `:127-128` **还原往返逐字节**：`resolveMessageBlobs` 后 `JSON.stringify` 相等。
- `:143-145` blobRefs≥2/`blobCount` `toBe(1)`（内容寻址）/blobBytes>0。
- `:172-174` 二跑零改动；`:186` 备份=改写前原文；`:194` 无 `.compact-tmp` 残留。
- `:205-209` 预览 rewrittenLines=1 但文件/备份未产生；`:217-218` 预览/执行统计一致。

## 4. 未覆盖与脆弱点

并发追加 skip 分支（源 `:215-219`）无断言（无法稳定模拟）；失败清理 tmp 分支无断言。断言≠已运行：**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 用例/断言/夹具 | 已证实 | 全 220 行 |
| 测试通过状态 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 11 用例 | §2/§3 | 69-219 | covered |
