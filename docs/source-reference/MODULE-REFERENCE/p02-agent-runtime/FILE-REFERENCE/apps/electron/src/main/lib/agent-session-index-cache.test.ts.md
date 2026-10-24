---
path: apps/electron/src/main/lib/agent-session-index-cache.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4f4d6595f9947f6249e087674172c1465a7865c7
sha256: 9a6ab4221876c9261ea213b2401f315de4da94138e2b477213f80bc3aec8e789
lines: 61
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-session-index-cache.test.ts

## 1. 测试目标

session-manager 索引缓存失效语义：外部替换失效缓存、删索引不返陈旧元数据。bun:test；electron 最小 mock（`:6-20`）+ 临时 `PROFER_CONFIG_DIR` + **动态 import 带 cacheKey 隔离模块态**（`:26-32`）。

## 2. 用例清单

共 **2 个 `test(`**：外部改写索引后 `getAgentSessionMeta` 取新标题（`:40`）；删索引文件后返回 undefined（`:52`）。

## 3. 真实断言

`:49` `title` `toBe('externally replaced title')`；`:55` `existsSync` true；`:59` `getAgentSessionMeta` `toBeUndefined()`。

## 4. 未覆盖与脆弱点

mtime+size 同值并发场景无断言；损坏索引 fail-closed 路径无断言（缺口如实）。断言≠已运行：**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 用例/断言/隔离夹具 | 已证实 | 全 61 行 |
| 测试通过状态 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 用例 | §2/§3 | 40-60 | covered |
