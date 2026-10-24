---
path: apps/electron/src/main/lib/review/review-desktop-isolation.p04.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: be80b3c0081c75b94e8b337454c6a3ff3e9b3b82
sha256: 42edc27b0a0ce6ae7cd0a5d12f8df3a56034136aea3414d6c7c7921ff70b5c2b
lines: 104
kind: test
package: p05-review-engine
author: docs-r07-author-nb-30-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---
# apps/electron/src/main/lib/review/review-desktop-isolation.p04.test.ts

## 1. 测试目标

P04-S01 有界桌面审计（`apps/electron/src/main/lib/review/review-desktop-isolation.p04.test.ts:2-6`）：直接内容搜索、会话引用搜索、归档计数/清理、UI 投影事件抑制四面；全部用合成隔离会话索引；真实 Electron 窗口/持久 tab/事件重放仍是 **LIVE-06 NOT-RUN**（`:5-6`）。被测对象 `agent-session-manager`/`agent-session-ui-projection-publisher`（批外模块）。

夹具：tmp `PROFER_CONFIG_DIR`（`:31-33`）；`fixture()` 建 review-owned + ordinary 同工作区两会话（`:35-46`）。

## 2. 用例清单

共 **4 个 `test(`**（1 个 `describe`）：

| # | 行 | 用例 | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- | --- |
| 1 | 49-66 | 按正文/标题/空引用查询搜索均排除 review owner | 双会话 append 同 marker | `searchAgentSessionMessages` + `searchAgentSessionReferences`×3 | 独立 |
| 2 | 68-81 | 归档计数排除 owned；自动归档不动 owner | 双 archived → owned 改回 | `countArchivedAgentSessions` + `autoArchiveAgentSessions(-1)` | 独立 |
| 3 | 83-89 | 桌面孤儿健康清单排除 owner 的 ID 与标题 | fixture | `findOrphanSessions` | 独立 |
| 4 | 91-103 | 已知 review owner 零 UI 投影 upsert；普通元数据更新可见 | AgentEventBus 监听 | `publishAgentSessionProjection(owned)` + `updateAgentSessionUiMeta`×2 | 独立 |

## 3. 真实断言

- `:55-65` 四组 `map(h=>h.sessionId)` toContain ordinary.id / not.toContain owned.id（正文搜索、空引用、标题、正文引用）。
- `:73-80` `before` ≥1、owned 改回后计数不变、`autoArchiveAgentSessions(-1)` ≥0、`owned.archived` toBe false、`ordinary.archived` toBe true。
- `:86-88` 孤儿清单 some(sessionId===owned.id) false、some(title===owned.title) false、some(ordinary.id) true。
- `:99-102` `events.some(v=>v.id===owned.id)` toBeFalse、ordinary 更新 toContainEqual `{id,kind:'session_projection'}`、`owned.title` toBe `'internal-updated'`（**元数据已改但零事件**）。

## 4. 未覆盖与脆弱点

- LIVE-06 明示未测：真实窗口/持久 tab/事件重放（`:5-6`）。
- `searchAgentSessionMessages` 是 async；用例 1 未测空 marker/超长 query。
- 归档计数断言用 ≥1/不变（相对断言），受同进程其它用例残留影响（共享 tmp 目录）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 test/1 describe | 已证实 | `:48-103` |
| 搜索双面排除 owner | 已证实 | `:55-65` |
| 归档/自动归档不动 owner | 已证实 | `:73-80` |
| 投影抑制但元数据仍写 | 已证实 | `:99-102` |
| 测试通过与否 | 未知 | NOT_RUN |
| LIVE-06 真实桌面面 | 未知 | 明示 NOT-RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| 搜索排除 | §2/§3 | 1 | covered |
| 归档计数/自动归档 | §2/§3 | 2 | covered |
| 孤儿清单 | §2/§3 | 3 | covered |
| 投影抑制 | §2/§3 | 4 | covered |
| LIVE-06 | §4 | — | unknown（NOT-RUN） |
