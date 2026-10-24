---
path: apps/electron/src/renderer/atoms/cslab-tour-atoms.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 677a939f41bb4a9e89a96ff639dfc49a017a1ec1
sha256: 2cb2aca7c25d818dad224fe68e59ccd272ef464a220bb02f1c3cdf35b2069d57
lines: 26
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/cslab-tour-atoms.ts

## 1. 结论与边界

新手引导一次性指令通道（头注释 :2-7）：**指令/ack 解耦**——工作台持复杂逻辑（openAssetInPane 等），引导层 atom 下发指令、工作台执行后回写 ack，避免跨组件 ref 与 DOM 模拟点击。

## 2. 导出与关键符号

导出 4 条（`export` :10/:16/:23/:26）：`CsLabTourCommand`（四指令 open-table-at-index/open-asset-by-title/open-plot/refresh-assets，带 id :10-14）、`CsLabTourAck`（:16-20）、`cslabTourCommandAtom`（:23）、`cslabTourAckAtom`（:26，按 id 匹配）。

## 3-7. 不适用

纯原子+指令协议（无逻辑分支）——依据：26 行全文。

## 8. 修改影响面

- 消费面：CSLab 新手引导+工作台执行器。
- 依赖面：无（自包含协议）。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 4 条；指令/ack 协议 | 已证实 | :2-26 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出 | §2 | :10-26 | covered |
