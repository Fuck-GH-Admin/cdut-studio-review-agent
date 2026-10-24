---
path: apps/electron/src/main/lib/review/review-d2-runtime.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0870321252376c4a6a024cd6af15790587d1ce12
sha256: 2c440458a579d12a808a835e769a9cb4dc9fcac9e6394d1e4009679d5267388a
lines: 547
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: p05-review-engine
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-d2-runtime.ts

## 1. 结论与边界

本文件把 D1 作者态（`ReviewAuthoringWorkspaceV1`）中已选的业务情景与业务对象，编译成一份**固定、不可发布**的 D2 技术预审计划（`D2RuntimePlan`），并通过既有 `submitCommand` 事务把业务主体（`ReviewSubject`）、语义规则（`RuleSpec`）和映射（`D2RuleBinding`）写入同一个 V2 案卷聚合；另提供安装后校验、档案逐操作证据门禁和 Pi 运行回执覆盖校验。运行时服务，不含 IPC/UI，也不发起模型请求。

边界：

- 不创建第二套 Agent 内核；D2 只把作者态责任投影成现有 Pi 可执行的语义检查（文件头注释 `apps/electron/src/main/lib/review/review-d2-runtime.ts:1-4`）。
- 不产生发布资格或行政决定：计划固定写 `mode:'technical-pre-review'`、`publicationAllowed:false`（`apps/electron/src/main/lib/review/review-d2-runtime.ts:305-306`）。
- 不写模板库；候选壳登记由调用方 `saveAuthoringCandidateDraft` 完成（`apps/electron/src/main/lib/review/review-d2-runtime.ts:68-83` 只返回对象）。
- 不直接读写运行存储；Pi 运行由 `pi-case-review-service.ts` 负责，本文件只校验其回执（`apps/electron/src/main/lib/review/review-d2-runtime.ts:498-547`）。

## 2. 导出与关键符号

`export` 逐条核对：7 个导出函数，0 个导出类型/常量。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `makeD2CandidateShell` | 函数（导出） | 68-83 | `(workspace, templateId, version) => TemplateVersion` | 生成最小草稿壳；先跑作者态校验，找不到源模板抛错；壳无字段/材料/政策/分项，仅 1 个 `manual-review` 阶段与 1 个 `item-feedback` 输出 |
| `compileD2RuntimePlan` | 函数（导出） | 142-317 | `(workspace, selection, caseV2, trustedStudentSnapshot?) => D2RuntimePlan` | 纯编译 + 校验；不落盘；生成规则、主体、映射与指纹 |
| `verifyD2InstalledPlan` | 函数（导出） | 320-360 | `(aggregate) => string[]` | 校验已安装计划与案卷模板/规则/主体/映射一致；空数组表示通过；无计划返回 `[]` |
| `attachD2RuntimePlan` | 函数（导出） | 366-417 | `(input) => Promise<ReviewCommandResult<D2RuntimePlan>>` | 通过 `submitCommand` 在草稿案卷上安装计划；支持原生未绑定案卷一并绑定模板 |
| `createD2TechnicalCase` | 函数（导出） | 425-468 | `(input) => Promise<ReviewCommandResult<D2RuntimePlan>>` | 专用建案入口：先编译，再 `createAggregate`，再 attach；两段独立事务 |
| `validateD2OperationEvidence` | 函数（导出） | 476-495 | `(aggregate, ruleId, status, documentVersionIds) => string \| undefined` | 档案类逐操作/开放状态的最低独立证据门禁；非档案目标返回 `undefined` |
| `verifyD2PiRun` | 函数（导出） | 498-547 | `(aggregate, run) => {complete:boolean;problems:string[]}` | 用真实 Run 的检查、输入哈希、有效规则哈希、SourceRef 与门禁复核覆盖 |
| `sha` | 内部 | 21 | `(value:unknown)=>string` | `JSON.stringify` 后 sha256；`undefined` 用字符串 `'undefined'` |
| `safe` / `ID` | 内部 | 22-23 | 正则 `/^[a-z][a-z0-9-]{0,79}$/` | 标识符白名单 |
| `toDemo` | 内部 | 24-28 | 工作区 → `DemoState` | 只取 revision/modules/templates |
| `sectionFor` | 内部 | 29 | `(key)=>'d2-scope-'+sha(key).slice(0,16)` | 业务对象分项 ID；B1 复用同一公式（`apps/electron/src/main/lib/review/review-v3-main-b1-local-plan.ts:100`） |
| `runtimeRuleId` | 内部 | 30 | `(checkId)=>'d2-'+sha(checkId).slice(0,20)` | 规则 ID |
| `runtimeCheckId` | 内部 | 31-32 | `(ruleId,subjectId,allSubjects)=>string` | Pi 运行检查 ID 的推导式，见 §3.6 |
| `scopeRef` | 内部 | 33-49 | `D2TargetBinding => ReviewSubject` | 业务对象转审核主体；`sourceRefs:[]`、`status:'confirmed'` |
| `digestPlan` | 内部 | 50 | `Omit<D2RuntimePlan,'fingerprint'> => string` | 计划指纹 |
| `d2CandidateShellProblem` | 内部 | 52-65 | `TemplateVersion \| undefined => string \| undefined` | 候选壳资格 + 壳纯净性检查 |
| `validateTargets` | 内部 | 85-121 | `(selection)=>void` | 逐目标种类校验；抛 `D2_TARGET_INVALID` 等 |
| `validateTrustedSnapshot` | 内部 | 124-136 | `(snapshot)=>void` | 仅接受 `controlled-synthetic` + `current` 的受控快照 |

## 3. 内部逻辑与关键流程

### 3.1 候选壳：最小、草稿、不可发布

`makeD2CandidateShell` 先调用 `validateReviewAuthoringV1(workspace)`，有错即 `D2_AUTHORING_INVALID`；随后在 `workspace.definitions.templates` 精确匹配 `templateId+version`，找不到抛 `D2_TEMPLATE_NOT_FOUND`（`apps/electron/src/main/lib/review/review-d2-runtime.ts:69-72`）。返回壳固定 `schemaVersion:2`、`fields:[]`、`materialSlots:[]`、`policyVersionIds:[]`、`policyRefs:[]`、`sections:[]`、单阶段 `manual-review`、单输出 `item-feedback`、`status:'draft'`（`:73-82`）。`createdAt` 取当前时间，不参与任何计划哈希。

`d2CandidateShellProblem` 的判定顺序（`:52-65`）：

1. 模板不存在、`status!=='draft'` 或 `isAuthoringCandidateDraft` 为假 → 返回“只能用于尚未绑定模板的新案卷”文案；
2. 壳夹带字段/材料槽/分项/政策/政策引用、输出不是唯一 `item-feedback`、阶段不是唯一 `manual-review` 且执行角色不是 `reviewer`、`objectType!=='document'` → 返回“夹带额外政策、静态规则、字段、阶段或审批输出”文案。

注意：第 1 条的文案同样覆盖“模板缺失/被占用/资格记录损坏”，并不只表示“案卷已绑定模板”；用户侧错误语义由调用方补充（`review-v3-main-d4-local-plan.ts:93-97` 另做已绑定拦截）。

### 3.2 编译前置门禁（`compileD2RuntimePlan`）

按执行顺序：

1. 作者态校验 `validateReviewAuthoringV1` → `D2_AUTHORING_INVALID`（`:148-149`）。
2. D3 冻结锁校验 `validateD3WorkspaceLocks(workspace,false)` → `D3_FROZEN_LOCK_INVALID`（`:153-154`）。`installed=false` 只校验本地 `sharedModuleLocks` 声明，不读已安装的 `review-d3-frozen-modules` 磁盘目录（`review-d3-workspace-locks.ts:17-35,44-54`）。
3. `workspace.advanced` 任一数组值非空 → `D2_UNMAPPED_ADVANCED`（`:155-157`）。
4. 模板必须存在于工作区且案卷模板/版本等于选择 → `D2_TEMPLATE_MISMATCH`（`:158-161`）。
5. 任一 `generic-object` 目标即 `genericMode`；与其它种类混用 → `D2_GENERIC_OBJECT_MIXED`（`:162-164`）。
6. 复合分支：`scenarios` 必须是 1–13 个唯一、安全的字符串，且不能与单数 `scenario` 并存 → `D2_SCENARIOS_INVALID`（`:166-169`）。
7. 分支与模板一致性：模板声明 `scenarios` 时选择必须非空且都在模板内（`D2_SCENARIO_REQUIRED`）；模板无 `scenarios` 时不得选择分支（`D2_SCENARIO_INVALID`）（`:171-175`）。
8. 校园卡/学籍范围：非全学籍目标时必须 `scenario + scenarioObjectKey + 单一 campus-card 目标且 objectKey 相等`（`D2_SCENARIO_SCOPE_REQUIRED`）；全学籍目标不得带 `scenarioObjectKey`（`D2_SCENARIO_SCOPE_INVALID`）；无分支模板不得声明 `scenarioObjectKey`（`:176-189`）。
9. `validateTargets`（`:190`）；受控快照校验（`:191`）；快照只能配合全 `student-field` 目标（`:192-194`）；学籍目标必须全有或全无（`:195-198`）。

### 3.3 预览展开与对象登记

- `genericMode` 走 `compileD4Generic(workspace, selection)`，否则按 `selectedScenarios` 逐分支调用 `previewDemo`；多分支时任务按 `checkId` 去重，`previewFingerprint` 由“情景 + 各预览指纹 + 去重检查键”再哈希（`apps/electron/src/main/lib/review/review-d2-runtime.ts:199-206`）。
- 任一预览 `blocked` → `D2_PREVIEW_BLOCKED` 并拼接 issues（`:203`）；非 generic 且零任务 → 同样 `D2_PREVIEW_BLOCKED`（`:207`）。
- 目标登记表以 `objectKey` 为键；`scenarioObjectKey` 必须已登记（`:208-211`）。
- 来源按 `sourceId`、绑定按 `checkId`（键为 `templateId@version:checkId`）建表（`:212-213`）。
- 若预览任务绑定了 `studentScope` 而选择里没有学籍目标 → `D2_STUDENT_SCOPE_REQUIRED`（`:218-219`）。
- 学籍任务展开：`studentTargets` 按 `source.studentScope.fieldKeys` 过滤，逐字段生成 `instanceCheckId = checkId + '#' + objectKey`，并按 `intents`/`enrollmentStatuses`/快照三态计算 `applicability`：意图不匹配 → `unknown`；无学籍状态限制 → `applicable`；有限制但无快照 → `unknown`；否则按快照 `enrollmentStatus` 命中与否给 `applicable`/`not-applicable`（`:227-234`）。学籍目标存在却没有任何字段级实例 → `D2_STUDENT_SCOPE_REQUIRED`（`:236-238`）。

### 3.4 规则与映射生成（逐 `expanded` 项）

关键点（`apps/electron/src/main/lib/review/review-d2-runtime.ts:239-300`）：

- `objectKey` 取任务自带键；模块级任务（`checkId` 以 `module/` 开头）回落到 `selection.scenarioObjectKey`（`:241`）。未登记对象 → `D2_SCOPE_MISSING`（`:243`）。
- 来源绑定缺失/空 → `D2_SOURCE_MISSING`（`:245-247`）。
- 权威性：任务来源是 `cross-school-reference`，或任一来源缺失/为 `cross-school-reference`/`policy-candidate`/`applicability!=='request-scope'` → `unverified-policy`，否则 `request-scope`（`:248-253`）。
- `generic-object` 必须由 `sourceBinding.genericScope.businessTypes` 覆盖其 `businessType`（`:255-257`）。
- `student-field` 且有材料门禁时，门禁替代事实标签必须全部以 `d2:student:<fieldKey>:` 开头（`:258-261`）。
- 规则文本把责任、完成标准、边界、来源清单、行政边界、未核实校规提示、学籍适用性提示、结构化门禁 JSON 依次拼接（`:262-277`）。`RuleSpec` 固定 `execution:'semantic'`、`semanticOutputEnum:['compliant','non-compliant']`、`onFail:'manual-review'`、`onUnknown:'needs-confirmation'`、`priority:50000+index`；`confirmation` 仅在 `request-scope` 时为 `confirmed`（`:278-286`）。
- 映射记录 `checkId/ruleId/objectKey/subjectId/sourceIds/authority/applicability`，并对 generic/student 目标附加 `evidenceCoverage`，有门禁时 `structuredClone(gate)`（`:287-299`）。
- 所有登记目标必须至少被一条责任使用，否则 `D2_UNUSED_TARGET`（`:301-303`）；规则 ID 冲突 → `D2_RULE_COLLISION`（`:304`）。

### 3.5 计划定型与指纹

`bare` 计划写入 `schemaVersion`（generic=3，学籍=2，其它=1）、`mode`、`publicationAllowed:false`、可选受控快照、工作区身份、模板身份、单/多情景、`authoringDigest=sha(workspace)`、`previewFingerprint`、`targets` 克隆、`subjects`（由 `scopeRef` 生成）、`rules`、`mapping`；最后 `fingerprint=digestPlan(bare)`（`apps/electron/src/main/lib/review/review-d2-runtime.ts:305-316`）。

### 3.6 安装后校验（`verifyD2InstalledPlan`）

- 无 `d2RuntimePlan` → 返回空数组（表示“不是 D2 案卷”，不是“通过”）（`:321-322`）。
- 候选壳问题直接作为一条问题（`:324-325`）；`fingerprint` 必须等于去掉指纹后的重算值（`:326,330`）。
- `schemaVersion` 只能是 1/2/3；有 `generic-object` 必须为 3，有 `student-field` 必须为 2；`mode` 与 `publicationAllowed` 固定（`:327-330`）。
- 案卷模板必须与计划一致，`caseFields.d2PlanFingerprint` 必须是文本且等于计划指纹（`:333-337`）。
- 案卷规则中不得有计划外规则（`:338-339`）；计划内每条规则必须与已存规则逐字节一致（`sha` 比较，`:340-341`）；另有 `d2-` 前缀的额外规则检查（`:342-344`，与 `:338` 部分重叠）。
- 案卷主体不得有计划外主体（`:345-346`）；计划主体必须与已存主体一致（`:347-350`）。
- 每条映射：规则必须存在、`sourceIds` 必须等于规则 `sourceRefIds`；有对象键时主体必须匹配且规则分项等于 `sectionFor(objectKey)`；无对象键时不得带 `subjectId`/`sectionId`（`:351-358`）。

`authoringDigest` 与 `previewFingerprint` 只做“随计划内容一起被指纹覆盖”的校验，没有工作区可供重算，因此不能证明作者态未被替换（见 §10 推断项）。

### 3.7 安装事务（`attachD2RuntimePlan`）

`submitCommand` 的 handler 内（`apps/electron/src/main/lib/review/review-d2-runtime.ts:379-416`）：

1. 案卷必须 `stage==='draft'` 且尚无 `d2RuntimePlan`，否则 `INVALID_TRANSITION`（`:380-382`）。
2. 原生未绑定案卷识别：首条回执类型为 `CreateNativeWorkspaceCaseV3`、模板为 `pending-template-v3@0`（`:385-387`）；此时用选择里的模板覆盖 `selectedCase` 的模板身份（`:388-395`）。
3. 模板必须存在且通过 `d2CandidateShellProblem`，否则 `AGENT_DECISION_DISABLED`（`:390-392`）。
4. `compileD2RuntimePlan`（`:396`）。
5. 案卷不得已有规则或主体，否则 `VALIDATION_FAILED`（`:397-399`）。
6. `mutate` 内（`:402-413`）：原生案卷写入模板/对象类型；追加计划主体；追加规则；写入 `d2PlanFingerprint`；写入 `d2RuntimePlan`；返回计划克隆。

`submitCommand` 负责逐案串行、CAS（`expectedRevision`）、幂等（`requestId+payloadHash`）与回执同事务落盘（`apps/electron/src/main/lib/review/case-store-v2.ts:203-262`）；磁盘层还使用 OS 目录锁、唯一临时名 + `rename`、文件与 POSIX 目录 `fsync`、`state.v2.json.previous.json` 备份（`review-v3-case-disk-tx.ts:78-149`）。

### 3.8 专用建案（`createD2TechnicalCase`）

- 入口校验：安全 `caseId`、非空标题、非空 `actorId`、`actor.role==='reviewer'`，否则 `VALIDATION_FAILED`（`:433-435`）。
- 模板壳校验（`:436-438`）。
- 构造 `revision:0` 的草稿案卷（`:440-445`），**先编译**以 fail-closed（`:446-447`）。
- 用 `CreateD2TechnicalReviewCase` 回执 `createAggregate`（`:448-456`），再以 `expectedRevision:0` 调 `attachD2RuntimePlan`（`:457-461`）。
- 若 attach 成功，再跑 `verifyD2InstalledPlan`，有问题抛 `D2 创建后计划核验失败`（`:463-466`）。
- 返回值就是 attach 的结果；attach 失败时返回 `ok:false`，但第一步创建的裸草稿已落盘。文件注释明确说明这一恢复路径：可用 `attachD2RuntimePlan` 显式恢复，绝不降级为已发布模板（`:419-424`）。

### 3.9 档案逐操作证据（`validateD2OperationEvidence`）

- 只对 `archive-operation` / `archive-item` 目标生效；找不到映射或目标直接返回 `undefined`（`apps/electron/src/main/lib/review/review-d2-runtime.ts:482-484`）。
- 只对 `compliant`/`non-compliant`/`not-applicable` 三种状态检查（`:485`）。
- 事实键：操作目标为 `d2:archive:<operation>`；档案级目标固定 `d2:archive:open-status`（`:486`）。
- 通过条件：`evidenceLinks` 中存在 `status==='confirmed'`、`linkedBy==='user'`、`subjectId` 等于目标主体、`supportsFact` 等于事实键、`documentVersionId` 在本次引用列表内，且该文档存在并 `active!==false`（`:487-492`）。
- 不满足返回中文问题串，包含对象键与事实键（`:493`）。

### 3.10 Pi 运行覆盖校验（`verifyD2PiRun`）

- 无计划 → `{complete:false}`（`:500`）。
- 先并入 `verifyD2InstalledPlan` 的全部问题（`:501`）。
- `run.status!=='completed'` → 问题（`:502`）。
- 用案卷当前 observations/evidence 快照重算 `computeRunInputHash`，必须等于 `run.inputManifest.hash`（`:503-509`）。
- 模板必须存在，且 `run.inputManifest.effectiveRuleSetHash` 必须等于当前有效规则集哈希（`:510-513`）。
- 对每条映射推导运行检查 ID：`check-<ruleId>-subject-<subjectId>` 或 `check-<ruleId>-case-<全部主体按字典序 join>`（`:31-32,517-518`）。检查必须存在、`ruleId` 一致、`target.subjectIds` 等于 `[subjectId]` 或全部主体（`:519-524`）。
- `execution-failed`/`not-executed` → 问题；`unverified-policy` 必须为 `awaiting-confirmation`；理由不能为空（`:525-529`）。
- 逐项调用档案证据门禁与 `validateD2GuardSubmission`（`:530-534`）。
- 确定性结论（`compliant`/`non-compliant`）必须有 SourceRef；每条引用必须对应 active 文档、`parseRevision` 一致、`contentHash` 存在且等于运行清单中的内容哈希（`:536-544`）。
- `complete` 仅当问题为空（`:546`）。

## 4. 调用者与调用链

入向（冻结树 grep，排除测试）：

| 调用方 | 使用点 | 说明 |
| --- | --- | --- |
| `apps/electron/src/main/lib/review/review-v3-main-d4-local-plan.ts` | `:14` 导入；`:119-123` 调 `attachD2RuntimePlan`；`:125` 调 `verifyD2InstalledPlan`；`:117` 调 `makeD2CandidateShell` | D4 50 套候选的 Main IPC 入口 `LOCAL_D4_ATTACH_PLAN_V3` |
| `apps/electron/src/main/lib/review/review-v3-main-b1-local-plan.ts` | `:11` 导入；`:146` 调 `verifyD2InstalledPlan` | B1 自定义候选自行构造计划，只复用安装校验 |
| `apps/electron/src/main/lib/review/pi-case-review-service.ts` | `:21` 导入；`:462` 准备 Pi 运行前校验；`:932` 提交结果前校验；`:992` 调 `validateD2OperationEvidence` | D2 案卷进入 Pi 的真实门禁 |
| `apps/electron/scripts/review-d2-plan.ts` | `:11` 导入；`:24` 编译；`:31` 候选壳；`:37` 建案；`:52` attach | 离线 CLI，非产品 IPC |

出向依赖：`case-store-v2.ts:203/271`（事务/建案）、`template-store.ts:253/358`（模板与候选资格）、`effective-rules.ts:104/108`（有效规则与哈希）、`run-service-v2.ts:29`（输入哈希）、`review-d2-execution-gates.ts:117`（结构化门禁）、`review-d4-common.ts:7`（generic 编译）、`semantic-module-demo.ts:358`（预览）、`apps/electron/src/main/lib/review/review-authoring-v1.ts:56`、`review-d3-workspace-locks.ts:17`。


`readAggregate` 只在 `:14` 导入，全文没有其它引用（静态未使用）。`verifyD2PiRun` 没有生产调用者：冻结树检索只命中 `review-d2-runtime.test.ts` 与设计文档；生产 Pi 服务使用 `verifyD2InstalledPlan` 与 `validateD2OperationEvidence`（`pi-case-review-service.ts:462,932,992`）。

本文件不注册 IPC；`LOCAL_D4_ATTACH_PLAN_V3` 的 sender 守卫在 `review-v3-main-d4-local-plan.ts:78/84/118/127`。

## 5. 数据 I/O、读写与副作用

输入/输出形状：

- 输入 `workspace: ReviewAuthoringWorkspaceV1`、`selection: D2ScenarioSelection`、`caseV2: ReviewCaseV2`、可选 `D2TrustedStudentSnapshotV1`；类型定义见 `packages/shared/src/types/review-d2.ts:65-150`。
- 输出 `D2RuntimePlan`：`targets/subjects/rules/mapping` + `fingerprint`（`packages/shared/src/types/review-d2.ts:132-150`）。

读写：

- 读模板库（`getTemplate`，`template-store.ts:253`）与候选资格控制记录（`isAuthoringCandidateDraft`，`:358`）——都是磁盘读取。
- 读案卷聚合（`submitCommand` 内部 `readAggregate`，`case-store-v2.ts:203-211`）。
- 写：仅 `attachD2RuntimePlan` 的 `submitCommand` 与 `createD2TechnicalCase` 的 `createAggregate`；写 `review-cases/<caseId>/state.v2.json`，逐案串行、单次 revision+1、回执同事务（`case-store-v2.ts:1-14,203-262`）。
- 无网络、无进程/窗口/通知/遥测；日志仅限 `console` 由下层使用。

原子性与幂等：

- `submitCommand` 用 `expectedRevision` 做 CAS；同 `requestId` 同载荷返回原回执，不同载荷返回 `REQUEST_ID_COLLISION`（`case-store-v2.ts:216-231`）。
- 计划内容通过 `structuredClone` 与案卷隔离（`review-d2-runtime.ts:307,313,408-412`）。
- `createD2TechnicalCase` 是**两段事务**：建案与 attach 不原子；attach 失败会留下裸草稿（`:419-424,456-461`）。

## 6. 分支、失败、取消与恢复

主要错误码（均在抛出点）：

| 错误码/文案 | 触发 | 行 |
| --- | --- | --- |
| `D2_AUTHORING_INVALID` | 作者态校验失败 | 70,149 |
| `D2_TEMPLATE_NOT_FOUND` | 候选壳找不到源模板 | 72 |
| `D3_FROZEN_LOCK_INVALID` | D3 冻结锁不一致 | 154 |
| `D2_UNMAPPED_ADVANCED` | 高级关系非空 | 156 |
| `D2_TEMPLATE_MISMATCH` | 模板/案卷模板不一致 | 160 |
| `D2_GENERIC_OBJECT_MIXED` | generic 与其它目标混用 | 164 |
| `D2_SCENARIOS_INVALID` / `D2_SCENARIO_REQUIRED` / `D2_SCENARIO_INVALID` | 分支集合非法/缺失/多余 | 168,173,175 |
| `D2_SCENARIO_SCOPE_REQUIRED` / `D2_SCENARIO_SCOPE_INVALID` | 校园卡主体范围非法 | 182,185,188 |
| `D2_TARGET_INVALID` / `D2_CUSTOM_OBJECT_INVALID` / `D2_GENERIC_TARGET_INVALID` | 目标字段非法 | 89,96,99,102,108,113,118,119 |
| `D2_TRUSTED_SOURCE_INVALID` | 快照非法或套用到非学籍目标 | 134,193 |
| `D2_STUDENT_OBJECT_MIXED` | 学籍目标与其它目标混用/同一责任双绑定 | 197,226 |
| `D2_PREVIEW_BLOCKED` | 预览阻断或零任务 | 203,207 |
| `D2_SCOPE_MISSING` | 分支对象/业务对象未登记 | 210,243 |
| `D2_SOURCE_MISSING` | 责任没有来源绑定 | 247 |
| `D2_STUDENT_SCOPE_REQUIRED` | 学籍责任无目标/无字段实例 | 219,237 |
| `D2_STUDENT_UNSCOPED_CHECK` | 学籍模板责任缺少字段约束或整案例外 | 223 |
| `D2_GENERIC_SCOPE_REQUIRED` | generic 对象未被业务类型覆盖 | 257 |
| `D2_STUDENT_EVIDENCE_SCOPE_INVALID` | 证据标签未绑定更正字段 | 260 |
| `D2_UNUSED_TARGET` | 目标无对应责任 | 302 |
| `D2_RULE_COLLISION` | 规则 ID 重复 | 304 |
| `INVALID_TRANSITION` | attach 时非草稿/已有计划 | 381 |
| `AGENT_DECISION_DISABLED` | 候选壳不合格 | 392,438 |
| `VALIDATION_FAILED` | 已有规则/主体，或建案入参非法 | 398,434 |

失败后的状态：

- `compileD2RuntimePlan` 纯函数，抛错不写盘。
- `attachD2RuntimePlan` 的 handler 抛错由 `submitCommand` 捕获为 `ok:false`，不写部分数据（`case-store-v2.ts:242-247`）。
- `createD2TechnicalCase` 的编译在建案前；建案后 attach 失败会保留裸草稿；attach 成功但 `verifyD2InstalledPlan` 失败会抛错，此时案卷与计划都已持久化（`:463-466`）。
- 无取消/超时/重试逻辑；恢复靠重新 `attachD2RuntimePlan`（对裸草稿）或新案卷（对已固定计划的案卷）。`verifyD2InstalledPlan` 不提供修复，只报告问题。

## 7. 权限与权威状态

- 本文件没有 sender/frame/窗口检查，也没有角色分支；它是 Main 侧服务。`attachD2RuntimePlan` 不校验 `actor.role`，只把 `actor` 原样写入回执；`createD2TechnicalCase` 要求 `role==='reviewer'`（`:433`）。
- 真实 IPC 守卫在调用方：`review-v3-main-d4-local-plan.ts:78,84,118,127` 调 `assertC0ReviewMainSender`；`review-v3-main-b1-local-plan.ts:21,122,128` 同。
- 权威资格来自模板库的 `candidate-held` 控制记录，不来自可编辑的 `sourceNote`（`template-store.ts:352-360`；测试 `review-d2-runtime.test.ts:391-407`）。
- 计划本身永远 `publicationAllowed:false`；`authority` 只区分 `request-scope` 与 `unverified-policy`，后者在 Pi 提交时只能得到 `awaiting-confirmation`（`:248-253,285`；门禁见 `review-d2-execution-gates.ts:117-122`）。
- 行政边界写进规则文本：“技术核验结果不能代替学校制度确认、授权或最终批准”（`:270`）。

## 8. 修改影响面

- 改导出签名会影响：`review-v3-main-d4-local-plan.ts`、`review-v3-main-b1-local-plan.ts`、`pi-case-review-service.ts`、`apps/electron/scripts/review-d2-plan.ts`，以及 3 个测试文件。
- 改 `sectionFor`/`runtimeRuleId`/`runtimeCheckId` 公式会同时破坏已安装计划的 `verifyD2InstalledPlan` 与 Pi 运行的检查 ID 对账；`runtimeCheckId` 还必须与 `pi-case-review-service.ts:374,774` 的生成式保持一致（`check-<rule>-<scope>-<subjects>`）。
- 改 `RuleSpec` 字段（`execution/semanticOutputEnum/confirmation/priority`）会影响 Pi 准备、提交、覆盖统计与报告。
- 改 `verifyD2InstalledPlan` 的严格度会影响 D4/B1 的安装回执、`preparePiReviewRunV2`（`pi-case-review-service.ts:462`）与提交（`:932`）。
- 改 `validateD2OperationEvidence` 会影响档案类结论的提交门禁与 `verifyD2PiRun`。
- 共享类型 `D2RuntimePlan`/`D2RuleBinding` 在 `packages/shared/src/types/review-d2.ts`；改类型需同步 D4 客户端、B1、Pi 与渲染层读取。

## 9. 测试证据

本文件**没有**被列入本批的专用测试；直接测试是 `apps/electron/src/main/lib/review/review-d2-runtime.test.ts`（不在本批 8 文件内，属间接证据，未逐行纳入本手册 scope）。该文件 16 个 `test(`，覆盖：编译（文本/校园卡/档案）、情景缺失与目标篡改、建案与 attach、安装后规则/主体篡改、Pi 准备/提交/逐操作证据、输入哈希过期、候选资格与 sourceNote 独立、候选壳发布拒绝、壳夹带规则拒绝（`review-d2-runtime.test.ts:96,119,140,160,171,192,200,214,235,246,289,350,377,391,409,416`）。

本批内间接覆盖：

- `apps/electron/src/main/lib/review/review-v3-main-d4-local-plan.test.ts:114-145` 直接调用 `attachD2RuntimePlan` 并断言 `schemaVersion=2`、`mapping.length>0`、`mapping.length===rules.length`、指纹 64 位、两个学籍主体、无 `not-applicable`、`verifyD2InstalledPlan` 为空。
- 同文件 `:147-178` 走真实 IPC handler，断言返回 checks/fingerprint、案卷模板被绑定、安装校验为空。
- 同文件 `:180-210` 断言已绑定模板被拒且零写入（`d2RuntimePlan` 仍 undefined）。
- `apps/electron/src/main/lib/review/review-v3-d4-catalog-attach.test.ts:59` 对 50 套逐一 attach 并断言每套 `checks>0`（不在本批）。

`NOT_RUN`：本轮未执行 `bun test`、typecheck、构建、GUI 或真实模型请求；以上只是静态阅读断言，不能表述为“测试通过”。

未覆盖/缺口（静态判断）：

- `custom-object` 目标的编译路径没有直接测试；B1 是自行构造计划而非调用 `compileD2RuntimePlan`。
- `verifyD2PiRun` 对“检查 ID 顺序/排序差异”的敏感性没有专门用例。
- `validateD2OperationEvidence` 的 `archive-item` 多档案共用 `d2:archive:open-status` 事实键，缺少跨档案隔离用例。
- 本文件没有并发 attach、进程崩溃、写盘失败注入测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 编译为纯函数，不落盘 | 已证实 | `review-d2-runtime.ts:142-317` 无写调用；写仅在 attach/create |
| 安装通过 `submitCommand` 单事务写案卷 | 已证实 | `:375-416`；`case-store-v2.ts:203-262` |
| 建案与 attach 是两段事务，attach 失败留裸草稿 | 已证实 | `:419-424,456-461` |
| 计划固定不可发布 | 已证实 | `:305-306,330` |
| 候选资格来自控制记录而非 `sourceNote` | 已证实 | `template-store.ts:352-360`；测试 `review-d2-runtime.test.ts:391-407` |
| `d2CandidateShellProblem` 第一条文案也覆盖“模板缺失/被占用” | 已证实 | `:52-56` 与调用点 `:391-392` |
| 额外 `d2-` 规则检查与“计划外规则”检查部分重叠 | 已证实 | `:338-339` 与 `:342-344` |
| `authoringDigest`/`previewFingerprint` 不能独立重算工作区 | 推断 | `:312,326-330`；校验函数没有 workspace 入参 |
| `custom-object` 编译路径缺少直接测试 | 推断 | 测试文件仅见 campus-card/archive/文本/学籍；grep 无 custom-object 用例 |
| 档案级事实键不区分 itemId，跨档案隔离依赖 subjectId | 已证实 | `:486-489` |
| Pi 检查 ID 与 `pi-case-review-service.ts` 的生成式一致（前提：D2 生成的 sectionId/主体唯一） | 已证实（静态） | `:31-32,517-524`；`pi-case-review-service.ts:374,774` |
| 并发 attach 的败者得到 `VERSION_CONFLICT` | 推断 | 由 `case-store-v2.ts:233-236` 的 CAS 推导；无并发测试 |
| `readAggregate` 导入但未使用 | 已证实 | `:14` 导入；全文无其它引用 |
| `verifyD2PiRun` 无生产调用者 | 已证实（冻结树检索） | 仅 `review-d2-runtime.test.ts` 与设计文档命中；生产用 `verifyD2InstalledPlan`/`validateD2OperationEvidence` |
| attach 继承 OS 目录锁/fsync/previous 备份 | 已证实 | `case-store-v2.ts:166-183`；`review-v3-case-disk-tx.ts:78-149` |
| `createD2TechnicalCase` 在校验失败后可能留下已持久化案卷 | 已证实 | `:463-466` 在 attach 成功后抛错 |
| `compileD2RuntimePlan` 对 `custom-object` 的适用性 | 未知 | 代码允许，但无测试/调用样例；B1 走独立构造 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `makeD2CandidateShell` 正常/缺模板 | §3.1 | 68-83 | covered |
| `d2CandidateShellProblem` 两分支 | §3.1 | 52-65 | covered |
| 作者态/D3 锁/advanced 门禁 | §3.2 | 148-157 | covered |
| 模板与案卷匹配 | §3.2 | 158-161 | covered |
| generic 混用/分支集合/校园卡范围 | §3.2 | 162-189 | covered |
| 目标校验各 kind | §3.2 | 85-121 | covered |
| 受控快照校验 | §3.2 | 124-136,191-198 | covered |
| 预览与去重/零任务 | §3.3 | 199-207 | covered |
| 学籍实例展开与三态 | §3.3 | 218-238 | covered |
| 规则/映射生成 | §3.4 | 239-300 | covered |
| 目标未使用/规则冲突 | §3.4 | 301-304 | covered |
| 计划指纹 | §3.5 | 305-316 | covered |
| `verifyD2InstalledPlan` 全部检查 | §3.6 | 320-360 | covered |
| `attachD2RuntimePlan` 正常/原生绑定/拒绝 | §3.7 | 366-417 | covered |
| `createD2TechnicalCase` 两段事务/失败 | §3.8 | 425-468 | covered |
| `validateD2OperationEvidence` | §3.9 | 476-495 | covered |
| `verifyD2PiRun` 各门禁 | §3.10 | 498-547 | covered |
| IPC 注册/守卫 | §4,§7 | 无（调用方 `review-v3-main-d4-local-plan.ts:76-133`） | covered（边界） |
| `custom-object` 编译 | §10 | 110-113 | partial |
| 并发/崩溃恢复 | §6,§10 | 203-262（case-store） | partial |
