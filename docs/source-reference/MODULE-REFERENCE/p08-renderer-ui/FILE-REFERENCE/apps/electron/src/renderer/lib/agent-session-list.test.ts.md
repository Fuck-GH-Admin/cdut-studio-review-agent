---
path: apps/electron/src/renderer/lib/agent-session-list.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 65b796d5adc49277133124472de81aebd94faa93
sha256: 3b42442eb31903d0f5f045e24a3b64d9e0da03e2f7d0e0a52301323be73a20b1
lines: 327
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/agent-session-list.test.ts

## 1. 测试目标

验证 `agent-session-list.ts` 的会话列表纯函数：排序/替换/upsert、实时投影合并、全量快照合并（删除语义与陈旧快照防御）、review-owned 过滤（P04-S01）、撤销优先（P04-S04）、草稿标记幂等同步。SUT 同批收录（`agent-session-list.ts`）；测试框架 `bun:test`（`agent-session-list.test.ts:1`）。

## 2. 用例清单

grep `test(` 机械计数=24、`describe(`=7（`it(`=0），逐 describe 拆分：`sortAgentSessionsByUpdatedAtDesc` 1 个（`:27`）；`replaceAgentSessionInFreshnessOrder` 1 个（`:38`）；`upsertAgentSession` 4 个（`:49` 追加重排、`:57` 浅合并保留字段、`:70` 绝不删其它会话、`:86` 委派元数据完整保留）；`upsertAgentSessionProjection` 3 个（`:146` 探索三字段、`:161` 低 revision 不覆盖、`:167` 不伪造血缘）；`mergeFetchedAgentSessions` 4 个（`:175` 快照为准、`:183` 陈旧快照保父会话、`:198` 删除语义、`:209` 幂等）；`P04-S01 renderer snapshot and late upsert owner filtering` 4 个（`:221`、`:226`、`:231`、`:236`）；`syncDraftSessionId` 6 个（`:280`、`:286`、`:292`、`:298`、`:304`、`:310`）；顶层独立 test 1 个（`:319` P04-S04 撤销）。合计 24，与标签一致。

## 3. 真实断言

- 排序：`expect(result.map((s) => s.id)).toEqual(['b', 'c', 'a'])`（`agent-session-list.test.ts:33`）。
- 替换：`:43-44` expect ['a','b'] 与 title='新标题'；upsert 浅合并 `:63-67` expect channelId='ch-1'、workspaceId='ws-1' 保留。
- 核心回归 `:83` expect `['child-a','child-b','parent']`（父会话不丢）；`:96-101` toMatchObject 工作区/父子/委派字段。
- 投影：`:153-158` toMatchObject 探索三字段；`:164` expect revision:3、permissionMode:'plan'（低 revision 不覆盖）；`:169-170` expect toBeUndefined()（不伪造血缘）。
- 合并：`:179-180` expect ['b','a'] 与 updatedAt=5；`:195` expect some(parent)===true（陈旧快照保留）；`:205-206` expect old===false、keep===true（删除语义）；`:212-213` expect ['a','b']、toHaveLength(2)。
- P04-S01：`:223` expect ['ordinary']；`:227-228` expect upsert 后均 ['ordinary']；`:233` expect replace 后 []；`:275` expect 迟投影后 ['ordinary']。
- 草稿：`:283`、`:289`、`:295`（toBe(ids) 同引用）、`:301`、`:307`、`:315` 六组。
- P04-S04：`:324` expect ['remaining']（撤销优先）；`:326` expect ['remaining','normal-after-delete']（无撤销时保留）。

## 4. 未覆盖与脆弱点

未覆盖：`addDraftSessionId`/`removeDraftSessionId` 直接调用（仅经 syncDraftSessionId 间接，`agent-session-list.ts:36-37`）；`upsertAgentSessionProjection` 对既有普通条目的部分字段覆盖矩阵未逐字段断言。脆弱点：`makeSession` 工厂（`:12-24`）不构造 `studyTeachingMode` 等新字段，SUT 字段集扩展时投影映射（`agent-session-list.ts:71-107`）无测试锁定；projection 工厂（`:106-144`）与真实 `AgentSessionUiProjection` 字段漂移会静默失真。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 24 用例清单与断言文本 | 已证实 | `agent-session-list.test.ts:27-327` 逐行 |
| 测试实际通过 | 未知 | `NOT_RUN`（本轮未运行测试，纯静态阅读） |
| bun:test 运行器行为 | 未知 | 断言≠运行 |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| sortAgentSessionsByUpdatedAtDesc | §2/§3 | 27-35 | covered |
| replaceAgentSessionInFreshnessOrder | §2/§3 | 38-46, 231-234 | covered |
| upsertAgentSession | §2/§3 | 49-102, 226-229 | covered |
| upsertAgentSessionProjection | §2/§3 | 146-171, 236-276 | covered |
| mergeFetchedAgentSessions | §2/§3 | 175-214, 221-224, 319-327 | covered |
| syncDraftSessionId | §2/§3 | 280-316 | covered |
| addDraftSessionId / removeDraftSessionId | §4 | 10-28(SUT) | partial |
