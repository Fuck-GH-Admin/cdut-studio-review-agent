---
path: apps/cli/src/commands/export.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f0cd900738aa75bdf406c8fc7f7dfa7de03a7a87
sha256: 15856da69a4c6c12265f6b0bb3437b6f6323e24ac7d87b2ff15facc251da313f
lines: 30
kind: test
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/cli/src/commands/export.test.ts

## 1. 测试目标

验证 `export.ts` 导出的锚点函数 `findAssistantAnchorTurnIndex`：①assistant 消息位于某逻辑 turn 时返回该 turn 下标；②不存在的 UUID 返回 undefined（供 `export --after-message` 探索增量读取）。不运行测试，只读断言（NOT_RUN）。

## 2. 用例清单

用例数与源码一致：`test(` 2 个（`describe` 1 个；`it(` 0 个）。夹具 `assistant(uuid)`（`:6-13`）构造 `SDKAssistantMessage`（text content + `parent_tool_use_id: null`）。

| # | 用例 | 行 | 设置/动作 | 断言要点 |
| --- | --- | --- | --- | --- |
| 1 | assistant 消息位于某逻辑 turn → 返回 turn 下标 | 16-25 | 3 组 MessageGroup（user + 两个 assistant-turn，第二组含两条同 uuid 消息） | `'assistant-1'→1`、`'assistant-2'→2` |
| 2 | 不存在的 UUID → undefined | 27-29 | 空数组 | `toBeUndefined()` |

## 3. 真实断言

`:23` `expect(findAssistantAnchorTurnIndex(groups, 'assistant-1')).toBe(1)`；`:24` `…('assistant-2')).toBe(2)`；`:28` `expect(findAssistantAnchorTurnIndex([], 'missing')).toBeUndefined()`。

## 4. 未覆盖与脆弱点

- 未覆盖：user 组同 uuid 不误匹配（用例 1 的 user 组无 uuid 字段，间接排除）、同 uuid 跨多 turn 取首个（实现 `findIndex` 语义，未测）、`--after-message` 端到端窗口切片（`slice(anchor+1)` 未测）。
- 脆弱点：夹具手工构造 `MessageGroup` 形状（与 session-core 类型的契约以类型导入对齐，`:3`）；无 mock（纯函数直测）。
- mock 边界：`SDKAssistantMessage`/`MessageGroup` 均为类型导入（`:2-3`），不触真实解析。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 用例与断言行号 | 已证实 | `:6-29` 逐行读 |
| 多消息组取组下标 | 已证实 | 用例 1（第二组两条同 uuid） |
| 无 mock | 已证实 | 全文读 |
| 测试通过与否 | 未知 | NOT_RUN（本轮未执行） |

## 6. 覆盖表

| 被测分支 | 用例 | 状态 |
| --- | --- | --- |
| 锚点命中 | 1 | covered |
| 未命中 undefined | 2 | covered |
| 端到端窗口切片/护栏 | - | unknown（未覆盖） |
