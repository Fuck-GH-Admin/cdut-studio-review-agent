---
path: apps/electron/src/main/lib/review/review-ipc-actor-guard.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3e6870d3886972c8a509046f775819f9a6e98acc
sha256: e1812073348497d7cd7e71bc1e903458ebc36a43ee36e19b6dbae6734529eab8
lines: 158
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-ipc-actor-guard.ts

## 1. 结论与边界

旧版 V2 业务命令的**渲染层操作者身份边界**（头注 :1-7）：Renderer IPC 是不可信边界；本地桌面审核员只是应用内角色，**不是**学校/教师/Agent 认证。提供两类绑定：仅凭据形状校验 + Main 固定 actor 覆盖（`bind*`），以及附加主窗口/主帧来源校验 + Main 签发 Principal 的「统一收口」（`bindVerified*`，注释 :56-63）；另有补件判定人派生（RUN-17）与本地代录标注（AUTH-10）。

边界：不含业务校验/落盘；`issueLocalPrincipal` 的角色放行矩阵在 `review-principal-service.ts`；主窗口注册在 `main-window-state.ts`。

## 2. 导出与关键符号

导出 11 项（3 常量 + 2 接口 + 6 函数，逐条与 `export` 一致）：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `LOCAL_REVIEWER_ACTOR` | const | 17 | `Object.freeze({actorId:'local-reviewer',actorSource:'local',role:'reviewer'})` | 审核员固定 actor |
| `deriveLocalSupplementResolverActor` | fn | 30 | `(aggregate, supplementId) => Actor` | 补件判定人（按来源任务派生） |
| `bindLocalReviewerCommand` | fn | 46 | `<T>(command: T) => T` | reviewer 凭据形状校验 + actor 覆盖 |
| `VerifiedLocalCommand<T>` | interface | 64 | `{command: T; principal: ReviewPrincipal}` | 收口返回形状 |
| `assertReviewMainSender` | fn | 69 | `(event) => void` | 主窗口 + 主帧来源校验 |
| `bindVerifiedLocalReviewerCommand` | fn | 80 | `(event, command, scope) => VerifiedLocalCommand<T>` | 来源校验 + Principal 签发 |
| `LOCAL_SUBMITTER_ACTOR` | const | 101 | `{actorId:'local-student',…,role:'student'}` | 本地提交方固定 actor |
| `bindLocalSubmitterCommand` | fn | 107 | `<T>(command: T) => T` | 补件应答凭据校验 + actor 覆盖 |
| `LOCAL_PROXY_AUTHORIZATION` | const | 122 | `'LOCAL_OPERATOR_PROXY_NO_SCHOOL_DELEGATION'` | 代录标注常量 |
| `VerifiedSubmitterCommand<T>` | interface | 124 | `VerifiedLocalCommand<T> & {proxy: {...}\|null}` | 代录元数据形状 |
| `bindVerifiedSubmitterCommand` | fn | 133 | `(event, command, scope) => VerifiedSubmitterCommand<T>` | 补件应答统一收口 |

## 3. 内部逻辑与关键流程

1. **`deriveLocalSupplementResolverActor`**（:30-44）：在 `aggregate.supplements` 找 `supplementId`，经 `originTaskId` 找来源任务（:34-37）；`role = originTask?.assigneeRole==='teacher' ? 'teacher' : 'reviewer'`（:38）；`actorId = originTask?.assigneeActorId ?? (teacher?'local-teacher':'local-reviewer')`（:40）。注释 :24-28：渲染层自填 role/actorId 一律不参与派生；本地 teacher 只是「本机教师阶段试办」角色；最终任务归属仍由 stage-workflow 校验。
2. **`bindLocalReviewerCommand`**（:46-53）：`claim=command?.actor`，必须 `actorSource==='local' && role==='reviewer'`，否则 throw `本地审核 IPC 仅允许 reviewer 操作；教师、校方、系统或 Agent 权限必须经过可信服务授权`（:48-50）；返回**新对象** `{...command, actor: LOCAL_REVIEWER_ACTOR}`（:52），渲染层 actorId 被丢弃（注释 :51）。
3. **`assertReviewMainSender`**（:69-78）：`assertMainWindowSender(event, getMainWindow)`（`ipc-sender-guard.ts:30-34`）失败 throw `审核 IPC 仅允许主窗口调用（SENDER_UNTRUSTED）`（:70-74）；`event.senderFrame !== event.sender.mainFrame` throw `审核 IPC 仅允许主框架调用（子帧不具备业务权限）`（:75-77）。
4. **`bindVerifiedLocalReviewerCommand`**（:80-95）：`assertReviewMainSender`（:85）→ `command.actor` 已定义则 `assertNoRendererRoleEscalation`（:87；`review-principal-service.ts:142-152`，非本地可签发角色即 throw `ROLE_ESCALATION`）→ `issueLocalPrincipal({role:'reviewer', caseIds:[scope.caseId ?? \`local-scope:${scope.action}\`], actions:[scope.action], sessionId:\`local-main-webcontents:${event.sender.id}\`})`（:88-93）→ 返回 `{command:{...command, actor:LOCAL_REVIEWER_ACTOR}, principal}`（:94）。
5. **`bindLocalSubmitterCommand`**（:107-116）：凭据须 `local` 且 `role∈{student,reviewer}`，否则 throw `本地补件应答 IPC 仅允许本地提交方或审核员，不接受校方/教师/Agent 身份声明`（:108-112）；student → `LOCAL_SUBMITTER_ACTOR`，reviewer（代提交）→ `LOCAL_REVIEWER_ACTOR`（:115，注释 :113-114 明示代录也是 Main-bound）。
6. **`bindVerifiedSubmitterCommand`**（:133-158）：`assertReviewMainSender`（:138）→ 同上凭据检查（:139-143）→ `onBehalf = claim.role==='reviewer'`（:144）→ Principal 角色 `reviewer`/`student`（:145-150）→ 返回 `{command:{...command, actor: onBehalf?LOCAL_REVIEWER_ACTOR:LOCAL_SUBMITTER_ACTOR}, principal, proxy: onBehalf ? {onBehalfOf:'local-student', authorization: LOCAL_PROXY_AUTHORIZATION, submitterConfirmedByStudent:false} : null}`（:151-157）——代录显式标注「无校方委托授权、非学生本人确认」（注释 :118-121）。

## 4. 调用者与调用链

入向（全树 grep）：
- `review-ipc.ts:1` 导入 `bindLocalReviewerCommand/bindLocalSubmitterCommand/deriveLocalSupplementResolverActor`。`bindLocalReviewerCommand` 调用点（handler 内）：`RECORD_WORKSPACE_DISPOSITION_V2`（:734）、`OPEN_WORKSPACE_SUPPLEMENT_V2`（:739）、`ACKNOWLEDGE_WORKSPACE_MATERIAL_V2`（:744）、`DECIDE_WORKSPACE_CASE_V2`（:749）、`RECORD_WORKSPACE_SUBJECT_ADJUDICATION_V2`（:1033）、`RECORD_STAGE_DECISION_V2`（:1044）、`RESOLVE_SUPPLEMENT_V2`（:1049）、`CAST_RATING_V2`（:1148）、`RESOLVE_APPEAL_V2`（:1153）。`deriveLocalSupplementResolverActor`：`RESOLVE_SUPPLEMENT_V2`（:1058，作为 `actor` 传给业务）。`bindLocalSubmitterCommand`：`RESPOND_SUPPLEMENT_V2`（:1066）。
- `review-v3-f13-main-service.ts:11` 导入 `LOCAL_SUBMITTER_ACTOR`（:81/:92/:102/:108/:228/:233，F13 学生申诉提交/撤回）。
- `bindVerifiedLocalReviewerCommand`：唯一消费者是 `review-identity-authority.test.ts:143-146`（destroyed sender 拒绝）。`bindVerifiedSubmitterCommand`、`assertReviewMainSender`（外部）、`LOCAL_PROXY_AUTHORIZATION`（外部）**无生产/测试消费者**（全树检索仅本文件内部 :85/:138/:127/:155）。
- 测试：`review-ipc-actor-guard.test.ts`（7 用例直接）、`review-ipc-legacy-sender.test.ts:13/:108-112`（补件判定人派生 5 断言）。

出向：`../ipc-sender-guard assertMainWindowSender`（:10）、`../main-window-state getMainWindow`（:11）、`./review-principal-service issueLocalPrincipal/assertNoRendererRoleEscalation`（:12-15；`review-principal-service.ts:80-101/:142-152`）、`@profer/shared` 类型（:8）、`electron` 类型（:9）。

## 5. 数据 I/O、读写与副作用

纯内存：无磁盘/网络；`Object.freeze` 常量（:17/:101）；返回新对象不改入参（`review-ipc-actor-guard.test.ts:26/:36` 断言输入不可变）。

## 6. 分支、失败、取消与恢复

| 分支 | 结果 | 行 |
| --- | --- | --- |
| reviewer 命令缺/伪造 actor（来源/角色） | throw `本地审核 IPC 仅允许…` | 48-50 |
| 非主窗口/子帧 | throw `SENDER_UNTRUSTED`/`主框架` 文案 | 70-77 |
| Renderer 声明不可签发角色 | throw `PrincipalError('ROLE_ESCALATION')`（review-principal-service.ts:145-149） | 87 |
| 补件应答伪造校方/教师/Agent 身份 | throw `本地补件应答 IPC 仅允许…` | 108-112 / 139-143 |

无状态残留；无取消/重试。

## 7. 权限与权威状态

- **逐入口守卫事实**：`bind*` 只校验凭据形状、不校验来源（注释 :57-59 明示单独使用「只等于拒绝非 reviewer claim，不等于来源可信」）；`bindVerified*` 才叠加 `assertReviewMainSender` + Principal。生产 handler（`review-ipc.ts`）实际采用 **组合式**：各 handler 起始处 `assertC0ReviewMainSender(event)`（如 :732/:737/:742/:747/:1047/:1062，来自 `review-c0-authority.ts`）再 `bindLocalReviewerCommand`（:734 等）——等效于 `bindVerifiedLocalReviewerCommand` 的保护，但未使用该函数。注释 :60-61 的「凡是能写业务的 handler 都必须改用本函数」（AUTH-06）**未被实际接线**（`bindVerified*` 无生产调用者）——现存实现与设计注释的偏差，照实记录，不改码。
- 身份权威：`LOCAL_REVIEWER_ACTOR`/`LOCAL_SUBMITTER_ACTOR` 是 Main 固定常量，渲染层 actorId 一律丢弃（:51-52/:113-115）；代录必带 `LOCAL_PROXY_AUTHORIZATION` + `submitterConfirmedByStudent:false`（:154-156），防止读成学生本人确认。
- 补件判定人权威：Main 按补件来源任务派生（:24-28 RUN-17），教师角色仅限本地试办语义。
- 与 `review-principal-service` 的一致性：`issueLocalPrincipal` 仅签发本地角色，教师/评委/校方需外部授权（`review-principal-service.ts:81-85`，`externalAuthorization:'BLOCKED_EXTERNAL'` :107）。

## 8. 修改影响面

- 改 `bind*` 影响 `review-ipc.ts` 9+2 个 handler 的 actor 记账与拒绝文案；改 `deriveLocalSupplementResolverActor` 影响补件判定审计身份（`RESOLVE_SUPPLEMENT_V2` 回执 actor）与 `review-ipc-legacy-sender.test.ts`。
- `LOCAL_*_ACTOR` 常量被回执/审计消费（`review-v3-f13-main-service.ts`、`review-ipc.ts` 各业务回执），改值影响审计一致性与 `review-ipc-actor-guard.test.ts` 断言。
- `bindVerified*` 改动目前只影响 `review-identity-authority.test.ts`；若未来按 AUTH-06 接线，需迁移上述 handler。

## 9. 测试证据

直接测试 `apps/electron/src/main/lib/review/review-ipc-actor-guard.test.ts`（7 用例 / 2 describe；无 I/O、纯函数直调；NOT_RUN）：
- describe 1（:4-28）：`actorSource∈{system,agent,school,mock}` 全部 throw 含「本地审核 IPC」（:5-10）；`role∈{teacher,school-admin,student,system,template-owner}` 全部 throw（:11-15）；`{}`/`actor:null`/`actor:'reviewer'` 全 throw（:16-20）；合法 local/reviewer 通过且 `result.actor` 等于 `LOCAL_REVIEWER_ACTOR`、`requestId` 保留、**输入 command.actor 不被修改**（:21-27）。
- describe 2（:30-52）：student 通过但 actor 被绑定为 `LOCAL_SUBMITTER_ACTOR`、输入不可变（:31-37）；reviewer 代提交绑定为 `LOCAL_REVIEWER_ACTOR`（:38-43）；`role∈{teacher,system,school-admin}` 与 `actorSource∈{school,agent,mock}` 全部 throw 含「本地补件应答 IPC」，空命令 throw（:44-52）。

间接证据：`review-identity-authority.test.ts:143-146`（`bindVerifiedLocalReviewerCommand` 对 destroyed sender 的 fake event 抛错——mock event 非真实窗口）；`review-ipc-legacy-sender.test.ts:108-112`（派生：teacher 任务→`local-teacher`；reviewer 任务→`local-reviewer`；`assigneeActorId:'local-teacher-2'` 优先；无来源任务→`local-reviewer`；`aggregate===undefined`→reviewer）；`review-c0-ipc.test.ts:60-64`（handler 层伪造 actor 拒绝）。

未覆盖（缺口）：`bindVerifiedLocalReviewerCommand` 的 Principal 内容（scope/sessionId 派生）、`bindVerifiedSubmitterCommand` 全部分支（零消费者）、`assertReviewMainSender` 子帧分支、`assertNoRendererRoleEscalation` 交互、代录 `proxy` 形状均无断言；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 导出符号/行号如 §2 | 已证实 | :17-133 逐条 |
| 渲染层 actorId 被丢弃、actor 由 Main 常量覆盖 | 已证实 | :52/:115；`review-ipc-actor-guard.test.ts:24-26/:34-36` |
| 代录标注不可被读成学生确认 | 已证实 | :122-131/:154-156 |
| 生产 handler 组合式守卫（`assertC0ReviewMainSender`+`bind*`） | 已证实 | `review-ipc.ts:732-734` 等 |
| `bindVerified*`/`assertReviewMainSender`/`LOCAL_PROXY_AUTHORIZATION` 无外部消费者 | 已证实（否定） | 全树检索 |
| AUTH-06 注释要求 vs 现状偏差 | 已证实（实现矛盾记录） | :60-61 vs §4 |
| 补件判定人派生的 stage-workflow 复核行为 | 推断 | 注释 :28 所述下游校验在 `stage-workflow`（未逐行核） |
| 真实 Electron 事件下的主帧判定 | 未知 | 仅 fake/mock event 测试 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `LOCAL_REVIEWER_ACTOR`/`LOCAL_SUBMITTER_ACTOR` | §2/§7 | 17-21/101-105 | covered |
| `deriveLocalSupplementResolverActor` | §3.1 | 30-44 | covered |
| `bindLocalReviewerCommand` | §3.2/§7 | 46-53 | covered |
| `assertReviewMainSender` | §3.3 | 69-78 | covered（未测子帧） |
| `bindVerifiedLocalReviewerCommand` | §3.4 | 80-95 | covered（仅 smoke 测试） |
| `bindLocalSubmitterCommand` | §3.5 | 107-116 | covered |
| `LOCAL_PROXY_AUTHORIZATION`/`VerifiedSubmitterCommand` | §2/§3.6 | 122-131 | covered（未测） |
| `bindVerifiedSubmitterCommand` | §3.6 | 133-158 | covered（零消费者） |
