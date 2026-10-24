---
path: apps/electron/src/main/lib/agent-fork-workspace-copy.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3e07e86715f649d1a5f554e162b0c9394d9a2e8e
sha256: 51316f76ee87480780a9ca041f528a8a0850971e455c8ab375bf874924e6afac
lines: 95
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-fork-workspace-copy.test.ts

## 1. 测试目标

fork 工作区复制：黑名单语义、失败结构化、project key 稳定。不运行（`NOT_RUN`）。

## 2. 用例清单

4 用例（:32/:65/:78/:87），1 describe（:31）；真实 tmp 目录 fixture（:13-29）。
1. 保留 .context/跳过高风险（:32-63）：copied 6/skipped 3/failed 0（:50-52）；6 个存在断言（:53-58）、4 个不存在断言（:59-62）。
2. 源不存在结构化失败（:65-76）：failedPaths `[{path, reason: stringContaining('ENOENT')}]`（:75）。
3. Windows 超长路径 key（:78-85）：`buildForkProjectKey` 稳定+≤240（fork-file-ops 间接）。
4. 黑白名单判定（:87-94）：.context true/.claude false/node_modules false/build true/out true/.git false。

## 3. 真实断言

`:50-62`/`:72-75`/`:83-84`/`:88-93`（toBe/toEqual/expect.stringContaining 如 §2）。

## 4. 未覆盖与脆弱点

未覆盖：条目级复制失败分支。mock 边界：真实文件系统（mkdtemp+afterEach 清理）。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例/断言如 §2-3 | 已证实 | 逐行读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 分支 | 用例 | 状态 |
| --- | --- | --- |
| 黑名单复制/失败降级/key/判定 | #1-#4 | covered |
