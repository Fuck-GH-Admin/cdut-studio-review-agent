---
path: packages/shared/src/index.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 766725aba33d6e4e21da01bd4e2ee9ccea6234fa
sha256: fe985c3115b277ddc7dfd06d80edeaba21003ea3eadf99d72571ceda6e81f14a
lines: 16
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/index.ts

## 1. 结论与边界

`@profer/shared` 包的**根桶文件**：12 条 `export *` 把 types/config/utils/review/constants 转发为包根导出（`packages/shared/src/index.ts:5-16`）。`packages/shared/package.json` 的 `main`/`types` 与 `exports['.']` 都指向本文件（`packages/shared/package.json:6-11`），是全仓 `import … from '@profer/shared'` 的统一入口。

边界：不含任何实现；**不转发** `./agent/index`（`packages/shared/src/agent/index.ts`，见该篇）与 `./types` 之外的子路径导出。`exports` 映射仅 `.`、`./types`、`./config`、`./utils` 四键（`packages/shared/package.json:8-13`）——`@profer/shared/review/…` 之类的深路径**不在** exports 映射内（源码注释如 `review-v3-t01-typed-criteria.ts:4` 提到的路径是文档性说法，实际 import 都走包根，见 §4）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `export * from './types/index'` | 转发 | 5 | — | 类型桶（含 agent/review-v2 等全部类型模块） |
| `export * from './types/cdut'` | 转发 | 6 | — | |
| `export * from './config/index'` | 转发 | 7 | — | `APP_NAME` 等 |
| `export * from './utils/index'` | 转发 | 8 | — | utils 桶 |
| `export * from './review/decision-readiness-v2'` | 转发 | 9 | — | |
| `export * from './review/batch-review-triage'` | 转发 | 10 | — | |
| `export * from './review/t01-typed-criteria'` | 转发 | 11 | — | |
| `export * from './constants/permission-rules'` | 转发 | 12 | — | |
| `export * from './constants/browser-file-sentinels'` | 转发 | 13 | — | |
| `export * from './constants/ofv-theme-bridge'` | 转发 | 14 | — | |
| `export * from './constants/session-storage'` | 转发 | 15 | — | |
| `export * from './constants/document-anchor'` | 转发 | 16 | — | |

导出计数：12 条 `export *`，0 个本地符号。桶内符号总量由被转发模块决定（如 `constants/permission-rules.ts` 14 个、`constants/ofv-theme-bridge.ts` 16 个，见各篇）。

## 3. 内部逻辑与关键流程

本文件不适用（无逻辑）——依据：全文仅注释（`:1-3`）与 12 条 `export *`，无语句、无分支。执行期行为 = 模块图加载（import 本文件即加载全部被转发模块）。

## 4. 调用者与调用链

出向：12 个同包子模块（§2）。

入向：全仓 `@profer/shared` 包根导入（grep `@profer/shared`/`from '…shared…'` 共 1600+ 处，含类型引用），按宿主分：

- `apps/electron`：preload（`apps/electron/src/preload/index.ts:9-15,129,…`）、主进程（`apps/electron/src/main/ipc.ts:134`、`agent-permission-service.ts:21-28`、`agent-session-manager.ts:74-76` 等）、渲染层（`viewer/main.ts:29-33`、`lib/document-anchor.ts:7-11` 等）。
- `packages/core`：providers（`packages/core/src/providers/types.ts:9` 等）、pdf-engine（`pdf-engine/types.ts:19` 等）。
- `apps/cli`（`apps/cli/src/sessions.ts:9`）、`packages/project-core`、`apps/electron/scripts/*`。
- 依赖声明：`bun.lock:34,72,185,202,212`（workspace:*），`apps/cli/package.json:17`、`apps/electron/package.json:98`、`packages/core/package.json:17`、`packages/project-core/package.json:17`。
- 子路径入口（`exports` 映射内的）：`./types`、`./config`、`./utils` 各自被子路径 import 的用法存在与否见各子桶篇；包根是最常用入口。
- 测试对桶的间接覆盖遍布全仓（如 `agent-orchestrator-p0-guards.test.ts:2`）。

## 5. 数据 I/O、读写与副作用

本文件不适用（无副作用）——依据：无语句；被转发模块的副作用各自归各自篇（本批 8 个被转发模块全部无 I/O）。

## 6. 分支、失败、取消与恢复

本文件不适用——依据：无分支、无异常、无异步。

## 7. 权限与权威状态

本文件不适用——依据：无 sender/role/actor 相关代码。

## 8. 修改影响面

- 增删 `export *`：影响全部 `@profer/shared` 根导入方（1600+ 处）的符号可见性；重名符号在 `export *` 下会被静默排除（ESM/TS 语义，未在本仓实测——推断）。
- 与 `packages/shared/package.json` `exports` 的一致性：新增可深导入模块需两处同步。
- 不改行为的前提下，删行只影响导入面，无运行时语义。

## 9. 测试证据

本文件无专属测试（薄桶文件）。间接证据：任何经 `@profer/shared` 导入的测试都在事实上覆盖本文件的转发可达性（如 `packages/shared/src/constants/permission-rules.test.ts:3-8` 经相对路径导入，不经本桶；`apps/electron/src/main/lib/agent-orchestrator-p0-guards.test.ts:2` 经本桶）。`export *` 重名排除行为无测试。

**NOT_RUN**：本轮未执行测试/typecheck。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 12 条转发清单与顺序 | 已证实 | `:5-16` |
| package.json main/types/exports 指向本文件 | 已证实 | `packages/shared/package.json:6-13` |
| `./agent` 不被转发、不在 exports 映射 | 已证实 | `:5-16`、`package.json:8-13` |
| 全仓 1600+ 处包根导入 | 已证实（grep 计数，含注释/类型引用） | grep `@profer/shared` |
| `export *` 重名符号会被静默排除 | 推断 | ESM 语义；仓内无重名实测 |
| 实际打包产物形态（tsc/bun 打包） | 未知 | 本轮 NOT_RUN 构建 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 12 条 `export *` | §2 | 5-16 | covered |
| package.json 入口一致性 | §1, §8 | package.json:6-13 | covered |
| `./agent` 未转发 | §1 | 5-16 | covered |
| 重名排除语义 | §10 | — | unknown（推断） |
