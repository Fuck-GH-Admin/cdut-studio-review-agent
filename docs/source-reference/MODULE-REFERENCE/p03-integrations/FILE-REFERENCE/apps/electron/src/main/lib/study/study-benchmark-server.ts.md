---
path: apps/electron/src/main/lib/study/study-benchmark-server.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 69b6f13a97727437d22b422fd576c43596b5ef9f
sha256: ceef22cf73798052f0788f5c4fe7d1befb1e793869739c0b8d9352661d67e998
lines: 286
kind: source
package: p03-integrations
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/study/study-benchmark-server.ts

## 1. 结论与边界

速课堂**基准服务**（`apps/electron/src/main/lib/study/study-benchmark-server.ts`，286 行）：本地基准运行时（`BenchmarkRuntime`）启动/停止/查询，供检索质量评测。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `getStudyBenchmarkRuntime` | 函数 | `:85-…` | `() => BenchmarkRuntime \| null` |
| `startStudyBenchmarkServer` | 函数 | `:224-267` | `() => Promise<BenchmarkRuntime>` |
| `stopStudyBenchmarkServer` | 函数 | `:268-286` | 停止 |

## 3. 内部逻辑与关键流程

`startStudyBenchmarkServer`（`:224-267`）：起本地基准服务（重复启动按运行时语义处理）；`getStudyBenchmarkRuntime` 返回当前运行时或 `null`；`stop` 释放。

## 4. 调用者与调用链

消费方：QA/开发者基准评测入口。出向：检索引擎（hybrid/graphrag）。

## 5. 数据 I/O、读写与副作用

本地服务（评测数据读写）；无外部网络。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 未启动查询 | `:85` | `null` |
| 重复启动 | `:224-267` | 按运行时语义 |

## 7. 权限与权威状态

无身份语义；评测数据仅本地。

## 8. 修改影响面

运行时生命周期与评测口径。

## 9. 测试证据

无专属测试（全树检索 `startStudyBenchmarkServer` 测试命中 0）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 个导出 | 已证实 | `:85-286` |
| 基准实际行为 | 未知 | 未运行 |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 3 个导出 | `:85-286` | covered |
