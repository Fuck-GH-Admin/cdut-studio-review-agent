---
path: apps/electron/src/main/lib/review/run-service-v2.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8d54d818aa372c495b9d5480d1da736e9d5f2dcb
sha256: 56e0a19cf6ed98d9aedaba01965d81348e3637a96d0d937997ac4080da65d0b4
lines: 250
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/run-service-v2.ts

## 1. 结论与边界

V2 运行编排服务（M3，头注 :1-8）：`runReviewCaseV2` 创建运行（不可变输入 manifest）→ 执行运行图 → 每节点落盘（检查点持久化）；续跑时 done+同 hash 跳过（A11/A18）；取消走进程内注册表（K18）；事件经 `onEvent` 回调。

边界：节点执行器由调用方注入（`NodeExecutor`）；存储在 `run-store-v2`；运行图规划/执行在 `review-run-graph`；不含业务规则求值。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `cancelRunV2` | fn | 20-22 | 登记取消（进程内） |
| `isRunCancelled` | fn | 24-26 | 查询取消 |
| `computeRunInputHash` | fn | 29-56 | 不可变输入指纹（sha256） |
| `StartRunOptions` | interface | 80-91 | `{runId?, initiatedBy?, observationSnapshot?, evidenceSnapshot?, resumeRunId?, onEvent?, cancelled?, signal?}`（:89-90 注释：外部取消信号穿透到模型请求网络层） |
| `runReviewCaseV2` | async fn | 97-250 | 主编排入口 |

内部：`cancelledRunIds`（:18，`Set<string>`）、`effectiveRuleDependencies`（:58-79，规则字段依赖提取）。

## 3. 内部逻辑与关键流程

1. **`computeRunInputHash`**（:29-56）：材料 JSON 含 templateId/Version、`caseFields`（N2b 修正「旧 hash 缺 caseFields」，:35）、`reviewRules`、documents（**按 documentOrder 或 versionId 排序**，注释 :42-45：材料顺序是展示/流程关注点，重排不应使刚完成的运行失效；manifest 另存展示顺序）、每文档 `{id,hash,parseRevision,parseStatus,active}`、subjects、观察/证据快照；sha256 hex。注释 :41：`usage/unusedReason` 是运行输出，变化不使自身输入过期。
2. **`runReviewCaseV2(caseV2, template, executors, options)`**（:97-250）：
   - 续跑分支（`options.resumeRunId`）：`getRunV2` 读旧运行，校验同 runId/`inputManifest.hash` 一致（否则「输入变化」拒绝），保留 done+同 hash 检查点跳过（A11/A18，`readArtifact` 校验产物指纹 `dependencyHash`，不符重做——测试 :171-179）。
   - `planRunGraph` 规划节点图（`review-run-graph`），`executeRunGraph` 逐节点执行：每节点前后查 `cancelledRunIds`（取消即停，K18）；节点产物 `saveArtifact`、检查点追加 `CheckpointRecord` 并 `saveRunV2`（每节点后持久化）；`onEvent` 即时回调（`node-started` 等，测试 :39）。
   - 节点失败 → 运行 `failed`（error 记录）、前序产物保留（测试 :42-47）。
   - 收尾（:229-249）：`effectiveRuleDependencies`+`combineCoverage` 装配 `run.coverage`（无政策规则时 plannedChecks=0 如实为 0，测试 artifacts :82）；`allClearVerdictAllowed` 为 false 时把 blockers 追加 diagnostics（`coverage: …`，:244）；`completedAt` 仅 completed 时写（:246）；`saveRunV2` + 清取消登记（:247-248）。

## 4. 调用者与调用链

入向（生产）：`run-async-service.ts:10`（`cancelRunV2/isRunCancelled/runReviewCaseV2`，异步审核管线）；`review-v3-main-template-run.ts:21`、`review-d2-runtime.ts:17`、`workspace-business-service-v2.ts:8`、`pi-case-review-service.ts:177`（动态 require `computeRunInputHash`）——后者用于运行输入 manifest。测试：本批两个 + `real-chain-journey.test.ts:17`、`single-case-mvp.e2e.test.ts:13`、`case-lifecycle-v3.test.ts:11`、`review-v3-t05-business-mode.test.ts:20`、`batch-automation-service.test.ts:9`、`batch-group-action-service.test.ts:8`、`workspace-business-service-v2.test.ts:6`、`source-current-validity-v3.test.ts:5`。出向：`./review-run-graph`（:12）、`./run-store-v2`（:13）、`./case-store-v2 readAggregate`（:14）、`./effective-rules`（:15）。

## 5. 数据 I/O、读写与副作用

- 读写：`run-store-v2`（运行记录 + artifacts）；`readAggregate` 聚合；无网络。
- 进程内：`cancelledRunIds`（:18-26，注释 :17「单机桌面：跨进程取消无需持久化标记」）。
- 副作用：`onEvent` 回调（事件流）；无日志。

## 6. 分支、失败、取消与恢复

- 取消：`cancelRunV2` 登记后不启动新节点（K18）；收尾清登记（:248）。
- 失败：节点异常 → 运行 failed、前序检查点/产物保留（可续跑）；`error` 记录原因。
- 恢复：`resumeRunId` 从磁盘检查点恢复；done+同 hash 跳过；产物指纹不符（`dependencyHash`）→ 对应节点重做（:171-179 测试）。
- 输入变化：续跑时 `inputManifest.hash` 不一致 → 拒绝（防新旧输入混用）。

## 7. 权限与权威状态

- 输入权威：不可变 manifest（`computeRunInputHash` 指纹）；材料顺序不影响指纹（注释 :42-45）。
- 检查点权威：`CheckpointRecord` 每节点落盘；产物 `dependencyHash` 是恢复核验依据（R03）。
- 取消权威：进程内集合（单进程假设）。
- 无 sender/role 检查；执行器由调用方注入（注释「产品层由 buildReviewExecutors 提供，避免隐式默认执行器」位于 `batch-store.ts:650`（runBatchQueue 需注入 runCase），`StartRunOptions` 本身不含该注释——r1 更正原错误归属）。

## 8. 修改影响面

- `computeRunInputHash` 字段集是运行过期判定锚点，被 4 个生产消费方 + 8 个测试文件依赖；增删字段会使历史 `inputManifest.hash` 失配（`pi-case-review-service` 的续审/过期判定同受影响）。
- 编排顺序（每节点持久化）改动影响崩溃恢复语义与 `run-service-v2.artifacts.test.ts`。
- 同步测试：本批 2 个 + 8 个间接文件。

## 9. 测试证据

直接测试（本批两文件）：
- `run-service-v2.test.ts`（11 用例 / 1 describe；`PROFER_CONFIG_DIR=work/tmp` 隔离 :15-17；`ensureBuiltinTemplateDrafts` 真实模板 :19-22；假执行器全 kind done :30-33；NOT_RUN）。11 个 test 声明行（grep 实测 :37/:44/:51/:73/:95/:108/:117/:122/:131/:150/:171）：①材料读取状态变化不改 hash、parseRevision 变化改 hash（:37-43）；②材料顺序无关（:44-50）；③分项模板一次运行纳入全部分项标准分别覆盖（:51-68）；④workspace-only 规则进清单与 coverage 分母（`effectiveRuleIds` 3 条+hash 64 位+planned 3/pending 3，:73-93）；⑤completed 且检查点落盘可读回（:95-106）；⑥同 hash 续跑 done 跳过（A11，`parseCalls===0`，:108-115）；⑦**输入变化续跑拒绝**（K06，`rejects.toThrow('不能在旧运行上续跑')`，:117-120）；⑧执行前取消 K18（cancelled 落盘、completedAt undefined，:122-129）；⑨后续节点运行中前序检查点已落盘（:131-148）；⑩OCR 产物丢失续跑仅重做 OCR+下游（`{parse:0,ocr:1,extract:1}`，:150-169）；⑪产物指纹损坏同运行续跑重做（`calls===1`，:171-179）。
- `run-service-v2.artifacts.test.ts`（5 用例 / 3 describe；auto-check 合成运行图 :18-24；NOT_RUN）：每节点产物落盘且事件即时（首事件含 `node-started`，:31-40）；中途失败保留前序产物（:42-47）；产物删除后读回 undefined（:49-58）；caseFields 变化改 hash 且长度 64（:62-67）；无政策规则 plannedChecks=0、documents 0（:71-84）。

间接：`real-chain-journey.test.ts`/`single-case-mvp.e2e.test.ts` 等 8 文件。
未覆盖（缺口）：`isRunCancelled` 独立断言、`effectiveRuleDependencies` 各 constraint 分支、`onEvent` 事件全集；NOT_RUN。（r1 更正：原列「续跑输入变化拒绝」属误判——测试 :117-120 已测该分支。）

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出/内部符号行号如 §2 | 已证实 | 逐条 |
| 输入指纹含 caseFields、排除 usage、顺序无关 | 已证实 | :35/:41-50 + 两测试 |
| 每节点持久化、失败保留前序、产物损坏重做 | 已证实 | 测试 :42-58/:171-179 |
| 取消 K18（不启动新节点） | 已证实 | :18-26 + 测试 :108-121 |
| 覆盖装配无规则 plannedChecks=0 如实 | 已证实 | :229-244 + 测试 :82 |
| 跨进程取消能力 | 未知 | 进程内集合假设（:17 注释） |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `computeRunInputHash` | §3.1/§9 | 29-56 | covered |
| `runReviewCaseV2` 主链 | §3.2 | 97-250 | covered |
| 续跑跳过/产物指纹重做 | §3.2/§6 | +测试 171-179 | covered |
| `cancelRunV2`/`isRunCancelled` | §3/§6 | 18-26 | covered（isRunCancelled 未测） |
| 续跑输入变化拒绝（K06） | §6/§9 | 测试 :117-120 | covered |
| `effectiveRuleDependencies` 分支 | §3.2 | 58-79 | partial（未测） |
