---
path: apps/electron/src/renderer/components/content-review/review-v3-t01-model-draft-port.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7c62b3b5b38dfa4a2f66654f463505f477473b45
sha256: be30d835e4ec15f363a9f9e83fa52c872e9a8f7b201063910b6058a08ee4677f
lines: 30
kind: test
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-t01-model-draft-port.test.ts

## 1. 测试目标

**T01 授权模型起草域合同**（`apps/electron/src/renderer/components/content-review/review-v3-t01-model-draft-port.test.ts:6`）：system 禁伪造政策权威、不可信模型只返回草案、非法输出不静默伪完成。

## 2. 用例清单

1 describe / 3 test。

| # | 名称 | 断言 | 行 |
| --- | --- | --- | --- |
| 1 | system 禁伪造政策权威 | `system` 含「policyVersionIds=[]」/「questions」；`user` 含「实验室申请」 | `:7-12` |
| 2 | 不可信模型只能返回草案 | 注入伪造（status published/policyVersionIds/policyRefs/publishedAt）→强制 `draft`、`policyVersionIds==[]`、`policyRefs`/`publishedAt` undefined、`supportedBy==='authorized-model-draft'`、questions 含「核实」 | `:13-25` |
| 3 | 非法输出不伪完成 | `'not json'`→`T01_MODEL_JSON_INVALID`；`'{}'`→`T01_MODEL_TEMPLATE_REQUIRED` | `:26-29` |

## 3. 真实断言

- `expect(result.template.policyVersionIds).toEqual([])`（`:20`）。
- `expect(result.template.publishedAt).toBeUndefined()`（`:22`）。
- `expect(() => parseT01ModelDraftResponse('not json',…)).toThrow('T01_MODEL_JSON_INVALID')`（`:27`）。

## 4. 未覆盖与脆弱点

- 未覆盖：`makeT01ModelDraftPrompt` 空 brief 分支、`safeArray` 截断。
- 脆弱点：提示词文本断言（十戒关键词）。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例覆盖提示词/降级/拒绝 | 已证实 | `:7-29` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 提示词 | 1 | `:7-12` | covered |
| 强制降级 | 2 | `:13-25` | covered |
| 拒绝 | 3 | `:26-29` | covered |
