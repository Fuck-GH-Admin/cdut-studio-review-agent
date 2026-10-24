---
path: apps/electron/src/main/lib/review/review-v3-t03-subject-restructure.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 57a2b538953cf989e9c58e2ca7d5fc219a3a7f7e
sha256: acf0c41523ac6e42981ff48402366ee92b258e019ef6056acc06258760912b61
lines: 273
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t03-subject-restructure.ts

## 1. 结论与边界

T03 F05/A05：拆分/合并/重新归属的**真实领域变换**。纯函数、保来源的提案，供唯一原生 Case CAS writer 使用；禁止 IPC 分步写入——主体退役、新候选、证明重挂与复审过期必须作为**一个事务**提交（文件头 `apps/electron/src/main/lib/review/review-v3-t03-subject-restructure.ts:1-7`）。

## 2. 导出与关键符号

`export` 逐条核对：2 个接口 + 2 个函数 = 4 个导出（类/常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `T03RestructureProposal` | 接口（导出） | 13-28 | `{kind:'split'\|'merge',operationId,caseId,expectedRevision,retireSubjectIds,retireEvidenceLinkIds,proposedSubjects,proposedObservations,proposedEvidenceLinks,blockedReasons,impact}` | 原主体仅在单 CAS 成功后置 ignored（`:18`）；新 observation 全未确认（`:22-23`）；迁移链接全 candidate（`:24-25`） |
| `T03SplitPart` | 接口（导出） | 30-38 | `{id,title,fieldKeys,evidenceLinkIds,sourceRefs?}` | 证据须显式 ID，不从共享证书/同名猜测（`:34`） |
| `proposeT03SubjectSplit` | 函数（导出） | 114-196 | `(aggregate,run,input)=>T03RestructureProposal` | 拆分提案 |
| `proposeT03SubjectMerge` | 冲数（导出） | 202-273 | 同上 | 合并到**新**身份 |
| `activeRef`/`uniqueRefs`/`freshObservation`/`freshLink` | 内部 | 40-80 | 来源有效性/去重；新 obs（`confirmed:false`、`supersedesObservationId`）/新 link（`status:'candidate'`） | |
| `subjectById`/`ensureNewIds` | 内部 | 81-91 | 找有效原主体；新 ID 须全新不重复 | `找不到有效原始事项：X`/`拆并后主体 ID 必须是全新且互不重复的标识` |
| `currentObservations` | 内部 | 92-101 | 每字段取 `current ?? history 末条` | 后到 AI 假说不挤掉仍有效的人工确认（`:93-94`） |
| `operationChecks` | 内部 | 102-107 | requestId 非空 + 非 decided/archived | `已决定或归档案卷不能直接重写主体；请使用正式复核流程` |

## 3. 内部逻辑与关键流程

### 3.1 拆分（`proposeT03SubjectSplit`，`:114-196`）

1. `operationChecks`；原主体有效；parts ≥2（`拆分至少需要两个目标事项`）；新 ID 校验（`:119-122`）。
2. 归属检查（blockedReasons 而非丢弃，`:129-136`）：每个字段恰好归属一个 part（`字段未唯一归属：X`）；每条非 rejected 旧链接恰好归属一个 part（`证明未唯一归属：X`）；无效链接 ID（`存在无效证明关联 ID`）。
3. 逐 part：字段取原主体值（`:142-143`）；来源=显式 sourceRefs（active）+ 归属字段的 current observation 来源 + 归属链接派生 ref（blockRef 优先，保真定位，`:144-156`）——注释：把原主体全部 ref 复制给每个拆分件会伪造归属（`:144-145`）。
4. blocked：无可核验来源（`新事项缺少可核验来源：X`）、含失效来源（`新事项包含失效来源：X`）、拆分事实缺当前有效来源（`拆分事实缺少当前有效来源：F`）、链接用失效原件（`证明使用了已失效原件：L`）（`:163-179`）。
5. 返回提案：`retireSubjectIds:[origin.id]`、`retireEvidenceLinkIds:全部旧链接`、`impact=planT03Recheck(...)`（`:184-195`）。

### 3.2 合并（`proposeT03SubjectMerge`，`:202-273`）

1. `operationChecks`；≥2 不同事项（`合并至少需要两个不同事项`）；新 ID 校验（`:207-209`）。
2. 字段合并（`:219-229`）：每 key 取各主体“effective 值”（current observation 优先于原字段，`:220-225`）；值不唯一 → `合并字段存在冲突，必须人工确认：K`（**不写入新主体**，`:226-228`）。
3. 来源：各主体 sourceRefs 并集（active）；全无且 observations 无 active 来源 → `合并事项缺少当前有效原件来源`（`:230-234`）；每条 current obs 来源须有效（`合并事实缺少当前有效来源：F`，`:236-239`）。
4. 链接去重（`[documentVersionId,supportsFact,blockRef]` 签名）且须 active 原件（`:242-248`）。
5. 结构一致性：跨分项拒（`跨分项事项不能直接合并`）、跨类型拒（`不同类型的事项不能直接合并`，`:251-254`）。
6. 返回：`retireSubjectIds:输入全部`、单新主体（`correction:'user-confirmed'`）、`impact=planT03Recheck`（`:260-272`）。

## 4. 调用者与调用链

入向（冻结树 grep）：生产消费点在 T03 工作台的单 CAS 命令适配（注释 `:3-6`）；测试：`review-v3-t03-fact-workflow.test.ts:2`（`proposeT03SubjectMerge`/`proposeT03SubjectSplit`，本批用例 6-7）。出向：`@profer/shared` 类型；`review-v3-t03-fact-workflow.ts:11`（`planT03Recheck`/`projectT03Facts`）。

## 5. 数据 I/O、读写与副作用

纯提案：不写聚合（测试断言原 subjects/links 不变，`review-v3-t03-fact-workflow.test.ts:142-143`）；无 IO。

## 6. 分支、失败、取消与恢复

| 抛 `Error` | 触发 | 行 |
| --- | --- | --- |
| `找不到有效原始事项：X` | 原主体缺失/ignored | 83 |
| `拆并后主体 ID 必须是全新且互不重复的标识` | ID 非法 | 89 |
| `拆并操作必须有稳定 requestId` | operationId 空 | 103 |
| `已决定或归档案卷不能直接重写主体；请使用正式复核流程` | 阶段 | 105 |
| `拆分至少需要两个目标事项` | parts<2 | 121 |
| `合并至少需要两个不同事项` | <2 | 208 |

其余“失败”为 `blockedReasons`（§3），由调用方拒绝提交；无取消概念。

## 7. 权限与权威状态

- 新 observation 恒 `confirmed:false`（即使复制自已确认输入，`:22-23`）；新链接恒 `candidate`（`:24-25`）——归属须人工确认。
- 字段冲突不静默取值（`:226-228`）；归属不明阻断提交（`:112`）。
- `operationChecks` 禁止改写已决定/归档案卷（`:104-106`）。

## 8. 修改影响面

- 改提案形状影响唯一 CAS writer 的 mutate 与 T03 工作台。
- 改 `currentObservations`/冲突语义影响 A05 防掩盖断言（测试用例 7）。

## 9. 测试证据

直接测试：`review-v3-t03-fact-workflow.test.ts`（本批，详见其手册）用例 6：split 提案 blockedReasons 空、2 个 proposedSubjects、obs 全未确认、links 全 candidate、原数据不变；merge 冲突 blockedReasons 含“合并字段存在冲突，必须人工确认：score”、新主体无冲突字段、links 全 candidate。用例 7（A05）：主体字段相等但确认 observation 冲突仍阻断。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

缺口：`确保新 ID`/阶段拒绝/`找不到主体`/跨分项跨类型分支、split 的多 part 归属矩阵、merge 无冲突正例无独立断言。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 纯提案、原数据不变 | 已证实 | 测试 `:142-143` |
| 新 obs/links 恒未确认/candidate | 已证实 | `:48-80`；测试 `:140-141,150` |
| 字段冲突阻断不掩盖（A05） | 已证实 | `:226-228`；测试 `:152-165` |
| 拆分来源不伪造 | 已证实 | `:144-156` |
| 单 CAS 事务约束 | 未知 | 由调用方（CAS writer）保证，未逐行核 |
| 生产接线 | 未知 | 本批未逐行核 T03 命令入口 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `proposeT03SubjectSplit` | §3.1 | 114-196 | covered |
| `proposeT03SubjectMerge` | §3.2 | 202-273 | covered |
| 内部构造族 | §2 | 40-107 | covered |
| 权限/冲突语义 | §7 | 18-25,226-228 | covered |
| 阶段/ID/类型分支 | §6,§9 | 102-121,208,251-254 | partial |
| CAS writer 接线 | §10 | — | unknown |
