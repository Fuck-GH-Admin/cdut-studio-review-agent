---
path: apps/electron/src/main/lib/review/model-identity-runtime.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0c03217b3f40afa31c9a61d8c606d7e9e7a91381
sha256: 8feaaf6166a03783c9a7997f8797a2b633dd1d1ee12dae61d69f3f18aae451b8
lines: 63
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/model-identity-runtime.test.ts

## 1. 测试目标

MHI-01/02 模型身份单一口径（`pickChannelModelId`/`waitForRetry`，`review-model-identity`）+ MHI-07 跨平台 OCR 绝对路径（`isAbsolutePagePath`）。注释 :3「纯逻辑模块不依赖 Electron：无需 mock 运行时」。

## 2. 用例清单

7 用例 / 3 describe。夹具 `channel`（两启用模型，:6-13）；纯函数+AbortController。

| describe | # | 用例（行） | 核心断言 |
| --- | --- | --- | --- |
| MHI-01/02 | 3 | 显式选择 B（15-18） | `pickChannelModelId(…{modelId:'model-B'})==='model-B'`（不落第一个 A） |
| | | 停用模型回落（20-25） | 选 A 且 A 停用 → `'model-B'` |
| | | 跨渠道不串用（27-30） | `channelId:'ch-other'` → `'model-A'`（回落本渠道首个启用） |
| MHI-10 | 2 | signal 已中止立即拒绝（34-40） | `rejects.toThrow('模型请求已取消')` 且耗时 <1s（不等 5s 退避） |
| | | 退避中途 abort（42-48） | 20ms 后 abort → 同上 <1s |
| MHI-07 | 2 | POSIX/盘符/UNC 接受（52-57） | 4 个 true 断言 |
| | | 相对/空拒绝（59-63） | 3 个 false 断言 |

## 3. 真实断言

如 §2 表内（逐条读自 :16-63）。注意 MHI-10 用真实时钟（`Date.now()` 差 <1000）。

## 4. 未覆盖与脆弱点

- 未覆盖：`pickChannelModelId` 无启用模型分支、`waitForRetry` 正常完成路径。
- 脆弱点：时序断言依赖真实毫秒（CI 慢机理论可 flake）；`isAbsolutePagePath` 被测对象在另一模块（跨模块断言）。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 用例断言如 §2 | 已证实 | 本文件逐行 |
| 模型身份/退避中断被固定 | 已证实 | 用例 1-6 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| pickChannelModelId 三场景 | §2 | covered |
| waitForRetry 中止两路径 | §2 | covered |
| isAbsolutePagePath 全分支 | §2 | covered |
| 无启用模型/正常退避 | §4 | unknown（未测） |
