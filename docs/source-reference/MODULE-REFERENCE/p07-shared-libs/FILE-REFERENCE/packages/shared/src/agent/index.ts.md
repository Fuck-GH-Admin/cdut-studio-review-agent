---
path: packages/shared/src/agent/index.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4cb120ce109e15589679ec6af419fd119b58c893
sha256: fe842b9021e8341a871c3ace2f41ede0105112380aa65336703cdb5729d0f8cc
lines: 5
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/agent/index.ts

## 1. 结论与边界

`packages/shared/src/agent/` 目录的桶文件，当前**零导出**：全文 5 行 = 文件头注释 + 1 行说明注释「tool-matching.ts 已删除 — SDK 消息直接透传，无需工具匹配」（`packages/shared/src/agent/index.ts:5`）。无代码、无 re-export。

边界：与 `packages/shared/src/types/agent.ts`（类型模块，被 `types/index.ts:25` 转发）**无关**——同名 `agent` 但不同目录；本篇只覆盖 `src/agent/index.ts`。

## 2. 导出与关键符号

本文件不适用（无导出）——依据：全文无 `export` 语句（`:1-5` 仅注释）。历史符号 `tool-matching` 相关实现已删除（`:5` 注释），删除时点不在冻结树内可考。

导出计数：0。

## 3. 内部逻辑与关键流程

本文件不适用——依据：无语句、无分支、无逻辑。

## 4. 调用者与调用链

出向：无。入向（grep 全冻结树，检索式：`from './agent'`、`from '../agent'`、`shared/src/agent`、`agent/index`、`@profer/shared/agent`）：**未检出任何 importer**。辅助证据：

- 包根 `packages/shared/src/index.ts:5-16` 的 12 条转发中**不含** `./agent/index`。
- `packages/shared/package.json:8-13` 的 `exports` 映射（`.`、`./types`、`./config`、`./utils`）不含 `./agent`。
- 仓内所有 `from './agent'`/`from '../agent'` 命中均指向 `packages/shared/src/types/agent.ts`（如 `types/agent-preset.ts:16`、`types/index.ts:25`），不是本文件。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：无代码。

## 6. 分支、失败、取消与恢复

本文件不适用——依据：无代码。

## 7. 权限与权威状态

本文件不适用——依据：无代码。

## 8. 修改影响面

当前零消费者（§4），删除或改动本文件对冻结树内的构建/运行无静态可见影响（bundler 会把未引用模块排除；推断）。保留价值仅是目录占位与历史说明（`:5`）。

## 9. 测试证据

无专属测试；grep 未见测试引用本文件。**NOT_RUN**：本轮未执行测试/构建。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 行、零导出、仅注释 | 已证实 | 全文 `:1-5` |
| 不被包根转发、不在 exports 映射 | 已证实 | `index.ts:5-16`、`package.json:8-13` |
| 无 importer | 已证实（否定结论，检索范围=冻结树全文，检索式见 §4） | grep 0 命中 |
| `tool-matching.ts` 的删除时点与原行为 | 未知 | 仅 `:5` 注释；历史不在冻结树 |
| 打包后是否残留空模块 | 未知 | 构建 NOT_RUN（删除影响推断为无） |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 文件内容（注释） | §1 | 1-5 | covered |
| 零导出 | §2 | — | covered |
| 零调用者 | §4 | — | covered（否定，已给检索式） |
