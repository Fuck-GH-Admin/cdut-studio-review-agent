---
path: apps/electron/src/main/lib/review/review-owned-session.p03.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 05c2ce7214cc7545c15d1b750e5da15a7b179f41
sha256: c0aefa153ad658ed7c451c29cf7d4b0cec1684bc5da2a931caeee48550618a73
lines: 98
kind: test
package: p05-review-engine
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-owned-session.p03.test.ts

## 1. 测试目标

P03-S03：可信内部评审 Owner、持久索引与最小普通桌面/Pocket 入口屏障（`apps/electron/src/main/lib/review/review-owned-session.p03.test.ts:1-5`）——Owner 原子落盘（不从标题/预设推断）、Owner 不可篡改、Pocket 排除私有会话、事件/运行时快照在 replay 追加前被拒。P04/P05 的全表面枚举（tabs/search/replay/Feishu）另行覆盖（`:3-4`）。

## 2. 用例清单

1 describe / 4 test。夹具 `fixture()`：`createReviewOwnedAgentSession({caseId,title:'内部审核执行',…})` + `createAgentSession('普通聊天-…','mock-channel',…)`（`:26-34`）。

| # | 名称 | 动作 | 断言要点 | 行 |
| --- | --- | --- | --- | --- |
| 1 | Owner 原子打入持久索引，不从标题/预设推断 | 建 owned/ordinary | `owned.owner==={kind:'review-case',caseId}`；`getAgentSessionMeta`/`listAgentSessions(true)` 均含 owner；`owned.agentRuntime==='pi'`；`isReviewOwnedAgentSession` 一真一假；`isVisibleAgentSession` 一假一真；`assertOrdinaryAgentSession(owned)` 抛「内部审核会话」 | `:37-49` |
| 2 | Owner 在常规更新（含运行时属性注入）下不可变 | 两会话各尝试 `updateAgentSessionMeta(...,{owner:伪造})` | 均抛「owner 不可」；改 title 后 owner 不变；ordinary 无 owner；`caseId:'../forged'` 建会话抛「有效案卷」 | `:51-63` |
| 3 | Pocket 会话列表排除 owned；已知 sessionId 也读/改/删不到 | `handleRemoteCommand('list_sessions')` + 7 种命令逐个对 owned | 列表含 ordinary 不含 owned；7 种命令均 `{ok:false,error:'会话不存在'}`；ordinary 的 `session_detail` ok | `:65-84` |
| 4 | Pocket 事件与运行时快照在 replay 追加前被拒 | `mayPublishAgentEventToRemote` + `get_agent_runtime_contexts` | owned `false`/ordinary `true`；contexts 不含 owned | `:86-97` |

## 3. 真实断言

- `expect(owned.owner).toEqual({ kind: 'review-case', caseId })`（`:39`）。
- `expect(() => updateAgentSessionMeta(ordinary.id, { owner: … } as never)).toThrow('owner 不可')`（`:56-58`）。
- `expect(result).toEqual({ ok: false, error: '会话不存在' })`（`:80`）。
- `expect(mayPublishAgentEventToRemote(owned.id)).toBeFalse()`（`:88`）。

## 4. 未覆盖与脆弱点

- 未覆盖：P04/P05 全表面（tabs/search/replay/Feishu，声明另测）；`updateAgentSessionMeta` 其它字段注入。
- 脆弱点：「会话不存在」错误文案断言与 remote-service 耦合；`as never` 绕过类型以测运行时防护。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例覆盖 Owner 落盘/不可变/Pocket 排除/事件拒绝 | 已证实 | `:37-97` |
| 测试实际通过 | 未知 | NOT_RUN |
| 7 种 Pocket 命令的全集性 | 推断 | 测试列举 7 种；remote-service 命令全集未核 |

## 6. 覆盖表

| 被测行为 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| Owner 原子落盘/判别 | 1 | `:37-49` | covered |
| Owner 不可篡改 | 2 | `:51-63` | covered |
| Pocket 排除 | 3 | `:65-84` | covered |
| 事件/快照拒绝 | 4 | `:86-97` | covered |
