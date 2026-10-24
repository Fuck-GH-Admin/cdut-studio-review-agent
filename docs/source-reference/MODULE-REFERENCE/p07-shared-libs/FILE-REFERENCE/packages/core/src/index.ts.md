---
path: packages/core/src/index.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 46f852943acad287bbd43908dbf25c230ea1e21e
sha256: 4a7cc72db07079268af6d55ecc590a6a1f2d63ebce1bac4ec1df60dc21f61ceb
lines: 9
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/core/src/index.ts

## 1. 结论与边界

`@profer/core` **根入口（同构边界）**（`packages/core/src/index.ts:1-6`）：根入口仅运行时导出「浏览器与 Node.js 均可运行」的模块。`pdf-engine`/`office-engine` 依赖 Node 原生（node:zlib、pdfjs-dist/legacy、动态导入 onnxruntime-node），**只应由主进程经 subpath**（`@profer/core/pdf-engine`、`@profer/core/office-engine`）消费；根入口对其**仅纯类型导出**（`export type *`，编译后完全擦除、零运行时引入）——防止渲染进程把 Node 专用模块打进浏览器构建。

边界：9 行纯导出清单，无逻辑。

## 2. 导出与关键符号

本文件无自身定义——4 条转发（`:6-9`）：

| 语句 | 行 | 语义 |
| --- | --- | --- |
| `export * from './providers/index.ts'` | 6 | 运行时（同构） |
| `export * from './highlight/index.ts'` | 7 | 运行时（同构） |
| `export type * from './pdf-engine/index.ts'` | 8 | **仅类型**（擦除） |
| `export type * from './office-engine/index.ts'` | 9 | **仅类型**（擦除） |

## 3. 内部逻辑与关键流程

本文件不适用——依据：纯导出边界声明。

## 4. 调用者与调用链

出向：4 个子模块。入向（检索=模块名 `@profer/core`/`highlight/index` 等，全冻结树）：

- bare `@profer/core`：**17 处全部在 apps/electron main**（main/index.ts:244、pi-model-registry、agent-orchestrator-p0-guards、agent-orchestrator.ts:92、agent-sdk-auth-env、cdut-ai-class-manager、yanhu 三件、channel-manager、channel-url-routing、conversation-title-service、lightweight-completion、retrospective-service、review-model-gateway）——**全部消费 providers 符号**（getAdapter/normalizeBaseUrl 等）；未发现经此入口消费 highlight/pdf/office 类型转发的实例。
- renderer 走 `@profer/core/highlight` subpath（不引 bare）；preload/shared/cli 零引用。
- Node 专用面（pdf-engine/office-engine）由 main 经 `@profer/core/pdf-engine`、`@profer/core/office-engine` subpath 消费（package.json:14 subpath export）。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯导出。

## 6. 分支、失败、取消与恢复

本文件不适用。

## 7. 权限与权威状态

本文件不适用（无权限代码）；**同构边界契约**（`:1-6`）即架构权威口径（类型擦除防浏览器构建污染）。

## 8. 修改影响面

将 `export type *` 改 `export *` 会破坏同构边界（浏览器构建污染）；改动影响全部 `@profer/core` 消费者。

## 9. 测试证据

无专属测试（边界由构建配置保障）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 类型擦除同构边界 | 已证实 | `:1-9` |
| Node 专用 subpath 消费约定 | 已证实（注释声明） | `:3-4` |
| 实际构建产物验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 转发语句 | §2 | 6-9 | covered |
