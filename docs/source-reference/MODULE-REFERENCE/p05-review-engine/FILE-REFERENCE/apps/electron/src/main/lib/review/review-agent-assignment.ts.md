---
path: apps/electron/src/main/lib/review/review-agent-assignment.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e5636ccc4524fcd26109e3b361ddc424a2d48e23
sha256: d1a42842ba20149cd5438263287bedb566d6ee68610e017494458b395804b0ac
lines: 377
kind: source
package: p05-review-engine
author: docs-r07-author-nb-30-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---
# apps/electron/src/main/lib/review/review-agent-assignment.ts

## 1. 结论与边界

审核操作**可信指派**（08 设计 §2.2：显式指派是 Agent 写权限的唯一来源，`apps/electron/src/main/lib/review/review-agent-assignment.ts:1-10`）。UI/IPC 创建指派（绑定 sessionId/turnId/案卷或模板/动作范围/工作角色）；工具每次调用携带 assignmentId，服务端五重校验；建案型指派成功后绑 caseId（一指派一案）；撤销后新写入被拒、已完成动作保留时间线；仅用户发起轮（`triggeredBy='user'`）可创建/使用写权限；落盘两份轻量 JSON（`:9`）。

边界：不执行业务写本身（校验后由 pi-case-review-service 等执行）；不做身份认证（sessionId/turnId 由 Main 注入）；角色仅 reviewer/student（teacher/judge 决定角色不开放代操作，`:174`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `ReviewAssignmentAction` | type | 19-21 | 12 值：操作类 `list/create-case/register-material/submit-case/start-run/get-run-status/cancel-run/export-report` + 决定类 `submit-result/decide-stage/resolve-supplement/respond-supplement`（C2 决定类受代批开关二次约束，`:18`） | |
| `ReviewAgentAssignment` | interface | 24-57 | `{id;sessionId;turnId;caseId?;templateId?;templateVersion?;actions[];activeRunId?;workRole:'reviewer'\|'student';grantedBy{actorId,sessionId};createdAt;expiresAt?;turnPolicy?:'single-turn'\|'multi-turn';caseVisibility?{caseIds[]};revokedAt?;revokeReason?}` | AUTH-07 轮次策略（`:46-51`）、AUTH-09 可见范围（`:52-53`） |
| `CreateAssignmentInput` | interface | 154-167 | 创建入参（workRole/grantedByActorId/expiresAt 可选） | |
| `createAssignment` | function | 170-194 | `(input) => ReviewAgentAssignment` | |
| `revokeAssignment` | function | 197-218 | `(assignmentId, reason?) => boolean` | AUTH-08 双层撤销 |
| `bindCaseToAssignment` | function | 221-230 | `(assignmentId, caseId) => ReviewAgentAssignment` | 建案后绑定 |
| `bindRunToAssignment` | function | 233-243 | `(assignmentId, runId) => ReviewAgentAssignment` | 宿主绑定直接 Pi 运行 |
| `AssignmentCheck` | interface | 246-252 | `{ok;code?;message?;assignment?}`，code 联合 8 值 | |
| `checkAssignment` | function | 259-314 | 见 §3.3 | 工具调用前校验 |
| `listAssignments` | function | 317-324 | `(sessionId?) => ReviewAgentAssignment[]` | 拷贝返回 |
| `findActivePiReviewAssignment` | function | 327-335 | `(sessionId) => ReviewAgentAssignment\|undefined` | 最近一条有效直接审核指派 |
| `actorOfAssignment` | function | 338-340 | `→ {actorId:'agent-'+sessionId, actorSource:'agent', role:workRole}` | role 来自指派非模型声明 |
| `CaseReadScopeCheck` | interface | 347-352 | `{ok;code?('CASE_NOT_VISIBLE'\|'READ_SCOPE_UNVERIFIED');message?;caseIds[]}` | AUTH-09 |
| `checkCaseReadScope` | function | 354-370 | 读范围校验 | |
| `isCaseVisible` | function | 373-377 | `(scope, caseId, localOwnerBrowsing?) => boolean` | 空范围=不可见 |

内部（关键）：`ASSIGNMENTS_FILE`/`REVOCATIONS_FILE`（`:59-65`）、`pendingRevocations:Set`（`:72`，进程内撤销隔离）、`isLiveDirectPiRun`（`:74-85`）、`readRevocationIntents`（`:98-108`，损坏→null）、`recordRevocationIntent`（`:111-117`）、`isDurablyRevoked`（`:120-125`）、`readAll`/`writeAll`（`:127-152`）。

## 3. 内部逻辑与关键流程

### 3.1 落盘与撤销（AUTH-08）

- 双文件：`review-agent-assignments.json`（主账本）+ `review-agent-assignment-revocations.json`（撤销意图，`:60-65`）；均 `writeJsonFileAtomic`（tmp+rename 原子替换，`ENOSPC` 不得截断账本，`:146`）。
- `revokeAssignment`（`:197-218`）**顺序即契约**：① `pendingRevocations.add`（先于任何可失败读写）；② `recordRevocationIntent` 持久化（`:201`，主账本写失败/崩溃后重启仍拒绝）；③ 主账本 `writeAll`；④ 成功后才清 pending。未知 ID/已撤销 → 清 pending 返回 false（`:204-208`）。
- `isDurablyRevoked`（`:120-125`）：pending 命中 → true；意图账本不可读（null）→ **true**（不可证未撤销即按已撤销）；否则查意图列表。
- `writeAll`（`:139-152`）：把 pending 中未盖 `revokedAt` 的行补盖时间戳后整体写（防残留陈旧授权行），提交完成才清 pending。

### 3.2 创建与绑定

- `createAssignment`（`:170-194`）：四校验（sessionId/turnId 必填、actions 非空、caseId‖templateId 二选一、workRole 仅 reviewer/student）；`id='asg-'+uuid8`、actions 去重、`turnPolicy:'single-turn'` 默认（`:186`）、caseVisibility 默认单案（`:187`）。
- `bindCaseToAssignment`（`:221-230`）：不存在/已撤销/已绑其他案卷 → 抛错（一指派一案）。
- `bindRunToAssignment`（`:233-243`）：runId 非空、一指派一运行。

### 3.3 `checkAssignment`（`:259-314`）顺序短路

1. `:269-277` 读意图账本（异常→null）；`isDurablyRevoked` → `ASSIGNMENT_REVOKED`。
2. `:278-283` `readAll()` 异常 → `ASSIGNMENT_REVOKED`（账本不可信读取即拒绝）。
3. `:284-286` 不存在/会话不符（均 `ASSIGNMENT_NOT_FOUND`）/`revokedAt`（`ASSIGNMENT_REVOKED`）。
4. `:287-289` `expiresAt` 过期 → `ASSIGNMENT_EXPIRED`。
5. `:290-303` AUTH-07：`multi-turn` 无 expiresAt → 配置无效拒绝；`single-turn` 无 turnId 且 `requireTurnMatch` → `TURN_UNVERIFIED`；turnId 不等 → `TURN_MISMATCH`。
6. `:304-306` `isLiveDirectPiRun` 不活（直接 Pi 运行已结束/中断/无可信记录）→ `ASSIGNMENT_REVOKED`（`isLiveDirectPiRun:74-85`：无 activeRunId 视为普通委派放行；有则要求 `!isInterruptedRunV2 && getRunV2.status==='running'`，异常→false）。
7. `:307-309` `turnTriggeredBy` 非 'user' → `TURN_NOT_USER`。
8. `:310-312` 动作不在范围 → `ACTION_NOT_ALLOWED`。
9. `:313` ok + assignment。

### 3.4 读范围（AUTH-09）

`checkCaseReadScope`（`:354-370`）：无指派时仅 `localOwnerBrowsing` 放行（空 caseIds）；已撤销（revokedAt 或 pending）→ `READ_SCOPE_UNVERIFIED`；范围= `caseVisibility.caseIds ?? [caseId]`。`isCaseVisible`（`:373-377`）：scope.ok 才判；本地所有者浏览+空范围=全部可见；否则 `caseIds.includes`。

## 4. 调用者与调用链

出向：`node:crypto`/`node:fs`/`node:path`、`../safe-file`（writeJsonFileAtomic）、`../config-paths`（getConfigDir）、`./run-store-v2`（getRunV2/isInterruptedRunV2）（`:11-16`）。

入向（检索=符号名+模块名，全冻结树）：

- **工具层**：`apps/electron/src/main/lib/adapters/pi-review-ops-tools.ts:13,201-205,282,347`（`checkAssignment` 五重校验 + `actorOfAssignment` + `bindCaseToAssignment`）。
- **宿主/编排**：`apps/electron/src/main/lib/agent-orchestrator.ts:3710-3716`（会话收尾批量 `revokeAssignment`）；`apps/electron/src/main/lib/review/pi-case-review-service.ts:18,487-532,920,1190-1191`（create/bindRun/revoke/find/check('submit-result')/list）。
- 间接测试（批外）：`review-identity-authority.test.ts:21-137`（AUTH-07/08/09 断言群）、`review-pi-run-bridge.main.test.ts:42`。

## 5. 数据 I/O、读写与副作用

- 磁盘：`<configDir>/review-agent-assignments.json` 与 `review-agent-assignment-revocations.json`，`writeJsonFileAtomic` 原子替换（`:116,147`）。
- 读：`existsSync+readFileSync`（`:101-104,132`）。
- 内存副作用：`pendingRevocations` Set 增删（`:72,199,207,216,150`）。
- 幂等：`recordRevocationIntent` 去重（`:114`）；重复 revoke 返回 false 不重复写意图。

## 6. 分支、失败、取消与恢复

- **fail-closed 全覆盖**：主账本损坏 → `readAll` 抛（`checkAssignment` 捕获转 `ASSIGNMENT_REVOKED`，`:281-283`；`createAssignment` 直接抛）；意图账本损坏 → `recordRevocationIntent` 抛（`:113`，调用方不得声称撤销成功）、`checkAssignment` 按已撤销（`:122-123`）。
- 崩溃恢复：意图先落盘（`:60-64` 注释），主账本写失败/进程崩溃后重启仍拒绝该 grant；`isLiveDirectPiRun` 防止 `revokedAt` 写失败后经运行终态复活 grant（`:78-79`）。
- 撤销写失败：pending 标记保留（`:212-214` 注释），异常由 Main 调用方观察。
- 取消：无异步；`cancel-run` 是动作枚举值（执行在别处）。

## 7. 权限与权威状态

本文件即**授权权威实现**：

- 写权限唯一来源=有效指派（`:2`）；role 由 `workRole` 派生不由模型声明（`:39,337-340`）；`grantedBy` 记人工授权人与代操作 AI 分开（`:41-42`）。
- 轮次权威：仅 `turnTriggeredBy==='user'`（`:307-309`）；AUTH-07 单轮默认、多轮须显式 expiresAt（`:290-303`）。
- 运行权威：`activeRunId` 由宿主绑定模型不能指定（`:37`）；`isLiveDirectPiRun` 绑运行存活（`:74-85`）。
- 读权威（AUTH-09）：无指派不可读案卷（`:343-346` 动机：写有门禁读过去没有）。

## 8. 修改影响面

- 改 `checkAssignment` 顺序/码 → 影响 `pi-review-ops-tools.ts:203` 的每次写校验与 `pi-case-review-service.ts:920`；`review-identity-authority.test.ts` 断言群会红。
- 改撤销时序（意图/账本/ pending）→ AUTH-08 崩溃恢复语义被破坏（`review-identity-authority.test.ts:105-117` 有「撤销后重启」用例）。
- 改 `ReviewAssignmentAction` → 工具层动作白名单与服务端校验同步。
- `CASE_MISMATCH` 在 code 联合（`:248`）但本文件**无返回分支**（全树 grep 仅类型声明）——调用方若按其分支处理需自查。

## 9. 测试证据

本批**无**直接测试文件。间接（批外，静态读到断言行）：`review-identity-authority.test.ts`——`:77-78` 单轮 TURN_MISMATCH、`:85` TURN_UNVERIFIED、`:97` 多轮过期/跨轮、`:106,117` revoke 后重启仍拒绝、`:125-137` 读范围三态（无指派拒/本地浏览放行/可见性判断）。`review-pi-run-bridge.main.test.ts:42` 绑定链。**NOT_RUN**：本轮未执行测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 意图先落盘+pending 先入（AUTH-08 时序） | 已证实 | `:197-217` |
| 账本损坏 fail-closed 双账本 | 已证实 | `:103,113,133-135,281-283` |
| 单轮默认/多轮须 expiresAt（AUTH-07） | 已证实 | `:290-303` |
| 仅 user 轮可写 | 已证实 | `:307-309` |
| `isLiveDirectPiRun` 防终态复活 | 已证实 | `:74-85` |
| 读范围合同（AUTH-09） | 已证实 | `:354-377` |
| `CASE_MISMATCH` 声明未用 | 已证实（类型 `:248` vs 无返回分支，全树 grep） | grep |
| `writeJsonFileAtomic` 原子性实现 | 推断 | `../safe-file` 批外未读 |
| 真实并发写多进程交错 | 未知 | 单进程 Main 假设；NOT_RUN |
| 工具层是否有旁路直写 | 未知 | pi-review-ops-tools 全文未读 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 15 导出 | §2 | 19-377 | covered |
| 撤销时序/双账本 | §3.1 | 59-152 | covered |
| create/bind | §3.2 | 170-243 | covered |
| `checkAssignment` 9 步 | §3.3 | 259-314 | covered |
| AUTH-09 读范围 | §3.4 | 347-377 | covered |
| `CASE_MISMATCH` | §8 | 248 | covered（未用事实） |
