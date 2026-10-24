---
path: apps/electron/src/main/lib/cslab/cslab-ooxml-worker.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 16a42b50d09a8946f13c6427e699b75e58f21f5b
sha256: a4dc62c734ebd21907f9034cf9772886bd57ee565f52665fa21f4194a4ffd42a
lines: 32
kind: source
package: p03-integrations
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-ooxml-worker.ts

## 1. 结论与边界

CSLab OOXML 独立 Worker 线程入口（文件头 `apps/electron/src/main/lib/cslab/cslab-ooxml-worker.ts:1-6`）：由 esbuild 单独打包为 `dist/cslab-ooxml-worker.cjs`，主进程经 `worker_threads` 调用，避免大 docx 解压占用主线程。薄文件（32 行）。

## 2. 导出与关键符号

`export` 逐条核对：**0 个导出**（纯入口模块；依赖 `./cslab-ooxml.ts:9` 的 `executeOoxmlTask`/`CsLabOoxmlTask`）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `WorkerRequest` | 内部接口 | 11-16 | `{type,buffer?,capsules?,input?}` |
| `parentPort.on('message')` | 入口逻辑 | 22-32 | 消息循环 |

## 3. 内部逻辑与关键流程

`:18-20`：无 `parentPort` 抛 `cslab-ooxml-worker 必须在 worker_threads 中运行`（防误 import 主线程）。
`:22-32`：`on('message')` 异步处理：`executeOoxmlTask(raw as CsLabOoxmlTask)` → `{ok:true,result}`；异常 → `{ok:false,error:errorMessage}`（不抛出）。

## 4. 调用者与调用链

入向：主进程 worker_threads 池（esbuild 打包后 spawn）；测试：本批无专属测试（scope 无 `.test.ts`）。出向：`node:worker_threads`、`./cslab-ooxml.ts:9`。

## 5. 数据 I/O、读写与副作用

消息通信（`parentPort.postMessage`）；无文件/网络 IO。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| 非 worker 环境 | 抛错 | 18-20 |
| 任务异常 | `{ok:false,error}` | 26-31 |
| 成功 | `{ok:true,result}` | 25 |

无取消概念（worker 生命周期由主进程管理）。

## 7. 权限与权威状态

无权限判定；任务语义权威在 `executeOoxmlTask`。

## 8. 修改影响面

改消息协议影响 worker 池调用方；改打包入口影响构建产物。

## 9. 测试证据

本批**无专属测试**（scope 事实）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 非 worker 环境拒绝 | 已证实 | `:18-20` |
| 异常→`{ok:false}` | 已证实 | `:26-31` |
| worker 池接线 | 未知 | 未逐行核 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 入口逻辑 | §3 | 18-32 | covered |
| 接线 | §10 | — | unknown |
