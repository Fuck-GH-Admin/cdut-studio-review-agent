---
path: apps/electron/src/main/lib/review/review-v3-f13-main-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c35bff8e188367647e68e8a3baffe7d7d328e999
sha256: 0e2432bc28f386904c42dff820b8abd8f5bda24fbd52839fed8db80dcd69f105
lines: 245
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-f13-main-service.ts

## 1. 结论与边界

F13 **本地申诉事务入口**：Renderer 只能提交申诉内容与期望修订号；实际申诉人、复审人、ID、当前有效 Run 都由 Main 产生或核实。`local` 身份仅表示本机记录，不代表学校账号认证，也不允许改写原业务决定（文件头 `apps/electron/src/main/lib/review/review-v3-f13-main-service.ts:1-7`）。

## 2. 导出与关键符号

`export` 逐条核对：3 个接口 + 4 个函数 = 7 个导出（类/常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `F13SubmitAppealCommand` | 接口（导出） | 24-30 | `{caseId,requestId,expectedRevision,againstDecisionId,statement,newEvidenceDocumentVersionIds,confirmLocalSubmitter?}` | 旧案卷无提交方绑定时用户显式声明本机申诉人（`:28-29`） |
| `F13ReviewAppealCommand` | 接口（导出） | 32-37 | +`appealId,resolution,reason,amendedResult?` | |
| `F13WithdrawAppealCommand` | 接口（导出） | 39-41 | +`appealId` | |
| `submitLocalF13Appeal` | 函数（导出） | 72-129 | `(input)=>Promise<ReviewCommandResult<Appeal>>` | 提交 CAS |
| `runCoversAppealEvidence` | 函数（导出） | 137-144 | `(run,evidenceVersionIds)=>boolean` | RUN-24 exact-version 覆盖判定 |
| `reviewLocalF13Appeal` | 函数（导出） | 147-221 | 同上 | 复核 CAS |
| `withdrawLocalF13Appeal` | 函数（导出） | 223-245 | 同上 | 撤回 CAS |
| `F13CommandIdentity` | 内部 | 18-22 | 三字段命令标识 | |
| `assertCommand` | 内部 | 43-49 | caseId 安全 + requestId/expectedRevision 合法 | `申诉请求标识或案卷修订号非法` |
| `requireLocalBusiness` | 内部 | 51-55 | `resolveT05BusinessMode==='local-business'` | `技术预审不能直接创建正式业务申诉` |
| `sameActor`/`chooseLocalReviewer` | 内部 | 57-70 | 双字段比较；自动指派 ≠ 原决定人的本地复核角色 | `无法指派与原决定人不同的本地复核角色` |

## 3. 内部逻辑与关键流程

### 3.1 提交（`:72-129`）

`assertCommand` + 证据 ID 列表校验（`申诉引用的材料版本必须为有效标识列表`，`:74-77`）。`submitCommand(type:'SubmitLocalAppealV3',actor:LOCAL_SUBMITTER_ACTOR)`（`:78-88`）。CAS handler（`:89-127`）：

1. `requireLocalBusiness`（`:90`）。
2. 提交方绑定：已绑定他人 → `案卷已经绑定其他提交人，不能以本机申诉人代替`（`:91-94`）；未绑定且未 `confirmLocalSubmitter` → `首次本地申诉须确认本机申诉人身份`（`:95-97`）；未绑定+确认 → effectiveAggregate 临时补绑定（`:98-104`）。
3. 目标决定存在（`被申诉的最终决定不存在`，`:105-106`）。
4. `planF13AppealSubmission`（reviewer=`chooseLocalReviewer(original.actor)`，appealId/taskId=`randomUUID`，`:108-117`）。
5. `mutate`：必要时写回 submitter 绑定、追加 appeal/任务、更新阶段（`:120-126`）。

### 3.2 RUN-24 覆盖判定（`runCoversAppealEvidence`，`:137-144`）

空证据=true；否则要求每个 evidence versionId 都在 `run.inputManifest.documentVersions` 的 **exact versionId** 集合中（注释：旧版本 Run 不得为新提交版本背书，`:132-136`）。

### 3.3 复核（`:147-221`）

- `resolution` 仅两值（`独立复核结论只能维持或更正原决定`，`:149-151`）。
- 复核人身份**从原子案卷的真实指派核实**：`trustedLocalActors=[teacher,reviewer]`（`deriveT05LocalActor`），按 `currentAssignment.assigneeActorId/assigneeRole` 匹配（`尚无有效的本机独立复核指派`，`:152-158`）。
- CAS handler（`:170-219`）：`requireLocalBusiness`；申诉存在（`申诉不存在`）；任务须有 Main 指派（`申诉没有 Main 指派的本地复核人`）；复核人与指派一致且与预解析 actor 相同（`复核指派已变更，请刷新后重试`，`:178-182`）。
- **RUN-24**（`:183-199`）：`run=currentT05Run(aggregate)`；`verifiedRunId` 要求 `run.startedAt > appeal.createdAt` **且** `runCoversAppealEvidence`（注释：较新的 startedAt 不是证据已核验的证明；T04/partial Run 没见过新版本不能背书，`:184-187`）；有新证据而无 verifiedRunId → `INVALID_TRANSITION: 申诉新证据尚未由提交后启动的 Run 在冻结输入中核验，不能仅凭时间较新的 Run 复核`（`:196-199`）。
- `planF13AppealReview`（decisionId=`randomUUID`，`:200-209`）；`mutate` 更新 appeal/tasks/追加 amendment/阶段（`:212-218`）。

### 3.4 撤回（`:223-245`）

`submitCommand(type:'WithdrawLocalAppealV3',actor:LOCAL_SUBMITTER_ACTOR)`；handler 里 `requireLocalBusiness` + `planF13AppealWithdrawal`；`mutate` 更新 appeal/tasks/阶段（`:231-243`）。

## 4. 调用者与调用链

入向（冻结树 grep）：IPC 层经 `review-ipc.ts`/相关 handler 暴露（`SubmitLocalAppealV3`/`ReviewLocalAppealV3`/`WithdrawLocalAppealV3` 命令类型为本文件自定义，写入 case-store-v2 命令流）；本批检索生产调用点见 §10。测试：`review-v3-f13-main-service.test.ts:13-14`（本批 5 例）。

出向：`case-store-v2.ts:10`（`CommandValidationError`/`readAggregate`/`submitCommand`）、`review-ipc-actor-guard.ts:11`（`LOCAL_SUBMITTER_ACTOR`）、`review-v3-t05-main-service.ts:12`（`currentT05Run`/`deriveT05LocalActor`/`resolveT05BusinessMode`）、`review-v3-f13-appeal-flow.ts:13-15`、`review-storage-id.ts:16`。

## 5. 数据 I/O、读写与副作用

- 读：`readAggregate`（复核前置，`:152`）。
- 写：三条命令各经 `submitCommand` 的 Case CAS（appeal/task/decision/stage/submitter 一次原子保存）。
- 副作用：`randomUUID` 生成 ID；无 IPC 自身、无网络。
- 幂等：`requestId+payloadHash` 幂等（测试重放断言 `:65-71`）。

## 6. 分支、失败、取消与恢复

| 拒绝（`CommandValidationError`） | 触发 | 行 |
| --- | --- | --- |
| `VALIDATION_FAILED: 申诉请求标识或案卷修订号非法` | 入参 | 47 |
| `VALIDATION_FAILED: 申诉引用的材料版本必须为有效标识列表` | 证据列表 | 76 |
| `INVALID_TRANSITION: 技术预审不能直接创建正式业务申诉` | 非 local-business | 53 |
| `INVALID_TRANSITION: 案卷已经绑定其他提交人…` | 绑定冲突 | 93 |
| `VALIDATION_FAILED: 首次本地申诉须确认本机申诉人身份` | 缺确认 | 96 |
| `NOT_FOUND: 被申诉的最终决定不存在` | 目标缺失 | 106 |
| `INVALID_TRANSITION: 无法指派与原决定人不同的本地复核角色` | 指派失败 | 67 |
| `VALIDATION_FAILED: 独立复核结论只能维持或更正原决定` | resolution | 150 |
| `INVALID_TRANSITION: 尚无有效的本机独立复核指派` | 指派缺失 | 158 |
| `NOT_FOUND: 申诉不存在` | 复核 | 173 |
| `INVALID_TRANSITION: 申诉没有 Main 指派的本地复核人` | 任务缺失 | 176 |
| `INVALID_TRANSITION: 复核指派已变更，请刷新后重试` | 指派漂移 | 181 |
| `INVALID_TRANSITION: 申诉新证据尚未由提交后启动的 Run…` | RUN-24 | 197-198 |
| T05/F13 层错误 | 透传 | 108,200,233 |

- 失败后状态：CAS 拒绝零写入（测试 `decisions` 长度断言）。
- 取消/恢复：无取消；恢复=修数据/新 revision 重试。

## 7. 权限与权威状态

- 申诉人/复核人是 `deriveT05LocalActor` 派生的**本机**身份（`local-student`/`local-teacher` 等），非学校认证（文件头 `:5-6`）。
- 复核人从原子案卷指派核实（`:146,152-158`），CAS 内二次核对（`:178-182`）。
- RUN-24：Run 必须冻结 exact versionId 才能背书新证据（`:132-144,183-199`）。
- 不改写原业务决定：amend 只追加（T05 层）；撤回保留原判。

## 8. 修改影响面

- 改三条命令契约影响 IPC/preload/渲染层申诉入口与 `case-store-v2` 命令流。
- 改 `runCoversAppealEvidence` 影响 RUN-24 语义与测试。
- 改 `chooseLocalReviewer`/actor 派生影响 `review-v3-t05-main-service.ts` 契约。

## 9. 测试证据

直接测试：`review-v3-f13-main-service.test.ts`（150 行，5 例，详见其手册）：无确认拒绝+确认后 Appeal/任务/身份/回执原子保存（`submitter==='local-student'`、指派 `local-teacher`、回执 actor role student、`decisions` 1）、重放幂等、维持原判恢复 decided 且原判保留、新证据无 Run 拒绝改判、RUN-24 exact-version 五断言、撤回关闭申诉保留历史。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

缺口：`chooseLocalReviewer` 退化分支、复核 amend 全路径、指派变更分支、`requireLocalBusiness` 的技术预审分支无独立断言。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三命令一次原子 CAS | 已证实 | `:78-128,159-220,225-244` |
| RUN-24 exact-version | 已证实 | `:137-144,183-199`；测试 `:115-128` |
| 复核人从案卷指派核实 | 已证实 | `:152-158,178-182` |
| 本机身份非学校认证 | 已证实 | 文件头 `:5-6` |
| 首次绑定须显式确认 | 已证实 | `:95-97`；测试 `:44-49` |
| IPC/渲染层接线 | 未知 | 本批未逐行核入口 handler |
| `currentT05Run`/`resolveT05BusinessMode` 内部 | 未知（文件外） | `review-v3-t05-main-service.ts` 未逐行读 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `submitLocalF13Appeal` | §3.1 | 72-129 | covered |
| `runCoversAppealEvidence` | §3.2 | 137-144 | covered |
| `reviewLocalF13Appeal` | §3.3 | 147-221 | covered |
| `withdrawLocalF13Appeal` | §3.4 | 223-245 | covered |
| 权限/RUN-24 | §7 | 132-144,152-158 | covered |
| 入口接线/退化分支 | §9,§10 | — | unknown |
