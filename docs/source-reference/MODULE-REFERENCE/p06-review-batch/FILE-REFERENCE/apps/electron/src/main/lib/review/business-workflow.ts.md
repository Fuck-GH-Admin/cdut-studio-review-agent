---
path: apps/electron/src/main/lib/review/business-workflow.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 841b00eb9df1afd77aed43c63061a0ab27de5037
sha256: 871cbe473d2027cef0229e991027a03cd98d1c5beda3a1cdafa247cb6627f450
lines: 171
kind: source
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/business-workflow.ts

## 1. 结论与边界

业务闭环状态机（文件头 `:1-10`，M4）：**纯函数进出**、落盘由调用方负责（`:22` 注释）。原则：BusinessDecision 追加式（更正=追加不覆盖，A09）；AI 建议不是决定（必须 actor+basedOnRunId/revision）；补件回复≠满足；申诉必须关联既有决定、复核不改写原判；全部变更带 expectedRevision 冲突返回 VERSION_CONFLICT。

不做的事：不落盘/不写聚合（`WorkflowState` 是内存容器）；不做 Run 校验（basedOnRunId 只验非空）；T05/stage-workflow 的 V2 事务层在各自模块。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `WorkflowState` | interface | `:23-28` | `{caseV2; decisions[]; supplements[]; appeals[]}` |
| `WorkflowResult<TEntity>` | type | `:30` | `{ok:true; state; entity}` 或 `{ok:false}&ReviewAppCommandError` |
| `DecisionInput` | interface | `:37-44` | `{scope; stageId; result; finalScores?; reason; basedOnRunId}` |
| `recordDecision` | function | `:47-70` | 记录业务决定（追加式+CAS） |
| `openSupplementRequest` | function | `:74-100` | 开补件 |
| `respondSupplement` | function | `:103-118` | 回复补件（只到 responded） |
| `resolveSupplement` | function | `:121-133` | 判定 satisfied/insufficient/cancelled |
| `submitAppeal` | function | `:137-156` | 提交申诉 |
| `resolveAppeal` | function | `:159-171` | 复核 upheld/overturned/withdrawn |

内部：`now()`（`:32`）、`nextRevision(state)`（`:33`，revision+1+updatedAt）。

## 3. 内部逻辑与关键流程

### 3.1 `recordDecision`（`:47-70`）

`assertExpectedRevision` 冲突 → VERSION_CONFLICT；`reason` 空 → `VALIDATION_FAILED('决定必须附理由（AI 建议不是决定）')`；`basedOnRunId` 空 → `VALIDATION_FAILED('决定必须基于一次运行')`。决定实体：id `dec-{ts}-{rand}`、`basedOnRevision=state.caseV2.revision`（写入前版本）。**阶段推进**（`:65-68`）：pass/partial-pass→`decided`；return/reject→`awaiting-supplement`；withdraw→`archived`。

### 3.2 补件（`:74-133`）

- `openSupplementRequest`：CAS；`reason`/`requiredElements` 必备（“补件必须说明原因与所需要素（A09）”）；stage→`awaiting-supplement`；请求 `{id:sup-…, originFindingKeys, materialSlotId?, requiredElements, reason, responsibleRole, deadline?, status:'open', responses:[]}`。
- `respondSupplement`：目标须 open/responded（已关闭拒“不能再回复”）；note 或材料至少其一；状态→`responded` 追加 response。**不推 revision**（注意：与 recordDecision/openSupplement 不同，`:112-117`）。
- `resolveSupplement`：cancelled 需理由（“取消补件必须说明理由”）；status→outcome；仅 `satisfied` 时 stage→`reviewing` 且 revision+1（`:129-131`）。

### 3.3 申诉（`:137-171`）

- `submitAppeal`：CAS；`againstDecisionId` 必须存在（“申诉必须关联既有决定（A10）”）；statement 必备；status `submitted`。
- `resolveAppeal`：目标须 submitted/in-review（已关闭拒）；status→outcome + `reviewDecisionId`；`upheld` 时 stage→`awaiting-review` 且 revision+1（`:167-169`）；overturned/withdrawn 不动 stage/revision——“成立/不成立…不改写原决定内容”（文件头 `:8`）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（排除测试）：`stage-workflow.ts` import 本模块（业务实体构造语义的早期版本；V2 事务层自建同类实体）；直接测试 `business-workflow.test.ts`；`stage-workflow.test.ts` 亦引用。出向仅 `@profer/shared` 类型与 `assertExpectedRevision`。

## 5. 数据 I/O、读写与副作用

纯内存；无 I/O/日志。输出新 state 对象（追加式数组）；`now()` 取系统时间。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| CAS 冲突 | `:48/:79/:138` | VERSION_CONFLICT |
| 理由/依据缺失 | `:50-51/:81-82/:124-125/:143` | VALIDATION_FAILED |
| 目标不存在/已关闭 | `:105-107/:123/:161-163` | NOT_FOUND/VALIDATION_FAILED |
| 无取消/恢复 | — | 纯函数 |

## 7. 权限与权威状态

actor 由命令携带并记入决定/申诉；无角色校验分支。权威语义在原则注释（追加式、AI≠决定、回复≠满足）；`basedOnRevision` 固定写入前版本供审计。

## 8. 修改影响面

改状态机语义 → 影响 `stage-workflow` 的实体构造与两测试文件；与 V2 事务层（`stage-workflow.respondSupplementV2` 等）并存时需注意语义同步（如 respond 不推 revision 的差异）。

## 9. 测试证据

本轮 `NOT_RUN`。直接测试 `business-workflow.test.ts`（详见其手册）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 纯函数、追加式、CAS | 已证实 | `:22/:47-69` |
| 阶段推进映射（pass→decided 等） | 已证实 | `:65-68` |
| 回复≠满足、取消需理由 | 已证实 | `:102-133` |
| 申诉不改写原判 | 已证实 | `:158-171` |
| respondSupplement 不推 revision | 已证实 | `:112-117` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `recordDecision` | 3.1 | `:47-70` | covered |
| `openSupplementRequest` | 3.2 | `:74-100` | covered |
| `respondSupplement` | 3.2 | `:103-118` | covered |
| `resolveSupplement` | 3.2 | `:121-133` | covered |
| `submitAppeal`/`resolveAppeal` | 3.3 | `:137-171` | covered |
