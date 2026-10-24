---
path: apps/electron/src/main/lib/review/review-v3-b-candidate-readiness-workbench.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 426e93270e2a533575c83a7f1408adf7a577b2dc
sha256: 8f6081209ac228b12bbd9a01e3e3896c2fcc4831e62cd44b9cb409f7aa35f444
lines: 171
kind: source
package: p05-review-engine
author: docs-r07-author-nb-30-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---
# apps/electron/src/main/lib/review/review-v3-b-candidate-readiness-workbench.ts

## 1. 结论与边界

Dev-B R27：**只读的候选就绪面**——把真实 B20 主读输入、B19 物理来源、B3 保守路由、（可选）B26 历史工作台与 B23 恢复预检组合成 `B27Readiness` 报告 + 待办动作清单（`apps/electron/src/main/lib/review/review-v3-b-candidate-readiness-workbench.ts:1-8`）。不是第二个 Case 写入者；调用方必须从既有真实服务取得 B20/B3，**绝不**把本载荷当 C Main 权威 principal/session/lease（`:5-7`）。

边界：`buildB27CandidateReadiness` 不做业务决定（`automaticBusinessChangeAllowed:false` 恒定，`:24`）；「linked-candidate」只是物理技术回执、**不是 PASS**（`:44`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `B27NextAction` | type | 17-21 | 8 值：`SELECT_OR_AUTHOR_TEMPLATE\|REQUEST_MANUAL_BUSINESS_CLASSIFICATION\|REAUTHOR_OR_REFREEZE\|REVALIDATE_SOURCE_OR_REPICK\|CONFIRM_ROLE_AND_SUBJECT\|RESOLVE_RULE_AND_OBJECT_SCOPE\|REQUEST_SCHOOL_POLICY_OR_GOLD\|MANUAL_REVIEW_REQUIRED` | |
| `B27Action` | interface | 22-25 | `{action;checkKey;targetKey;sourceId;reason; automaticBusinessChangeAllowed:false}` | |
| `B27Readiness` | interface | 26-36 | `{schemaVersion:'review-v3-b27-candidate-readiness/1'; candidateOnly:true; publicationAllowed:false; businessWriteAllowed:false; schoolPolicyVerified:false; currentMainAuthorityRecheckedByC:false; templateId; caseCandidateId; ownerId; authorFingerprint; routeStatus; technicalRoutingReady; technicalSourcesLinked; pendingPhysicalReconfirmation; readyForFormalDecision:false; actions[]; snapshotSha256}` | |
| `buildB27CandidateReadiness` | function | 46-171 | `(candidate:B20CurrentCandidateRead, routing:B3RouteState, options:{historical?;recovery?}) => B27Readiness` | 唯一导出函数 |

内部：`reject`（`:15`，`Error('B_R27_'+why)`）、`sha64`（`:16`）、`action` 工厂（`:37-41`）。

## 3. 内部逻辑与关键流程

`buildB27CandidateReadiness`（`:46-171`）：

1. `:51-68` 输入闸（`INPUT_NOT_CURRENT_CANDIDATE`）：candidate schemaVersion/candidateOnly/三 false/`authorStatus==='candidate-held'`/`frozenFingerprint` 64hex/`frozenDescriptor.canonicalPlan.fingerprint` 相等/provenance 七项一致（planFingerprint/ownerId/ownerGeneration/caseCandidateId/snapshotHash）/routing 存在/两数组。
2. `:69-75` Check×target 双向映射（canonical `bindingDetails` vs current `candidateProvenance.bindings`），数量/去重不齐 → `MISSING_OR_DUPLICATE_TARGET`。
3. `:78-109` 逐绑定：四元组+applicability+sources 与 declared.sourceIds 逐位一致（`PROVENANCE_BINDING_MISMATCH`）；每个 source：非 `linked-candidate`/缺 rawSha256/documentVersionId/parseRevision/blockId/readExtent/receiptHash → `sourcesLinked=false` + `REVALIDATE_SOURCE_OR_REPICK`（`:91-98`）；`needs-human-confirmation` 或缺 subjectId → `CONFIRM_ROLE_AND_SUBJECT`（`:99-103`）；`applicability==='unknown'` → `RESOLVE_RULE_AND_OBJECT_SCOPE`（`:105-108`，注释：绝不暗示 not-applicable）。
4. `:110-121` 路由：有效路由 3 值（`countdown/default-selected/manually-selected`）且 chosen.templateId 与 candidate 一致才算 `routed`；chosen 不一致 → `ROUTE_TEMPLATE_MISMATCH`；`unmatched` → `SELECT_OR_AUTHOR_TEMPLATE`；其它非 routed → `REQUEST_MANUAL_BUSINESS_CLASSIFICATION`。
5. `:122-135` recovery（B23）：范围五元校验（`RECOVERY_SCOPE_MISMATCH`）；存在 `requiresTrustedNativeRepick`/`requiresCurrentParserAndSourceReceipt` 归档 → `REVALIDATE_SOURCE_OR_REPICK`。
6. `:136-152` historical（B26）：形状校验（`HISTORICAL_AUDIT_INVALID`）；同 templateId 命中时：`original!=='RAW_BYTES_MATCH_TECHNICAL_ONLY'` → `REAUTHOR_OR_REFREEZE`；`sourceUnknown/scopeUnknown` → `RESOLVE_RULE_AND_OBJECT_SCOPE`。注释 `:142-143`：新 B1 模板 #51 有意不在冻结 D4，绝不按名字别名到 50 个历史候选。
7. `:153-154` 恒追加 `REQUEST_SCHOOL_POLICY_OR_GOLD`（只有独立校方签发者和 Gold 能立政策授权）。
8. `:157-170` 组装（`technicalRoutingReady=routed`、`technicalSourcesLinked=sourcesLinked`、`pendingPhysicalReconfirmation=!sourcesLinked||recovery.archives.length>0`、`readyForFormalDecision:false`），`snapshotSha256=sha256(JSON(result))`（不含自身）。

## 4. 调用者与调用链

出向（类型）：`./review-v3-b1-b2-main-read-bundle-v3-b`（B20CurrentCandidateRead）、`./review-intake-routing-adapter-v3-b3`（B3RouteState）、`./review-v3-b1-b2-recovery-preflight-v3-b`（B23RecoveryPreflight）、`./review-v3-b4-bulk-evidence-workbench`（B26Workbench）（`:9-13`）。

入向（检索=符号名+模块名，全冻结树）：

- 类型 `B27Readiness`/`B27Action`：`apps/electron/src/renderer/components/review-v3-dev-b/review-v3-product-workflow.ts:9,26`（**renderer 入口层**，type-only）、`apps/electron/src/main/lib/review/review-v3-b-bulk-remediation-cycle.ts:9,170,178`。
- `buildB27CandidateReadiness`：**零调用**（仅定义行）；`B27NextAction` 零外部引用。
- 测试：无同名 .test.ts，全树零测试引用（含 `B27_` 前缀错误文案无断言）。

## 5. 数据 I/O、读写与副作用

无。纯函数 + sha256；只读输入对象。抛普通 `Error('B_R27_…')`。

## 6. 分支、失败、取消与恢复

- 失败=throw（**6 个错误码名/7 个失败点**：`reject(` + HISTORICAL_AUDIT_INVALID/INPUT_NOT_CURRENT_CANDIDATE/MISSING_OR_DUPLICATE_TARGET/PROVENANCE_BINDING_MISMATCH/RECOVERY_SCOPE_MISMATCH/ROUTE_TEMPLATE_MISMATCH 六名，另直接 throw `:80` `B_R27_PROVENANCE_BINDING_MISMATCH` 为 PROVENANCE_BINDING_MISMATCH 双失败点，§3；`:80` 正常被 `:74-75` 数量闸挡住）。
- 无异步/取消。恢复语义在动作清单：`REVALIDATE_SOURCE_OR_REPICK`/`REAUTHOR_OR_REFREEZE` 等即修复路径。

## 7. 权限与权威状态

无权限分支（无 actor/sender 检查，`:6-7` 注释明示本载荷不是 principal/session/lease）。权威否定字面量：`currentMainAuthorityRecheckedByC:false`、`schoolPolicyVerified:false`、`readyForFormalDecision:false`、`automaticBusinessChangeAllowed:false`（`:24,28-29,34`）；`REQUEST_SCHOOL_POLICY_OR_GOLD` 恒存在（`:153-154`）。

## 8. 修改影响面

- `buildB27CandidateReadiness` 当前零调用，改动无静态可见影响；`B27Readiness` 形状被 renderer（`review-v3-product-workflow.ts:26`）与 B28（`describeB28CandidateHandoff:178-193`）消费，字段改动需同步。
- `snapshotSha256` 口径是 B28 `describeB28CandidateHandoff` 的 `sha.test` 校验对象（`review-v3-b-bulk-remediation-cycle.ts:184`）。

## 9. 测试证据

无直接/间接测试（全树零测试引用）。**NOT_RUN**。缺口：全部 8 动作触发分支、`MISSING_OR_DUPLICATE_TARGET`/`ROUTE_TEMPLATE_MISMATCH`/`RECOVERY_SCOPE_MISMATCH`/`HISTORICAL_AUDIT_INVALID` 无断言。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 输入闸 17 项一票拒 | 已证实 | `:51-68` |
| linked-candidate 七要素缺一即降级 sourcesLinked | 已证实 | `:91-98` |
| `REQUEST_SCHOOL_POLICY_OR_GOLD` 恒追加 | 已证实 | `:153-154` |
| 模板 #51 不别名历史 50 候选 | 已证实（注释+分支） | `:142-151` |
| `buildB27CandidateReadiness` 零调用 | 已证实（否定结论，检索式见 §4，全冻结树） | grep |
| B20/B3 真实服务形态 | 未知 | 批外模块未读 |
| renderer 载荷消费细节 | 未知 | `review-v3-product-workflow.ts` 未逐行读 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出 | §2 | 17-46 | covered |
| 输入闸/绑定比对 | §3 | 51-89 | covered（无测试） |
| source 三动作 | §3 | 90-108 | covered |
| 路由分支 | §3 | 110-121 | covered |
| recovery/historical | §3 | 122-152 | covered |
| 实际消费 | §10 | — | unknown（类型级） |
