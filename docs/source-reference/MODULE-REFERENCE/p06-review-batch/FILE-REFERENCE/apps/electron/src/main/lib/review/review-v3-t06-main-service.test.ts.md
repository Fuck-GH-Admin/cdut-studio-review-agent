---
path: apps/electron/src/main/lib/review/review-v3-t06-main-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 652ecff14e65c9c314308150c25f2b325d6fd074
sha256: 0647d0e0dd622736e1b8326331c246c10ce6689d6e6fddef400f41badeeff2e5
lines: 419
kind: test
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t06-main-service.test.ts

## 1. 测试目标

T06 物理入库 Main 端口：指纹校验、幂等、部分失败不掩盖（文件头 `:1-3`；真实 OS 选择器无法单测，直接注入内部选择状态但对真实目录/ZIP 读盘）。覆盖 RUN-38/39 必填模板语义、BATCH-15/17、RUN-45/BATCH-07 恢复、BATCH-09 建批校验、B1 返修正负例。被测：`buildT06SelectionFromPath`、`commitT06PhysicalImport`、`__resetT06ProcessCachesForTest`（`review-v3-t06-main-service`），联动 `stage-workflow.submitCaseV2`、`application-service`、`batch-store.createBatchV2Validated`、`run-async-service.assembleAndRunReview`。

夹具：`PROFER_CONFIG_DIR=mkdtemp(t06m-)`（`:10-12`）；三个模板：`t06-physical@1`（`applicant` case 字段）、`t06-other-business@1`、`t06-required-inputs@1`（必填 `amount`+必需分项 `decl`+必交槽 `application-form`，`:45-62`）；`seedSelection(files)` 真实临时目录写文件后 `buildT06SelectionFromPath`（`:37-43`）。本轮 `NOT_RUN`。

## 2. 用例清单

1 describe、**17 test**：

| # | test 行 | 断言要点 |
| --- | --- | --- |
| 1 | `:67-74` | `previewFingerprint:'deadbeef'` → 拒“来源内容在预览后发生变化” |
| 2 | `:76-89` | 同 requestId 两次提交 `toEqual`、1 组 done、有 batchId |
| 3 | `:91-111` | 坏组（未知 entryId）failed（“不在本次来源中”）**caseId 仍存在**、好组 done+1 文档 |
| 4 | `:113-129` | 混合模板：2 组 done、2 批次（`[templateId, anotherTemplateId]`）、成员不交叉 |
| 5 | `:131-146` | 模板缺失组隔离：`['failed','done']`、批次只含好案卷 |
| 6 | `:148-162` | 两次同名同大小同内容入库 → **不同** documentVersionId（按案卷隔离） |
| 7 | `:164-187` | RUN-38/39：warnings 含“必交材料槽”“申报金额”、`caseFields.amount` undefined、`submitCaseV2` 拒“尚未补齐必填输入”、`assembleAndRunReview` 拒 `/尚未提交审核\|尚未补齐/` |
| 8 | `:189-215` | 显式 `fieldValues/subjects/entryAssignments`：无 warnings、文档 role/slot/fileName 保留、提交成功 → `submitted` |
| 9 | `:217-230` | 非法槽位拒组“材料槽不在所选模板中” |
| 10 | `:232-271` | B1 返修：补录（`updateFields/upsertCaseSubject`）后 subjects/`amount:{kind:'number',value:5000}`、文档不丢、提交成功 |
| 11 | `:273-316` | B1 负例：未知分项拒“审核分项不存在”、对象值拒“必须是有效数字”；T06 建案阶段同拒且 `caseId` undefined |
| 12 | `:318-325` | BATCH-17：隐藏文件进 `excluded`（reason 含“隐藏”），entries 只有可见文件 |
| 13 | `:327-340` | BATCH-15：同 requestId 并发第二单拒“正在本进程处理中” |
| 14 | `:342-359` | RUN-45/BATCH-07：`__resetT06ProcessCachesForTest` 模拟重启后恢复，`toEqual` 原回执、revision/文档数不变 |
| 15 | `:361-384` | RUN-45：伪造死 `ownerPid:2147483646` running 账本 → 接管续跑 done、有 batchId |
| 16 | `:386-404` | BATCH-09：`createBatchV2Validated` 拒不存在案卷（“批次成员与模板/政策锁不一致”）/政策锁不符（“政策锁”）；合法案卷可建批 |
| 17 | `:406-418` | 预览后同长换内容（AAA→BBB）→ 组 failed（“内容已变化”） |

## 3. 真实断言

- #3 断言失败组**保留 caseId**（`:107` 注释“失败案卷仍然被创建并记录，便于复核”）。
- #6 断言两案卷的 `documentVersionId` 不同——“同名同大小不能共享 DocumentVersion”。
- #7 的 `assembleAndRunReview` 断言是 MANAGER-INTAKE-GATE #2（不能绕过提交按钮跑审核）。
- #11 断言 `wrongType.cases[0]?.caseId` 为 `undefined`（建案前失败不谎报 caseId）。
- #14 用 `__resetT06ProcessCachesForTest` 模拟进程重启（测试专用钩子，`:353`）。
- #15 直接手写账本 JSON 制造“中断现场”（`:373-379`），验证 ownerPid 死亡接管。

## 4. 未覆盖与脆弱点

**未覆盖**：`pickT06PhysicalSource`（OS 弹窗，`:3` 注释）；ZIP 来源全流程（解包、恢复重核、zipDecodedCache、`attachment` 映射）；`existing` 组绑定；`isRequestLedgerBusy` 超龄窗口；512MB/2000 上限；`batchError` 分支。

**脆弱点**：#15 依赖 `ownerPid:2147483646`（Linux 上不可能存活；非跨平台验证）；#7/#10/#11 依赖 `application-service` 的字段校验文案（“必须是有效数字”）；模板夹具用 `as never` 绕过类型；`submitCaseV2`/`assembleAndRunReview` 跨服务断言受这些服务变化影响。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 describe、17 test、真实目录/模板 | 已证实 | `grep -c test(`=17 |
| 指纹守卫（预览后变化/同长换内容） | 已证实 | #1/#17 |
| 三层幂等+并发 busy | 已证实 | #2/#13/#14 |
| 部分失败保留、不进批次成员 | 已证实 | #3/#5 |
| RUN-38/39 必填语义+提交门禁 | 已证实 | #7/#8/#10/#11 |
| 混合模板拆真实批次 | 已证实 | #4 |
| 案卷级文档隔离 | 已证实 | #6 |
| BATCH-17/15、RUN-45 恢复/接管 | 已证实 | #12/#13/#14/#15 |
| BATCH-09 建批校验 | 已证实 | #16 |
| ZIP/弹窗路径 | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| `buildT06SelectionFromPath` folder | #12/#17 | `:318-325`、`:406-418` | covered |
| `commitT06PhysicalImport` 幂等 | #2/#13/#14 | 多处 | covered |
| 组隔离/部分失败/建批 | #3/#4/#5/#16 | 多处 | covered |
| RUN-38/39+B1 返修 | #7/#8/#10/#11 | 多处 | covered |
| 归属/槽位 | #9 | `:217-230` | covered |
| 账本恢复/接管 | #14/#15 | `:342-384` | covered |
| ZIP/弹窗/attachment/existing | — | — | unknown |
