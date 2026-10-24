---
path: apps/electron/src/main/lib/review/review-v3-core-t03-run-gate.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: cec63549653e3e22c4510365878e28e619dbcf45
sha256: a7b3be7a5b935f236b87a4170e186c5170d4d05794ca0a21cfcf857c1687ba5d
lines: 285
kind: source
package: p05-review-engine
author: docs-r07-author-nb-47-20261023
reviewer: p05-review-engine
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-core-t03-run-gate.ts

## 1. 结论与边界

V3 R01/T03「真实 Run 身份 + 按动作的决定就绪」纯领域门（文件头 :1-11）：`assessT03RunAction` 对照 Main 冻结的 Run 证据判定动作是否被 Run 背书；`selectT03CurrentRun` 取最新可证 current 的 Run。**技术完成 ≠ 业务放行**（:8-10）：通过本门不授权 actor/案卷模式/任务；这些由 Main 在 CaseAggregate CAS 事务内另行复查。

不做的事：无 IO、无 Actor 选择、不写 RunStore/CaseStore（:3-4）；不自载存储（`selectT03CurrentRun` 由调用方供列表与证明，:259-267 注释）。

## 2. 导出与关键符号

导出 6 条（`export` 逐条核 :15/:25/:45/:47/:168/:268）：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `T03AuthorizedException` | interface | `:15-23` | `{checkId, authority:'template-allowed-exception', policyVersionId, actorId, reason}` | Main 核验的模板例外 |
| `T03TrustedRunEvidence` | interface | `:25-43` | `inputSnapshotFresh`（必）+ `runPlanFingerprint?`/`expectedCheckIds?`/`manualOnlyTemplate?`/`exceptions?` | Main 提供的证明（:26-31 注释：缺证≠肯定结果） |
| `T03GateAction` | type | `:45` | `= T05LocalStageAction`（`review-v3-t05-local-stage-plan`） | 动作枚举 |
| `T03RunGateResult` | interface | `:47-54` | `{action, allowed, runCurrent, blockers[], nonCompliantCheckIds[]}` | 结果 |
| `assessT03RunAction` | function | `:168-256` | `(input{aggregate, run, action, evidence?}) => T03RunGateResult` | 主判定 |
| `selectT03CurrentRun` | function | `:268-285` | `({aggregate, runs, prove}) => ReviewRunV2 \| undefined` | 倒序选最新 current |

内部函数：`documentVersionsMatch`（:56-77）、`checkLedgerMatches`（:79-133）、`supplementIsOpen`（:135-139）、`resolvedByHuman`（:141-151）、`authorizedException`（:153-161）。

## 3. 内部逻辑与关键流程

### 3.1 `documentVersionsMatch`（:56-77）

run.inputManifest.documentVersions 必须是数组；当前案卷文档按 versionId 建表（重复/缺 versionId → false）；recorded 数量与现表 size 相等；逐条 versionId 唯一、contentHash 与 documentId 双向全等（:71-75）。

### 3.2 `checkLedgerMatches`（:79-133）

checkId 缺失/重复 → blocker（:83-85）；coverage 四计数必须为合法非负整数且 `effectiveVerdicts<=planned`、`completed<=planned`（:87-98）；`effectiveVerdicts === compliant+non-compliant 计数`（:100-102）；`plannedChecks === checks.length`（:103-105）；**awaiting 双计**语义（注释 :106-108）：`completedChecks = 非(not-executed/execution-failed)`、`pendingChecks = awaiting-confirmation|awaiting-supplement|not-executed|execution-failed`（:109-114），不符即 blocker；零检计划无 `manualOnlyTemplate` → blocker（:116-118，「不能将空检查结果当成通过」）；有 `expectedCheckIds` 时集合双向相等 + `plannedChecks === expected.size`（:120-131）。

### 3.3 `assessT03RunAction`（:168-256）顺序

1. `nonCompliantCheckIds` 提取（:172-173）。
2. `return-for-supplement` 无需 Run 即放行（:178-183，`runCurrent:false`）。
3. 无 run/evidence → 阻断（:185-188，「没有 Main 验证的真实运行及其输入快照」）。
4. Run 身份（:189-196）：id 非空、`run@rev*` 前缀视为旧伪 Run、caseId/templateId/templateVersion/inputManifest.templateVersion 一致、inputManifest.hash 存在。
5. 输入新鲜度：`evidence.inputSnapshotFresh && documentVersionsMatch`（:197-199）。
6. CanonicalPlan 分支（:200-211）：`runPlanFingerprint` 全等 + plan.templateId/Version 与案卷一致；缺 `expectedCheckIds` 阻断。
7. Run 生命周期：`completed|partially-completed`（:213-215）。
8. `runCurrent = blockers.length === 0`（:216）——注意在 stage-pass 附加检查之前计算。
9. `stage-pass` 附加（:219-254）：须 `status==='completed'`（partially-completed 不得过，:220）；`checkLedgerMatches`；逐 check 分支（:222-250）：compliant 过；not-applicable 须非空 reason；non-compliant 须 `authorizedException`（:153-161：checkId 匹配 + `authority==='template-allowed-exception'` + policyVersionId/actorId/reason 非空）；awaiting-* 须 `resolvedByHuman`（:141-151：disposition ∈ human-confirmed-compliant/false-positive/waived + reason 非空 + `runId` 匹配或缺省 + findingKey 匹配 checkId 或 ruleId）；not-executed/execution-failed 阻断；未知状态阻断。
10. 未关闭补件计数阻断（:251-252，`supplementIsOpen`：open/responded/insufficient）。
11. 返回 `{action, allowed: blockers.length===0, runCurrent, blockers, nonCompliantCheckIds}`（:255）。

### 3.4 `selectT03CurrentRun`（:268-285）

倒序遍历 runs，跳过非 completed/partially-completed（:273）；以 `action:'final-reject'` 调 `assessT03RunAction`，`prove` 回调供证据（:275-280）；`result.runCurrent` 为真即返回（:281）；否则 undefined。注释 :259-267：替代 T05 旧 `currentT05Run` 扫描，避免旧 `inputManifest.documents` 字段的不存在假设。

## 4. 调用者与调用链

入向（全冻结树 `*.ts`）：
- 生产：`apps/electron/src/main/lib/review/review-runtime-contract.ts:15-17`（import `assessT03RunAction` + 两类型，spec :17），调用 `assessT03RunAction` :161/:185。
- 测试：`review-v3-core-t03-run-gate.test.ts:3`（批内，16 用例）。
- **否定**：`selectT03CurrentRun` 无生产调用者（符号全树检索仅命中本文件 :268/:276 与本批测试 :215 动态 import + :220/:226 使用）；`T03AuthorizedException`/`T03GateAction` 无外部引用。

出向（:12-13）：`@profer/shared` 类型（CaseAggregateV2/CheckResult/ReviewRunV2）；`review-v3-t05-local-stage-plan`（T05LocalStageAction :45）。

## 5. 数据 I/O、读写与副作用

无 IO、无副作用、无状态（依据：纯函数 + 仅类型导入 :12-13）。输入是已加载的 `CaseAggregateV2`/`ReviewRunV2` 值；输出纯数据。

## 6. 分支、失败、取消与恢复

- 无 throw（全部经 blockers 表达）；`runCurrent` 与 `allowed` 是两个不同维度（reject/return-to-previous-stage 可在 non-compliant 时被 Run 背书，:217-218 注释）。
- 失败语义：`allowed:false` + `blockers[]` 中文文案（用户可见）。
- 不适用「取消/恢复」：依据纯函数无状态。

## 7. 权限与权威状态

- 无 sender/role 检查（依据：无相关字段）；权限/actor/阶段合法性由 T05 planner 与 Main CAS 负责（:8-10/:253-254 注释）。
- 权威语义：Run 身份与输入快照新鲜度是唯一门槛；`evidence` 必须由 Main 供给（:26-31 注释）；`authorizedException`/`resolvedByHuman` 的身份可信度依赖上游录入（本文件只验字段完备性）。

## 8. 修改影响面

- `review-runtime-contract.ts`（T05 行为资格判定链）；动作枚举与 `T05LocalStageAction` 联动。
- blockers 文案是 UX 契约（测试以 `blockers.join()` 含「原件」子串断言）。
- 需同步测试：批内 `review-v3-core-t03-run-gate.test.ts`（16 用例）。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/review/review-v3-core-t03-run-gate.test.ts`（批内，1 describe/16 用例，NOT_RUN）。逐用例（见该文件手册 §2）：合法 stage-pass（:62）、21 人不合规可拒/退回不可过（:69）、模板例外双面（:77）、文档增删改哈希全 stale（:94）、documentId 换绑（:111）、effectiveVerdicts 计数（:118）、缺证据三负例（:125）、run@rev 假 Run/身份（:132）、CanonicalPlan 指纹+清单（:140）、零检/duplicate/分母（:158）、awaiting/not-executed/partially-completed（:167）、人工处置+stale runId 负例（:174）、not-applicable reason/补件（:191）、无 Run 仅可补件（:196）、输入顺序无关（:205）、selectT03CurrentRun 选旧不选 stale+缺证明 undefined（:214）。
- mock 边界：纯函数直调，fixture 为最小 CaseAggregateV2/ReviewRunV2 字面量（`as ReviewRunV2` 断言）。未覆盖：`manualOnlyTemplate` 与 `expectedCheckIds` 并存、`nonCompliantCheckIds` 空值形态、disposition 的 findingKey=ruleId 分支（:146）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 6 条与 §2 一致 | 已证实 | :15-268 |
| `return-for-supplement` 无需 Run | 已证实 | :178-183 |
| `run@rev*` 前缀判旧伪 Run | 已证实 | :192 |
| awaiting 双计（completed 执行+pending 业务） | 已证实 | :106-114 |
| stage-pass 须 completed（partially-completed 阻断） | 已证实 | :220 |
| 例外/人工处置字段完备性校验 | 已证实 | :141-161 |
| `runCurrent` 先于 stage-pass 附加检查计算 | 已证实 | :216 vs :219 |
| `selectT03CurrentRun` 无生产调用者 | 已证实（否定） | 全树符号检索（见 §4） |
| disposition 身份的真实性 | 未知（仅字段校验） | :141-151 |
| T05 planner 侧 actor/stage 合法性 | 未知（属他文件） | :8-10 注释 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `assessT03RunAction` 全分支 | §3.3/§9 | :168-256 | covered |
| `checkLedgerMatches` | §3.2 | :79-133 | covered |
| `documentVersionsMatch` | §3.1 | :56-77 | covered |
| `resolvedByHuman`/`authorizedException`/`supplementIsOpen` | §3.3 | :135-161 | covered |
| `selectT03CurrentRun` | §3.4/§4 | :268-285 | covered（无生产调用） |
| 4 个导出类型 | §2 | :15-54 | covered |
| manualOnly+expectedCheckIds 并存 | §9 | — | unknown |
| disposition 身份真实性 | §10 | — | unknown |
