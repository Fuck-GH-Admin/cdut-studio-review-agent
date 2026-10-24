---
path: apps/electron/src/renderer/lib/exploration-session.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: eea33a165891d8b3994b23b1432fa23e97d5d1d8
sha256: ce9a94777a10877fea313ed52279f16d765282eea05bed783fc54491a31e7692
lines: 89
kind: test
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/exploration-session.test.ts

## 1. 测试目标

直接测试 `exploration-session.ts` 5 函数（1 个 describe `:15`）+ 与 `agent-message-queue` 的 mention 解析联动。12 个 `test(`，Given-When-Then 中文命名。**照实**：`:16-19` 与 `:21-24` 为重复用例（同名同体）。

## 2. 用例清单

| # | 行 | Given-When-Then + 真实断言 |
| --- | --- | --- |
| 1/2 | `:16-24` | 主线 Pi→`toEqual({canFork:true, canExplore:true})`（**重复两次**） |
| 3 | `:26-29` | 分支会话→两入口全关 `toEqual({false,false})` |
| 4 | `:31-34` | runtime 缺省→保守 `canExplore:false` |
| 5 | `:36-44` | 时间线+多 binding（含 sidechain）→`toBe('assistant-2')`（跳过子 Agent） |
| 6 | `:46-51` | 窗口不含绑定→回退最后 binding `toBe('assistant-2')` |
| 7 | `:53-58` | 旧快照+新缓存合并→`getLatestExplorationConclusion toBe('探索新结论')` |
| 8 | `:60-63` | 锚点后多条→最新 `toBe('探索最终结论')` |
| 9 | `:65-68` | 锚点缺失/无新增→`toBe('')` |
| 10 | `:70-73` | 仅 sidechain 回复→`toBe('')`（子 Agent 不作结论） |
| 11 | `:75-81` | 草稿构造→markdown 含 `&session:branch-1::`、**不含探索正文**、html 含 mention data-* |
| 12 | `:83-88` | mention 解析联动→`mentionedSessionIds toEqual(['branch-1'])`+`cleanedText` 移除标签 |

## 3. 真实断言

`toEqual`/`toBe`/`toContain`/`not.toContain`。工厂函数构造 SDKMessage；无 mock 框架。

## 4. 未覆盖

- mergeExplorationMessages 非 uuid 消息分支细节；bindings undefined 组合；escapeHtml 全字符集。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 12 个 `test(`、断言如 §2 | 已证实 | 文件全读（89 行） |
| **照实**：用例 1/2 重复（`:16`/`:21`） | 已证实 | 同名同体 |
| 实际执行结果 | 未知 | `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 状态 |
| --- | --- | --- |
| 可用性/锚点/合并/结论/草稿 | §2 | covered |
| §4 边缘 | — | — | unknown |
