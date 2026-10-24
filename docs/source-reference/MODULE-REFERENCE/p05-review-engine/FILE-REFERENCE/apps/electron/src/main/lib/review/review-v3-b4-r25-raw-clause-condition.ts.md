---
path: apps/electron/src/main/lib/review/review-v3-b4-r25-raw-clause-condition.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 43b3b1dc825f9e22596ba9ff1823e908a046a3ee
sha256: ee2777180b0e7fe2e5279c13a7ab2c124503d33e3fac5b52936d992982cd2f17
lines: 275
kind: source
package: p05-review-engine
author: docs-r07-author-nb-47-20261023
reviewer: p05-review-engine
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-b4-r25-raw-clause-condition.ts

## 1. 结论与边界

Dev-B R25：原文逐字节条款 pin → 冻结 Check 谱系 → **仅候选**的逐规则/逐对象条件见证。文件头 :1-9 明示：永不签发学校政策/权威/Gold/Case/Run/Check PASS；R25 JSON 中的 raw SHA 回执由完整 Library 文件独立计算（非 R14 重构）；CI 复核 RAW 见证但无法重算私有 Library 哈希。

不做的事：不发政策引用、不改 R14/R13 证据、不做语义判定（`semanticValidated:false` 恒定）；`evaluateB4R25ClauseBoundConditions` 输出恒 `cannotAuthorizeSchool:true`。

## 2. 导出与关键符号

导出 9 条（`export` 逐条核 :29/:41/:58/:75/:91/:211/:219/:223/:237）：

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `B4R25RawClausePin` | interface | `:29-39` | 单条 pin：domain/templateId/ruleId/rawSourceSha256/headingLine/rawExcerptSha256/rawRuleBodyNonBlankLines/r14AdditionalNonRuleContextLines |
| `B4R25RawClauseEvidence` | interface | `:41-56` | `review-v3-b4-r25-independent-raw-clause-pins/1` + frozenD4GitSHA + rawOriginals×3 + observedLaterVersions×3 + clauses[32] |
| `B4R25RuleProof` | interface | `:58-73` | 输出 proof：四哈希（rawSource/rawExcerpt/triggerLine/binding）+ checkIds + requiredDimensions + 状态常量（`SOURCE_BODY_VERBATIM_HASH_MATCH_CANDIDATE_ONLY` 等） |
| `B4R25ClauseAudit` | interface | `:75-84` | `rules:32 / independentlyRawBound:32 / contextContamination:1 / candidateOnly:true` 字面量类型 |
| `auditB4R25OriginalClauseBindings` | function | `:91-209` | `(raw, r13, r14, archives) => B4R25ClauseAudit` 整链审计 |
| `B4R25RuleConditionReceipt` | interface | `:211-217` | 五字段回执（templateId/ruleId/rawExcerptSha256/triggerLineSha256/bindingSha256） |
| `B4R25ObservedCondition` | interface | `:219-221` | `{instance: B4RiskInstance, clauseReceipt?}` |
| `B4R25BoundFinding` | interface | `:223-231` | 结论项：candidatePredicate + reason 枚举 + `cannotAuthorizeSchool:true`/`semanticValidated:false`/`publicationAllowed:false` |
| `evaluateB4R25ClauseBoundConditions` | function | `:237-275` | 按选中规则绑定观察条件 |

内部符号：`frozen` 常量 `b68443b2…`（:23）、`hash`（:24，utf8 sha256）、`sha64` 正则（:25）、`deny`（:26，抛 `Error('B4_R25_…')`，注意非 C0ContractError）、`domains = ['G03','G04','G06']`（:27）。

## 3. 内部逻辑与关键流程

### 3.1 `auditB4R25OriginalClauseBindings`（:91-209）

1. 先整链校验上游：`validateB4RuleAnchorLedger(r13, archives)`（:97）、`validateB4HighRiskEvidence(r14, archives)`（:98）。
2. raw 头校验（:99-107）：schemaVersion/frozenD4GitSHA===`frozen`/`publicationAllowed===false`/`schoolPolicyVerified===false`/method 非空/clauses 长度 32/rawOriginals 3 键/observedLaterVersions 3 键/每 domain 文件+sha64+byteCount≥1，违者 `B4_R25_RAW_PROVENANCE_HEADER`。
3. 历史版本钉扎（:109-121）：`G02='g02-t03-review'`/`G04='d4-g04-t06'`/`G08='g08-t03'`；恢复哈希硬编码（G02 `e3d1d015…`、G04 `d9c459f2…`、G08 null）；状态 `RAW_VERIFIED_MATCH_CANDIDATE_ONLY`（G02/G04）与 `RAW_NOT_AVAILABLE`（G08）；observedOldRawSha256 须 sha64 且 ≠ 恢复值（:120-121），违者 `B4_R25_CONFLICT_VERSION_DRIFT`。
4. pin 索引（:123-135）：格式校验（ruleId `R-\d\d`、双 sha64、headingLine≥1、行数安全整数、additional≥0），键 `templateId/ruleId` 唯一（`DUPLICATE_RAW_CLAUSE`）。
5. 逐 R14 条目（:137-203）：pin 与 R13 anchor 双向绑定（:141-155，`B4_R25_RAW_R13_R14_SOURCE_BINDING`：domain/headingLine/rawSha256/heading/mappedCheckIds/sourceIds 全等）；**逐字节行数校验**（:157-169）：`parts.length === rawRuleBodyNonBlankLines + r14AdditionalNonRuleContextLines` 且 body 前缀哈希 === rawExcerptSha256，否则 `B4_R25_RAW_CLAUSE_VERBATIM_MISMATCH_<id>_LINES_…`（异常仅 G06-T06/R-34 允许 additional=2 :158-160）；`spill` 计数（:170）；触发条件行必须存在（:172-175，`B4_R25_RAW_TRIGGER_NOT_EVIDENCED`）；sourceEvidence 全 `unknown` + locator 齐全（:176-178，`SOURCE_APPLICABILITY_PROMOTED`）；维度账与 `B4_REQUIRED_DIMENSIONS[domain]` 双向吻合（:179-182，`INSTANCE_DIMENSION_NOT_PROVEN`）；产出 proof（:183-203，bindingSha256=hash(JSON(bindingInput))，r14Context 例外标 `NON_RULE_CONTEXT_APPENDED`）。
6. 覆盖封口（:204-205）：`proofs===32 && spill===1 && index.size===32`，否则 `B4_R25_CLAUSE_COVERAGE`。

### 3.2 `evaluateB4R25ClauseBoundConditions`（:237-275）

先跑整链 audit（:246）；按 selected 三元组找 proof（无 → `B4_R25_RULE_NOT_PINNED` :247-249）；observations 形状校验（:250-251）；委托 R24 `inspectB4HighRiskInstanceEvidence`（:252-253）；逐 finding 绑定回执（:254-271）：五字段全等才沿用 R24 的 `candidatePredicate`，否则 `'unknown'` 并给 reason：`CLAUSE_RECEIPT_MISSING`（无回执）/`WRONG_OR_STALE_CLAUSE_RECEIPT`（不匹配）/`INSTANCE_UNRESOLVED`/`TECHNICAL_CANDIDATE_ONLY`。输出恒 `cannotAuthorizeSchool:true`、`semanticValidated:false`、`publicationAllowed:false`（:264-273）。注释 :240-245：R-14 的证据不能因同文件复用来证明 R-17。

## 4. 调用者与调用链

入向（全冻结树 `*.ts`）：
- `apps/electron/src/main/lib/review/review-v3-b4-bulk-evidence-workbench.ts:10`（type `B4R25ClauseAudit`，:77 使用）。
- **否定**：`evaluateB4R25ClauseBoundConditions` 无任何外部调用者/测试（符号名全树检索仅命中自身 :237）；`auditB4R25OriginalClauseBindings` 仅本文件 :246 内部调用；其余类型无外部引用（检索口径：全仓 basename + 9 个导出符号名）。

出向（:10-21）：`node:crypto` createHash；`review-v3-b4-high-risk-semantic-evidence`（`validateB4HighRiskEvidence` :98）；`review-v3-b4-rule-source-diff`（`validateB4RuleAnchorLedger` :97、类型）；`review-v3-b4-obligation-lineage`（B4Archive 类型）；`review-v3-b4-conflict-and-instance-guard`（`inspectB4HighRiskInstanceEvidence` :253、`B4_REQUIRED_DIMENSIONS` :180、B4HighRiskDomain/B4RiskInstance）。

## 5. 数据 I/O、读写与副作用

无 IO/无副作用（依据：仅 createHash + 纯校验；输入全部是已解析 JSON 值）。`deny`/`fail` 抛 Error（非 C0ContractError，:26）。幂等：同输入同输出。

## 6. 分支、失败、取消与恢复

- 失败即抛 `B4_R25_*`/`B4_RULE_DIFF_*`/`B4_R25_RAW_CLAUSE_VERBATIM_MISMATCH_*` Error（详 §3）；无 catch/重试；fail-closed。
- 不适用「取消/恢复」：依据同步纯校验无状态、无持久化。

## 7. 权限与权威状态

无 sender/role 检查（依据：无相关字段）。权威语义：`rawExcerptSha256` 是「原文逐字节」的独立证据（非 R14 重构，:5-7 注释）；一切输出 `candidateOnly`/`cannotAuthorizeSchool`，把技术绑定与学校权威严格分离。

## 8. 修改影响面

- 消费方 `review-v3-b4-bulk-evidence-workbench.ts`（类型）；`evaluateB4R25ClauseBoundConditions` 当前无消费者（改签名影响面=0 生产）。
- 硬编码不变量：32 pin/1 spill/3 模板/frozenD4GitSHA/两恢复哈希/`B4_REQUIRED_DIMENSIONS` 契约（`review-v3-b4-conflict-and-instance-guard.ts:87`）。
- 无直接测试需同步（§9）。

## 9. 测试证据

直接测试：**无**（全树 `*.test.ts` grep `auditB4R25`/`evaluateB4R25`/`B4R25` 0 命中；检索口径见 §4）。批内无覆盖；32/107 等硬编码计数只在运行时调用方触发校验。`NOT_RUN`：本轮未执行测试。mock 边界：无测试即无 mock；真实运行需真实 R13/R14/archives JSON。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 9 条与 §2 一致 | 已证实 | :29-237 |
| 逐字节行数+哈希校验、G06-T06/R-34 唯一 spill（+2 行） | 已证实 | :157-170 |
| 覆盖封口 32/1/32 | 已证实 | :204-205 |
| 输出恒 candidateOnly/cannotAuthorizeSchool | 已证实 | :264-273 |
| 回执五字段不匹配→unknown+原因 | 已证实 | :255-271 |
| `evaluateB4R25ClauseBoundConditions`/`auditB4R25OriginalClauseBindings` 无外部调用者 | 已证实（否定） | 全树符号检索（§4） |
| R25 JSON 实物内容（32 pin 真实哈希） | 未知（不在冻结树内） | 依赖运行时输入 |
| `inspectB4HighRiskInstanceEvidence` 内部语义 | 未知（属他文件） | :253 |
| CI 对私有 Library 的复核能力 | 推断（注释声明不能重算） | :6-9 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `auditB4R25OriginalClauseBindings` 全步骤 | §3.1 | :91-209 | covered |
| `evaluateB4R25ClauseBoundConditions` | §3.2 | :237-275 | covered |
| 5 个导出接口 + 4 个 proof/receipt 类型 | §2 | :29-84/:211-231 | covered |
| 硬编码不变量矩阵 | §3.1/§8 | :23/:109-121/:204-205 | covered |
| 测试断言 | §9 | — | unknown（无测试） |
| R25 JSON 实物/R24 内部语义 | §10 | — | unknown |
