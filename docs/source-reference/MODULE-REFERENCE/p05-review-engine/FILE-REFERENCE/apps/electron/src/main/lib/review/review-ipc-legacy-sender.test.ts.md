---
path: apps/electron/src/main/lib/review/review-ipc-legacy-sender.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f63782b23c62813b320ca374699b68216a52638d
sha256: 881a19d1b573dc157943d801b9e4b94e72fd53af39a40f6afa1895946e48ed37
lines: 154
kind: test
package: p05-review-engine
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-ipc-legacy-sender.test.ts

## 1. 测试目标

AUTH-06/RUN-43/RUN-17 三面（`apps/electron/src/main/lib/review/review-ipc-legacy-sender.test.ts:1-4`）：①**每个旧高影响 V2 写通道**必须与 C0/T05/F13 同过「可信 Main 窗口+主帧」检查后才写域；②批次案卷拒旧 `CAST_RATING` 并行记分；③续交确认入参校验；④补件判定人由 Main 按 origin task 派生（渲染层自填角色不参与）。

## 2. 用例清单

5 describe / 5 test。夹具：`__proferElectronTestHooks.ipcMainHandlers` 直调 handler；`setMainWindow` 挂可信窗；`LEGACY_WRITES` 9 通道清单（`:26-36`）。

| # | describe | 名称 | 断言要点 | 行 |
| --- | --- | --- | --- | --- |
| 1 | AUTH-06 legacy write sender boundary | 9 通道拒伪造窗+拒子帧 | 每通道对 `{sender:副本,senderFrame:frame}` 与 `{sender,senderFrame:{id:2}}` 均抛 `SENDER_UNTRUSTED`（共 18 断言，**先拒后写**） | `:48-57` |
| 2 | T07 评分权威 | 批次案卷拒旧 CAST_RATING | `createBatchV2` 建批次 → `CAST_RATING_V2` 抛「评分必须走 T07 评分通道」 | `:60-77` |
| 3 | RUN-43 续交确认 | 非法 `resumeInterrupted` 执行前被拒 | `START_BACKGROUND_PI_REVIEW_V2` rejects「审核续交确认参数非法」 | `:80-89` |
| 4 | RUN-17 补件判定人派生 | teacher origin→本地 teacher；reviewer→local-reviewer；pinned→local-teacher-2；无 origin→local-reviewer；aggregate 缺→local-reviewer | `deriveLocalSupplementResolverActor` 五行断言 | `:92-113` |
| 5 | RUN-17 teacher 补件经普通 IPC 可判定 | 全链：建聚合→`ensureInitialTask`(teacher)→`recordStageDecision(return-for-supplement)`→`RESOLVE_SUPPLEMENT_V2`（渲染层伪称 reviewer） | handler `ok:true`；补件 `status==='satisfied'`——判定人被 Main 派生为 teacher | `:116-153` |

## 3. 真实断言

- `expect(() => invoke(channel, { sender: { ...sender }, senderFrame: frame })).toThrow('SENDER_UNTRUSTED')`（`:54`）。
- `expect(() => handler!(trusted, {...})).toThrow('评分必须走 T07 评分通道')`（`:72-76`）。
- `expect(deriveLocalSupplementResolverActor(aggregate, 'sup-teacher')).toEqual({ actorId: 'local-teacher', actorSource: 'local', role: 'teacher' })`（`:108`）。
- `expect(readAggregate(caseId)!.supplements[0]!.status).toBe('satisfied')`（`:152`）。

## 4. 未覆盖与脆弱点

- 未覆盖：9 通道之外的旧写通道；`F13_*`/`bindLocalSubmitterCommand` 路径；真实 Electron sender 类型（用结构化替身）。
- 脆弱点：`invoke` 的合成入参（`:41-45`）对不同通道形状是并集近似；`as never`/`as unknown` 多处绕过类型。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 9 旧写通道 sender 守卫齐全（先拒后写） | 已证实 | `:53-56` |
| 批次拒并行记分 | 已证实 | `:72-76`（与 `review-ipc.ts:94-99` 一致） |
| 补件判定人 Main 派生 | 已证实 | `:108-112`、`:143-152` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| AUTH-06 sender | 1 | `:48-57` | covered |
| T07 评分权威 | 2 | `:60-77` | covered |
| RUN-43 续交 | 3 | `:80-89` | covered |
| RUN-17 派生 | 4 | `:92-113` | covered |
| RUN-17 全链 | 5 | `:116-153` | covered |
