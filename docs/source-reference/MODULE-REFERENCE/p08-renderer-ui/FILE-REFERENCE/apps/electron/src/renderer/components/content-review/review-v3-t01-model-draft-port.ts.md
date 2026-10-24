---
path: apps/electron/src/renderer/components/content-review/review-v3-t01-model-draft-port.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0ec9c910a9f2e78983c1f4f113373d1a48788bbd
sha256: cb562fd7749a50a105c686bd48e345c79a62c6225a180e849653626e4dddd41d
lines: 54
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-t01-model-draft-port.ts

## 1. 结论与边界

**T01 授权模型起草端口**（`apps/electron/src/renderer/components/content-review/review-v3-t01-model-draft-port.ts:1-4`）：模板语义属 T01；模型调用/凭据/Main IPC 属 Local-L。**不可信模型只能返回可编辑草案，永不能伪造发布权威**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `T01ModelDraftInvoke` | type | `:9` | `(prompt:{system,user}) => Promise<string>`（可注入） |
| `makeT01ModelDraftPrompt` | 函数 | `:13-32` | 构造 system+user prompt |
| `parseT01ModelDraftResponse` | 函数 | `:33-49` | 解析→`T01BriefDraft`（强制降级） |
| `draftT01ViaAuthorizedModel` | 函数 | `:50-54` | async，prompt→invoke→parse |

内部：`safeArray`（`:10-11`，过滤+截 30）。

## 3. 内部逻辑与关键流程

- **system 提示词十戒**（`:17-28`）：不创造制度/来源、不明值进 questions 不猜、不输出 Case/Run/凭据、`schemaVersion=2 status=draft`、`policyVersionIds=[]`、未确认计算不伪装 deterministic、禁 Markdown 围栏。
- **`parseT01ModelDraftResponse`**（`:33-49`）：剥围栏（`:34`）→JSON 解析（失败 `T01_MODEL_JSON_INVALID`）→对象/`template` 校验→`importT01Template` 深验→**强制降级**：`policyVersionIds:[]`、`policyRefs/publishedAt:undefined`、`catalogKind:'custom'`、`status:'draft'`、`sourceNote`「模型生成的未确认模板草案」（`:41-45`）；questions 恒加「请核实政策原文…」（`:47`）；`supportedBy:'authorized-model-draft'`（`:48`）。

## 4. 调用者与调用链

- 消费方：T01 起草入口（授权模型通道）。
- 出向：`review-v3-t01-brief-authoring`（`draftT01FromBrief`）、`review-v3-t01-template-portability`（`importT01Template`）。

## 5. 数据 I/O、读写与副作用

经 `invoke`（调用方注入的模型调用）；无本地写。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| brief 空 | `:14` | 抛 `T01_BRIEF_REQUIRED` |
| 非 JSON | `:36` | `T01_MODEL_JSON_INVALID` |
| 非对象/无 template | `:37-39` | 对应错误 |
| 伪造发布/政策引用 | `:41-45` | **强制降级为 draft+清空** |

## 7. 权限与权威状态

- 「模型文本不能创建来源/权威」（`:19-26` 提示词+`:41-48` 强制降级双保险）。
- `supportedBy:'authorized-model-draft'` 如实标注来源（`:48`）。

## 8. 修改影响面

- 提示词十戒是模型输出质量合同；`importT01Template` 深验口径（template-portability 手册）。
- `safeArray` 上限 30。

## 9. 测试证据

`review-v3-t01-model-draft-port.test.ts`（30 行，3 用例）直接覆盖。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 个导出、强制降级红线 | 已证实 | `:9-54` |
| 提示词十戒 | 已证实 | `:17-28` |
| 模型实际输出 | 未知 | 未调用 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 4 个导出 | `:9-54` | covered |
| 提示词/降级 | `:13-49` | covered |
