# STAGE2 review-business 轨：关键调用链实证（CHAINS.md）

- 调查根：DSH docs-r07-index-qa-20261023（MiMo/max，本回合执行阶段二模块调查）｜时间锚 `date -u` 2026-10-23T21:29:01Z｜本文件首落 21:42Z
- 源：baseline/source@05fb2565e20eb1760233696be1832f68196b37c2（只读，HEAD 一致 clean=0）
- 证据口径：全部 file:line 为本人实读冻结源所得；manual 复用仅限已 accepted 哈希事实；**静态断言≠实测，真实运行 NOT_RUN**；未 accepted 稿=线索（标「待验」）
- 标记：**证实**=本轨实读到该边；**推断**=有相邻证据但未直读到边；**未知**=未覆盖

## 权威数据与持久化总览（先立坐标）

| 数据 | 权威写者 | 形态 | 证据 |
| --- | --- | --- | --- |
| 案卷聚合（caseV2 + receiptLog + caseArchive） | `case-store-v2.writeAggregate`（唯一业务写者） | JSON（每案聚合文件） | case-store-v2.ts:167（证实）；case-lifecycle-v3.ts:4 注「state.v2.json remains the only business writer」（证实） |
| 旧版案卷投影（ReviewCase V1） | `case-store.saveCase`（受 V2 守卫限制） | JSON 原子写（writeJsonAtomic） | case-store.ts:224-233（证实） |
| author 修订（workspace authoring） | `review-authoring-store-v1` | append-only revisions/<n>.json + sha256 digest | review-authoring-store-v1.ts:27/:13/:30/:51（证实） |
| run 事件/产物/检查点 | review-run-graph 回调（writeArtifact/writeCheckpoint）→ run-store-v2 | JSON（推断：store 读写未全读） | review-run-graph.ts:132（边证实；落盘形态推断） |
| 磁盘事务层 | `withC2CaseDiskTransaction` / `writeC2CaseStateDurably` | tmp+fsync+rename+父目录 fsync | review-v3-case-disk-tx.ts:78/:118-129（证实） |
| SQLite | **未见**——review 业务目录 grep `sqlite\|\.db` 无命中（证实「无直接引用」；是否存在间接驱动=未知） | — | 本轨 grep（证实） |

## C1 CREATE_CASE（旧入口）→ V1 案卷 JSON

IPC `REVIEW_IPC_CHANNELS.CREATE_CASE`（review-ipc.ts:146，入口白名单注释 :72）→ `createEmptyCase`（case-creation.ts:22-48）→ `saveCase`（case-store.ts:224-233）→ 案卷 JSON（getCaseFilePath，writeJsonAtomic）。

关键边与分支：
- case-creation.ts:35 `academicYear: input.academicYear.trim()` —— **trim 后无空串拒绝**（证实）；:30 `title` 空回退「未命名案卷」；:46 `saveCase`。
- case-store.ts:225 `assertWritableLegacyProjection`（V2 案卷禁止旧写口，:219 抛错原文「原生审核案卷禁止通过旧版案卷写入口修改」，证实）。
- case-store.ts:228 `writeJsonAtomic`（原子写，证实存在该调用）。
- **academicYear 空字符串结论**：经 C1 入口 `''`（或全空白）→ trim 为 `''` → saveCase 无字段校验（:224-233 仅 ID/路径/写盘校验）→ **空学年可持久化**（证实，静态）。对照 C2 模板入口对必填案卷字段另有校验（C2），两入口校验面不一致 → CONFLICTS#1。

## C2 CREATE_CASE_V2 → 案卷聚合（事务/回执）→ JSON

IPC `CREATE_CASE_V2`（review-ipc.ts:644，actor?: Actor、requestId/expectedRevision 入参可见）→ `bindC0LocalCreateIntent`（review-c0-authority.ts，review-ipc.ts:2 import 证实；函数体未逐行读=推断权限语义）→ `createCaseFromTemplate`（application-service.ts:146）→ `createAggregate`（case-store-v2.ts:269-284）→ `writeAggregate`（:167）。

关键边与分支：
- application-service.ts:146-220：模板已发布+政策依赖校验（文件头 :7-8 证实清单；模板发布校验行=推断，未逐行）；:205-206 `stage:'draft'`、`revision:0`；:210 CommandReceipt（payloadHash、actor、summary）。
- `allowIncompleteIntake`（:50-52 注释、CreateCaseOptions :56-58）：批量分案先入库后补录，仅允许暂缺必填案卷字段/必需分项，`submitCaseV2` 提交前统一阻断（注释 :53-55 证实；submitCaseV2 门禁行=待验）。
- case-store-v2.ts:269-284 `createAggregate`：不走 expectedRevision（revision=0 起，:269 注释证实）；已存在→INVALID_TRANSITION（:275）；**`authorizeAtCommit?.()` 在串行落盘时刻再验主能力**（:277 证实）；创建回执与创建动作同事务（:279-281 证实）。

## C3 业务命令链（UPDATE_FIELDS / UPSERT_CASE_SUBJECT / CORRECT_OBSERVATION / SET_EVIDENCE_LINK）→ CAS 事务 → JSON

IPC（review-ipc.ts:656 UPDATE_FIELDS_V2、:716 UPSERT_CASE_SUBJECT_V2、:721 CORRECT_OBSERVATION_V2、:727 SET_EVIDENCE_LINK_V2）→ 每条先 `bindC0LocalCaseCommand(event, caseId, channel, command)`（review-c0-authority.ts；actor/发送端绑定=推断，函数体未逐行）→ review-c0-case-service 的 `updateFieldsC0/upsertCaseSubjectC0/correctObservationC0`（require 惰性加载 :658-659/:718-719/:722-723 证实；wrapper→application-service 的转发边=推断）→ application-service 命令函数 → `case-store-v2.submitCommand`（:203-262）→ `writeAggregate`（:167）。

submitCommand 事务七步（全部逐行证实，case-store-v2.ts）：
1. :210 `assertSafeReviewStorageId(caseId)`（路径穿越防线）；
2. :211 `enqueueCase` 每案串行；
3. :212-220 读聚合 + 「可解析但损坏 JSON 永不成可写伪案卷」身份/revision/回执账完整性拒绝（:215-220）；
4. **幂等**：:222-228 同 requestId 同 payloadHash 同 type → 回放原回执；不同载荷 → `REQUEST_ID_COLLISION`；
5. **CAS**：:231-233 `command.expectedRevision !== aggregate.caseV2.revision` → `VERSION_CONFLICT`（携 currentRevision）；
6. **archived 门**：:235-241 仅 `RestoreReviewCaseV3` 可离开 archived，其余命令 `INVALID_TRANSITION`（注释明示唯一出口为 C-owned RestoreReviewCaseV3 with CAS/Actor/durable Receipt）；
7. :243-250 handler 抛错=整体拒绝不写部分数据；:253-254 `structuredClone` 草稿 + revision 事务统一 +1 一次（:9 注释「纯函数内部不再递增」）；:256-258 回执（actor+指派来源）；:261 回执与业务变化同一事务 `writeAggregate`。

命令层业务分支（application-service.ts，证实）：
- `updateFields` :331：入参 `expectedRevision`；:333 archived → INVALID_TRANSITION「已归档案卷不可修改」；:344-351 mutate（caseFields/subject.fields 按 scope 分流）。
- `correctObservation` :374-398：人工确认值不被 AI 覆盖、supersedes 链（文件头 :8 证实；recordObservation 落点 :390）。
- `upsertCaseSubject` :494-567：:500 archived 拒；**:501 非 draft 拒**（注释 :477「仅 draft 阶段可补录（已提交案卷走阶段办理/补件，不在入库补录里绕过门禁）」）；:480「走 V2 CAS/回执事务，重复 requestId 幂等」；:537-567 存在 subject 替换/新建两分支。
- `setEvidenceLink` :416-431：绑定目标/共享范围校验（文件头 :8）+ transitionEvidenceLink。

## C4 draft/archived 生命周期（权威状态）

- `archiveReviewCaseV3`（case-lifecycle-v3.ts:36-71）→ submitCommand(type=ArchiveReviewCaseV3)：已归档幂等返回（:48）；`caseArchive{previousStage, archivedAt, archivedBy}`（:60-65）；`stage='archived'`（:66）；已有未恢复归档再归档→history 追加（:57-59）。**证实**。
- `restoreReviewCaseV3`（:73-90）：仅 `archived`+未恢复+`previousStage!=='archived'` 可恢复（:78-79）；恢复后 `stage='draft'`（:87，**注意：不回 previousStage，落 draft**——实现事实，如实记录）。**证实**。
- 入口差异总结：draft 可补录（C3 upsertCaseSubject :501）；archived 除 Restore 外全拒（case-store-v2.ts:235-241）；旧 V1 口对 V2 案卷整体拒写/拒删（case-store.ts:219/:365）。

## C5 V1/双入口守卫 + updateCase 队列 CAS（含已证实现缺陷）

- case-store.ts:219 `assertWritableLegacyProjection`（V2→旧写口拒）；:357-365 `deleteCase`（V2→旧删口拒「请使用正式案卷归档流程」）。**证实**。
- `updateCase`（:278-304）：`enqueueCaseWrite` 每案队列（:243-255）→ 读最新→CAS→patch→`revision+1` 原子写回（:270 注释、:287-301 实现）。**证实**。
- **实现缺陷（留给阶段三设计差异报告，本阶段不修）**：:290-292 `if (options.expectedRevision !== undefined && ...)` —— **expectedRevision 缺省时 CAS 完全跳过**；与注释 :273-274「缺省视为 0：仅当盘上 revision 也是 0/缺省时接受」矛盾。→ CONFLICTS#2（implementation_gap）。同一文件另有注释 :276「跨进程乐观并发校验由渲染层随后续批次接入」=登记在案的缺口。

## C6 author revision 双入口（workspace authoring v1 / 模板 authoring v3）

- v1：`review-authoring-store-v1.ts` append-only `revisions/<revision>.json`（:27，命名正则 `^[1-9]\d*\.json$` :44）；记录 `digest=sha256(JSON.stringify(workspace))`（:13/:19/:30，不符即拒）；历史缺失→`AUTHORING_HISTORY_BROKEN`（:51）；workspaceId/revision 与文件名一致性校验（:56）。**证实**（store 层）。
- v1 服务层 `review-authoring-v1.ts`（338 行）与 v3 `review-template-author-store-v3-b1.ts` 的**双入口并存关系**=**待验**（本轨窗口内未逐行；线索：files 归属表显示二者同域，manual 均已 accepted——但归属≠调用证据，不作结论）。

## C7 review 执行 → 取消/失败补偿 → run 持久化

- `review-run-graph.ts`：取消语义——:7「取消后不再启动新节点；进行中节点完成后 run=cancelled，禁止后续决定/写回（A18/K18）」；:126 重申；:156 循环内 `cancelled()` 即 break；:200-201「cancelled 时未启动节点保持 pending，run=cancelled；**不产生完成事件（K18）**」。**证实**。
- 回调面：`onEvent/writeArtifact/writeCheckpoint/runId`（:132）——run 事件/产物/检查点经回调落 run-store（落盘形态=推断）。
- `interruptedResumeGate`（review-runtime-contract.ts:220）：中断恢复闸——签名实读存在；**fail-closed 语义（未知 effect 不重放）具体行=待验**（accepted manual 有此事实，标记复用手记待复核）。
- run-store-v2 的 RUN-43 拒止→续交状态机、`INTERRUPTED_RUN_MARKER`、写失败保留拒止=**待验**（accepted manual 已记（nb-15 批 accepted），本轨未重读行号）。

## C8 权威状态与磁盘事务/补偿

`review-v3-case-disk-tx.ts`（证实）：
- :78 `withC2CaseDiskTransaction`（每案磁盘事务）、:103 `withC2CaseDiskWriteSync`；
- :118-129 `writeC2CaseStateDurably`：tmp(`.uuid.tmp`, wx, 0o600)→writeFileSync→fsyncSync→renameSync→父目录 fsync（:16-17 import 面、:114-116 注释）；**目录持久化失败后调用方必须重读 receipt 再重试**（:115-116 注释，补偿契约）；
- :60 owner lock 写入含 fsync（并发权威边界）。

## C9 plan 链（published plan / plan-binding）与结果输出

- `plan-binding-v3.ts`（183 行）：首绑唯一不可变/升级需 Main ACK+authorizeRemoved/义务身份含来源版本集/删除双重来源复核=**待验行号**（accepted manual（nb-16 批 accepted）已记；本轨未逐行复核，标记复用待验）。
- 结果/报告输出（report-service/report-export-v2）→ 文件输出=**未覆盖**（窗口外，见 RESULT.json 缺口清单）。

## 去重：跨模块同名/易混符号唯一规范路径

| 符号 | 唯一规范路径 | 易混点 |
| --- | --- | --- |
| `enqueueCase`（V2 聚合队列） | apps/electron/src/main/lib/review/case-store-v2.ts | 与 case-store.ts `enqueueCaseWrite`（V1 每案写队列，:243）**同目录近义名**，两者独立实现 |
| `updateCase`（V1 patch+CAS） | apps/electron/src/main/lib/review/case-store.ts:278 | 与 application-service `updateFields`（V2 命令，:331）非同一入口，勿互指 |
| `academicYear` | 值域键：shared 类型；写入面 case-creation.ts:35（V1）/builtin-templates.ts:98/:211（模板 required）/migration.ts:141（迁移） | 同名三写入面，校验面不一致（见 CONFLICTS#1） |
| `.context/`（用户工作区） | apps/electron/src/main/lib/agent-prompt-builder.ts:1008-1014（会话级/工作区级两层定义） | 与仓根 .context/ 档案目录同名异物（既往 index 线已证，非本轨调用） |
