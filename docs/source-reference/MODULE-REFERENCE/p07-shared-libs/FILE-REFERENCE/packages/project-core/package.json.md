---
path: packages/project-core/package.json
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 77d954b076e9bcc7d56e61314d6558dff873f0b8
sha256: bf64a8d12a0ee955d960923680a3cd5a14ffe27e65145c4cd5a8741a4c27a311
lines: 22
kind: config
package: p07-shared-libs
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# packages/project-core/package.json

## 1. 键清单

| 键 | 值 | 行 | 说明 |
| --- | --- | --- | --- |
| `name` | `@profer/project-core` | 2 | 包名 |
| `version` | `0.1.0` | 3 | |
| `license` | `AGPL-3.0-only` | 4 | |
| `description` | Headless core for Agent project orchestration — Graph construction, state replay, and query. Shared by the Electron app, CLI and future query surfaces. | 5 | |
| `type` | `module` | 6 | ESM |
| `main`/`types`/`exports["."]` | `./src/index.ts` | 7-12 | **入口直指 TS 源**（bun/TS 解析，无构建产物） |
| `scripts.typecheck` | `tsc --noEmit` | 13 | |
| `scripts.test` | `bun test` | 14 | |
| `dependencies` | `@profer/shared: workspace:*` | 15-17 | 唯一运行依赖（workspace 协议） |
| `devDependencies` | `typescript: ^5.0.0` | 18-20 | |

## 2. 默认值来源

无默认值逻辑；workspace 依赖版本由 monorepo 解析（bun workspace）。

## 3. 真实消费者

description 自述「Shared by the Electron app, CLI and future query surfaces」。真实消费者（QA F-NB41-03 校正——此前「零命中」为检索失误）：`apps/electron/src/main/ipc.ts`（import `:4417`）、`lib/pi-harness/orchestrator-bridge.ts:4`（getReadyTasks）、`reconciler.ts:1`（TaskGraph 类型）、`telemetry.ts:1`（getTaskVerificationContext）、`graph-focus-packet.ts:7`、`goal-controller.ts:1`（selectHarnessFocus）、`governor.ts:1-2`、`verification-evaluator.ts:1`、`evals/replay.ts:1`（buildGraphFromEvents/selectHarnessFocus）、`evals/types.ts:1`（GraphEvent 类型）、pi-harness 4 个测试（telemetry/goal-controller/verification-evaluator/governor/graph-focus-packet.test.ts:2）；另经 `main/lib/project-graph-service.ts:14-25`（generateSummary/formatSummaryAsPreamble）与 `renderer/atoms/graph-atoms.ts:18`（deriveGraph）落地 Electron/CLI 用法。本包 `src/index.ts` 未在本批（导出面未核）。

## 4. 环境覆盖

无。

## 5. 缺失/非法值行为

`exports` 指向 `.ts` 在标准 node/tsc node16 解析下需构建步骤（当前工具链为 bun 直跑——推断）。

## 6. 修改影响面

改 `main/exports` 影响未来消费者的导入解析；改 `@profer/shared` 依赖影响 workspace 图。

## 7. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全键取值 | 已证实 | `packages/project-core/package.json:1-22` |
| 消费者 12+ 文件（pi-harness 全链+Electron/CLI） | 已证实（静态） | 冻结树 `from '@profer/project-core'` 检索（QA F-NB41-03 补） |
| bun/.ts 入口约定 | 推断 | 键取值 + 工具链惯例 |
| 脚本运行结果 | 未知 | NOT_RUN |

## 8. 覆盖表

| 键组 | 章节 | 状态 |
| --- | --- | --- |
| 标识/入口/脚本/依赖 | §1 | covered |
| 消费者（零引用） | §3 | covered |
| 运行验证 | §7 | unknown（NOT_RUN） |
