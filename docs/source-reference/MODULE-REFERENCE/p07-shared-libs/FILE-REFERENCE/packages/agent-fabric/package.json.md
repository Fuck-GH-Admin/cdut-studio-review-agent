---
path: packages/agent-fabric/package.json
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c093ba2ea8b81d219274f6875444a4e9e555ab59
sha256: 92ead1626e8e7c78157a4b765c1f6084f9060cdde64b53013ded67217db2cfac
lines: 19
kind: config
package: p07-shared-libs
author: docs-r07-author-nb-05-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---

# packages/agent-fabric/package.json

## 1. 结论与边界

结论：`@profer/agent-fabric` 包清单（纯 manifest，kind=config）——声明纯契约层包（类型+纯函数，不绑定 Electron/Claude SDK/Pi runtime，`:5`）。边界：消费者经 `@profer/agent-fabric` 导入（grep 全树：`apps/electron/src/main/lib/agent-fabric/*` 6 源 + 2 测试（8 文件）+ `main/index.ts`，均域外未深读）；本文件无运行时行为。

## 2. 键清单（全部 19 行逐行核）

| 键 | 值 | 行 | 说明 |
| --- | --- | --- | --- |
| name | `@profer/agent-fabric` | `:2` | 包名 |
| version | `0.1.0` | `:3` | |
| license | `AGPL-3.0-only` | `:4` | |
| description | 契约层职责描述 | `:5` | 纯契约/纯函数声明 |
| type | `module` | `:6` | ESM |
| main / types | `./src/index.ts` | `:7-8` | **直指源码 TS**（无构建产物层） |
| exports | `{".": "./src/index.ts"}` | `:9-11` | 仅根导出，无子路径 |
| scripts.typecheck | `tsc --noEmit` | `:13` | |
| scripts.test | `bun test` | `:14` | |
| devDependencies | `typescript ^5.0.0` | `:16-18` | **零运行时依赖**（无 dependencies 键） |

## 3. 默认值来源与真实消费者

无运行时配置键（纯 manifest）。消费者=打包器/TS 解析（`main`/`types`/`exports`）与 `bun test`/`tsc` 脚本。无环境覆盖机制。

## 4. 缺失/非法值行为

不适用，依据：非运行时配置文件，无读取方做缺失回退；`exports` 缺失将影响模块解析（构建期行为，NOT_RUN）。

## 5. 修改影响面

`exports`/`main`/`types` 改动影响所有导入方解析；license/version 为发布元数据；移除 `type: module` 会改变解析语义。

## 6. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全部键值、零运行时依赖 | 已证实 | `:1-19` 逐行 |
| 消费者清单 | 已证实（grep） | 全树 `*.ts` |
| 构建/解析行为 | 未知 | NOT_RUN |

## 7. 覆盖表

| 键组 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 全部键 | §2 | 2-18 | covered |
