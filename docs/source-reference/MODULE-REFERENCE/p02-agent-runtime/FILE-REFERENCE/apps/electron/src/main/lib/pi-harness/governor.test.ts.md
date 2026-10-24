---
path: apps/electron/src/main/lib/pi-harness/governor.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0e1aca03a9f68e967a21302ee506cfcb384215b6
sha256: e33d286bc4f61c2a25fb8169f0417e0983526fbd724bc60e658bff0c4a79d506
lines: 40
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-harness/governor.test.ts

## 1. 测试目标

`decideShadowGovernorCandidate`（`governor.ts:22`）：只记不跑、阻断无变化循环、mutation 后修复候选+指纹去重、ready 候选零迁移。bun:test；夹具 goal/active/ready/failure（`:6-14`），无 mock。

## 2. 用例清单

共 **4 个 `test(`**：shadow 只记不执行（`:17`）；失败无 mutation 阻断（`:22`）；mutation 后给候选+去重（`:27`）；ready 候选不消耗 transition（`:35`）。

## 3. 真实断言

`:19` `{taskId:'active', action:'required_verification', blockedReason:'shadow_mode'}`；`:24` `toBeUndefined()`；`:30` blockedReason shadow_mode+`:32` 去重后 `toBeUndefined()`；`:37` `{taskId:'ready', action:'ready_task', blockedReason:'shadow_mode'}`+`:38` `taskTransitions` `toBe(0)`。

## 4. 未覆盖与脆弱点

permission_mode 分支（非 bypassPermissions）无独立断言（源 `:31-35`）；estimatedPromptChars 值无断言。断言≠已运行：**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例/断言 | 已证实 | 全 40 行 |
| 测试通过状态 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 用例 | §2/§3 | 17-39 | covered |
