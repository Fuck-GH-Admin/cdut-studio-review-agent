---
path: apps/electron/src/main/lib/review/review-runtime-contract.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 31e198bddb432621c9d7eb77667d7badcb0159db
sha256: a1291c00629122e20819e31a72b55b214045a55e54d5a4c29e8f8aecfc07029c
lines: 232
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-runtime-contract.ts

## 1. 结论与边界

RUN-01/02/04/05/07/09/14/22 唯一业务 Run 合同（头注 :1-13）：Main 侧纯函数——回答①哪份 Run 是「用户审核动作」的权威业务 Run；②是否冻结可比较身份（attemptId/planFingerprint/input hash）；③诊断运行能否冒充业务 Run。**RUN-04：选择只从最新业务 attempt 开始，最新失败/执行中/取消绝不回退旧成功**；诊断 Run 不成为当前也不阻断选择。

边界：不写盘/不建 Run/不授予权限；T03 判定在 `review-v3-core-t03-run-gate`。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `RunAuthorityKind` | type | 15 | business-attempt/stage-evidence/diagnostic |
| `BUSINESS_PI_PREFIX`/`TEMPLATE_STAGE_PREFIX`/`DIAGNOSTIC_PREFIX` | const | 18-22 | `run-pi-`/`run-tpl-`/`run-diag-` |
| `classifyRunAuthority` | fn | 28-32 | 前缀分类（旧 `run-*` 视为 business，注释 :24-26） |
| `RunAuthorityDecision` | interface | 34-43 | run/kind/reason/blockedByRunId/t03 |
| `isSyntheticRunId` | fn | 47-49 | `run@rev*`/空串 |
| `FrozenAttemptIdentity`/`freezeAttemptIdentity` | interface/fn | 53-79 | 冻结身份（缺 planFingerprint → undefined，RUN-08） |
| `isSameAttempt` | fn | 82-86 | 同 attempt 判定 |
| `isCurrentBusinessRun` | fn | 91-93 | 诊断隔离 |
| `expectedCheckIdsFromPlan` | fn | 96-103 | `t04:` 公式（与 F07 同） |
| `buildT03Evidence` | fn | 108-122 | Main freshness→T03 证据 |
| `resolveCurrentBusinessRun` | fn | 127-171 | 当前业务 Run 选择 |
| `assessStagePassWithT03` | fn | 175-186 | T05 stage-pass 严门禁（RUN-05） |
| `decisionRunRelation` | fn | 190-207 | 决定引用校验（RUN-14/22） |
| `interruptedResumeGate` | fn | 212-231 | RUN-43 续跑闸门（默认 fail-closed） |

## 3. 内部逻辑与关键流程

1. **`freezeAttemptIdentity`**（:61-79）：缺 inputHash/planFingerprint/synthetic id → undefined（注释 :58-60 不拿 input hash 冒充计划指纹）；attemptId=sha256([caseId,templateId,version,inputHash,planFingerprint])。
2. **`resolveCurrentBusinessRun`**（:127-171）：只看 business-attempt、去 synthetic、startedAt 降序取最新（:129-133）；无 → `no-business-run`；queued/running → `latest-attempt-in-progress`+blockedBy（:138-144）；非 completed/partially-completed → `latest-attempt-{status}`+blockedBy（禁止回退，:145-149）；T03 不过 → `latest-attempt-not-current`（:151-162）；过 → `latest-attempt-current`+run。
3. **`decisionRunRelation`**（:190-207）：无 id→`unbound`；不存在→`missing-run`；当前→`current`；同 attempt→`same-attempt-history`；否则 `superseded`。
4. **`interruptedResumeGate`**（:212-231）：非可续交放行；`resumeInterrupted===true` 或 `mode==='restart'` 放行；否则拒绝+中文提示（「自动续跑可能重复发起上次未确认的模型请求，已拒绝…」，注释 :209-211 无耐久 effect journal 不重放未知 effect）。

## 4. 调用者与调用链

入向（生产）：`review-v3-t05-main-service.ts:27`（多函数）、`workspace-business-service-v2.ts:10`（resolveCurrentBusinessRun）、`review-pi-run-bridge.ts:13`（interruptedResumeGate）。测试：`review-runtime-contract.test.ts:15-18`。出向：`./review-v3-core-t03-run-gate`（:17-18）、`node:crypto`（:14）。

## 5. 数据 I/O、读写与副作用

纯函数；无 I/O/日志。

## 6. 分支、失败、取消与恢复

无 throw；全部经 `RunAuthorityDecision`/`{allowed,message}` 表达（fail-closed：最新失败不回退、续跑闸门默认拒绝）。

## 7. 权限与权威状态

- 业务 Run 权威：最新 business-attempt 优先，失败不回退（RUN-04，:137-149）；诊断隔离（:28-32/:91-93）。
- 身份权威：attemptId 冻结五元组（RUN-08 不冒充）；T03 绑定核验（:151-162）。
- 决定权威：superseded 决定只作历史展示（RUN-14/22，注释 :187-189）。
- 续跑权威：RUN-43 未知 effect 不自动重放（:209-231）。
- 无 sender/role 检查（Main 消费方负责）。

## 8. 修改影响面

T05 阶段办理/工作台业务就绪/Pi 续审三链；`expectedCheckIdsFromPlan` 与 F07 公式耦合。同测：`review-runtime-contract.test.ts`（13 用例）。

## 9. 测试证据

直接测试 `review-runtime-contract.test.ts`（13 用例 / 5 describe；纯函数+V2 存储（mkdtemp）；NOT_RUN）要点：
- 分类/冻结（3）：`run-tpl-`/`run-diag-`→diagnostic、`run-pi-`/`run-`→business、`run@rev` 不算当前（:57-66）；缺 planFingerprint→undefined（:69-75）；同输入同计划同 attempt、计划不同不同（:77-84）。
- RUN-04 选择（4）：最新失败不回退旧成功（`latest-attempt-failed`+blockedBy，:88-102）；running 阻断（:104-122）；诊断不影响选择（:124-135）；过期 `latest-attempt-not-current`（:137-144）。
- 决定/Check 清单（2）：superseded/same-attempt-history/unbound（:148-166）；`expectedCheckIdsFromPlan` 与 F07 公式一致（:168-183）。
- RUN-43（4）：崩溃 running→failed+可续交标记（`partially-completed`、diagnostics 含 marker 与 `resume-interrupted`、拒止解除，:187-210）；无检查点/无已接受检查不伪装可续交（:212-221）；闸门 fail-closed 两放行路径+提示含 `未确认的模型请求`（:224-232）；用户确认续交记「新回合」+「不会被重放」（:234-248）。

未覆盖：`assessStagePassWithT03`/`buildT03Evidence` 独立断言（经 T03 测试族）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 15 导出/行号如 §2 | 已证实 | 逐条 |
| RUN-04 不回退/诊断隔离/冻结身份 | 已证实 | :28-149 + 测试族 |
| RUN-43 fail-closed 续跑闸门 | 已证实 | :209-231 + 测试 :224-248 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 分类/冻结/isSameAttempt | §3.1 | 15-93 | covered |
| `resolveCurrentBusinessRun` | §3.2 | 127-171 | covered |
| `decisionRunRelation`/`expectedCheckIdsFromPlan` | §3.3 | 96-103/190-207 | covered |
| `interruptedResumeGate` | §3.4 | 212-231 | covered |
| `assessStagePassWithT03`/`buildT03Evidence` | §2 | 108-186 | covered（间接） |
