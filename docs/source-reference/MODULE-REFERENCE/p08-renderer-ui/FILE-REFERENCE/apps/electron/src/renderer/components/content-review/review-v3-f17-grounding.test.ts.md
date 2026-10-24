---
path: apps/electron/src/renderer/components/content-review/review-v3-f17-grounding.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6fcff0a412edbb3f97553c619df4451e3f534240
sha256: 4670c1616a32c1d4e87da5c6f0b4d63cc3cdbbdd8f723a80a4490313f7b69fa1
lines: 55
kind: test
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-f17-grounding.test.ts

## 1. 测试目标

**F17 证据上下文与引用验证**（`apps/electron/src/renderer/components/content-review/review-v3-f17-grounding.test.ts`）：三角色原件片段（不发无关材料）、引用拒伪造/跨案/过期 Run/版本/块、缺原文显式披露+拒跨案。

## 2. 用例清单

3 test。夹具：4 文档（app-v1/proof-v1/rule-v1/foreign）——**foreign 不在 run.inputManifest**（`:9`、`:22`）。

| # | 名称 | 断言要点 | 行 |
| --- | --- | --- | --- |
| 1 | 三角色片段、不发无关材料 | 含「申请表.docx」/「证明材料记载」/「场地人数不得」；**不含「不可发送的其他资料」**；3 个 token 全部可解析 | `:27-36` |
| 2 | 引用拒伪造/跨案/过期 | 改 run-f17→run-other/块不存在/parseRev 2→3/跨案/新 run/**foreign 版本** 全 null | `:38-48` |
| 3 | 缺原文披露+拒跨案 | 空文档→「没有可读取的原文文本块」；跨案 run→抛「其他案卷」 | `:50-55` |

## 3. 真实断言

- `expect(context).not.toContain('不可发送的其他资料')`（`:32`）。
- `expect(resolveF17Citation(token.replace('|2|', '|3|'), aggregate, run)).toBeNull()`（`:44`）。
- `expect(resolveF17Citation('[F17:run-f17|foreign|2|block-1]', aggregate, run)).toBeNull()`（`:47`）。

## 4. 未覆盖与脆弱点

- 未覆盖：`terms` 分词质量、预算截断路径。
- 脆弱点：token 串操作断言（replace 改造伪造）。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例覆盖三面（含 foreign 拒发） | 已证实 | `:27-55` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 片段选取 | 1 | `:27-36` | covered |
| 引用验证 | 2 | `:38-48` | covered |
| 披露/跨案拒 | 3 | `:50-55` | covered |
