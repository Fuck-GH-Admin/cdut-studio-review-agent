---
path: apps/electron/src/main/lib/review/review-tools.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b6f95eb7dce058f3d88dfb6aa0314cdd87ce5ab4
sha256: 6cdeb3f808abfad3951d4a6d58f5f6080ca763ba634591a26cf63dcb24359269
lines: 476
kind: source
package: p05-review-engine
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-tools.ts

## 1. 结论与边界

审核业务工具集（M3，文件头 `apps/electron/src/main/lib/review/review-tools.ts:1-7`）：Pi 执行器装配的**本案业务工具**（不暴露通用文件/网络工具）；全部写入经受控函数（Observation/EvidenceLink/CheckResult 追加），**不直接写盘、不触碰主进程状态**。工具边界：`read_` 前缀只读；`record_/link_/submit_` 前缀受控写入（返回新数组，持久化由执行器在 checkpoint 统一处理，`:13`）。

边界：不做确定性规则计算（"组级计分走确定引擎"，`:332`；`rule.execution !== 'semantic'` 的规则 Agent 不得覆盖 `:337`）；不产生人工确认（`link_evidence` 是 candidate，`:311`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `ReviewToolContext` | interface（export） | `:14-29` | `{ caseId; subjects; documents; rules; fields?; caseFields?; observations; evidenceLinks; results; actor; caseRoot?; documentCapabilities?; onCapabilityEvent?; inspectDocumentImage? }` | 受控内存态 |
| `ReviewTool` | interface（export） | `:31-37` | `{ name; description; input; execute(input) => Promise<{ok:true;data}\|{ok:false;error}> }` | 工具契约 |
| `reviewCheckToolKey` | function（export） | `:82-84` | `(ruleId, scope, subjectIds) => string` | `check:<ruleId>::<scope>::<sorted ids>` |
| `buildReviewTools` | function（export） | `:87-476` | `(context) => ReviewTool[]` | 装配 13 个工具 |
| 内部函数 | function（内部） | `:39-79` | `findSubject/numericValueOccursInQuote/fieldPayload/crossSectionDuplicateSubjects/latestObservation` | 见 §3.1 |

工具清单（13 个）：`list_review_documents` `:114-124`、`read_document` `:126-148`、`read_documents` `:150-165`、`inspect_document_image` `:167-201`、`read_subject_field` `:203-230`、`search_document_text` `:232-244`、`read_rule` `:246-254`、`record_observation` `:256-308`、`link_evidence` `:310-329`、`submit_check` `:331-401`、`search_document_text_batch` `:409-428`、`record_observations` `:430-448`、`submit_checks` `:450-473`（后三个批量工具由前三个按名复用 `:403-406`）。

## 3. 内部逻辑与关键流程

### 3.1 内部函数

- `findSubject`（`:39-41`）；`fieldPayload`（`:50-53`，FieldValue 取 `value` 或 `documentVersionId`）。
- `numericValueOccursInQuote`（`:43-48`）：双方归一化（去 `，,空白￥¥元` 与尾随 `.0`）后，从 quote 抽数字 token 匹配——**数字字段必须能在原文中找到**。
- `crossSectionDuplicateSubjects`（`:55-75`）：仅 `targetScope==='group'` 且 requirement 含"重复"+"确认"时启用；以"成果/奖项/项目/作品 名称"类 identity 字段（`:60-62` 正则）跨分项比对（≥3 字符、大小写折叠），返回疑似重复 subjectId。
- `latestObservation`（`:77-79`）：按 subjectId+fieldKey 过滤全部 observation（注释命名"latest"，实现返回全部匹配）。

### 3.2 关键工具行为

- `ref()`（`:94-108`）：SourceRef 构造——文档/块必须存在；image 块不可带 quote（`:99`）；quote 必须是块文本子串（`:100`）；quote 截 400 字（`:106`）。
- `unreadRuleDocuments`（`:109-111`）：`role==='rule'` 且 `!isFullyRead` 的 active 材料。
- `read_document`（`:126-148`）：blockIds ≤80（`:133`）、offset/limit/sheetName/fromRow/toRow 按类型透传 `documentCapabilities.read`；异常转 `{ok:false,error}`。
- `read_documents`（`:150-165`）：≤8 份（`:155`）、`Promise.all` 并发、统计 submitted/notProcessed/accepted/rejected。
- `inspect_document_image`（`:167-201`）：必填三参；无 `context.inspectDocumentImage` 即拒（":175"）；`loadImage` → 多模态识别 → **合成 `vision-<blockId>` 文本块**写回 `document.blocks`（`:182-193`，含 `vision:{imageBlockId, engine:'项目 Pi 审核 Agent'}`）→ `markImageRead` + `read` 记录阅读。
- `read_subject_field`（`:203-230`）：**取值优先级** = 用户已确认值 → 用户未确认值 → 体/案字段默认 → 最后 AI 值（`:212-215/:221-224`）；缺失返回 `{known:false,value:null}`（不是空串）。
- `search_document_text`（`:232-244`）：limit 固定 50、`offset` 翻页；`truncated = nextOffset !== null`。
- `read_rule`（`:246-254`）：返回 11 个规则字段；缺失即错（"不存在或未确认规则不得推断为自动通过" `:247`）。
- `record_observation`（`:256-308`）：字段在模板校验（`:262-263`）、作用域（case/subject/section）四重校验（`:264-268`）、类型匹配（`:270`）、**必须带 blockId+quote**（`:277-278`）、数字须在 quote 中（`:283`）、kind 分派 number/boolean/multi/text|date|enum/其他拒绝（`:280-296`）→ `recordObservation(..., extractedBy:'ai')` 受控写入（`:297-305`，原地替换数组）。
- `link_evidence`（`:310-329`）：文档/主体存在性校验 → `buildEvidenceLinks(..., linkedBy:'ai')`。
- `submit_check`（`:331-401`）核心守卫链：规则存在（`:335-336`）→ 仅 semantic 规则（`:337-338`）→ scope 匹配（`:339`）→ status 五值（`:340-343`）→ **compliant/non-compliant 前必须完整读完 role=rule 材料**（`:344-352`，列出未读材料）→ 主体列表合法（`:353-355`）→ 跨分项重复检查（`:356-359`，重复时禁确定结论）→ group 规则须覆盖全部适用事项（`:360-361`）、subject 规则每次一项（`:362`）→ 确定结论必须带 blockId 级 sourceRefs（`:363-366`）且真实可解析（`:367-379`）且 quote/图像定位与原文匹配（`:380-384`）→ 组装 `CheckResult`（`executedBy:'semantic'`，`:385-394`）→ 同 `checkId` 覆盖（`:395-397`）。
- 批量工具（`:407-474`）：`search_document_text_batch` 关键词去重 ≤32（`:413-416`）；`record_observations` ≤50（`:435`）；`submit_checks` ≤50 + 汇总 toolKeys（`:455/:466-470`）；均逐项复用单条工具、统计 notProcessedCount。

## 4. 调用者与调用链

- **入向（生产）**：`apps/electron/src/main/lib/review/v2-executor-factory.ts:26`（import）、`:803`（`buildReviewTools({...})` 装配）、`:959-960`（`reviewCheckToolKey` 生成覆盖账本键）。测试入向：`review-tools.test.ts`（12 用例）、`pi-review-executor.test.ts`（执行器集成）。
- **出向**：`./evidence-service` 的 `buildEvidenceLinks/recordObservation`（`evidence-service.ts:62/:13`，`:10` 导入）、`./document-capability-library` 的 `DocumentCapabilityLibrary`（`:67`；方法 `listDocuments/read/search/loadImage/markImageRead/isFullyRead`，`:120/:134/:240/:177/:194/:110` 调用）。

## 5. 数据 I/O、读写与副作用

- 输入：`ReviewToolContext` 受控内存态；输出：`{ok,data|error}` 结构化结果。
- 写入面：`context.observations/evidenceLinks/results` 三数组（原地 length=0 + push，`:304-305/:325-326/:395-397`）；`document.blocks`（vision 块 `:184-193`）；`documentCapabilities` 的阅读状态（`markImageRead/read`）。
- 副作用：`onCapabilityEvent` 钩子（`:121/:241`）；无磁盘/网络/进程（inspectDocumentImage 能力由注入回调承担）。
- 并发：`read_documents`/批量工具内部串行或 Promise.all，但工具调用由执行器序列化（推断）；无锁。

## 6. 分支、失败、取消与恢复

- 全部业务拒绝走 `{ok:false, error: <中文消息>}`（**不抛异常**，唯一例外是 `documentCapabilities.read` 等内部抛错被 catch 转 error，`:144-146/:197-199`）。
- 关键拒绝：未读完规则材料不得出确定结论（`:346-351`）、数字不在原文（`:283`）、引用与原文不匹配（`:276/:378/:384`）、跨分项重复须人工（`:357-358`）、确定性规则不可覆盖（`:337`）。
- 无取消机制（execute 无 signal）；失败后上下文不变（写入都在校验之后）。
- 幂等：`submit_check` 同 checkId 覆盖（`:395-397`）；`record_observation` 经 `recordObservation` 建 supersedes 链（description `:257`）。

## 7. 权限与权威状态

- 无 sender/role 检查（执行器/IPC 层职责）；`context.actor` 仅存储（`:20`）。
- 权威状态：人工确认值优先（`extractedBy==='user' && confirmed`，`:212/:221`）；AI 提取值 `extractedBy:'ai'` 不覆盖人工；确定性规则结果归确定引擎（`:332/:337`）；`executedBy:'semantic'` 标记检查来源（`:392`）。

## 8. 修改影响面

- 改工具契约/守卫 → `v2-executor-factory.ts:803-960` 的覆盖账本、`review-tools.test.ts`（12 用例）、`pi-review-executor.test.ts`。
- `reviewCheckToolKey` 生成规则变化 → 覆盖账本键（`:959-960`）与既有案卷兼容性。
- `recordObservation/buildEvidenceLinks`（evidence-service）语义变化 → 观测/证据链（跨批）。

## 9. 测试证据

**直接测试 `review-tools.test.ts`（12 个 `test()`，bun:test，NOT_RUN；只列名与断言主题，未逐条抄断言行）**：`read_subject_field` 缺失返回 unknown 非空串（`:22`）、search 命中带坐标（`:31`）、材料目录/块读取真实位置（`:38`）、批量工具逐项校验（`:46`）、record_observation supersedes 链（`:76`）、案卷级数字字段带原文提取（`:88`）、Agent 不能覆盖确定性结果（`:108`）、非法规则/状态如实拒绝（`:117`）、语义结论须带有效材料块（`:124`）、未读完规则材料拒确定结论（`:131`）、跨分项重复要求人工（`:156`）、link_evidence candidate（`:174`）。

未覆盖：`inspect_document_image` 合成 vision 块路径、`numericValueOccursInQuote` 边界（尾零/千分位）、`submit_checks` toolKeys 汇总。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出 + 5 内部 + 12 工具全守卫链 | 已证实 | 逐行读 `:1-476` |
| 确定结论须读完规则材料、数字须在原文、人工值优先 | 已证实 | `:344-352`、`:283`、`:212/:221` |
| 受控写入不落盘 | 已证实 | `:3-5` 注释 + 全文无 fs |
| 12 测试主题与守卫一一对应 | 已证实（名称级） | `review-tools.test.ts` 行号 §9 |
| `recordObservation`/`buildEvidenceLinks`/capability 内部 | 未知 | 跨批文件未逐行读 |
| 执行器串行化保证 | 推断 | 由 `v2-executor-factory` 编排 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `buildReviewTools` 12 工具 | §2/§3.2 | `:87-476` | covered |
| 内部 5 函数（含重复检测/数字匹配） | §3.1 | `:39-84` | covered |
| `reviewCheckToolKey` | §2/§8 | `:82-84` | covered |
| 受控写入面/副作用 | §5 | 调用行号 | covered |
| 测试 12 用例 | §9 | 测试行号 | covered（NOT_RUN） |
| 跨批依赖内部 | §10 | — | unknown |
