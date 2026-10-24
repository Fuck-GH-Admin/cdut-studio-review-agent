---
path: packages/session-core/src/node.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7fa8e9937e8039b89083c628202cb7467a792431
sha256: f47cad2966e1a6d707a27d9e9615f5a9ba3130ddfdcbdba1fd5dad66bee01616
lines: 8
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-47-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/session-core/src/node.ts

## 1. 结论与边界

Node 侧子入口（8 行，头注释 :1-7）：含文件 IO 的 readSessionMessages 经此暴露；**禁止浏览器/渲染层 import**（否则 Vite 打包 node:fs 运行时报错）；浏览器侧用主入口。

## 2. 导出与关键符号

导出 1 条（`export` :8）：`readSessionMessages`（re-export 自 `./read-fs`）。

## 3-7. 逻辑/数据/分支/权限

不适用，依据：纯 re-export 无逻辑/无 I/O 本身/无分支/无权限。

## 4. 调用者与调用链

入向（子agent 交叉核）：`@profer/session-core/node` 全生产 4 处：`cli/commands/outline.ts:8`、`search.ts:8`、`info.ts:10`、`export.ts:16`（调用点 :25/:26/:26/:35）。Electron 主进程未用（自建 IO）。出向：`./read-fs`（:8）。

## 5. 数据 I/O、读写与副作用

不适用（本文件无 IO；透传 read-fs）。

## 8. 修改影响面

CLI 4 命令的文件读取入口；双入口契约（package.json exports "./node"）。

## 9. 测试证据

无直接测试（经 CLI 命令间接）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条；浏览器禁入边界 | 已证实 | :1-8 |
| 4 CLI 消费者 | 已证实 | §4 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| readSessionMessages re-export | §2/§4 | :8 | covered |
