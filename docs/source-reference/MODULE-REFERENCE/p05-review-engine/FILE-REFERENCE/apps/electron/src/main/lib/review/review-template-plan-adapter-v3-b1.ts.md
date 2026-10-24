---
path: apps/electron/src/main/lib/review/review-template-plan-adapter-v3-b1.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 974f0b0d127301ed71ad10df5ae64623ce378882
sha256: 3801ad5f90376f599d36beb669dae36c9ca80d1240a58ef0ee198f0618b66d99
lines: 314
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-template-plan-adapter-v3-b1.ts

## 1. 结论与边界

Dev-B B1：保来源、无副作用的 author→Plan 适配器（头注 :1-5）。不写 CaseAggregate/ReviewRun/Decision、不升政策权威；C0/1 是线契约，丰富不可变 descriptor 是 Dev-B sidecar。候选只能编译/预览，**本代码不能发布**（`publicationAllowed: false`）。

边界：author 文档存储在 `review-template-author-store-v3-b1`；C0 校验 `assertC0CanonicalPlan`。

## 2. 导出与关键符号

类型：`B1FieldType/B1Field`（:19-28）、`B1Condition`（:29-31）、`B1Obligation`（:32-40）、`B1Module`（:41-45）、`B1Source`（:46-52）、`B1Target`（:53-59）、`B1AuthorDocument`（:60-73）、`B1BindingDetails`（:74-85）、`ImmutablePlanDescriptorB1`（:86-96）、`B1PlanDiff`（:270-277）。

| 函数 | 行 | 说明 |
| --- | --- | --- |
| `evaluateB1Condition` | 123-135 | 条件→applicability（缺→unknown 不当 PASS） |
| `compileReviewB1Plan` | 138-268 | 全量校验+编译 Plan |
| `diffReviewB1Plans` | 279-296 | added/removed/changed/requiresAck |
| `requireReviewB1UpgradeAck` | 298-307 | 删除义务须 ACK |
| `verifyReviewB1Descriptor` | 308-312 | 冻结 descriptor 重算比对 |
| `adaptLegacyP06Plan` | 313-314 | 恒 throw（拒绝猜测映射） |

内部：`id/nonempty/valid/unique/stable/digest/reject`（:10-17，`stable` 键序规范化 JSON）、`moduleOrder`（:98-121，DAG 拓扑+环检）、`matchesFieldType`（:174-191，`evidence` 值恒 false——证据条件只能由可信消费者解析，注释 :172-173）。

## 3. 内部逻辑与关键流程（`compileReviewB1Plan`，:138-268）

1. 结构校验（:139-151 `B1_AUTHOR_INVALID`）；stages/outputs 合法唯一（:152-155 `B1_WORKFLOW_INVALID`）；sources 可追溯唯一（:157-161 `B1_SOURCE_INVALID`）；fields 类型/来源/enum（:162-170 `B1_FIELD_INVALID`）；targets 唯一+字段类型匹配（:192-202 `B1_TARGET_INVALID`）。
2. 模块拓扑序（`moduleOrder`，:203）；逐 check：sourceIds 在册、targetKeys 非空唯一、condition 仅 always/field-equals（:205-217 `B1_OBLIGATION_INVALID`）；checkKey 全局唯一（:218-219 `B1_CHECK_COLLISION`）；field-equals 的字段须存在且类型匹配（:220-225 `B1_CONDITION_SOURCE_MISSING`/`B1_CONDITION_TYPE_MISMATCH`）。
3. 逐 target 展开 binding（applicability=evaluateB1Condition，:226-238）；**未映射 target 拒绝** `B1_UNUSED_TARGET Unmapped target would disappear`（:240）。
4. 指纹：moduleDigests（逐模块 digest）+authorDigest+details → fingerprint（:242-245）；CanonicalPlan：planId=`plan-{fingerprint[:28]}`、binding 带 `conditionFingerprint=digest({condition,fieldValues,sourceVersionIds})`（:246-262）；`assertC0CanonicalPlan`（:263）；返回 descriptor（`publicationAllowed:false`，:264-268）。
5. **`adaptLegacyP06Plan`**（:313-314）：恒 `UNSUPPORTED_PLAN_MAPPING: … preserve original bytes: {digest}`——注释 :312「不能靠猜新 target 或丢义务来转换」。

## 4. 调用者与调用链

入向（生产）：`review-template-author-store-v3-b1.ts:13`（compileReviewB1Plan/verifyReviewB1Descriptor）、`review-v3-main-local-author-workbench.ts:17`、`review-v3-b1-b2-candidate-source-bridge.ts:13`、`review-v3-b4-object-isolation.ts:8`、`review-v3-b3-unmatched-author-bootstrap.ts:12`、`review-v3-fallback-template-draft.ts:19`（类型）、`review-v3-main-b20-current-registry.ts:15`、`review-v3-b1-b2-recovery-preflight-v3-b.ts:12`、`review-v3-b1-b2-main-read-bundle-v3-b.ts:11`。测试：`review-template-author-store-v3-b1.test.ts`（间接）。出向：`@profer/shared`（:6-9）、`node:crypto`（:5）。

## 5. 数据 I/O、读写与副作用

纯函数（结构化 clone/稳定序列化）；无 I/O/日志。

## 6. 分支、失败、取消与恢复

全部拒绝经 `B1_*`/`B1_*: message` throw（fail closed on omissions/mismatched provenance/unsupported DSL，注释 :137）；无取消。

## 7. 权限与权威状态

- 发布权威边界：`publicationAllowed: false`（:88）；`status:'candidate-held'` 唯一合法（:141）。
- 来源权威：sources 必须可追溯（documentVersionId/locator/recordedBy，:157-161）；`recordedBy` 注释 :51「不是校方发布签名」。
- 证据权威：`evidence` 字段值恒拒（:188），真实证据条件由后续可信 MaterialCandidate+SourceIdentity 消费者解析（注释 :172-173）。
- 删除权威：`requireReviewB1UpgradeAck` 逐删除键须显式 ACK（:298-307）；Dev-C 仍拥有 InstallPlan CAS（注释 :297）。

## 8. 修改影响面

B1 author 链（workbench/bridge/recovery）；fingerprint 公式变更即旧冻结候选失效。同测：`review-template-author-store-v3-b1.test.ts`（4 用例，间接）。

## 9. 测试证据

间接测试：`review-template-author-store-v3-b1.test.ts`（4 用例；`freezeB1Candidate` 内走 `compileReviewB1Plan`：不完整草稿冻结 throw `B1_AUTHOR_INVALID`（:34-35）、完整后 bindings 长度 1（:42）、篡改文档 → `B1_HISTORY_BROKEN`（:55-62）、status 欺升 `published` → `B1_DRAFT_STRUCTURE_INVALID`（:86-88）。缺口：`diffReviewB1Plans`/`requireReviewB1UpgradeAck`/`adaptLegacyP06Plan`/`evaluateB1Condition` 全分支无直接用例。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 函数/类型群/行号如 §2 | 已证实 | 逐条 |
| fail-closed 校验/未映射 target 拒 | 已证实 | :137-240 |
| evidence 恒拒/不可发布 | 已证实 | :188/:88 |
| P06 恒拒映射 | 已证实 | :313-314 |
| diff/ACK 行为 | 未知（未测） | §9 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `compileReviewB1Plan` 全链 | §3 | 138-268 | covered（间接） |
| `evaluateB1Condition` | §2 | 123-135 | covered（间接） |
| `diffReviewB1Plans`/`requireReviewB1UpgradeAck` | §2 | 279-307 | covered（未测） |
| `verifyReviewB1Descriptor`/`adaptLegacyP06Plan` | §2 | 308-314 | covered（间接/未测） |
