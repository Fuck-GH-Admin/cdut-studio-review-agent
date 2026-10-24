---
path: apps/electron/src/main/lib/review/review-v3-b4-conflict-and-instance-guard.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f714143a303a757293b4357c26fc38662bde4c46
sha256: 7acf621e9f755f3816db4cf8fbe1295bd08c996b76db2449edfa3ea264c780ac
lines: 255
kind: source
package: p05-review-engine
author: docs-r07-author-nb-30-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---
# apps/electron/src/main/lib/review/review-v3-b4-conflict-and-instance-guard.ts

## 1. 结论与边界

Dev-B R24：历史原件与高风险检查的**证据边界**。文件头三分法（`apps/electron/src/main/lib/review/review-v3-b4-conflict-and-instance-guard.ts:1-5`）：冻结 D4 源身份、实时校方授权、技术候选谓词是**三种不同断言**，本模块一个都不授予。三个导出函数：`inspectB4OriginalVersion`（原件冲突三态）、`inspectB4HighRiskInstanceEvidence`（实例级谓词审计）、`auditB4FrozenUnknownCoverage`（冻结缺口清单）。

边界：归档条款→Check 追溯先验证，但 scope 字段不证明任何真实世界对象级规则（`:126-129`）；作者提交的 CASE scope 或假定 FALSE 不能消掉固定 34/4163 缺口（`:204-207`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `B4ConflictedOriginalPin` | interface | 19-24 | `{templateId;frozenD4SHA;frozenSourceVersion;frozenSourceSha256}` | |
| `B4ObservedOriginal` | interface | 26-32 | `{bytes:Uint8Array; provenance; expectedOriginalGitBlob?}` | 字节须独立获取，不得从旧摘要重建（`:25`） |
| `B4OriginalConflictFinding` | interface | 33-46 | `{…;state:'RAW_NOT_AVAILABLE'\|'FROZEN_BYTES_MATCH_CANDIDATE_ONLY'\|'DIFFERENT_VERSION_QUARANTINED'; canReplaceFrozenOriginal:false; publicationAllowed:false; schoolPolicyVerified:false}` | |
| `inspectB4OriginalVersion` | function | 51-84 | `(pin, observed?) => B4OriginalConflictFinding` | observed 缺省→`RAW_NOT_AVAILABLE` |
| `B4HighRiskDomain` | type | 86 | `'G03'\|'G04'\|'G06'` | |
| `B4_REQUIRED_DIMENSIONS` | const | 87-91 | `Record<B4HighRiskDomain, readonly string[]>`：G03 4 维/G04 5 维/G06 5 维 | |
| `B4RiskInstance` | interface | 92-103 | `{key;dimensions;observedCondition:'true'\|'false'\|'unknown'; evidence?{forInstanceKey;dimensions;rawSourceSha256}}` | 全实例元组，禁止案卷级替代（`:94`） |
| `B4RiskInstanceFinding` | interface | 104-114 | `{instanceKey;candidatePredicate:'applicable'\|'not-applicable'\|'unknown'; reason 7 值; rawRuleMappedToFrozenChecks:true; historicalInstanceSemanticsPreserved:false; schoolAuthorityVerified:false; publicationAllowed:false}` | |
| `B4HighRiskInstanceAudit` | interface | 115-124 | `{domain;templateId;ruleId;sourceSha256;checkedDimensions[];findings[];semanticValidated:false;publicationAllowed:false}` | |
| `inspectB4HighRiskInstanceEvidence` | function | 133-186 | `(proof,archives,selected,instances) => B4HighRiskInstanceAudit` | |
| `B4FrozenScopeGap`/`B4FrozenSourceGap` | interface | 189-203 | 缺口描述 | |
| `auditB4FrozenUnknownCoverage` | function | 209-255 | `(archives) => {sourceGaps;scopeGaps;candidateTemplates:50;frozenChecks:3875;publicationAllowed:false}` | |

内部：`D4_SHA` 常量（`:14`）、`hex64/hex40`、`fail`（`:17`，`Error('B4_R24_'+code)`）。

## 3. 内部逻辑与关键流程

### 3.1 `inspectB4OriginalVersion`（`:51-84`）

pin 校验（`BAD_FROZEN_PIN`：templateId `^[a-z0-9-]{2,128}$`、frozenD4SHA===D4_SHA、version 非空、frozenSourceSha256 64hex）→ 无 observed 直接返回 `RAW_NOT_AVAILABLE`（`:66`）→ observed 校验（`BAD_RAW_EVIDENCE`：Uint8Array 非空/provenance/可选 git blob 40hex）→ 算 byteSha256 + Git blob sha1（`'blob '+len+'\0'+bytes`，`:72-74`）→ 可选 blob 不符 `GIT_BLOB_MISMATCH`（`:75-76`）→ state 二分（byteHash===frozen → `FROZEN_BYTES_MATCH_CANDIDATE_ONLY`，否则 `DIFFERENT_VERSION_QUARANTINED`，`:81-82`）。注释 `:48-49`：记录的旧哈希（含 Library 观察）不是原始字节，字节现在拿不到就传 undefined。

### 3.2 `inspectB4HighRiskInstanceEvidence`（`:133-186`）

1. `:139` 先整体验 `validateB4HighRiskEvidence(proof, archives)`（B4 语义审计，32 规则）。
2. `:140-143` 找选中 rule（域/模板/ruleId），找不到 → `B4_R24_RULE_NOT_IN_PINNED_EVIDENCE`。
3. `:144-150` `B4_REQUIRED_DIMENSIONS` 与 proof 的 `expectedReviewDimensions`/`dimensionsNotEvidencedInArchivedCheckFields` **双双 JSON 全等** + disposition 四 false（`SEMANTIC_EVIDENCE_NOT_CLOSED`）。
4. `:151-156` instances 2..100、key 非空唯一、observedCondition 三值、dimensions 对象（`BAD_INSTANCES`）。
5. `:157-180` 逐实例判定链（顺序即优先级）：维度不全（非空串）→ `INCOMPLETE_SCOPE`（predicate unknown）；无 evidence → `NO_EXACT_INSTANCE_EVIDENCE`；evidence.forInstanceKey/维度不匹配 → `WRONG_OBJECT_EVIDENCE`；`rawSourceSha256!==rule.rawSha256` → `STALE_SOURCE_VERSION`；`observedCondition==='unknown'` → `UNKNOWN_CONDITION`；否则按 'true'→`applicable`/`INSTANCE_EVIDENCE_MATCHES_CANDIDATE`、'false'→`not-applicable`/`KNOWN_FALSE_EXACT_INSTANCE`。注释 `:129-131`：无证据→UNKNOWN（即使布尔看起来有利）；FALSE 只有配匹配候选证据才是技术 not-applicable。
6. `:181-185` 返回 `semanticValidated:false` 等否定字面量。

### 3.3 `auditB4FrozenUnknownCoverage`（`:209-255`）

1. `:218-221` 域集=8 且每域 domain 字段自指一致 + `frozenSourceGitSha===D4_SHA`（`FROZEN_DOMAIN_SET`）。
2. `:222-225` `sumB4Technical(validateB4TechnicalArchive×8)` 汇总必须恰为 `8/50/3875/34/4163`（`FROZEN_GAP_DRIFT`）。
3. `:228-248` 逐 check 收集：无 `genericScope` 且无 `caseScopeJustification` → scopeGap；每 source `sourceApplicability==='unknown'` → sourceGap（缺 documentVersionId/locator → `B4_R24_UNKNOWN_WITHOUT_PROVENANCE`）。
4. `:249-250` 缺口计数恰 `4163/34` 且 scopeGaps 全在 G01（`GAP_DETAIL_DRIFT`）。

## 4. 调用者与调用链

出向：`node:crypto`、`./review-v3-b4-high-risk-semantic-evidence`（`validateB4HighRiskEvidence`+类型）、`./review-v3-b4-obligation-lineage`（`validateB4TechnicalArchive`/`sumB4Technical`+类型）（`:6-12`）。

入向（检索=符号名+模块名，全冻结树）：

- `auditB4FrozenUnknownCoverage`：`review-v3-b4-bulk-evidence-workbench.ts:8,129`。
- `inspectB4HighRiskInstanceEvidence`/`B4_REQUIRED_DIMENSIONS`/`B4HighRiskDomain`/`B4RiskInstance`：`review-v3-b4-r25-raw-clause-condition.ts:18-21,253` 等（内部集群）。
- `inspectB4OriginalVersion` 及 3 个原件类型、`B4RiskInstanceFinding`/`B4HighRiskInstanceAudit`/`B4FrozenScopeGap`/`B4FrozenSourceGap`：**仅本文件**（零外部引用）。
- 测试：无同名 .test.ts，全树零测试引用。

## 5. 数据 I/O、读写与副作用

无写盘/网络；哈希计算（sha1/sha256）与纯数组处理。抛普通 `Error('B4_R24_…')`。

## 6. 分支、失败、取消与恢复

失败=throw（`BAD_FROZEN_PIN`/`BAD_RAW_EVIDENCE`/`GIT_BLOB_MISMATCH`/`SEMANTIC_EVIDENCE_NOT_CLOSED`/`BAD_INSTANCES`/`FROZEN_DOMAIN_SET`/`FROZEN_GAP_DRIFT`/`GAP_DETAIL_DRIFT` + 2 个 `B4_R24_` 运行时抛错）。无异步/取消。

## 7. 权限与权威状态

无权限分支。三分法权威否定贯穿所有返回（`canReplaceFrozenOriginal:false`/`schoolPolicyVerified:false`/`schoolAuthorityVerified:false`/`semanticValidated:false`/`publicationAllowed:false`）；G04/G03/G06 维度表（`:87-91`）是技术核对清单而非授权。文件头 `:4` 明示本模块授予零断言。

## 8. 修改影响面

- `auditB4FrozenUnknownCoverage` 是 B26 构建的第一道闸（`review-v3-b4-bulk-evidence-workbench.ts:129`），改缺口口径连锁影响 B26/B28/B33 的冻结计数契约。
- `inspectB4HighRiskInstanceEvidence` 被 `review-v3-b4-r25-raw-clause-condition.ts:253` 消费；维度表是 G03/G04/G06 实例审计的共享契约。
- `inspectB4OriginalVersion` 零调用，改动当前无静态影响。
- 无测试，改动无回归网。

## 9. 测试证据

无直接/间接测试（全树零测试引用）。**NOT_RUN**。缺口：三函数全部分支（含 `GIT_BLOB_MISMATCH`、7 种 finding reason、`GAP_DETAIL_DRIFT`）无断言。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三分法（冻结/授权/谓词）不授予任何断言 | 已证实 | `:1-5` + 返回字面量 |
| Git blob sha1 口径与 b4-original-byte-verifier 相同 | 已证实 | `:72-74` vs `review-v3-b4-original-byte-verifier.ts:43-45` |
| 判定链顺序（INCOMPLETE_SCOPE 优先于无证据） | 已证实 | `:157-173` |
| 缺口计数 4163/34/50/3875 固定断言 | 已证实 | `:222-225,249-250` |
| `inspectB4OriginalVersion` 零外部引用 | 已证实（否定结论，检索式见 §4，全冻结树） | grep |
| D4_SHA `b68443b2…` 对应的真实冻结对象 | 未知 | 常量绑定，来源不在本批 |
| 实例维度的真实业务语义 | 未知 | 仅技术清单 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 13 导出 | §2 | 19-255 | covered |
| `inspectB4OriginalVersion` | §3.1 | 51-84 | covered（无测试） |
| `inspectB4HighRiskInstanceEvidence` 判定链 | §3.2 | 133-186 | covered |
| `auditB4FrozenUnknownCoverage` | §3.3 | 209-255 | covered |
| 业务语义 | §10 | — | unknown |
