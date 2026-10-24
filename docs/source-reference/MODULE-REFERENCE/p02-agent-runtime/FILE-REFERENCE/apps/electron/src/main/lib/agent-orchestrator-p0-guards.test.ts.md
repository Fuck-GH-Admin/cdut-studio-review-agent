---
path: apps/electron/src/main/lib/agent-orchestrator-p0-guards.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7acebf8f4e225afc7433c6a3f7c426e6124b7a5d
sha256: 807e9edb77def45621988f3f83e5d1270d59d9fb06faebf9c4e802fb6a206c84
lines: 212
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-orchestrator-p0-guards.test.ts

## 1. 测试目标

`agent-orchestrator-p0-guards.ts` 全部 P0 防护：运行互斥/UUID 去重/Pi pre-interrupt/凭证 env 隔离/partial 消息/Plan 路径与 MCP/浏览器权限/skillMentions/xAI 预检。bun:test；纯函数直测，无 mock。

## 2. 用例清单

共 **24 个 `test(`**（机械 grep 核），两 describe：

| 组 | 行 | 用例要点 |
| --- | --- | --- |
| P0 guards 18 | `:21-28` | AgentRunAlreadyActiveError 码/双文案 |
| | `:30-36` | tryAcquire 拒绝并保留原令牌 |
| | `:38-44` | 释放后可再占用 |
| | `:46-51` | 旧令牌 finally 不清新运行 |
| | `:53-59` | queue UUID 只收一次 |
| | `:61-68` | 释放后可重试 |
| | `:70-73` | Pi pre-interrupt 恒 false |
| | `:75-86` | 凭证仅入 query env；process.env 不变；BASE_URL 归一去 /v1 |
| | `:88-91` | partial 消息识别 |
| | `:94-97` | Plan Markdown 路径允许/拒绝 |
| | `:98-101` | `mcp__` 拒 |
| | `:104-117` | Browser 名判定+白名单 5 项+其余 deny |
| | `:118-125` | skillMentions 空/非空 |
| | `:126-145` 等 | Plan 权限决策文案、isPlanModeMarkdownPath 逃逸防护 |
| xAI 6 | `:178-181` | enabled:false 拒 |
| | `:182-188` | agentExperimentalEnabled:false 拒 |
| | `:189-191` | agentRuntimes 无 pi 拒 |
| | `:193-195` | xAI+Pi 资格放行 |
| | `:197-206` | 非 xAI 不在此拦截 |
| | `:208-211` | 回归：旧判据 `isAgentEnabledForChannel(xai)=true` |

## 3. 真实断言

代表：`:34-35`（true/false+`sessions.get` 仍 'run-a'）；`:42` release true→`tryAcquire(...'run-b')` true；`:82-85` sdkEnv 注入+process.env 双不变；`:71-72` 两断言 false；`:209` `isAgentEnabledForChannel(xaiChannel)` `toBe(true)`。断言体逐条已读。

## 4. 未覆盖与脆弱点

未覆盖：`applyAgentSdkAuthEnv`（域外）内部、`isPlanModeMarkdownPath` win32 分隔符分支（运行平台相关）。断言≠已运行：**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 24 用例/断言/分组 | 已证实 | 全 212 行 |
| 与 p0-guards.ts 语义一致 | 已证实 | 逐条对照源文件 |
| 测试通过状态 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 24 用例 | §2/§3 | 21-211 | covered |
