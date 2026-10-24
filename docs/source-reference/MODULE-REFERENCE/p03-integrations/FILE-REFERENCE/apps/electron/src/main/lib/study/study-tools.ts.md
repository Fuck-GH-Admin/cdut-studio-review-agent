---
path: apps/electron/src/main/lib/study/study-tools.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 88d720b0a083c3c664544be4fdd5b544ec33d61b
sha256: 962ed86c945e815c454ee9a33f1ba3d2ddbea9f53bb96ff3315db040db9fb900
lines: 164
kind: source
package: p03-integrations
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/study/study-tools.ts

## 1. 结论与边界

**速课堂 Pi 工具注册**（`apps/electron/src/main/lib/study/study-tools.ts`，164 行）：把速课堂能力（检索/概念管理等）注册为 Pi Agent 工具。工具结果统一 JSON（`jsonToolResult`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `buildPiStudyTools` | 函数 | `:48-164` | `(…) => AgentToolResult<unknown>` 工具注册入口（唯一逻辑导出） |

内部：`PiSdk`（`:24`，Pi SDK 类型）、`jsonToolResult`（`:26-33`，JSON 工具结果包装）、`mergeConcepts`（`:34-47`，概念增删合并）。

## 3. 内部逻辑与关键流程

`buildPiStudyTools`（`:48-164`）：为 Pi 注册速课堂工具（检索经 `searchStudyRouted` 等）；`jsonToolResult` 统一返回形状；`mergeConcepts`（`:34-47`）对概念列表做 `add/remove` 幂等合并。

## 4. 调用者与调用链

- 消费方：Pi Agent runtime（速课堂会话）。
- 出向：Pi SDK（`@earendil-works/pi-coding-agent`）、`study-retrieval-router` 等。

## 5. 数据 I/O、读写与副作用

工具执行体内的检索/写入副作用（经各服务）；无直接 I/O 在本文件。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 概念增删 | `:34-47` | 幂等合并 |
| 工具结果 | `:26-33` | JSON 统一形状 |

## 7. 权限与权威状态

工具注册面；无身份校验（由 Pi runtime 权限层控制）。

## 8. 修改影响面

- 工具名/参数 schema 是 Pi 合同；`jsonToolResult` 形状变更影响模型解析。

## 9. 测试证据

无专属测试（全树检索 `buildPiStudyTools` 测试命中 0）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 个导出、工具注册 | 已证实 | `:24-164` |
| 概念合并语义 | 已证实 | `:34-47` |
| 工具实际执行 | 未知 | 未运行 |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `buildPiStudyTools` | `:48-164` | covered |
| jsonToolResult/mergeConcepts | `:26-47` | covered |
