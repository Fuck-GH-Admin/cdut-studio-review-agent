---
path: apps/electron/src/main/lib/agent-model-routing.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0805c3481b71e88b060596364a88ec8b68584e8e
sha256: 7428cdd60f6aef8084adb32dc172ee8c16432c1559cab53c4f8de4c8da9c66ed
lines: 89
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-model-routing.test.ts

## 1. 测试目标

`resolveAgentModelRouting`/`applyAgentModelRoutingToEnv`（`agent-model-routing.ts:27,48`）：DeepSeek SubAgent 固定、1M 三态、env 写/删。bun:test；真函数直测，无 mock。

## 2. 用例清单

共 **7 个 `test(`**（计数核对）：DeepSeek V4 Pro→subagent=flash+1M（`:9`）；兼容渠道 `gateway/deepseek-v4-pro` 同（`:20`）；`deepseek-reasoner` 1M 不误开（`:31`）；非 DeepSeek 删残留 env（`:41`）；DeepSeek 注入 env（`:57`）；context1m:false 强关不影响 subagent（`:68`）；context1m:true 未验证模型也开（`:80`）。全部独立。

## 3. 真实断言

`:15-17`（deepSeekFamily/enable1MContext/subagentModel）；`:26-28` 同构；`:37-38` 1M false；`:52-54` `env.CLAUDE_CODE_SUBAGENT_MODEL` `toBeUndefined()`；`:65` `toBe(DEEPSEEK_SUBAGENT_MODEL_ID)`；`:75-77`；`:87`。

## 4. 未覆盖与脆弱点

未覆盖：`supports1MContext` 内部代际表（shared 域外）；provider='deepseek' 但 modelId 非 deepseek-* 的组合。断言≠已运行：**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 用例/断言 | 已证实 | 全 89 行 |
| 测试通过状态 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 7 用例 | §2/§3 | 9-88 | covered |
