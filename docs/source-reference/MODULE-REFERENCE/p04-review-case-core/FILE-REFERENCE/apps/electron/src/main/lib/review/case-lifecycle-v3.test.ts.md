---
path: apps/electron/src/main/lib/review/case-lifecycle-v3.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8724832fd50cd4d8aa6a13283c430344b90164ac
sha256: d384764c4dc3b0c030b7b531616c19c1f166e60815c7c3e7a6c21d673060c344
lines: 151
kind: test
package: p04-review-case-core
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/case-lifecycle-v3.test.ts

## 1. 测试目标

验证 C1 权威可逆案卷归档/恢复：`archiveReviewCaseV3`/`restoreReviewCaseV3`（`apps/electron/src/main/lib/review/case-lifecycle-v3.ts:36-97`）的 CAS+回执单事务语义、重放/冲突、归档阻断、恢复不重新批准与命令合法性（`apps/electron/src/main/lib/review/case-lifecycle-v3.test.ts:26`「C1 authoritative reversible Case archive」）。

## 2. 用例清单

1 describe / 5 test。夹具：`seed(id)` = `saveCase({...buildDemoCase(), id})` + `ensureWorkspaceAggregateV2(id)`（`:21-24`）；`intent(id, revision, reason)` 构造合法命令（`:18-20`）；`actor = {actorId:'local-reviewer', actorSource:'local', role:'reviewer'}`（`:17`）；临时目录 `work/tmp/v3-c1-case-archive-<ts>`，`PROFER_CONFIG_DIR` 指向之，`afterAll` 清理（`:14-16`）。

| # | 名称 | 设置 | 动作 | 断言要点 | 行 |
| --- | --- | --- | --- | --- | --- |
| 1 | 归档=一次 Case CAS+回执；同 intent 重放不是擦除 | seed | 归档→读回→再归档→换载荷重放 | `ok:true`；`stage='archived'`；`revision+1`；`caseArchive` 匹配；回执 `ArchiveReviewCaseV3`；文档版本不变；V1 `getCase` 空；`deleteCase` 抛「禁止通过旧版删除入口」；重放字节不变；换载荷得 `REQUEST_ID_COLLISION` | `:27-54` |
| 2 | 归档阻断全部正常业务命令/旧版 save/Pi 运行 | seed+归档 | 提交 UpdateFields、`saveCase`、`syncWorkspaceProjectionV2`、`runReviewCaseV2`、`preparePiReviewRunV2` | 命令 `INVALID_TRANSITION`；`saveCase` 抛「原生审核案卷禁止」；投影 `archived`；运行/准备均抛「已经归档」；聚合字节不变 | `:56-75` |
| 3 | 恢复 CAS 且不重新批准；归档/恢复双回执 | seed→写 decided 聚合 | 归档→旧修订恢复→新修订恢复→重放→再归档 | 旧修订 `VERSION_CONFLICT`；恢复 `stage='draft'`、`revision+1`、`caseArchive` 带 restoredBy/restoreReason；回执尾序 `['Archive','Restore']`；旧快照运行抛「旧快照禁止执行」；重放字节不变；`caseArchiveHistory` 长度 1 | `:77-117` |
| 4 | running/queued Run 阻止归档直至取消 | seed+`saveRunV2(status:'running')` | 归档→改 `cancelled` 再归档 | 首次 `INVALID_TRANSITION`；字节不变；取消后成功、`stage='archived'` | `:119-132` |
| 5 | 非法 actor/reason、未跟踪归档不可写 | seed | `actorSource:'agent',role:'teacher'` 归档、空理由归档、伪造 archived 聚合恢复 | 均拒（「缺少可信人员」/「有效理由」/`INVALID_TRANSITION`）；字节不变 | `:134-150` |

**依赖顺序**：每用例独立 `seed`；用例 3 内部按 decided→archive→restore 时序；用例 4 依赖 `saveRunV2` 先写运行。

## 3. 真实断言

- 用例 1：`expect(saved.caseArchive).toMatchObject({previousStage, archivedBy: actor.actorId, reason})`（`:37-39`）；`expect(() => deleteCase(id)).toThrow('禁止通过旧版删除入口')`（`:46`）；`expect(collision).toMatchObject({ ok: false, code: 'REQUEST_ID_COLLISION' })`（`:52`）。
- 用例 2：`expect(blocked).toMatchObject({ ok: false, code: 'INVALID_TRANSITION' })`（`:66`）；`expect(() => saveCase(...)).toThrow('原生审核案卷禁止')`（`:67`）；`rejects.toThrow('已经归档')`（`:69-70`、`:71-73`）。
- 用例 3：`expect(stale).toMatchObject({ ok: false, code: 'VERSION_CONFLICT' })`（`:86`）；`expect(now.receiptLog.slice(-2).map(x => x.type)).toEqual(['ArchiveReviewCaseV3', 'RestoreReviewCaseV3'])`（`:97`）；`rejects.toThrow('旧快照禁止执行')`（`:101-102`）。
- 用例 4：`expect(blocked).toMatchObject({ ok: false, code: 'INVALID_TRANSITION' })`（`:126`）。
- 用例 5：`rejects.toThrow('缺少可信人员')`（`:141`）；`rejects.toThrow('有效理由')`（`:143`）。

## 4. 未覆盖与脆弱点

- 未覆盖：`check` 的 requestId 长度/字符边界（仅用合法值）、reason 1000 字上限、并发双归档竞争、`caseArchiveHistory` 多轮累积。
- 脆弱点：用例 3 依赖 `writeAggregate` 直写 decided 快照（`:80-81`）绕过命令层——若 `submitCommand` 收紧写入校验会失效；用例 2 的错误文案断言与 Main 文案耦合。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 用例断言内容与被测行为一一对应 | 已证实 | 只读核对本文件与 `case-lifecycle-v3.ts` |
| 测试实际通过 | 未知 | NOT_RUN（本轮未执行 `bun test`） |
| 用例 2 证明「全部业务命令被阻断」 | 推断 | 只试了 `UpdateFields` 一种命令类型 |

## 6. 覆盖表

| 被测行为 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 归档 CAS+回执+重放/冲突 | 1 | `:27-54` | covered |
| 归档阻断与旧入口禁用 | 2 | `:56-75` | covered |
| 恢复 CAS/不重新批准/历史 | 3 | `:77-117` | covered |
| 运行中阻断 | 4 | `:119-132` | covered |
| 命令合法性 | 5 | `:134-150` | covered |
