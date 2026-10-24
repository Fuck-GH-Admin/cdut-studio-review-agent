---
path: apps/electron/src/main/lib/review/review-v3-run-writer.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b53cea6fb2a71c003d7d8baaf501508d0a239eed
sha256: 5dc87edc3a3f7b7922ef6d42fc298dd97a0e74f61d9e1b7746d99dcb41807d0d
lines: 285
kind: source
package: p05-review-engine
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-run-writer.ts

## 1. 结论与边界

Dev-C C2-R01 —— **首个 Case 权威、不可变的 V3 ReviewRun 结果封存器**（文件头 `apps/electron/src/main/lib/review/review-v3-run-writer.ts:1-12`）：C Main-only 的收尾核验者在序列化 CAS 提交时独立证明 Owner generation/session、完整 Host 回执注册表与冻结输入清单；产出"供人工审阅的证据型 Run 记录"，**绝不产出**已批准 CheckResult、评分决定、学校 ACK 或完成态工作流。V2 runs-v2 文件保持 legacy；本文件只做一次 `CaseAggregate` CAS+Receipt，不建影子 run JSON 或第二事务权威（`:10-11`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `VerifyV3RunClosureAtCommit` | type（export） | `:27-31` | `(aggregate, run, events) => void` | C Main 收尾证明回调 |
| `C2SealRunPayload` | interface（export） | `:33-36` | `{ runId; terminalEventId }` | 封存载荷 |
| `getV3ReviewRunRecord` | function（export） | `:45-129` | `(caseId) => ReviewRunRecordV3 \| undefined` | 只读历史校验 |
| `sealV3ReviewRun` | function（export） | `:134-285` | `(caseId, command, attestAtCommit) => Promise<ReviewCommandResult<ReviewRunRecordV3>>` | 唯一封存入口 |
| `bindKey` | const（内部） | `:38-39` | `(entry) => JSON([checkKey,targetKey,objectKey,subjectId])` | 绑定唯一键 |

依赖：`REVIEW_V3_RUN_SCHEMA` 等（`@profer/shared`）、`CommandValidationError/payloadHash/readAggregate/submitCommand`（`apps/electron/src/main/lib/review/case-store-v2.ts:264/:187/:51/:203`）、`assertV3TechnicalJournalIntegrity/digestV3TechnicalEventChain/rawV3TechnicalEventChainDigest`（`review-v3-technical-ledger.ts:69/:145/:136`）、`currentSourceValidityBlockers`（`source-current-validity-v3.ts:63`）、`assertC2HostRunNotFenced`（`review-v3-durable-host-fence.ts:51`）。

## 3. 内部逻辑与关键流程

### 3.1 `getV3ReviewRunRecord`（`:45-129`，读侧全量复核）

历史 READ 不重放"当前"输入冻结（后续人工决定/来源替换不得抹掉历史，`:41-44` 注释），但拒绝被篡改的 Run/断链 Host/缺封存 ACK：

1. 记录/日志存在 + 6 项身份一致（schemaVersion/caseId/runId/caseRevision/planFingerprint/inputDigest/eventChainDigest/terminalEventId/terminal，`:49-59`）。
2. 已发布 Plan 快照**逐字节相等**（`:61-66`，`canonicalPlan ∪ canonicalPlanHistory` 中找 planId+fingerprint，`JSON.stringify` 全等）。
3. `SealV3ReviewRun` 回执恰 1 条、revision = `admittedAtRevision + events.length + 1`、actor 一致（`:68-75`）。
4. 事件回执链逐条匹配（`:76-86`）。
5. 绑定表去重重建（`:87-92`）→ read/check 事件重放（`:93-112`：read 校验历史 byteHash、check 填 technicalStatus/eventId/hostReceiptId/sequence，重复 check→undefined）。
6. 状态/覆盖/绑定/读证据与记录字段逐项一致（`:113-127`）；否则 `undefined`；通过则 `structuredClone(record)`（`:128`）。

### 3.2 `sealV3ReviewRun`（`:134-285`，CAS 提交）

`attestAtCommit` 非函数 → 同步 `throw Error('C2_MAIN_RUN_CLOSURE_ATTESTATION_REQUIRED')`（`:144-146`）。CAS 内顺序：

1. 无既有 `v3ReviewRun`（`:149-152`，不可覆盖）；`stage === 'reviewing'`（`:153-156`）。
2. journal 完整性 + `assertC2HostRunNotFenced`（`:157-158`）。
3. 载荷与末事件终态一致（`:160-170`：`terminalEventId` 必须是末事件且 `kind==='terminal'`）。
4. 执行期间无非 Run 业务改动（`:171-175`）；`currentSourceValidityBlockers` 空（`:176-178`）。
5. Run 所需原件均有 64hex `byteHash`（`:179-187`）。
6. Plan 绑定去重、非空（`:190-203`）——"执行结果不得创建/改变策略适用性"（`:188-189`）。
7. 事件重放（`:204-241`）：read 的 source 与冻结 `sourceVersionIds`/byteHash/caseId 一致（`:208-215`）；check 必须命中唯一绑定且未观察过（`:223-228`）；**非 unknown 的 check 必须有在先真实读取回执**（`:229-235`）。
8. 状态推导（`:242-249`）：`completed-technical` → 全观察 `requires-human-review` 否则 `incomplete`；`partial/needs-resume` → `incomplete`；其余 → `interrupted`。
9. `attestAtCommit(aggregate, run, allEvents)`（`:251-253`，"Main 有最后话，禁止伪造 Principal"）→ 构造 `ReviewRunRecordV3`（`:255-275`：plan/inputDigest/eventChainDigest/coverage 四计数/sealedAt/sealedByActorId）→ `mutate` 写 `draft.v3ReviewRun`（`:276-282`）。

## 4. 调用者与调用链

- **入向（生产）**：`apps/electron/src/main/lib/review/review-v3-main-trust-port.ts:25`（import）、`:212`（`sealV3ReviewRun` 调用）。`getV3ReviewRunRecord`：**冻结树仅本文件与本批测试命中**（apps+packages 全检索）——当前无生产读取方（诚实记录，见 §10）。
- **测试入向**：`review-v3-run-writer.test.ts`（12 用例）。
- **出向**：§2 依赖列表；`structuredClone` 防别名（`:197/:257-258/:279`）。

## 5. 数据 I/O、读写与副作用

- 写：一次 `submitCommand('SealV3ReviewRun')` CAS → `aggregate.v3ReviewRun` + receiptLog 一条；`getV3ReviewRunRecord` 纯读（`readAggregate`）。
- 幂等：已有 `v3ReviewRun` 即拒（`:149-152`）；同 requestId 重放语义由 case-store-v2 决定（测试 `:160-162` 证明重放 seal 不涨 revision）。
- 副作用：`new Date().toISOString()`（`:254`）；无网络/无独立文件。

## 6. 分支、失败、取消与恢复

- `CommandValidationError`：`INVALID_TRANSITION`（重复 seal `:150`、stage `:154`、终态缺失 `:168`、重复绑定 `:193`、空 Plan `:201`、重复 check `:226`）、`STALE_INPUT`（载荷 `:162`、业务改动 `:174`、失效来源 `:177`、缺 byteHash `:184`、read 身份 `:213`）、`DEPENDENCY_UNRESOLVED`（缺读回执 `:233`）；同步 `Error('C2_MAIN_RUN_CLOSURE_ATTESTATION_REQUIRED')`（`:145`）。
- 失败后状态：无 mutate 执行 → 账本无 `v3ReviewRun`，revision 不变（测试 `:192-193/:206/:223/:238-239/:265/:281` 断言）。
- 取消：不适用（原子 CAS）；恢复：修正后**新 requestId** 重试（旧命令由幂等回执锁定）。

## 7. 权限与权威状态

- `attestAtCommit` 是强制的 C Main 收尾证明（`:144-146` fail-closed）；`command.actor.actorId` 写入 `sealedByActorId`（`:274`）并被读侧核对（`:75`）。
- 状态语义：`state ∈ {requires-human-review, incomplete, interrupted}`——**human-review 待办**而非结论（`:277` summary"未产生业务审批与评分结论"）；`boundChecks[].decisionEligible` 恒初始 `false`（`:198`/`:91`，由人工决定层另行提升）。
- 权威：`v3ReviewRun` 是 Case 聚合内唯一权威记录（无影子文件，`:10-11`）。

## 8. 修改影响面

- 改 `ReviewRunRecordV3` 结构/状态推导 → `getV3ReviewRunRecord` 读侧（两处必须同步）、trust-port、12 用例测试、下游人工审阅 UI（跨批）。
- 改绑定键 `bindKey` → Plan 绑定去重与 check 归属（历史记录校验立即失效）。
- journal/校验器变化（`review-v3-technical-ledger.ts`）→ 封存与读侧双双受影响。

## 9. 测试证据

**直接测试 `review-v3-run-writer.test.ts`（12 用例，bun:test，NOT_RUN；夹具 `seed()` `:43-72`：真实 `createAggregate` + 直注 synthetic Plan `:61-65` 注明"不证明已发布策略/真实字节"；`attestHost` `:95-108` 造 `V3VerifiedHostReceipt` Map）**：

1. `:127-166` read→check→terminal→单 CAS 封存：`state==='requires-human-review'`、coverage `{1,1,0,0}`、`boundChecks[0]` `{technicalStatus:'accepted', decisionEligible:false}`、`readEvidence[0].eventId`、digest 64hex；账本 revision 5、receiptLog 序列 5 条、`decisions/observations` 为空；重放 seal 不涨 revision（`:160-162`）；**返回记录是克隆**（改副本不影响真值 `:163-165`）。
2. `:168-182` 无 check 的完成 → `incomplete`（coverage `{1,0,1,0}`、technicalStatus null）。
3. `:184-194` 无在先 read 的 check → 封存拒绝，消息含 '真实 Host 原件读取'。
4. `:196-207` 重复 check → 拒绝含 '重复观察'。
5. `:209-224` 缺 attestor `toThrow('ATTESTATION')`；draft stage 拒；带外 stage 改写仍拒（`:221-222`）。
6. `:226-240` 篡改事件 rawSha256 → 隔离。
7. `:242-254` 第二次 seal 新 requestId → 拒；Seal 回执恰 1 条。
8. `:256-266` 终态后带外改 byteHash → 拒。
9. `:268-282` 并发业务命令（带 CAS 回执）→ 旧冻结 Run 拒封。
10. `:283-301` 封存后合法业务改动，历史 Run 只读仍可见（revision 6、decisions 空）。
11. `:303-321` 读侧：伪造 boundChecks 状态 / 删 Seal 回执 → `getV3ReviewRunRecord` 返 undefined。
12. `:323-334` 读侧：伪造历史 Plan 绑定 → undefined。

未覆盖：`interrupted`/`needs-resume` 状态推导分支、`blockedApplicability>0` 场景。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出 + bindKey；封存/读侧全分支 | 已证实 | 逐行读 `:1-285` |
| 不可覆盖、无在先读拒 check、读侧防篡改 | 已证实 | 测试 `:127-334` 断言 |
| `getV3ReviewRunRecord` 无生产消费方 | 已证实（负向） | 冻结树 apps+packages 全检索仅本文件+测试命中 |
| state 推导三分支语义 | 已证实 | `:115-119/:245-249` + 测试 1/2 |
| `currentSourceValidityBlockers`/`validateV3ExecutionProposal` 内部 | 未知 | 跨批文件未逐行读 |
| `needs-resume`/`interrupted` 运行时行为 | 未知 | 测试未触达 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `sealV3ReviewRun` 全校验链 | §3.2 | `:134-285` | covered |
| `getV3ReviewRunRecord` 全复核 | §3.1 | `:45-129` | covered |
| `bindKey`/两接口 | §2 | `:27-39` | covered |
| 测试 12 用例断言 | §9 | 测试行号 | covered（NOT_RUN） |
| 负向：读函数无生产消费 | §10 | 检索口径见 §4 | covered |
| 跨批依赖内部 | §10 | — | unknown |
