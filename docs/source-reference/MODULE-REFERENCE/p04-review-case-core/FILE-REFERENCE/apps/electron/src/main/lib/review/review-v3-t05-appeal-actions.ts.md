---
path: apps/electron/src/main/lib/review/review-v3-t05-appeal-actions.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: abb1fc8a227b2108d55e75fb02454660047b372c
sha256: b092d1ca6c6b476c69618f47f3e61ac8ac3bddddaa6eda560fe354cb30171916
lines: 136
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t05-appeal-actions.ts

## 1. 结论与边界

T05 申诉业务语义的**纯准备函数**（供未来可信 Main 命令适配器使用）：不改聚合、不存新案、不铸 Actor、不授批准权；Main 供给已验证 Actor、生成 ID、当前修订与（更正时）已验证新 Run（文件头 `apps/electron/src/main/lib/review/review-v3-t05-appeal-actions.ts:1-10`）。它补 SubmitAppeal V3 缺失契约的产品域一半；可信 IPC 与原子追加归 Local-L（`:8-9`）。

## 2. 导出与关键符号

`export` 逐条核对：3 个接口 + 4 个函数 = 7 个导出（类/常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `T05SubmitAppealInput` | 接口（导出） | 13-17 | `{againstDecisionId,statement,newEvidenceDocumentVersionIds}` | |
| `T05ReviewAppealInput` | 接口（导出） | 19-25 | `{appealId,resolution:'maintain-original'\|'amend-original',reason,amendedResult?}` | amend 时强制新结论，绝不默认通过（`:23-24`） |
| `T05ReviewAppealPlan` | 接口（导出） | 27-31 | `{appeal,amendment?}` | amendment 追加到 `decisions`，不覆盖原决定（`:29-30`） |
| `effectiveT05Decisions` | 函数（导出） | 34-38 | `(decisions)=>BusinessDecision[]` | 过滤被 `amendsDecisionId` 取代者 |
| `prepareT05AppealSubmission` | 函数（导出） | 44-74 | `(aggregate,actor,input,context)=>Appeal` | 学生侧提交 |
| `prepareT05AppealResolution` | 函数（导出） | 81-127 | `(aggregate,reviewer,input,context)=>T05ReviewAppealPlan` | 独立复审 |
| `prepareT05AppealWithdrawal` | 函数（导出） | 130-136 | `(appeal,actor)=>Appeal` | 仅原申诉人撤回 |

## 3. 内部逻辑与关键流程

### 3.1 提交（`:44-74`）

`actor.role==='student'`（`仅提交方可以创建学生申诉`）；`stage==='decided'`（`案卷尚未形成可申诉的最终决定`）；目标决定须在 `effectiveT05Decisions` 中且 `finality==='final'`（`被申诉的决定不存在、已被更正或不是有效最终决定`）；`statement` 非空（`必须说明申诉理由`）；同一决定无 `submitted/in-review` 在途申诉（`针对同一决定已有待处理的申诉`）；证据版本去重后必须全部是 active 文档版本（`申诉不能引用不存在或已失效的材料版本`，`:60-63`）。返回 `Appeal{status:'submitted',…}`（`:64-73`）。

### 3.2 复审（`:81-127`）

- 申诉存在且未结案（`:87-89`）；`reviewer.role ∈ {teacher,reviewer}`（`当前角色不能复审`，`:90`）。
- 原决定存在且仍有效（`原决定已被更正，应重新选择有效决定`，`:91-95`）。
- 复审人 ≠ 原决定人（actorId+actorSource 双字段，`复审人不能与原决定人为同一主体`，`:96-99`）。
- `reason` 非空（`:100`）；amend 必须给 `amendedResult`（`更正原决定必须明确新的业务结论`，`:101-103`）且 `context.verifiedRunId`（`更正决定必须提供已核验的最新 ReviewRun`，`:104-106`）。
- `updated.appeal`：maintain→`status:'upheld'`，amend→`'overturned'`+`reviewDecisionId`（`:107-112`）。
- amend 时构造 `amendment`：基于原决定克隆，新 `id`/`actor:reviewer`/`result:amendedResult`/`basedOnRunId:verifiedRunId`/`basedOnRevision:aggregate.caseV2.revision`/`finality:'final'`/`amendsDecisionId:original.id`（`:114-125`）。注释强调学校批准语义不由本地角色推断（`:76-80`）。

### 3.3 撤回（`:130-136`）

未结案 + 仅原申诉人（actorId/actorSource 双字段）→ `{status:'withdrawn',resolution:'withdrawn'}`；不抹原决定（`:129`）。

## 4. 调用者与调用链

入向（冻结树 grep）：生产调用点在 Local-L 的可信 IPC 适配（注释 `:8-9` 指向未完成契约）；本批检索 `apps/`+`packages/` 非测试：**无生产调用者**（三 `prepareT05*` 与 `effectiveT05Decisions` 均 0 命中）。测试：`review-v3-t05-appeal-actions.test.ts:4`（本批 3 例）。出向：仅 `@profer/shared` 类型（`Actor`/`Appeal`/`BusinessDecision`/`CaseAggregateV2`）。

## 5. 数据 I/O、读写与副作用

纯函数：读聚合字段（入参），返回新对象；无写、无 IO、无副作用。

## 6. 分支、失败、取消与恢复

| 抛 `Error`（无前缀） | 触发 | 行 |
| --- | --- | --- |
| `仅提交方可以创建学生申诉` | 非 student | 50 |
| `案卷尚未形成可申诉的最终决定` | stage 非 decided | 51 |
| `被申诉的决定不存在、已被更正或不是有效最终决定` | 目标无效 | 54 |
| `必须说明申诉理由` | 空 statement | 55 |
| `针对同一决定已有待处理的申诉` | 在途重复 | 58 |
| `申诉不能引用不存在或已失效的材料版本` | 证据无效 | 63 |
| `申诉不存在`/`申诉已结案` | 复审前置 | 88,89 |
| `当前角色不能复审` | 角色 | 90 |
| `原业务决定不存在`/`原决定已被更正…` | 原决定 | 92,94 |
| `复审人不能与原决定人为同一主体` | 自审 | 98 |
| `复审结论必须说明理由` | 空 reason | 100 |
| `更正原决定必须明确新的业务结论` | 缺 amendedResult | 102 |
| `更正决定必须提供已核验的最新 ReviewRun` | 缺 verifiedRunId | 105 |
| `申诉已结案`/`只有原申诉人可以撤回` | 撤回 | 131,133 |

失败后无状态（纯函数）；无取消/恢复概念。

## 7. 权限与权威状态

- 身份/角色由 Main 绑定并认证（`:41-42`）；`appellant` 取 `actor.actorId/actorSource`（`:68`）。
- 复审独立性（≠原决定人）与学校批准语义不从本地角色推断（`:76-80`）。
- 追加语义：amendment 不覆盖原决定（`:29-30`）；撤回不抹决定（`:129`）。

## 8. 修改影响面

- 改返回形状影响未来 Local-L IPC 适配与 `Appeal`/`BusinessDecision` 共享类型。
- 改前置条件影响 3 个测试断言。

## 9. 测试证据

直接测试：`review-v3-t05-appeal-actions.test.ts`（63 行，3 例，详见其手册）：合法提交绑定决定与证据版本且原决定保留（`decisions` 长度 1）、无效证据拒绝、amend 追加关联 amendment 基于已验证新 Run 且缺 `verifiedRunId` 拒绝、撤回仅限原申诉人。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

缺口：全部错误分支（14 个 Error 文案中仅 4 个被断言间接覆盖）、`maintain-original` 全路径、`effectiveT05Decisions` 独立用例、在途重复提交。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 纯函数、不改聚合 | 已证实 | 全文无写；测试 `:168`（`decisions` 不变） |
| amend 不覆盖原决定 | 已证实 | `:114-125`；测试 `:183-185` |
| 复审人独立性 | 已证实 | `:96-99` |
| amend 强制新结论+Run | 已证实 | `:101-106` |
| 生产无调用者 | 已证实（检索范围：冻结树 `apps`+`packages` 非测试 `*.ts`） | 0 命中 |
| Local-L IPC 适配 | 未知 | 注释自述待建（`:8-9`） |
| 错误分支覆盖 | 未知 | 多数无断言 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `effectiveT05Decisions` | §2 | 34-38 | covered（源码）/partial（断言） |
| `prepareT05AppealSubmission` | §3.1 | 44-74 | covered |
| `prepareT05AppealResolution` | §3.2 | 81-127 | covered |
| `prepareT05AppealWithdrawal` | §3.3 | 130-136 | covered |
| 权限/追加语义 | §7 | 29-30,68,76-80 | covered |
| 生产接线 | §4,§10 | 检索记录 | covered（范围已声明） |
