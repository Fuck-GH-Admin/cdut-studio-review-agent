---
path: apps/electron/src/main/lib/review/coverage-ledger.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ef923fe92608869169e1fa8623e581ae9f20aa74
sha256: 64914e5bcfe152e08a30742012d471171013ff6771c36f5895b81957d57d093f
lines: 196
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/coverage-ledger.ts

## 1. 结论与边界

覆盖账本（M2，头注 :1-7，A08/K06）：材料账本（每文档版本 read/partially-read/unread+原因，未识别不从分母消失）+ 检查账本（计划检查缺失记 `not-executed`）；「全部符合」仅当：无未读材料 **且** 计划检查全部执行 **且** 无 awaiting。

边界：纯函数；不产生检查结果；`CheckResult` 由引擎/运行层给出。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `DocumentLedgerEntry` | interface | 11-16 | 材料账目 |
| `buildDocumentLedger` | fn | 19-39 | 材料账本（parse 失败/人工凭据语义） |
| `CheckLedgerEntry` | interface | 41-46 | 检查账目 |
| `buildCheckLedger` | fn | 130-136 | 检查账本（reconcile 的 entries） |
| `CoverageSummary` | interface | 138-148 | 汇总形状（含 `allClearVerdictAllowed`/blockers） |
| `combineCoverage` | fn | 150-196 | 双账本组合 + 全符合判定 |

内部：`CHECK_STATUSES`（:48-51）、`CheckLedgerReconciliation`（:53-57，含 `unexpectedResults`）、`reconcileCheckLedger`（:59-128）。

## 3. 内部逻辑与关键流程

1. **`buildDocumentLedger`**（:19-39）：有 `manualReadReceipt` → `read` + `审核员已核对原件：{reason}`（:22-29）；`parseStatus==='failed'` → **`unread`**（即使 usage=read，注释 :18）+ `自动解析失败；空占位块不代表读过原件。…`（:33-35）；否则 usage+unusedReason（:30-37）。
2. **`reconcileCheckLedger`**（:59-128）：建 resultKeys（subject/case/group 三种键，:72-87）与 checkId/ruleId 计数（:66-68/:73-75）。`record`（:89-105）：同名规则多版本 → `not-executed 同名规则来自多个版本，缺少可核实的唯一检查身份`（:92-93）；候选≠1 → `not-executed 同一计划目标收到多个结果，不能任意选一个`（:94-95）；命中但 checkId 缺失/重复/状态非法/not-applicable 无理由 → `not-executed 检查身份、状态或不适用理由无效，不能计为已覆盖`（:96-99）；否则入账命中状态（:100-102）。展开分母（:107-127）：subject 规则按主体（sectionId 过滤分项主体 :108）、group 规则按组值逐组（**G12/误判 5：不折叠**，缺组 → not-executed）、case 规则单条。`unexpectedResults = results.length - matched.size`（:128，多余/重复/无效结果单独计）。
3. **`combineCoverage`**（:150-196）：blockers 依次：空计划 `没有有效检查计划，不能宣称全部符合`（:172）/全 not-applicable `本次没有适用检查…`（:173）；逐未读材料 `材料「…」未完整读取（…）`（:175）；`N 项计划检查未执行`（含 execution-failed，:177）；`N 项检查待确认/待补件`（:178）；`N 项检查不符合`（:179）；`N 项检查结果无法与计划唯一对应（含多余、重复或无效结果）`（:180-185）。汇总口径（:187-195）：plannedChecks=账本长度；completed=非 not-executed/execution-failed；effectiveVerdicts=合规/不合规；pendingChecks=awaiting+notExecuted；`allClearVerdictAllowed = blockers.length===0`。

## 4. 调用者与调用链

入向（生产）：`pi-case-review-service.ts:13`（`combineCoverage`，Pi 运行收尾覆盖装配）；`review-v3-f07-plan-coverage.ts:13`（`buildDocumentLedger`）。测试：`coverage-ledger.test.ts:6`。`buildCheckLedger` **生产零消费者**（全树检索仅定义与测试）。出向：`@profer/shared` 类型（:9）；纯函数。

## 5. 数据 I/O、读写与副作用

纯函数；无 I/O/日志。

## 6. 分支、失败、取消与恢复

无 throw；异常情况全部以 `not-executed`+reason 入账（fail-closed：不能「以零问题掩盖错案/重复检查」，注释 :55）。无取消概念。

## 7. 权限与权威状态

- 分母权威：计划检查全量入账（未识别/缺结果不消失）；同名规则多版本不共享结论（:92-93）。
- 结果权威：一目标多结果不任选（:94-95）；身份/状态/不适用理由无效不计覆盖（:96-99）。
- 全符合权威：五类 blocker 任一存在即 `allClearVerdictAllowed=false`（:171-185）。
- 人工凭据权威：`manualReadReceipt` 可把失败材料转 `read`（:22-29）——凭据字段为结构记录，核验在上游。

## 8. 修改影响面

- `pi-case-review-service` 的 coverage/blockers（RUN 系语义）、`review-v3-f07-plan-coverage` 的覆盖装配。
- 键构造（`ruleId::subject::…`）变更影响结果匹配。
- 同测：`coverage-ledger.test.ts`（22 用例）。

## 9. 测试证据

直接测试 `coverage-ledger.test.ts`（22 用例 / 5 describe；纯函数夹具 doc/rule/result + `NullOcrPort/describePreview`；NOT_RUN）要点：
- 材料账本（3）：混合状态全入账带原因（:19-27）；parse 失败 usage=read 按 unread 入账 + 全符合阻断（:29-38，reason 断言 `解析原因：文件无法解码`）；`manualReadReceipt` 转 read（:40-52）。
- 检查账本（2）：2 规则×2 主体 3 结果 → 4 账目、缺项 `not-executed`（:56-62）；分项规则只为所属分项建账（:64-71）。
- combineCoverage（11）：违规不全符合（:75-79）；仅登记/空计划/全不适用不宣称（:81-85）；未读+未执行 blockers 含 `未完整读取`/`未执行`、pendingChecks 1（:86-93）；全清 → true、blockers `[]`（:95-101）；execution-failed 不计完成（:103-109）；案卷级结果不冒充主体分账（:111-118）；一目标两结果不任选（:120-127）；重复 checkId 不计两项（:129-134）；同名异政策版本不共用结论（:136-142）；合法空发现可符合、假结果阻断（:144-151）；不适用须理由、空主体不覆盖（:153-158）。
- OCR/预览（2）：NullOcrPort 如实拒绝 `OCR 不可用`（:162-166）；describePreview 图片直显/needs-renderer（:168-171）。
- 组规则（4）：三组只回填二 → `g3` not-executed、不折叠（:178-183）；无 groupBy 用整作用域键（:185-189）；组级聚合按主体列表匹配（:191-196）；未执行组阻断 allClear（:198-202）。

未覆盖：`buildCheckLedger` 的 sectionId 无映射分支、`unexpectedResults` 计数单独断言；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 导出/内部符号行号如 §2 | 已证实 | 逐条 |
| parse 失败=unread（例外凭据） | 已证实 | :22-35 + 测试 :29-52 |
| 不任选/不共用/不折叠 | 已证实 | :92-99/:117-127 + 测试 |
| 全符合五类 blocker | 已证实 | :171-185 |
| `buildCheckLedger` 生产零消费者 | 已证实（否定） | 全树检索 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `buildDocumentLedger` | §3.1/§9 | 19-39 | covered |
| `reconcileCheckLedger` 三类键+record | §3.2 | 59-128 | covered（经 combine） |
| `buildCheckLedger` | §3.2 | 130-136 | covered（生产零消费） |
| `combineCoverage` 五类 blocker | §3.3/§9 | 150-196 | covered |
| sectionId 缺映射/组值缺失 | §9 | 108/115-116 | partial（未测） |
