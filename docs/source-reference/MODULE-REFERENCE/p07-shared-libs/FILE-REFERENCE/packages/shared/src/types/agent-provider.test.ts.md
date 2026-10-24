---
path: packages/shared/src/types/agent-provider.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 130cdf166f28be20c3350aa74afcc1526862f0be
sha256: b4eac9a61b07796ed202c9820b7d9d5f732fffd8bc8e2b5cf8ac0ba33cb2f433
lines: 22
kind: test
package: p07-shared-libs
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/types/agent-provider.test.ts

## 1. 测试目标

Agent runtime **持久化兼容**（`packages/shared/src/types/agent-provider.test.ts:8`）：历史/非法值归一化兜底、严格校验只认受支持 runtime。

## 2. 用例清单

1 describe / 2 test（纯函数断言）。

| # | 名称 | 断言 | 行 |
| --- | --- | --- | --- |
| 1 | 缺失/非法历史值归一化兜底 | `DEFAULT_AGENT_RUNTIME==='pi'`；`normalizeAgentRuntime(undefined/'unknown')` 均 `'pi'` | `:9-13` |
| 2 | 校验只保留受支持值 | `isAgentRuntime('pi')===true`（两行重复断言）；`undefined`/`'codex'` 为 false；`normalizeAgentRuntime('pi')==='pi'` | `:15-21` |

## 3. 真实断言

- `expect(normalizeAgentRuntime('unknown')).toBe('pi')`（`:12`）。
- `expect(isAgentRuntime('codex')).toBe(false)`（`:19`）。

## 4. 未覆盖与脆弱点

- 未覆盖：`AgentRuntimeCapabilities` 快照、adapter 接口（纯类型）。
- 脆弱点：用例名称写「falls back to Claude / preserves Claude and Pi」（`:9`、`:15`）但断言全为 `'pi'`——**测试名称是 Claude 移除前的遗留文案**，与断言（Pi）不一致；断言本身正确。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 用例与归一化语义一致 | 已证实 | `:10-20` |
| 用例名称含过时「Claude」表述 | 已证实（文案遗留） | `:9`、`:15` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测函数 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| `normalizeAgentRuntime` | 1-2 | `:11-12`、`:20` | covered |
| `isAgentRuntime` | 2 | `:16-19` | covered |
