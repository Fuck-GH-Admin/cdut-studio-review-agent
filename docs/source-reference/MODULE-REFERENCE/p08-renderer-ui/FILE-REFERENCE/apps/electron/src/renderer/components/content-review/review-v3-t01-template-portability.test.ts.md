---
path: apps/electron/src/renderer/components/content-review/review-v3-t01-template-portability.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4f5d28d95323ab1d907494908d8e71e43381ae6f
sha256: b2ad21f6a68c85f110dccee3b871b8afdd9a16ff72956a1aa10a5a3b841772ac
lines: 68
kind: test
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-t01-template-portability.test.ts

## 1. 测试目标

**T01 导出配置**（`apps/electron/src/renderer/components/content-review/review-v3-t01-template-portability.test.ts:5`）：导出导入为独立草案、拒任意 JSON/案卷报告、清空外部政策声明（TAR-19）、深验非只看顶层、保留数值条件清签认、伪发布降级。

## 2. 用例清单

1 describe / 6 test。

| # | 名称 | 断言要点 | 行 |
| --- | --- | --- | --- |
| 1 | 导出导入为独立草案 | `templateId:'copy-template'`、`status:'draft'`、`version:1`、fields/slots/stages 相等、`rubric` undefined | `:7-18` |
| 2 | 拒任意 JSON/案卷报告 | `'{}'`→`T01_IMPORT_FORMAT`；`{name:'not template'}`→`T01_IMPORT_TEMPLATE_INVALID` | `:19-22` |
| 3 | 清空外部政策声明 | `policyVersionIds==[]`、`policyRefs==[]`、sourceNote 含「政策引用已清空」 | `:23-30` |
| 4 | 深验（TAR-19） | 坏字段 kind→`FIELDS_INVALID`；空 requirement→`SECTIONS_INVALID`；threshold:'ten'→`CRITERIA_INVALID`；坏 JSON→`T01_IMPORT_JSON` | `:31-47` |
| 5 | 保留数值条件清签认 | constraint.kind 保留、`ownerStatement` undefined | `:48-60` |
| 6 | 伪发布降级 | `status:'draft'`、`publishedAt` undefined、sourceNote 含「外部导入草稿」 | `:61-67` |

## 3. 真实断言

- `expect(clone.policyRefs).toEqual([])`（`:28`）。
- `expect(constraint?.ownerStatement).toBeUndefined()`（`:59`）。
- `expect(() => importT01Template('{not json',…)).toThrow('T01_IMPORT_JSON')`（`:46`）。

## 4. 未覆盖与脆弱点

- 未覆盖：stages/outputs 深验错误分支（FIELDS/SECTIONS/CRITERIA 已覆盖）。
- 脆弱点：`createT01Scenario`（business-presets 模块）夹具依赖。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 用例覆盖往返/拒绝/清空/深验/降级 | 已证实 | `:7-67` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 往返 | 1 | `:7-18` | covered |
| 拒绝 | 2 | `:19-22` | covered |
| 政策清空 | 3 | `:23-30` | covered |
| 深验 | 4 | `:31-47` | covered |
| 签认清空 | 5 | `:48-60` | covered |
| 降级 | 6 | `:61-67` | covered |
