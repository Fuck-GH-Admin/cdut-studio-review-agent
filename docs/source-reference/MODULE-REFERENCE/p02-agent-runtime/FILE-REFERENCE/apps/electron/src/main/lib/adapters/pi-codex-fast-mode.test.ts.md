---
path: apps/electron/src/main/lib/adapters/pi-codex-fast-mode.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8789f472660ec36c3deaf671b62e806bf646e577
sha256: 46fe9a109956842c543e1e7bf5a242d71feb5d6f54173f9534d44c1c8e5da02b
lines: 118
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-codex-fast-mode.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

三个 describe（`:5,28,56`）：①Codex Fast Mode（支持模型注入 priority、非支持不动、覆盖既有 tier、stream 选项保留、非对象不动）；②GPT-5.x 推理档位 `reasoning.effort` 注入（六档映射、GPT-6 Astra 降级、显式 none、非 Codex 不注入、保留已有 reasoning 字段、非对象不动）；③DeepSeek V4 思考协议（budget→max effort、保留 output_config 其它字段、关闭不保留 budget、旧模型不动、非对象不动）。本文件同时是 `pi-codex-request-settings.ts`/`pi-deepseek-reasoning-request-settings.ts` 的主要断言面（跨文件）。

## 2. 用例清单

共 16 条测试声明 = 13 个 `test(`（`:13,18,25,32,51,56,61,68,76,94,102,110,115`）+ 3 个 `test.each(`（`:6,39,82`）。

### describe `Pi Codex Fast Mode`（`:5`）

| # | 用例（行） | 真实断言 |
| --- | --- | --- |
| 1 | supported ×6（test.each，`:6`） | `injectCodexFastMode({model})` `toEqual({model,service_tier:'priority'})` |
| 2 | unsupported model（`:15`） | `injectCodexFastMode(payload)` `toBe(payload)`（同引用） |
| 3 | existing tier 被覆盖（`:20`） | `flex`→`priority` |
| 4 | stream 选项保留（`:27`） | `withCodexFastModeServiceTier({transport:'websocket'})` `toEqual({transport:'websocket',serviceTier:'priority'})` |
| 5 | 非对象（`:34`） | `'not-a-request'` 原样 `toBe` |

### describe `Pi Codex Thinking Level`（`:39`，#1268）

| # | 用例（行） | 真实断言 |
| --- | --- | --- |
| 6 | 六档映射（test.each，`:40`） | `reasoning` `toEqual({effort:expected,summary:'detailed'})` |
| 7 | GPT-6 Astra off→low（`:52`） | `toEqual({effort:'low',summary:'detailed'})` |
| 8 | 显式 none（`:57`） | `toEqual({effort:'none',summary:'detailed'})` |
| 9 | 非 Codex 不注入（`:62`） | `toBe(payload)` 且 `reasoning` `toBeUndefined()` |
| 10 | 保留已有 reasoning 字段（`:69`） | `toEqual({mode:'auto',summary:'detailed',effort:'high'})` |
| 11 | 非对象（`:77`） | 原样 `toBe` |

### describe `Pi DeepSeek V4 Thinking Settings`（`:82`）

| # | 用例（行） | 真实断言 |
| --- | --- | --- |
| 12 | 三模型×enabled（test.each，`:83`） | `thinking` `toEqual({type:'enabled'})`；`output_config` `toEqual({effort:'max'})` |
| 13 | 保留 output_config 其它字段（`:95`） | `toEqual({format:{type:'text'},effort:'max'})` |
| 14 | disabled 不保留 budget（`:103`） | `thinking` `toEqual({type:'disabled'})` |
| 15 | 旧模型不动（`:111`） | `toBe(payload)` |
| 16 | 非对象（`:116`） | 原样 `toBe` |

## 3. 真实断言

逐条见上表（全文件 `:6-117`）。纯函数无 mock。

## 4. 未覆盖与脆弱点

未覆盖：`createCodexFastModeExtension`/`createCodexRequestSettingsExtension`/`createDeepSeekReasoningRequestExtension` 钩子注册面、`THINKING_LEVEL_TO_EFFORT.max` 档、`injectOpenAIThinkingLevel` 对 `payload.reasoning` 非对象时的行为。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 16 条声明（13 test + 3 test.each） | 已证实 | `grep -c "  test\\|  test.each" = 16`；`:6-117` |
| tier 覆盖/不动同引用 | 已证实 | `:15-25` |
| 六档映射+Astra 降级 | 已证实 | `:40-60` |
| DeepSeek budget→effort/关闭 | 已证实 | `:83-114` |
| 扩展钩子面 | 未知 | 无断言 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| Fast Mode 注入/覆盖/包装 | 1-5 | 5-38 | covered |
| reasoning.effort 映射 | 6-11 | 39-81 | covered |
| DeepSeek V4 协议 | 12-16 | 82-118 | covered |
| 扩展工厂 | 无 | — | unknown |
