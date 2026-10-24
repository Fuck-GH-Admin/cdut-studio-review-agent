---
path: apps/electron/src/renderer/components/review-v3-dev-b/review-v3-author-trial.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6b565ee10a4e9f2de97990fb20b38585ad8a05e6
sha256: c9f611889b32b81c2e5fda81fb2e25a200c17459dd26fe3325ea9af54da7fb86
lines: 71
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/review-v3-dev-b/review-v3-author-trial.ts

## 1. 结论与边界

**Renderer 合成试填值**（`apps/electron/src/renderer/components/review-v3-dev-b/review-v3-author-trial.ts:1-5`）：**任何阶段不签发 SourceIdentity/不发布政策/不改已存 author 文档**；保存/冻结必须用原始 author 来源，**永不用这些临时事实**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `B1TrialValue` | type | `:10` | `string\|number\|boolean\|null` |
| `B1TrialValues` | type | `:11` | 嵌套 Record |
| `parseB1TrialInput` | 函数 | `:12-39` | `(field, raw) => B1TrialValue` 按类型解析 |
| `prepareB1TechnicalTrial` | 函数 | `:40-…` | 技术试填准备 |

| `exportB1AuthorCandidate` | 函数 | `:61-…` | `(draft: B1AuthorDocument) => string` 导出 candidate-only 信封 |
## 3. 内部逻辑与关键流程

`parseB1TrialInput`（`:12-39`）：`''`→null；text 原样；date 严格校验（ISO+可解析+往返一致，`:17-21`）；enum 须在 `enumValues`（`:24`）；number 有限（`:28`）；boolean 'true'/'false'；**evidence 抛 `B1_TRIAL_EVIDENCE_REQUIRES_REAL_SOURCE`**（`:35-36`，证据须真实来源）。

## 4. 调用者与调用链

- 消费方：ReviewV3AuthorWizard（试填）。
- 出向：B1 类型。

## 5. 数据 I/O、读写与副作用

纯函数；无写（红线 `:2-4`）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| date 非法 | `:17-21` | `B1_TRIAL_DATE_INVALID` |
| enum 非法 | `:24` | `B1_TRIAL_ENUM_INVALID` |
| evidence | `:35-36` | **拒（须真实来源）** |

## 7. 权限与权威状态

**不签发 SourceIdentity/不发布政策/不改 author**（`:2-3`）；evidence 须真实来源（`:35-36`）。

## 8. 修改影响面

`B1Field.type` 联合；试填↔保存隔离（`:4-5`）。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 个导出、evidence 拒红线 | 已证实 | `:1-71` |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 5 个导出 | `:10-71` | covered |
