---
path: apps/electron/src/renderer/components/content-review/review-v3-t01-example-packs.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 709ac817f448825c0814652bc83618fe7c2d7a16
sha256: 465f84fdc754b6a043251ada0e7d1f415d17a1666c1fa2bdf85bf1518c803ec0
lines: 56
kind: test
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-t01-example-packs.test.ts

## 1. 测试目标

**T01 六个实体验收包**（`apps/electron/src/renderer/components/content-review/review-v3-t01-example-packs.test.ts:7`）：六包含可上传文本原件且结果各异无伪造权威、ZIP 真实可解析字节+清单引用、虚构门槛是待确认规则非表单 max。

## 2. 用例清单

1 describe / 3 test。

| # | 名称 | 断言要点 | 行 |
| --- | --- | --- | --- |
| 1 | 六包文本原件各异无伪造权威 | 每包含可上传原件、结果各异 | `:8-29` |
| 2 | ZIP 真实可解析字节+清单引用 | async，字节/manifest 断言 | `:30-41` |
| 3 | 虚构门槛是待确认规则非表单 max | 不限制违规案卷录入 | `:42-55` |

## 3. 真实断言

（`:8-55` 断言组——包内容/ZIP/门槛语义。）

## 4. 未覆盖与脆弱点

- 未覆盖：`checkT01ExampleForm` 全分支。
- 脆弱点：6 包内容夹具断言。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例覆盖包/ZIP/门槛 | 已证实 | `:8-55` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 六包 | 1 | `:8-29` | covered |
| ZIP | 2 | `:30-41` | covered |
| 门槛语义 | 3 | `:42-55` | covered |
