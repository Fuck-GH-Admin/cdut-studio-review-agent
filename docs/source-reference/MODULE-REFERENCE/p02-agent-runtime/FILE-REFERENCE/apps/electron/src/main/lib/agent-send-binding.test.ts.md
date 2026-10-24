---
path: apps/electron/src/main/lib/agent-send-binding.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 80dec722c27fa9a9bd46bf238e037cc90cbc362a
sha256: 9fda6573f062f2ea2db9dd2401e75dab4eb993510ede178dc029fe1b401a2a74
lines: 49
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-send-binding.test.ts

## 1. 测试目标

`validateAgentSendBinding`（`agent-send-binding.ts:11`）七级归属校验。bun:test；纯函数直测，无 mock（常量夹具 `:5-14`）。

## 2. 用例清单

共 **6 个 `test(`**：session 缺（`:17`）；workspace 不匹配/已删除双分支（`:21`）；渠道缺/停用双分支（`:26`）；历史渠道不同保留切换（`:31`）；runtime 切换旧请求拒/新请求过（`:35`）；model 不属于渠道/停用双分支（`:43`）。

## 3. 真实断言

`:18` AGENT_SESSION_NOT_FOUND；`:22-23` AGENT_SESSION_WORKSPACE_MISMATCH/AGENT_WORKSPACE_NOT_FOUND；`:27-28` AGENT_CHANNEL_NOT_FOUND/AGENT_CHANNEL_DISABLED；`:32` `toEqual({ok:true})`；`:38-40` AGENT_SESSION_RUNTIME_MISMATCH+通过；`:44-47` AGENT_MODEL_NOT_IN_CHANNEL/AGENT_MODEL_DISABLED（均 `toMatchObject`）。

## 4. 未覆盖与脆弱点

错误码字面锁定；`normalizeAgentRuntime` 边界（shared 域外）。断言≠已运行：**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 用例/断言 | 已证实 | 全 49 行 |
| 测试通过状态 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 6 用例 | §2/§3 | 17-48 | covered |
