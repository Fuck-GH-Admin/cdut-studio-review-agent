---
path: apps/electron/src/renderer/components/agent/tool-result-renderers/grep-preview.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b6d83bb9dc3fa193590fde50cc8acb64f430fc60
sha256: 6d90843c4b6f6513dd1c60cb2b2eaed3d5afbb8918ca175ca4d9dfaad76bfed7
lines: 62
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/tool-result-renderers/grep-preview.ts

## 1. 结论与边界

Grep 折叠预览**收敛器**（62 行）：Grep 结果按「文件→匹配行」分组渲染无法按行切分，必须显式收敛渲染量，"否则折叠按钮只是个装饰"（`:4-6`）。纯函数无副作用。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `GrepPreviewMatch` | `:9-13` | `{file, line, content}` |
| `GrepPreviewGroup` | `:15-18` | `{file, matches[]}` |
| `GrepPreviewSlice` | `:20-25` | `{groups, hiddenMatches}`（hidden 用于提示可展开量） |
| `GREP_PREVIEW_MATCH_LIMIT=200` | `:28` | 折叠时最多渲染匹配条数 |
| `limitGrepGroupsForPreview` | `:35-62` | `(groups, collapsed, limit=200)`：未折叠原样返回（`hiddenMatches:0`）；折叠时整组尽量保留、最后一组按剩余额度截断（`:56` slice(0,budget)），`budget<=0` 整组计入 hidden |

## 3. 内部逻辑与关键流程

单遍预算算法：budget 初始化→每组判定（全收/截断/全藏）→返回可见组+隐藏计数。渲染量上界=limit（`:33`）。

## 4. 调用者与调用链

`apps/electron/src/renderer/components/agent/tool-result-renderers/grep-result.tsx`（renderGroups 内 `apps/electron/src/renderer/components/agent/tool-result-renderers/grep-result.tsx:114`）；同批 grep-preview.test.ts（4 用例）。

## 5. 数据 I/O、读写与副作用

纯函数；无 IO。

## 6. 分支、失败、取消与恢复

不适用（无失败路径）；截断语义确定性。

## 7. 权限与权威状态

渲染量上界契约（200 条）；`hiddenMatches` 诚实计数（`:33`"保证渲染量有上界"）。

## 8. 修改影响面

改收敛逻辑影响 grep 展示性能与"还剩 N 条"提示准确性；测试 4 用例锁定边界。

## 9. 测试证据

`grep-preview.test.ts`（同批，4 个 `test(`）：未折叠原样、超限收敛渲染量=limit+hidden=160、限额内不隐藏、组中截断 [100,50]。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全导出/预算算法 | 已证实 | 62 行全读 |
| 边界语义 | 已证实 | 测试 4 用例（同批） |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；测试 §9。
