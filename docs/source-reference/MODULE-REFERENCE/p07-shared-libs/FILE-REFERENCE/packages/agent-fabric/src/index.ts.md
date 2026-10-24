---
path: packages/agent-fabric/src/index.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1d8e5d049930acd2d2227750caf82d39d73ec361
sha256: 80c6fa38e7ed6c748b6693a1df29bb6f3e6012c8a8852dac48f20f37bba18829
lines: 17
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-05-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---

# packages/agent-fabric/src/index.ts

## 1. 结论与边界

`@profer/agent-fabric` 契约层**统一出口**：10 条 `export *` 纯再导出（`index.ts:8-17`），无逻辑/状态/副作用。注释声明只含类型与纯函数行为、不绑定 Electron/Claude SDK/Pi runtime（`index.ts:5`）。

## 2. 导出与关键符号

本文件自身 0 个自定义符号；10 条 `export *`（**说明符无 `.ts` 后缀**，与 pdf-engine 的风格不同，照实记录）：

| 行 | 再导出模块 | 本批归属 |
| --- | --- | --- |
| `:8` | `./protocol` | 本批 |
| `:9` | `./capabilities` | 本批 |
| `:10` | `./node` | 本批 |
| `:11` | `./task` | **不在本批 scope**（域外，248 行；定义 TaskStatus/TaskRequest/TaskPolicy/validateTaskRequest 等） |
| `:12` | `./state-machine` | 本批 |
| `:13` | `./task-graph` | 本批 |
| `:14` | `./events` | 本批 |
| `:15` | `./artifacts` | 本批 |
| `:16` | `./approval` | 本批 |
| `:17` | `./gateway` | 本批 |

## 3. 内部逻辑与关键流程

不适用，依据：无函数/类/常量，仅再导出（`index.ts:8-17`）。

## 4. 调用者与调用链

- 入向（grep 全树）：包内 7 个 `contract-*.test.ts` 全部经 `./index` 导入；域外 `apps/electron/src/main/lib/agent-fabric/*`（6 源：fabric-server/fabric-pairing/agent-fabric-service/fabric-executor-headless/fabric-config/fabric-store + 2 测试，共 8 文件）与 `main/index.ts` 经 `@profer/agent-fabric` 导入。
- 出向：10 个同包模块（§2 表）。

## 5. 数据 I/O、读写与副作用

无 I/O、无副作用（已证实）。

## 6. 分支、失败、取消与恢复

不适用，依据：纯再导出。

## 7. 权限与权威状态

无权限分支，依据：纯再导出。

## 8. 修改影响面

增删再导出改变包公开面（7 个域外消费文件 + 7 个测试）；`./task` 缺失将使整包无法解析（gateway/state-machine/task-graph 依赖它）。

## 9. 测试证据

`NOT_RUN`。无直接测试（薄再导出）；7 个契约测试经 `./index` 间接验证各模块导出可解析。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 10 条 `export *`、无 `.ts` 后缀、无逻辑 | 已证实 | `:1-17` 全文 |
| `./task` 域外（248 行不在本批 scope） | 已证实（边界声明） | SCOPE 文件集合 |
| 域外消费方行为 | 边界 | 未深读 |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 10 再导出 | §2 | 8-17 | covered |
| 调用链/影响面 | §4/§8 | — | covered |
