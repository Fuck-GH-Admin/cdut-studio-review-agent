---
path: apps/electron/src/main/lib/review/review-deleted-owner-tombstone.p04.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0195fc2422b5b491699e9c70ee74a59fb0216bd0
sha256: 6d8fd5f10ae7fdbae018ef5486680fe2da65a2f9862a285f456a876e44934032
lines: 111
kind: test
package: p05-review-engine
author: docs-r07-author-nb-30-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---
# apps/electron/src/main/lib/review/review-deleted-owner-tombstone.p04.test.ts

## 1. 测试目标

P04-S03：已删除的 review owner **不得**变成未知普通 ID（`apps/electron/src/main/lib/review/review-deleted-owner-tombstone.p04.test.ts:2`）。用隔离的合成磁盘索引，不起 Electron/真实 Pi 会话（`:3-4`）。被测对象：`agent-session-manager`/`remote-service`/`agent-session-ui-projection-publisher`（**非本 review 目录模块**；独立测试入口）。

夹具：tmp `PROFER_CONFIG_DIR`（`:28-30`）；`fixture()` 建 1 review-owned + 1 ordinary 会话（`:32-39`）。mock 边界：真实磁盘索引（合成目录）；`AgentEventBus` 真实事件总线。

## 2. 用例清单

共 **5 个 `test(`**（1 个 `describe`）：

| # | 行 | 用例 | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- | --- |
| 1 | 42-57 | 删除保留 ID-only 墓碑（原子，入现有会话索引） | fixture | deleteAgentSession(owned) + 索引文件断言 | 独立 |
| 2 | 59-66 | 普通删除保持普通；未知 ID 不误判为 owner | fixture | delete(ordinary) + 未知 ID | 独立 |
| 3 | 68-86 | 元数据移除后的迟到删除/投影事件仅对 review owner 抑制 | fixture + AgentEventBus 监听 | publishAgentSessionProjection×2 + publishAgentSessionDeletion | 独立 |
| 4 | 88-100 | 远程重放-追加守卫与普通命令路由拒已删 owner ID | fixture | mayPublishAgentEventToRemote + handleRemoteCommand | 独立 |
| 5 | 102-110 | 已删 owner ID 不可复用为委派普通会话 | fixture | createDelegatedChildSessionMeta(owned.id) | 独立 |

## 3. 真实断言

- `:44-48` 删除前后 `isReviewOwnedOrDeletedAgentSessionId(owned.id)` 均 true、`getAgentSessionMeta` toBeUndefined、`assertOrdinaryAgentSession` toThrow `'内部审核会话'`；`:49` ordinary 存活。
- `:54-56` 索引 `reviewOwnerDeletionTombstones` toContain owned.id、`sessions.some(id)` toBe false、墓碑**不含 caseId 文本**（`some(x=>x.includes('case-tombstone'))` toBe false，ID-only）。
- `:62-65` ordinary 删除后 `isReviewOwnedOrDeletedAgentSessionId` false、未知 ID false、`assertOrdinaryAgentSession` not.toThrow。
- `:82` `emitted.some(x=>x.id===owned.id)` toBe false（含 owner:undefined 的迟到快照也被 ID 围栏挡）；`:85` ordinary 删除事件 toContainEqual `{id,kind:'session_projection',operation:'delete'}`。
- `:91-92` `mayPublishAgentEventToRemote(owned.id)` false、ordinary true；`:93-99` 远程 `session_detail` 对 owned → `{ok:false,error:'会话不存在'}`、ordinary → `ok:true`。
- `:105-108` 复用 owned.id 建委派 → toThrow `'已删除的内部审核会话'`。

## 4. 未覆盖与脆弱点

- 被测三模块均批外（agent-session-manager 等），本文件只锚外部行为面。
- 墓碑仅断言不含 caseId；其它敏感字段（title 等）未逐一断言。
- 并发删除/写索引竞态未测。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 test/1 describe、合成磁盘夹具 | 已证实 | `:28-110` |
| ID-only 墓碑断言 | 已证实 | `:54-56` |
| 迟到事件 ID 围栏 | 已证实 | `:76-85` |
| 远程路由拒 ID | 已证实 | `:91-99` |
| 测试通过与否 | 未知 | NOT_RUN |
| 被测实现细节 | 未知 | 批外 |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| 墓碑原子性/ID-only | §2/§3 | 1 | covered |
| 普通/未知分类 | §2/§3 | 2 | covered |
| 迟到事件抑制 | §2/§3 | 3 | covered |
| 远程守卫/路由 | §2/§3 | 4 | covered |
| 复用拒绝 | §2/§3 | 5 | covered |
| 并发竞态 | §4 | — | unknown |
