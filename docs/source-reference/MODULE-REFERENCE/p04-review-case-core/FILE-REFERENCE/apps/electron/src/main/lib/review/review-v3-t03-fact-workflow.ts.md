---
path: apps/electron/src/main/lib/review/review-v3-t03-fact-workflow.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b001a4a1d27d58b95e7bb3ae362f9c465e50badf
sha256: 478eb4ca8f9d7eaa7f10d436e7d86a0bd05f957b8ea182af3a904083d6ba5849
lines: 284
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t03-fact-workflow.ts

## 1. 结论与边界

T03/F05-F06：按案卷的事实 + 证明复审**投影**。纯函数：不建第二 CaseStore、不猜来源坐标、不直接改持久 observation 或历史 ReviewRun（文件头 `apps/electron/src/main/lib/review/review-v3-t03-fact-workflow.ts:1-5`）。

## 2. 导出与关键符号

`export` 逐条核对：4 个接口 + 6 个函数 = 10 个导出（类/常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `T03ExtractedFact` | 接口（导出） | 8-16 | `{subjectId,fieldKey,value,sourceRefs?,confidence?,id?}` | `id` 仅展示原始提取，不是授权（`:14`） |
| `T03FactRow` | 接口（导出） | 18-29 | `{key,current,candidates,history,sourceState,needsReview,reasons,…}` | |
| `T03EvidenceGroup` | 接口（导出） | 31-40 | `{documentVersionId,fileName,active,links,suggestions,ambiguousSubjectIds}` | suggestions 恒 `status:'candidate'`（`:36-39`） |
| `resolveT03CorrectionRefs` | 函数（导出） | 58-84 | `(aggregate,rawRefs:unknown)=>SourceRef[]` | 确认时保留真实定位、拒绝旧修订/跨案卷 |
| `projectT03Facts` | 函数（导出） | 91-152 | `(aggregate,extracted?)=>T03FactRow[]` | 事实投影 |
| `projectT03Evidence` | 函数（导出） | 154-189 | `(aggregate,extracted?)=>T03EvidenceGroup[]` | 证明投影 |
| `proposedT03EvidenceLinks` | 函数（导出） | 192-202 | 建议跨主体关联 | 恒 candidate（`:191`） |
| `parseT03Correction` | 函数（导出） | 205-229 | `(raw,previous:FieldValue)=>FieldValue` | 0 与缺失区分（`:204`） |
| `T03RecheckImpact`/`planT03Recheck` | 接口/函数（导出） | 232-238,239-284 | 变更影响分析 | Run 不可变，只标需新 Run 的检查（`:231`） |
| `keyOf`/`sameValue`/`sourceState` | 内部 | 42-51 | 键/值比较；来源 `current/stale/unattributed` | |

## 3. 内部逻辑与关键流程

### 3.1 来源状态（`sourceState`，`:45-51`）

空 refs→`unattributed`；全部 ref 满足 caseId 相等 + 文档存在 active + `parseRevision` 相等 → `current`，否则 `stale`。

### 3.2 确认来源解析（`resolveT03CorrectionRefs`，`:58-84`）

必须数组（`事实来源必须是原件引用列表`）；逐条：documentVersionId 字符串（`事实来源缺少原件版本`）；文档存在且未停用（`事实引用的原件已停用或不存在，请重新选择当前原件`）；显式 `caseId`/`parseRevision` 不符即拒（`事实来源属于其他案卷或旧解析版本，请重新核对来源`，绝不静默“升级”，`:55-57`）；`location.kind` ∈ 五值（`事实来源位置无效，请重新选择原件`）；缺省 location 用 `{kind:'file'}`（legacy 兼容，`:54-56,70`）。返回去重（`:83`）。

### 3.3 事实投影（`projectT03Facts`，`:91-152`）

- 按 `[subjectId,fieldKey]` 聚合 history（observations 顺序）与 candidates（extracted）。
- `lastHuman`=最后一个 `confirmed && extractedBy==='user'`；`current` 仅当其来源仍 `current`（`:113-115`）；注释：较后的人工更正即使来源后来过期也取代旧确认，绝不复活被取代值（`:111-112`）。
- candidates = lastHuman 之后的未确认 observations + extracted（`:117-123`）。
- `reasons`：主体未归属/无有效人工确认/新提取值不同/来源变化（lastHuman 或候选 stale）/证明关联指向旧原件（`:124-139`）。
- `sourceState` 按 current→lastHuman→末条 history 推导（`:143-146`）；`needsReview=reasons.length>0`；排序 needsReview 优先（`:150-151`）。

### 3.4 证明投影（`projectT03Evidence`，`:154-189`）

文档过滤（evidence 角色/已有链接/被提取引用）；`active` 文档生成 suggestions（主体已知 + ref 精确匹配 + 无重复/无既有链接，恒 `candidate`，`:166-178`）；`ambiguousSubjectIds`=多主体且存在 candidate 证据时列出（`:179-186`，注释：一文档多主体候选不是身份决定，`:38-39`）。

### 3.5 更正值解析（`parseT03Correction`，`:205-229`）

number：空串拒（`数字不能为空；0 是有效数值`）+ 有限数（`请输入有效数字`）+ 保留 unit；boolean：仅 `'true'/'false'`；date：`YYYY-MM-DD` + 真实日历校验（`日期不在有效日历范围内`，含闰年，`:217-223`）；enum/text 透传；复合/附件字段拒绝（`该复合字段需要使用对应的结构化编辑器`，`:227-228`）。

### 3.6 重审影响（`planT03Recheck`，`:239-284`）

收集变更主体/字段/文档/链接；observations/links 反向扩充受影响主体（`:248-256`）；`effectiveRuleDependencies`（`*` 或字段命中）得 `impactedRules`（`:258-262`）；checks 过滤：sourceRefs/basis 命中 **或**（主体命中 && 字段命中）**或** basis.observationIds 命中（`:263-273`）。`fullReviewRequired = !run || (无依赖 && 无变更主体)`（`:281`）；reasons：无旧 Run/无依赖保守标记/文档版本变化（`:274-276`）。

## 4. 调用者与调用链

入向（冻结树 grep）：T03 事实工作台 UI/服务（生产消费点在渲染层 `ReviewV3T03FactWorkbench` 等，见 §10）；测试：`review-v3-t03-fact-workflow.test.ts:5-7`（本批 7 例中 5 例直接测本模块）。出向：仅 `@profer/shared` 类型。

## 5. 数据 I/O、读写与副作用

纯函数：无 IO/状态；不改聚合/observation/Run（`run.checks` 只读过滤，测试断言长度不变）。

## 6. 分支、失败、取消与恢复

`resolveT03CorrectionRefs`/`parseT03Correction` 抛 `Error`（文案见 §3.2/§3.5）；其余函数无抛错。失败无状态变化；无取消概念。

## 7. 权限与权威状态

- 人工确认（`extractedBy==='user' && confirmed`）优先于 AI 提取；later AI 不遮蔽人工值（`:86-89`）。
- 跨主体建议恒 `candidate`（`:191`）；`id` 不是授权（`:14`）。
- 旧修订/跨案卷来源绝不静默升级（`:55-57`）。

## 8. 修改影响面

- 改 `T03FactRow`/`T03EvidenceGroup` 影响 T03 工作台渲染。
- 改投影/解析语义影响 5 个测试与事实确认流程。
- `planT03Recheck` 影响“变更后需新 Run”的提示链。

## 9. 测试证据

直接测试：`review-v3-t03-fact-workflow.test.ts`（167 行，7 例中 5 例针对本模块，详见其手册）：0 值保留/AI 只读/旧来源过期、supersede 不复活（A05）、精确定位保留+旧修订拒绝（A05）、同证书双主体不自动确认、重审只选依赖检查且 Run 不可变。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

缺口：`proposedT03EvidenceLinks` 部分覆盖、`parseT03Correction` boolean/enum/text/复合分支、`planT03Recheck` 的 `fullReviewRequired` 分支无独立断言。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 纯投影、不改持久数据 | 已证实 | 全文无写；测试 `:125`（`run.checks` 不变） |
| 人工确认不被 AI 遮蔽 | 已证实 | `:86-89,113-123`；测试 `:38-51` |
| supersede 不复活 | 已证实 | `:111-112`；测试 `:52-77` |
| 旧修订/跨案卷拒绝 | 已证实 | `:66-69`；测试 `:84-86` |
| 跨主体恒 candidate | 已证实 | `:191`；测试 `:88-106` |
| 生产消费点 | 未知 | 渲染层未逐行核 |
| boolean/复合分支 | 未知 | 无断言 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `resolveT03CorrectionRefs` | §3.2 | 58-84 | covered |
| `projectT03Facts` | §3.3 | 91-152 | covered |
| `projectT03Evidence` | §3.4 | 154-189 | covered |
| `proposedT03EvidenceLinks` | §3.4 | 192-202 | covered |
| `parseT03Correction` | §3.5 | 205-229 | covered（number/date）/partial |
| `planT03Recheck` | §3.6 | 239-284 | covered |
