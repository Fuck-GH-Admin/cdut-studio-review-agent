---
path: packages/session-core/src/index.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9d300039f2ee422267dfb68a0eefe877d328e60d
sha256: f2cd2c60e6e5a501fcdd850b1154f7c467a02baba31711c0072dfe86d5c6a966
lines: 53
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-47-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/session-core/src/index.ts

## 1. 结论与边界

`@profer/session-core` 主入口 barrel（头注释 :1-10）：**全部纯函数、浏览器安全**，Electron 渲染层可直接 import；文件 IO 隔离到 `./node` 子入口（防 Vite 打包 node:fs）。纯 re-export 无运行时代码。

## 2. 导出与关键符号

9 块聚合（`export` :13/:19/:33/:40/:49/:50/:51/:52/:53）：`./read` 2 函数（:13-16）、`./group` 7 函数+3 类型（:19-30）、`./thinking-tags` 3 函数（:33-37）、`./transcript` 3 函数+2 类型（:40-46）、`./outline`（:49）、`./search`（:50）、`./select`（:51）、`./render-markdown`（:52）、`./tokens`（:53）。含 18 清单外模块（thinking-tags/transcript/search/select/tokens）。

## 3. 内部逻辑与关键流程

不适用，依据：纯 re-export。

## 4. 调用者与调用链

入向（子agent 交叉核）：`@profer/session-core` → exports "."，**11 importer（10 生产+1 测试）**：`cli/commands/{outline:9, search:9, info:11, export:17}`、`main/lib/{agent-orchestrator:93, agent-session-manager:79, retrospective-service:16, title-generation:12}`、`renderer/components/agent/{SDKMessageRenderer:15, AgentMessages:41}`、`cli/commands/export.test.ts:3`；包内 `session-core.test.ts:2-11`。出向：9 个包内模块 re-export。

## 5. 数据 I/O、读写与副作用

无。

## 6-7. 分支/权限

不适用，依据：纯 re-export。

## 8. 修改影响面

11 个 importer；浏览器安全边界（node:fs 隔离）依赖此结构。

## 9. 测试证据

经 `session-core.test.ts`（批外）+ `export.test.ts` 间接。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 9 块聚合、浏览器安全边界 | 已证实 | :1-53 |
| 11 importer | 已证实 | §4 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 9 聚合块 | §2 | :13-53 | covered |
