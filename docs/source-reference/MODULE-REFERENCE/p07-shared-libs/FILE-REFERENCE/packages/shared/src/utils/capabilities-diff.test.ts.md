---
path: packages/shared/src/utils/capabilities-diff.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 72a9fcadaf45a81bebd5b374826ce150d26ec912
sha256: 9dc721bd301926ace1d61d779062aab31e21df3d66e7da94848a6fbdc0f7ab5d
lines: 115
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/capabilities-diff.test.ts

## 1. 测试目标

`diffCapabilities` 八类变化 + 混合场景（`packages/shared/src/utils/capabilities-diff.test.ts:21`）。bun:test；被测同目录 `capabilities-diff.ts`。夹具：`makeCaps()`（`:6-19`，构造完整 `WorkspaceCapabilities`：mcpServers type:'stdio'、空 builtinMcpServers、memory 双段结构）。

## 2. 用例清单

共 **11 个 `test(`**（1 个 `describe`）：

| # | 行 | 用例 | 断言目标 | 依赖顺序 |
| --- | --- | --- | --- | --- |
| 1 | 22-28 | 无变化返回空数组 | `toEqual([])` | 独立 |
| 2 | 30-33 | 双空返回空数组 | `toEqual([])` | 独立 |
| 3 | 37-42 | MCP 新增 | `[{type:'mcp_added',name:'github'}]` | 独立 |
| 4 | 44-49 | MCP 移除 | `[{type:'mcp_removed',…}]` | 独立 |
| 5 | 51-56 | MCP 启用 | `[{type:'mcp_enabled',…}]` | 独立 |
| 6 | 58-63 | MCP 禁用 | `[{type:'mcp_disabled',…}]` | 独立 |
| 7 | 67-72 | Skill 新增 | `[{type:'skill_added',name:'Code Review'}]` | 独立 |
| 8 | 74-79 | Skill 移除 | `[{type:'skill_removed',…}]` | 独立 |
| 9 | 81-86 | Skill 启用 | `[{type:'skill_enabled',…}]` | 独立 |
| 10 | 88-93 | Skill 禁用 | `[{type:'skill_disabled',…}]` | 独立 |
| 11 | 97-114 | 混合 5 变化 | 5×toContainEqual + toHaveLength(5) | 独立 |

## 3. 真实断言

- `:27,32` `toEqual([])`×2。
- `:41,48,55,62` `toEqual([{type,name}])`（MCP 四态）。
- `:71,78,85,92` `toEqual([{type,name:'Code Review'}])`（Skill 四态，**name 用显示名**）。
- `:108-113` 5 条 toContainEqual + `toHaveLength(5)`（mcp_disabled/mcp_added/mcp_removed/skill_disabled/skill_added）。

## 4. 未覆盖与脆弱点

- 重复 name/slug 的 Map 折叠语义无用例（源 `:32-33,50-51`）。
- `prev/next` 缺字段容忍（`?? []`）无用例。
- 顺序契约（MCP 段先于 Skills、added 先于 removed）仅隐含于 toEqual/长度断言。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 test 八态+混合 | 已证实 | 全文 |
| skill 变化 name=显示名（用例 7-10 断言佐证源 `:56,58,64`） | 已证实 | `:71,78,85,92` |
| 混合计数精确（5） | 已证实 | `:113` |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| 空 diff | §2 | 1-2 | covered |
| MCP 四态 | §2 | 3-6 | covered |
| Skill 四态 | §2 | 7-10 | covered |
| 混合 | §2 | 11 | covered |
| Map 折叠/缺字段 | §4 | — | unknown |
