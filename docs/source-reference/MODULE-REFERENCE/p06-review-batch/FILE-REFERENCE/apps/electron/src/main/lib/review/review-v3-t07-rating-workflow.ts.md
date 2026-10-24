---
path: apps/electron/src/main/lib/review/review-v3-t07-rating-workflow.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a0f18ba5437763426f0e67503c0d4cd8f0793a89
sha256: 0105db6736778235ec51ee690334b6842427a43109b23691e637607e191210fb
lines: 471
kind: source
package: p06-review-batch
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t07-rating-workflow.ts

## 1. 结论与边界

T07 **独立评审领域核心**（运行时代码，纯函数状态机）：定义评分轮次类型族、动作归约 `applyT07Action`、名次/名额计算 `computeT07Ranking`、安全视图投影 `projectT07View`。文件头 `apps/electron/src/main/lib/review/review-v3-t07-rating-workflow.ts:1-6`：不建第二套 Case/Run/store；L/Main 把返回值作为既有批次/案卷聚合的版本化子记录持久化并注入可信 actor 与时间戳；UI 永不持久化该状态、不提供身份。

边界：持久化在 `apps/electron/src/main/lib/review/review-v3-t07-state-store.ts`；定点数值内核委托 `apps/electron/src/main/lib/review/review-v3-t04-rules-scoring.ts`（`decimalT04`/`formatT04`，导入 `:8`）；无磁盘/网络 I/O。

## 2. 导出与关键符号

导出类型 18 + 导出函数 4：

| 符号 | 类型 | 行 | 形状/签名 | 说明 |
| --- | --- | --- | --- | --- |
| `T07Actor` | 类型 | 10 | `{actorId, role:'judge'\|'organizer', actorSource:'local'\|'mock'\|'school'}` | 可信人工主体 |
| `T07Score` | 类型 | 11 | `{dimensionId, score:number\|null, na:boolean, comment?}` | 维度分 |
| `T07Case` | 类型 | 12 | `{caseId, blindLabel}` | 匿名案卷 |
| `T07Assignment` | 类型 | 13-16 | `{id, caseId, reviewerId, rubricVersion, status:'assigned'\|'submitted'\|'recused'\|'missing', reason?}` | 分配 |
| `T07Vote` | 类型 | 17-23 | 含 `offlineActionId?`（Main 专用，与票原子写） | 评分票 |
| `T07RankingRow` | 类型 | 24-29 | `{caseId, blindLabel, total, convertedTotal, rank, selected:boolean\|null, effectiveJudges, blockers[], dimensions[], divergence}` | 名次行 |
| `T07Freeze` | 类型 | 30 | `{by, at, round, ranking}` | 冻结快照 |
| `T07Round` | 类型 | 31-39 | 含 `revisionHistory?`/`divergenceReasons`/`tieOrders`（key=排序案卷 id `|` 连接）/`reopenedFrom?`/`finalized?` | 轮次 |
| `T07ActionEvent` | 类型 | 41-53 | `{actionId, sequence, at, actorId, role, actionType, targetId?, reason?, stateDigest}` | 不可覆写动作事件 |
| `T07State` | 类型 | 54-61 | `{batchId, rubricVersion, rubric, cases, rounds, tieDimensionId?, actionLog?}` | 全量状态 |
| `T07Action` | 联合 | 62-73 | 11 动作：assign/recuse/self-recuse/mark-missing/request-revision/submit/resolve-divergence/set-tie-order/set-tie-dimension/finalize/reopen | 动作 |
| `T07Context` | 类型 | 74-78 | `{actor, at, naEligible?}`（naWhen 由 T04/Main 求值，绝不 Renderer） | 上下文 |
| `currentT07Round` | 函数 | 80-84 | `(state): T07Round` | 末轮；无轮抛 `'评分批次还没有轮次'` |
| `applyT07Action` | 函数 | 149-152 | `(state, action, context): T07State` | 归约入口（含账本） |
| `computeT07Ranking` | 函数 | 322-437 | `(state): T07RankingRow[]` | 名次/名额计算 |
| `T07SafeCaseMaterial` | 类型 | 440-442 | `{caseId, summary, documents[], naEligibleDimensionIds?}` | 安全材料投影 |
| `T07JudgeView`/`T07OrganizerView`/`T07View` | 类型 | 443-451 | 角色视图 | 投影结果 |
| `projectT07View` | 函数 | 452-471 | `(state, actor, safeMaterials?): T07View` | 安全视图 |

内部：`assertOpen`（`:85-87`）、`fixed`（`:92-95`，六位定点）、`divideRounded`（`:96-102`，bigint half-up，除数≤0 抛 `T07_DIVISOR_INVALID`）、`fixedNumber`（`:104-106`）、`requireOrganizer`（`:107-109`）、`requireCase`（`:110-114`）、`withRound`（`:115-117`）、`invalidatedAdjudications`（`:119-127`）、`checkSubmission`（`:128-148`）、`appendActionEvent`（`:158-184`）、`digestOf`（`:187-195`，FNV-1a 64 位近似，`:186` 注释：仅账本自洽不作密码学证明）、`applyT07ActionCore`（`:197-320`）。

## 3. 内部逻辑与关键流程

### 3.1 动作归约 `applyT07ActionCore`（`:197-320`）

- 主体校验（`:198-200`）：`actorSource` 非 local/mock/school 抛 `'评分只接受可信人工主体'`。
- `reopen`（`:202-212`）：仅 organizer；须已冻结（否则 `'只有已冻结的轮次才能重开'`）；reason 必填；非 recused/missing 分配复制到新轮（id 追加 `-r<n+1>`、状态回 `assigned`，`:206-207`）；新轮 `number+1`、`reopenedFrom` 记录。
- `assertOpen`（`:213`）：已冻结其余动作抛 `'本轮评分已冻结，请由组织者授权重开'`。
- `assign`（`:214-226`）：organizer；`requireCase`；id 非空、`assignmentId` 唯一（`:218`）、同轮同案同评委唯一（`:219-221`）。
- `recuse`/`self-recuse`/`mark-missing`（`:227-250`）：recuse/mark-missing 须 organizer；self-recuse 须 judge（`:228-229`）且只能本人分配（`:237-239`）；reason 必填；目标须 `assigned`，或（非 mark-missing 且 `submitted`）——已交卷后发现利益冲突仍可回避（`:233-235` 注释）；有旧票时：`invalidatedAdjudications` + 票移入 `revisionHistory`（理由前缀 `'利益回避：'`）+ 状态 `recused`/`missing`（`:240-249`）。
- `request-revision`（`:251-263`）：organizer、reason 必填、目标须已提交且有票；撤销分歧/同分裁定、状态回 `assigned`、票移入修订历史。
- `submit`（`:264-285`）：role 须 judge（`:265`）；目标 `assigned` + `reviewerId===actorId` + `rubricVersion===state.rubricVersion` + 未有票（`:266-270`，否则 `'评分任务不属于当前评委或已提交、回避、过期'`）；`checkSubmission`；分数 `toFixed(6)` 归一（`:276-278`）；`invalidatedAdjudications` 后入票、状态 `submitted`。
- `resolve-divergence`（`:286-290`）：organizer + requireCase + reason → `divergenceReasons[caseId]`。
- `set-tie-dimension`（`:291-299`）：organizer；维度须属量表；`tieBreaker` 非 `by-dimension` 抛 `'当前量表的同分策略不是按维度比较…'`。
- `set-tie-order`（`:300-313`）：organizer；≥2 互异 id 且均属批次（`:302-304`）；`computeT07Ranking` 校验 id 集**恰为当前同分组**（`:305-310`，否则 `'同分裁定必须且只能包含当前同分的全部案卷'`）；key=`[...ids].sort().join('|')`。
- `finalize`（`:314-319`，fallback 分支）：organizer；无案卷抛 `'评分批次没有案卷，不能定稿'`；任一行有 blockers 或 `selected===null` 抛 `'存在缺评、未解决分歧、同分名额冲突或不完整量表，不能定稿'`；写 `finalized` 冻结快照。

### 3.2 提交校验 `checkSubmission`（`:128-148`）

维度数量与 id 双射（`:130-132`）；逐维：缺失抛 `'缺少量表维度：…'`；`na` 时 score 必须 null 且 `dimension.naWhen` 存在且 `context.naEligible(caseId,dimId)` 通过（`:136-140`，否则 `'未经适用条件确认，不能标 N/A'`）；非 na 时 score 须有限且在 `[min,max]`（`:141-142`）且 `toFixed(6)` 可表示（`:143-146`）。

### 3.3 动作账本 `appendActionEvent`（`:158-184`）

每次动作追加 `T07ActionEvent`：`sequence=旧长度+1`；`actionId` = submit 的 `offlineActionId`（幂等键）或 `'act-<seq>-<digest>'`（`:167-171`）；**同 ID 已入账抛 `T07_ACTION_REPLAY: 该动作已入账，不能重复提交`**（`:172-174`）；`stateDigest=digestOf({state:after, logLength})`（`:181`）。

### 3.4 名次计算 `computeT07Ranking`（`:322-437`）

- 每案卷（`:329-384`）：active 分配（非 recused/missing）→ 其票；每票加权总分 `Σ fixed(score)×fixed(weight) / Σ fixed(weight)` 定点 half-up（`:337-352`）；缺维或 N/A 未走 exclude 策略 → blocker `'存在待裁定的 N/A 或缺失维度'`（`:341-345`）；维度均分（`:355-363`）；blockers：名额非法（`:336`）、`validTotals<minEffectiveJudges`（`'有效评委 n/m'`，`:364`）、`missingStrategy==='block'` 且有未提交（`:365-367`）、分歧 `max-min>divergenceThreshold` 未复核（`:368-374`）。`convertedTotal=avg×toMax/fromMax`（`:379-381`）。
- 排序（`:386-394`）：无 blocker 且 total 非 null 者按 total 降序、caseId 升序；同 total **共享名次**（`:392`）。
- 同分处理（`:395-423`）：`by-dimension` 无 `tieDimensionId` → blocker `'按维度打破同分尚未指定维度'`；有则按该维度均分降序，维度值相同仍共享名次（注释：不按 caseId 裁定，`:407-413`）；`owner-decides` → `tieOrders[key]` 必须恰为该组完整序，否则 blocker `'同分等待组织者裁定顺序'`（`:414-420`）。
- 名额（`:424-435`）：`quota` undefined 全选；否则 `rank<=quota` 选中；**同分跨名额边界** → `selected=null` + blocker `'同分跨越名额边界，需明确裁定'`（`:427-434`）。
- 返回按 rank、caseId 排序（`:436`）。

### 3.5 视图投影 `projectT07View`（`:452-471`）

organizer → `{role:'organizer', state, ranking}`；judge → 仅本人分配（`reviewerId===actorId`，`:460`）+ 盲签 + 安全材料（summary/文档标题，`:465`）+ `naEligibleDimensionIds`（过滤有 `naWhen` 的维度，`:466`）+ `ownVote`。注释 `:439`：不给名册/他人票/总分/真名。

## 4. 调用者与调用链

入向：`apps/electron/src/main/lib/review/review-v3-t07-main-service.ts:19`（核心 API 导入块）；`apps/electron/src/main/lib/review/review-v3-t09-judge-adapter.ts:9`（`currentT07Round`+`T07Action`）；`apps/electron/src/main/lib/review/review-ipc.ts:754/:764/:766/:767`（`import()` 类型引用）；`apps/electron/src/preload/index.ts:4916-5032`（类型引用）；`apps/electron/src/renderer/components/content-review/ReviewV3T07JudgePanel.tsx:3`、`ReviewV3T07Workbench.tsx:16`（类型）；测试 `review-v3-t07-rating-workflow.test.ts:3`、`review-v3-t07-precision-rounds.test.ts:10`、`review-v3-t09-judge-adapter.test.ts:7`；`review-v3-t07-rating-adapter.ts:7`/`review-v3-t07-round-setup.ts:3`/`review-v3-t07-state-store.ts:12`（类型）。

出向：`@profer/shared`（`RubricSpec`，`:7`）；`./review-v3-t04-rules-scoring`（`decimalT04`/`formatT04`，`:8`）。

## 5. 数据 I/O、读写与副作用

纯函数无 I/O/副作用；状态不可变更新（`withRound` 替换末轮，`:115-117`）；`structuredClone` 不涉及。持久化/并发由 `review-v3-t07-state-store.ts`（CAS）负责。

## 6. 分支、失败、取消与恢复

全部失败路径抛中文可读 `Error`（§3 列全）；错误码型：`T07_DIVISOR_INVALID`（`:97`）、`T07_ACTION_REPLAY`（`:173`）。恢复语义：`reopen` 从冻结恢复新轮；`request-revision`/回避把票移入 `revisionHistory`（不丢审计）；账本 `actionLog` 只增不改（`:59` 注释）。

## 7. 权限与权威状态

- 角色门禁：`requireOrganizer`（assign/recuse/request-revision/resolve-divergence/set-tie-*/finalize/reopen）；submit 须 judge 且**本人分配**（`:265-270`）；self-recuse 须 judge 本人（`:237-239`）。
- actor 权威：`T07Context.actor` 由 L/Main 注入（文件头 `:3-5`），`actorSource` 白名单（`:198`）；`naEligible` 由 T04/Main 求值（`:76-77`）。
- 状态权威：返回值是唯一新状态（不可变）；`finalized` 冻结后除 `reopen` 外全部拒绝（`assertOpen`）。

## 8. 修改影响面

- 改动作/排名算法影响：`review-v3-t07-main-service.ts`（持久化桥）、`review-v3-t07-state-store.ts`（形状）、`review-v3-t09-judge-adapter.ts`（离线回件）、`review-ipc.ts`/`preload`/`ReviewV3T07JudgePanel.tsx`/`ReviewV3T07Workbench.tsx`（类型）、`review-v3-t07-rating-adapter.ts`（转换）。
- 定点语义改动（`fixed`/`divideRounded`）会改变总分/名次/名额——注释明示（`:88-91`）。
- 需同步测试：`review-v3-t07-rating-workflow.test.ts`、`review-v3-t07-precision-rounds.test.ts`（非本批）。

## 9. 测试证据

直接测试 `apps/electron/src/main/lib/review/review-v3-t07-rating-workflow.test.ts`（125 行、7 用例；NOT_RUN，断言见 `review-v3-t07-rating-workflow.test.ts.md`）：覆盖 finalize/reopen 周期、judge 投影不泄漏他人信息、同分跨名额、mark-missing 替补、提交后 self-recuse、改分撤销裁定、非同分/空批次拒绝定稿。未覆盖：`actionLog`/`T07_ACTION_REPLAY`、`offlineActionId` 幂等、`set-tie-dimension` 分支、`naEligible` N/A 路径、`scaleConversion` 除 `5→100` 外组合、`mark-missing` 后 missingStrategy=exclude。间接：`review-v3-t07-precision-rounds.test.ts`（定点精度，非本批）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 18 类型+4 函数导出与行号 | 已证实 | `:10-471` |
| finalize 阻断条件与 reopen 复制规则 | 已证实 | `:202-212/:314-319` |
| submit 五重校验（角色/归属/版本/重复/分数） | 已证实 | `:264-285/:128-148` |
| 同分三分支（by-dimension/owner-decides/跨名额） | 已证实 | `:395-435` |
| 账本幂等（offlineActionId/act- 前缀/FNV 摘要） | 已证实 | `:158-195` |
| 投影不泄漏（judge 仅本人任务） | 已证实 | `:452-471` + test:61-63 |
| 六位定点 half-up | 已证实 | `:92-102` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 全部 11 动作分支 | §3.1 | 197-320 | covered |
| `checkSubmission` | §3.2 | 128-148 | covered |
| `appendActionEvent`/`digestOf` | §3.3 | 158-195 | covered |
| `computeT07Ranking` 全分支 | §3.4 | 322-437 | covered |
| `projectT07View` | §3.5 | 452-471 | covered |
| 测试断言 | §9 | test:29-124 | covered |
| actionLog/幂等/N-A 路径等 | §9 | — | partial（无断言） |
| 运行行为 | §10 | — | unknown（NOT_RUN） |
