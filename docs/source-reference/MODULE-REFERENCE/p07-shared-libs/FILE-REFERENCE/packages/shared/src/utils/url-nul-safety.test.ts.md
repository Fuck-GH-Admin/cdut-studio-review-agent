---
path: packages/shared/src/utils/url-nul-safety.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2eada7e6034b4804e517ee881d8475928f96a07e
sha256: e6013ec8f0116ccc58b78b96a5d9242da181eddefe98d44033aa52dc76250f8c
lines: 38
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/url-nul-safety.test.ts

## 1. 测试目标

URL NUL 截断防御（`packages/shared/src/utils/url-nul-safety.test.ts:5`）：被测 `assertSafeUrlNoNul`/`UnsafeUrlCharacterError`——**被测源 `url-nul-safety.ts` 不在本批 18 文件清单内**（其符号经 `index.ts:44` 再导出），照实记录。语义面：裸 NUL/百分号编码 NUL（大小写不敏感）/其余 C0+DEL 控制字符/空输入拒绝；合法与无法解析字符串放行（解析归调用方）。

## 2. 用例清单

共 **6 个 `test(`**（1 个 `describe`）：

| # | 行 | 用例 | 断言目标 | 依赖顺序 |
| --- | --- | --- | --- | --- |
| 1 | 6-12 | 合法 URL 原样通过 | 3 例 toBe 原值（https/127.0.0.1/jw.cdut.edu.cn） | 独立 |
| 2 | 14-18 | 裸 NUL 被拒绝 | 2 例 toThrow(UnsafeUrlCharacterError) | 独立 |
| 3 | 20-25 | 百分号编码 NUL（大小写不敏感）被拒绝 | `%00`/`%0A`/`a%00b` 3 例 toThrow | 独立 |
| 4 | 27-32 | 其余 C0 与 DEL 被拒绝 | `\u0007`/`\u001f`/`\u007f` 3 例 toThrow | 独立 |
| 5 | 34-36 | 空输入被拒绝 | `''` toThrow | 独立 |
| 6 | 38-40 | 无法解析的字符串不做额外拦截 | `'not a url'` toBe 原值 | 独立 |

## 3. 真实断言

逐条见 §2（锚）：`:7-11` 3×toBe、`:15-17` 2×toThrow(错误类)、`:21-24` 3×toThrow、`:28-31` 3×toThrow、`:35`、`:39`。

## 4. 未覆盖与脆弱点

- `%0a` 小写变体未单列（语义含于「大小写不敏感」但断言仅 `%0A`）。
- 被测源不在本批（本篇只锚外部行为面）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 test、五拒绝面+双放行 | 已证实 | 全文 |
| 错误类断言（非仅文案） | 已证实 | toThrow(UnsafeUrlCharacterError) |
| 测试通过与否 | 未知 | NOT_RUN |
| url-nul-safety.ts 实现 | 未知 | 批外文件 |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| 合法放行 | §2/§3 | 1,6 | covered |
| 裸/编码 NUL | §2/§3 | 2-3 | covered |
| C0/DEL/空 | §2/§3 | 4-5 | covered |
| %0a 小写 | §4 | — | unknown |
