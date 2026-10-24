---
path: apps/electron/src/renderer/components/agent/ProcessBlockGroup.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ca3120fd70f6897e58976a21d6889c2b22c53fe2
sha256: fd13d23ab4bb11934be95b427dc7a7d1dcc23ffc2bebf8ca4f67de313f6df10e
lines: 314
kind: test
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/ProcessBlockGroup.test.ts

## 1. 测试目标

**Agent 过程块折叠分组**（`apps/electron/src/renderer/components/agent/ProcessBlockGroup.test.ts:24`）：最终正文外置/过程组折叠的全形态（连续 thinking+工具、中间 text、流式尾 text、keep expanded、纯正文、纯过程、thinking 无工具、多工具 pending、trailing thinking）。

## 2. 用例清单

1 describe / **20 test**（`:25-299`）。

| # | 形态 | 断言要点 | 行 |
| --- | --- | --- | --- |
| 1 | 连续 thinking+工具→正文前 | 折成一个过程组 | `:25-40` |
| 2 | 工具间中间 text | 只最终输出外置 | `:41-57` |
| 3 | 流式尾 text | 整轮保持过程组内 | `:58-70` |
| 4 | 流式 completed 工具后尾 text | 最终输出外置 | `:71-85` |
| 5 | keep expanded 完成后 | 仍最终输出外置 | `:86-98` |
| 6 | 纯 text 流式 | 正常输出 | `:99-107` |
| 7 | 纯过程轮 | 整轮折叠 | `:108-120` |
| 8 | thinking 无工具流式 | text 在 thinking 组外 | `:121-136` |
| 9 | 多工具仅最后 pending | 最终 text 外置 | `:137-155` |
| 10 | 多工具非最后 pending | 整轮保持组内 | `:156-170` |
| 11 | 最终回答后 trailing thinking | 回答外置 | `:171-187` |
| 12 | 回答在步骤间+trailing thinking | 只折过程块 | `:188-204` |
| 13 | 中间 text+后续工具+trailing thinking | 整轮折叠 | `:205-220` |
| 14 | trailing thinking 前最终回答 | thinking 折叠+回答外置 | `:221-236` |
| 15 | 多块纯正文回答 | 全部 text 块正常输出 | `:237-245` |
| 16 | 重复工具能力图标去重 | 工具名按序去重 | `:246-257` |
| 17 | text+AskUserQuestion | text 外置、AskUser 静默隐藏 | `:258-272` |
| 18 | 流式 text+AskUserQuestion | 流式中 text 保持外置 | `:273-282` |
| 19 | thinking→text→AskUserQuestion | 只 thinking 折叠、text 外置 | `:283-298` |
| 20 | 流式 text+trailing thinking | index 0 也 text 外置 | `:299-313` |

## 3. 真实断言

（`:25-313` 断言组——13 形态。）

## 4. 未覆盖与脆弱点

- 未覆盖：AskUserQuestion 过滤细节（源实现）。
- 脆弱点：形态夹具与折叠口径强耦合。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 20 用例覆盖折叠全形态 | 已证实 | `:25-313` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 正文外置/折叠 | 1-20 | `:25-313` | covered |
