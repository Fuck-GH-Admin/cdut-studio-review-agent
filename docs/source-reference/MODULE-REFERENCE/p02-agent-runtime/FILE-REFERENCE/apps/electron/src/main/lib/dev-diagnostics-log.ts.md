---
path: apps/electron/src/main/lib/dev-diagnostics-log.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 37bf5920528ec54f59e0832f896e74c58148af03
sha256: 1305c0b679a60390cc1917fba6dd3e6e3c4c898f7b8e14baa858f2c067170e95
lines: 46
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/dev-diagnostics-log.ts

## 1. 结论与边界

**开发态诊断日志落盘（仅开发构建）**（`dev-diagnostics-log.ts:1-9` 注释）：必须异步写（拖拽期同步 I/O 会让 renderer 重绘落后于原生边框 `:5-6`）；每文件首写检查体积并轮转（避免每行 stat `:7`）；**失败静默降级，绝不阻断正常功能**（`:8`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `DEV_DIAGNOSTICS_MAX_BYTES` | const（export） | `:15` | 5MB 轮转上限 |
| `shouldRotateDiagnosticsLog` | function（export） | `:20-22` | `sizeBytes >= maxBytes`（纯函数便于单测 `:19`） |
| `appendDevDiagnostic` | function（export） | `:36-46` | `(directory, fileName, record) => void`；调用方无需 await（`:35`） |

内部：`preparedFiles` Set（`:17`）、`prepareFile`（`:24-33`：mkdir+超限 rm）。

## 3. 内部逻辑与关键流程

`appendDevDiagnostic` 启动 void async IIFE（`:38`）：`prepareFile`（首访问 mkdir/stat，超限 `rm` 删除重建 `:30-32`）→ `appendFile(JSON 行)`（`:41`）；**catch 全静默**（`:42-44`：观测手段非业务依赖）。

## 4. 调用者与调用链

入向：开发诊断调用点（跨文件）；测试 `dev-diagnostics-log.test.ts`（同批）。出向：`node:fs/promises`、`node:path`。

## 5. 数据 I/O、读写与副作用

副作用：异步文件追加/删除、模块级 Set；无同步 I/O。

## 6. 分支、失败、取消与恢复

失败静默（`:42-44`）；轮转=删除重建。不适用取消/恢复。

## 7. 权限与权威状态

不适用（开发态观测工具）；失败静默=功能不阻断契约（`:8`）。

## 8. 修改影响面

改轮转/异步策略 → 开发期诊断体验与拖拽流畅度；阈值函数有测试锁定。

## 9. 测试证据

**直接测试 `dev-diagnostics-log.test.ts`（2 用例，NOT_RUN）**：阈值边界 0/MAX-1/MAX/MAX×3。`appendDevDiagnostic` I/O 行为无测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出+2 内部+异步静默契约 | 已证实 | 逐行读 `:1-46` |
| 测试 2 用例断言 | 已证实 | 测试 `:5-13`；NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 导出 | §2/§3 | `:15-46` | covered |
| 测试 | §9 | 测试行号 | covered（NOT_RUN） |
