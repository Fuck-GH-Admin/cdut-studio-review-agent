---
path: packages/shared/src/utils/context-usage.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: afc9bfe34db0194f23f24e0ed3c5d76383868045
sha256: 70d845f51a530850a6adfcc3c11039e3cbd3d7468fee9b507f0ff26badd30f74
lines: 31
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/context-usage.ts

## 1. 结论与边界

上下文占用率计算——主/渲染进程共用的**纯函数**（`packages/shared/src/utils/context-usage.ts:1-7`）。文件头约定（`:4-6`）：`usedTokens` 是调用方聚合后的总量（须自行 `input_tokens + cache_read_input_tokens + cache_creation_input_tokens`，SDK usage 三者分计）。31 行薄模块：1 函数。

边界：不聚合 usage（调用方职责）；不判「是否超限」（只出比率）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `calculateContextUsageRatio` | function | 16-31 | `(usedTokens: number\|undefined, contextWindow: number\|undefined) => number\|undefined` | 唯一导出 |

## 3. 内部逻辑与关键流程

六条件一票拒返回 `undefined`（`:20-28`）：任一 undefined、非有限数、`usedTokens<0`、`contextWindow<=0`；否则 `usedTokens / contextWindow`（`:30`）。注释（`:12-15`）：`undefined` 须解释为「占用率未知」**而非 0%**——通常意味着 session 尚无流式结果或 contextWindow 无法推断，应保守处理。

## 4. 调用者与调用链

出向：无 import。入向（检索=符号名+模块名，全冻结树）：`apps/electron/src/main/lib/agent-session-usage.ts:24,80,89`（**唯一产品调用**，main）；barrel `index.ts:33`。**无任何测试引用**（`*.test.ts` 全树零命中）。同名碰撞警示：`context-usage-badge-channel`（renderer 本地模块）与本文件无关。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯函数。

## 6. 分支、失败、取消与恢复

失败形态=`undefined`（不抛）；无取消概念。

## 7. 权限与权威状态

本文件不适用——依据：无权限代码。

## 8. 修改影响面

比率语义（含 undefined≠0%）被 UI 占用率展示消费（caller 见 §10）；改动会影响「未知」态的呈现。

## 9. 测试证据

无直接测试文件（同名/相邻测试不覆盖本函数的 grep 结果见 UNVERIFIED）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 六条件 fail-safe + undefined≠0% 契约 | 已证实 | `:12-30` |
| cache 三分聚合属调用方 | 已证实（注释约定） | `:4-6` |
| 生产 caller / 测试覆盖 | 见 UNVERIFIED 补记 | — |
| 测试通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `calculateContextUsageRatio` | §2, §3 | 16-31 | covered |
