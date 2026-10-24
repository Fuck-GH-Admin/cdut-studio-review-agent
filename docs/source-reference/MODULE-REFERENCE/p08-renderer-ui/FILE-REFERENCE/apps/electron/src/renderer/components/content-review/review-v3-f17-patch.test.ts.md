---
path: apps/electron/src/renderer/components/content-review/review-v3-f17-patch.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6e76d80c405802a8a77b92b1a2a782a83162295a
sha256: 3dec1f9f0ea85cf47de561699f2c570a38b59379ec7e19b0fb424bb7afb70ce4
lines: 27
kind: test
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-f17-patch.test.ts

## 1. 测试目标

**F17 适配人工确认的类型化值→现有 Main UpdateFields 契约**（`apps/electron/src/renderer/components/content-review/review-v3-f17-patch.test.ts:11`）；拒绝类型替换/空多选（调用 Main 前）（`:22`）。

## 2. 用例清单

2 test（无 describe）。夹具 `target(kind, scope)`（`:6-9`）。

| # | 名称 | 断言 | 行 |
| --- | --- | --- | --- |
| 1 | 类型化值适配 UpdateFields | number 0→`caseFieldValues:{score:0}`；date subject→`subjectFieldValues:[{subjectId:'subject-1', values:{score:'2026-10-21'}}]`；boolean false→case；multi `['甲','乙']`→case | `:11-20` |
| 2 | 拒绝类型替换/空 multi/缺 subjectId | number+text 抛「类型」；multi 空抛「至少」；subject 缺 ID 抛「事项 ID」 | `:22-27` |

## 3. 真实断言

- `expect(makeF17FieldPatch(target('number'), { kind: 'text', value: '23' })).toThrow('类型')`（`:23`）。
- `expect(() => makeF17FieldPatch(…{ subjectId: undefined }…)).toThrow('事项 ID')`（`:25-26`）。

## 4. 未覆盖与脆弱点

- 未覆盖：`attachment/object/rows` 拒绝分支（源码 `:10-11`）。
- 脆弱点：错误消息片段断言（「类型」/「至少」/「事项 ID」）。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 用例覆盖适配/拒绝 | 已证实 | `:11-27` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 四类型适配 | 1 | `:11-20` | covered |
| 三类拒绝 | 2 | `:22-27` | covered |
| 复杂字段禁改 | — | — | unknown（未覆盖） |
