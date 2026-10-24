---
path: apps/electron/src/renderer/components/content-review/review-v3-t01-versioning.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5a88799d499a49f87b5d2d3cdcdb303a4ca1306f
sha256: 98036f8f1516b00d5f943d8e9aca57b5955eb7f199c4b03e34cfa8b126519cec
lines: 53
kind: test
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-t01-versioning.test.ts

## 1. 测试目标

**F02 数值规则确认与模板版本**（`apps/electron/src/renderer/components/content-review/review-v3-t01-versioning.test.ts:16`）：派生/拷贝不复用旧签认、版本校验、要求/字段改动使签认失效（无关编辑不失效）、新确认存活。

## 2. 用例清单

1 describe / 4 test。夹具 `signed()`（`:10-14`，`confirmT01NumberLimit` 签认后模板）+ `owner`（owner-statement，`:6-9`）。

| # | 名称 | 断言 | 行 |
| --- | --- | --- | --- |
| 1 | 派生复用配置不复用签认 | `fork(published,2)`→`{version:2, status:'draft'}`、`publishedAt` undefined、新 `ownerStatement` undefined、原保留；`fork(…,1)` 抛 `T01_VERSION_NOT_NEWER` | `:17-25` |
| 2 | 拷贝不继承签认 | `copy→{templateId:'my-own-template', version:1, catalogKind:'custom', status:'draft'}`、`ownerStatement` undefined | `:26-31` |
| 3 | 要求/字段含义改动签认失效 | requirement 改→签认 undefined；字段 label 改→undefined；**仅 description 改→原对象返回（不失效）** | `:32-46` |
| 4 | 新确认存活于作者确认操作 | 同规则确认后 `reconcile` 保留 `owner` | `:47-52` |

## 3. 真实断言

- `expect(() => forkT01TemplateVersion(published, 1, …)).toThrow('T01_VERSION_NOT_NEWER')`（`:24`）。
- `expect(reconcileT01OwnerConfirmations(before, changedDescription)).toBe(changedDescription)`（`:45`）。
- `expect(readT01NumberLimit(…)('ownerStatement')).toEqual(owner)`（`:51`）。

## 4. 未覆盖与脆弱点

- 未覆盖：`reconcileT01OwnerConfirmations` 内部判定细节（typed-criteria 手册）。
- 脆弱点：`structuredClone` 夹具与对象同一性断言（`:45` `toBe`）。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例覆盖签认生命周期 | 已证实 | `:17-52` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 派生 | 1 | `:17-25` | covered |
| 拷贝 | 2 | `:26-31` | covered |
| 失效/存活 | 3-4 | `:32-52` | covered |
