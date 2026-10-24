---
path: apps/electron/src/main/lib/adapters/pi-retry-control.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 09b4af9b1a9dad9cd0a7f168aa8d28480dfdd302
sha256: 8e41e03dad10e888636fca7a7b16524e61cd91797c2357f33c7ee561db05450c
lines: 141
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-retry-control.test.ts

## 1. 测试目标

`pi-retry-control.ts` 的 Pi native retry 事件映射（describe 标题称 SDK 0.84.3 映射，`apps/electron/src/main/lib/adapters/pi-retry-control.test.ts:4`——与源文件注释的 0.82.1 版本说法不一致，照实记录）与终态门控。无 mock/无夹具（纯函数+固定时间戳 `ts=1_000_000`，`:5`）。

## 2. 用例清单

2 describe、15 test 调用点（QA N-NB54-05 校正；mapPiNativeRetryEvent 12 + gate 3）：

- `mapPiNativeRetryEvent`（`:4`）12 用例：`:7` starting 映射、`:21` 兜底文案「未知错误」、`:26` attempt 记退避时长、`:43` 兜底「重试中」、`:51` outcome=exhausted、`:62` 无 outcome 推断 success/exhaustion、`:71` start 无终态、`:77` success→cleared、`:82` outcome=succeeded 并存→cleared、`:90` success=false 但 outcome=succeeded→cleared、`:98` cancelled→cleared 不误报、`:106` 真失败→failed。
- `createPiRetryTerminalGate`（`:118`）3 用例：`:119` settle(true) 不透传、`:126` settle(false) 透传且二次 settle 为 undefined、`:134` peek 不清空。

## 3. 真实断言

- `:12-18` starting 对象 `toEqual`（delaySeconds=2←delayMs 2000）；`:23` `toMatchObject({reason:'未知错误'})`；`:31-40` attemptData 全字段 `toEqual`；`:47` reason 为 `'重试中'`。
- `:59/:65/:68/:74` outcome 各值 `toBe`/`toBeUndefined`；`:79/:87/:95/:103` `toEqual([{status:'cleared'}])`。
- `:111-114` failed 对象 `toEqual`（delaySeconds 0）；`:122/:129/:131/:137-139` gate 行为 `toBe`。

## 4. 未覆盖与脆弱点

未覆盖：`total*` 系列字段（源注释称不影响计数）、`PiRetryUpdate` 的消费方（agent-orchestrator）。`describe` 标题版本号（0.84.3）与源注释（0.82.1 patch）不一致——以源代码映射为准（QA 视角可复核）。无 mock。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 15 用例（12+3）行号与断言文本 | 已证实 | `:7-140`（QA N-NB54-05 校正） |
| 版本号标注差异 | 已证实 | test:4 vs 源:12 |
| 运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| 映射 4 态+gate 3 方法 | §3 | covered |
| total* 字段 | §4 | unknown |
| 实际运行 | §5 | unknown（NOT_RUN） |
