---
path: apps/electron/src/main/lib/review/review-c0-case-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7893e0e4546d4ff0e42b3be36edc7f0fcc19a1d0
sha256: eb4f61b621474c7396b87ed121e6535ad75d250b14e3b70b4994d879ec4ae643
lines: 114
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-c0-case-service.ts

## 1. 结论与边界

现有 V2 聚合/CAS/回执写入器（`case-store-v2` + `application-service`）之上的 **Main 授权包装**（头注 :1-2）：五个写服务先重核 `assertC0CaseAuthorization`，把 `Principal` 换成业务 `Actor` 再委托应用层；建案路径额外承担「旧 V2 建案身份/幂等/模板绑定」防伪，字段路径承担「**已发布模板**为字段类型权威」。

边界：不建 CaseV3 存储、不含 sender 校验（IPC 来源校验在 `review-c0-authority.ts`）；Renderer 不经 Main IPC 无法到达（无 handler 直暴露）；模板解析 `getTemplate` 与业务校验在 `template-store`/`application-service`。

## 2. 导出与关键符号

导出 5 个函数（无类型导出）：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `createCaseC0` | async fn | 20 | `(command: AuthorizedCaseCommand<CreateCasePayload>, templateId, version) => Promise<ReviewCommandResult<ReviewCaseV2>>` | 建案（含并发重放/防跨模板重放） |
| `updateFieldsC0` | fn | 71 | `(command: AuthorizedCaseCommand<UpdateFieldsPayload>) => …` | 字段写（已发布模板为类型权威） |
| `upsertCaseSubjectC0` | fn | 87 | `(command: AuthorizedCaseCommand<UpsertCaseSubjectPayload>) => …` | 申报事项补录（模板必须已发布） |
| `correctObservationC0` | fn | 101 | `(command: AuthorizedCaseCommand<CorrectObservationPayload>) => …` | 人工更正事实 |
| `setEvidenceLinkC0` | fn | 108 | `(command: AuthorizedCaseCommand<SetEvidenceLinkPayload>) => …` | 证明关联绑定/状态迁移 |

内部函数：`actorOf`（:16-18）：`Principal → Actor`，固定 `{actorId: principal.principalId, actorSource:'local', role:'reviewer'}`。

## 3. 内部逻辑与关键流程

1. **`actorOf`**（:16-18）：角色硬编码 `reviewer`。与授权断言一致：`assertC0CaseAuthorization` 只放行 `local+local-device+reviewer`（`packages/shared/src/types/review-v3-c0.ts:180`），因此 `principal.role` 实际恒为 `reviewer`。
2. **`createCaseC0`**（:20-58）：
   - 重核授权 `assertC0CaseAuthorization(command,'CREATE_CASE_V2')`（:24）；身份/版本防伪：`expectedRevision===0 && requestId===\`create-${caseId}\`` 否则 `CommandValidationError('VALIDATION_FAILED','Legacy create identity/revision mismatch')`（:25-27）；载荷 hash 复算比对 `payloadHash('CreateCaseFromTemplate', payload)===command.payloadHash`（:28-30，与绑定层 `review-c0-authority.ts:80-82` 双重校验）。
   - `replayOrReject(prior)`（:31-43）：在 `prior.receiptLog` 找同 `requestId` 回执；**仅当** `templateId`、`templateVersion`、`receipt.type==='CreateCaseFromTemplate'`、`receipt.payloadHash` 四者都与本次一致才幂等返回 `{ok:true, receipt, aggregate:prior, entity:prior.caseV2}`（:35-40，注释 :33-34「历史 V2 回执只哈希载荷不含模板绑定，此处双维度执行」）；否则抛 `CommandValidationError('REQUEST_ID_COLLISION','REQUEST_ID_COLLISION: case or template already exists with a different create request')`（:41-42）。
   - 先读 `readAggregate`：已存在 → `replayOrReject`（:44-45）；否则 `createCaseFromTemplate(templateId, version, payload, actorOf(principal), caseId)`（:47）。
   - 并发补救（:48-57）：若抛错是 `CommandValidationError('INVALID_TRANSITION')`（第二个相同并发建案输掉 `createAggregate` 锁，`case-store-v2.ts:276`）→ 重读聚合，仅对**完全一致的赢家**重放（:52-55）；其余错误原样 fail-closed 重抛（:56）。
3. **`updateFieldsC0`**（:71-86）：重核 `UPDATE_FIELDS_V2`（:72）→ `readAggregate` 后用案卷绑定的 `templateId@templateVersion` 取模板（:73-76）；**模板存在但未发布** → `INVALID_TRANSITION '案卷绑定的模板版本尚未发布，字段类型无权威来源，暂不允许写入'`（:77-80）；聚合不存在则模板置 `undefined`（:81）→ 委托 `updateFields(caseId, {requestId, expectedRevision, payload, actor}, template)`（:82-85）。类型规则（注释 :60-70）：已发布模板 → 按 FieldSpec 校验 kind/scope/选项并按类型写入；无模板记录（历史/合成案卷）→ 文本回退（`application-service.ts:347/:354` `toFieldValueV2(spec ?? {kind:'text'}, …)`）——即 T08 非 text 字段缺陷的修复点。
4. **`upsertCaseSubjectC0`**（:87-99）：重核 `UPSERT_CASE_SUBJECT_V2`（:88）；聚合缺失 → `NOT_FOUND '案卷聚合不存在'`（:90）；模板缺失**或**未发布 → `DEPENDENCY_UNRESOLVED '案卷绑定的模板不存在或未发布，不能写入申报事项'`（:91-94，注意比 updateFieldsC0 严格：无模板也拒）→ 委托 `upsertCaseSubject(…, template)`（:95-98）。
5. **`correctObservationC0`**（:101-107）/ **`setEvidenceLinkC0`**（:108-114）：仅重核授权后透传 `correctObservation`/`setEvidenceLink`（附 `actor`）。

## 4. 调用者与调用链

入向（全树 grep `review-c0-case-service`）：
- 生产唯一入口 `review-ipc.ts` 的五个 handler（均 `require` 动态加载）：`CREATE_CASE_V2` :648（`createCaseC0`）、`UPDATE_FIELDS_V2` :658、`UPSERT_CASE_SUBJECT_V2` :718、`CORRECT_OBSERVATION_V2` :723、`SET_EVIDENCE_LINK_V2` :728；命令对象由 `bindC0LocalCaseCommand/bindC0LocalCreateIntent` 先绑定（:647/:657/:717/:722/:727）。
- 测试：`review-c0-field-kind.test.ts:16`（`await import` 取 `updateFieldsC0`）、`review-c0-subject-upsert.test.ts:18`（`upsertCaseSubjectC0`）。

出向：`./case-store-v2` `payloadHash/readAggregate/CommandValidationError`（:8）；`./template-store` `getTemplate`（:9；`template-store.ts:253-259`，published+retired 会降级 `deprecated`）；`./application-service` 五个业务函数与载荷类型（:10-14）；`@profer/shared` `assertC0CaseAuthorization`（:4-7）。

委托行为（跨文件证据）：`createCaseFromTemplate`（`application-service.ts:146-218`）要求模板存在且 `status==='published'`（:155-157 `只有已发布模板可创建真实案卷`）、政策引用校验（:158-161）、字段作用域/必填校验（:162-183），建案回执 `requestId:\`create-${caseId}\``（:210）；`updateFields`（:331-363）归档拒绝 + 模板逐键校验 + 事项存在校验（:351 `NOT_FOUND`）；`upsertCaseSubject`（:494-570）仅 `draft` 阶段（:502 `仅草案阶段可补录申报事项…`）、模板必须已发布（:505）、分项/必填/类型/枚举校验（:511-537）；`correctObservation`（:374-403）必须附理由、sourceRefs 必须当前版本在案（:380-385）；`setEvidenceLink`（:416-453）区分「已有关联状态迁移」与「新绑定」两路（:420-441）。

## 5. 数据 I/O、读写与副作用

- 本文件自身不读盘；`readAggregate`（经 `case-store-v2.ts:51-73`）读 `state.v2.json`（损坏回退 `.previous.json`）；`getTemplate` 读模板库（`template-store`）。
- 写入全部发生在委托函数的 `submitCommand`/`createAggregate` 事务内（`case-store-v2.ts:203-284`），回执与业务同事务落盘。
- 副作用：无日志/网络/窗口；失败即抛（`CommandValidationError`）或返回 `{ok:false}` 结果对象（由 `submitCommand` 语义决定）。

## 6. 分支、失败、取消与恢复

| 分支 | 结果 | 行 |
| --- | --- | --- |
| 授权不通过（scope/role） | throw `C0ContractError`（经 `assertC0CaseAuthorization`） | 24/72/88/102/109 |
| 建案 revision≠0 或 requestId 非 `create-*` | throw `CommandValidationError('VALIDATION_FAILED')` | 25-27 |
| 建案 payloadHash 不匹配 | throw `VALIDATION_FAILED` | 28-30 |
| 同 requestId 但模板/载荷不同 | throw `REQUEST_ID_COLLISION` | 41-42 |
| 并发建案输锁 | 重读赢家精确重放，否则原错重抛 | 48-57 |
| 字段写遇未发布模板 | throw `INVALID_TRANSITION` | 77-80 |
| 事项补录：聚合缺失 | throw `NOT_FOUND` | 90 |
| 事项补录：模板缺失/未发布 | throw `DEPENDENCY_UNRESOLVED` | 91-94 |

全部为同步拒绝或委托事务的原子结果，无部分写入；无取消/恢复逻辑（恢复语义在 `case-store-v2` 事务层）。

## 7. 权限与权威状态

- 每个入口**独立重核** `assertC0CaseAuthorization`（:24/:72/:88/:102/:109），不依赖绑定层一次性校验（纵深防御；绑定层在 `review-c0-authority.ts:91` 也各查一次）。
- `Actor` 由 Main 从 `Principal` 派生（:16-18），Renderer 无法注入 actorId；回执 `actor` 字段（`case-store-v2.ts:254`）即审计权威来源。
- 类型权威规则（本批主题「权威状态」重点）：**只有已发布模板的 FieldSpec 能决定字段类型**；未发布 → 拒写（:77-80）；无模板记录 → 文本回退（:81 + `application-service.ts:347/:354`），显式保留历史兼容而非静默拒绝（注释 :67-69）。
- 事项补录模板门禁更严（无模板即拒，:91-94），与字段写的回退差异是**现存实现差异**，照实记录。

## 8. 修改影响面

- 改动直接影响 `review-ipc.ts` 五个写通道的返回（`ReviewCommandResult`）与错误抛出；渲染层依赖 `REQUEST_ID_COLLISION`/`INVALID_TRANSITION` 等文案。
- `payloadHash` type 字符串（`'CreateCaseFromTemplate'`）必须与 `case-store-v2.payloadHash` 消费方（回执复核点）及 `COMMAND_TYPE` 映射一致。
- 模板状态语义变更（draft/published/deprecated，`template-store.ts:253-259`）会影响 :77-80/:92-94 门禁。
- 需同步的测试：`review-c0-field-kind.test.ts`、`review-c0-subject-upsert.test.ts`（直接）；`review-c0-ipc.test.ts`（建案链路）。

## 9. 测试证据

直接测试（两文件在本批，详各自手册；此处列与本文件直接相关的断言）：
- `review-c0-field-kind.test.ts`（2 用例）：已发布模板下 `updateFieldsC0` 写入后 `readAggregate` 的 `caseFields.applicantCount`=`{kind:'number', value:18}`、`usageDate`=`{kind:'date', …}`、`organizationName`=`{kind:'text', …}`（:62-65）；非法数字值返回 `ok:false` 且 `code==='VALIDATION_FAILED'`（:79-82）。夹具：`mkdtemp` 配置根（:8-10）、动态 import（:12-17）、**手工构造 `AuthorizedCaseCommand`**（:20-30，绕过绑定层）。
- `review-c0-subject-upsert.test.ts`（4 用例）：补录分项持久化（subjects 1 条、`sectionId==='decl'`、`fields.projectName`=`{kind:'text', value:'数学建模'}`，:92-95）并可 `submitCaseV2` 进 `submitted`（:96-98）；已提交案卷补录拒绝（`message` 含「仅草案阶段」，:115-116）；越权 scope（`UPDATE_FIELDS_V2` 主体调补录）同步抛 `CASE_SCOPE_FORBIDDEN`（:125-128）；缺必填字段拒绝且 `subjects` 仍为空（:141-143）。夹具：真实 `registerMaterial`（:23-33）+ `submitCaseV2`，非手写聚合。

未覆盖（缺口）：`createCaseC0` 的 `REVISION`/hash/碰撞/并发重放分支无直接用例（仅 `review-c0-ipc.test.ts` 经 handler 间接覆盖建案三态）；`correctObservationC0`/`setEvidenceLinkC0` 无专属用例（`review-c0-ipc.test.ts:119-128` 经 handler 间接）；`updateFieldsC0` 的「无模板 → 文本回退」分支无用例。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出/1 内部符号行号如 §2 | 已证实 | :16-108 逐条 |
| 五个函数各自重核授权 | 已证实 | :24/:72/:88/:102/:109 |
| 建案幂等含模板绑定双维度 | 已证实 | :31-43；`review-c0-ipc.test.ts:91-95` |
| 并发建案只重放精确赢家 | 已证实 | :48-57；`review-c0-ipc.test.ts:98-104` |
| 字段类型权威=已发布模板，未发布拒写 | 已证实 | :71-86；`review-c0-field-kind.test.ts:49-83` |
| 无模板 → 文本回退（T08 修复语境） | 已证实 | :81 + `application-service.ts:347/:354` |
| 事项补录模板门禁更严（无模板也拒） | 已证实 | :87-94 vs :71-86 |
| `actorOf` 恒输出 reviewer | 已证实 | :16-18 + `review-v3-c0.ts:180` |
| 未发布模板字段写的用户体验/上游处理 | 未知 | 仅见测试直接断言抛错，渲染层处理未读 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `createCaseC0`（身份/hash/重放/并发） | §3.2/§6 | 20-58 | covered（部分未测已注明） |
| `updateFieldsC0`（模板三态） | §3.3/§7 | 71-86 | covered |
| `upsertCaseSubjectC0`（聚合/模板门禁） | §3.4 | 87-99 | covered |
| `correctObservationC0`/`setEvidenceLinkC0` | §3.5 | 101-114 | covered（间接测试） |
| `actorOf` | §3.1/§7 | 16-18 | covered |
| 无模板文本回退分支 | §7/§9 | 81 | partial（无用例） |
