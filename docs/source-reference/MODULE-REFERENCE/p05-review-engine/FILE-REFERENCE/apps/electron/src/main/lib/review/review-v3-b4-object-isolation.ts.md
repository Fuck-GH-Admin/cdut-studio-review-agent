---
path: apps/electron/src/main/lib/review/review-v3-b4-object-isolation.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 009c12382ddbc955965be0ce9b796739cc6905f8
sha256: bf69c0f9f63b710deec2274775d94ff98ced54c755a3f32f83afdb0ee15da753
lines: 73
kind: source
package: p05-review-engine
author: docs-r07-author-nb-30-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---
# apps/electron/src/main/lib/review/review-v3-b4-object-isolation.ts

## 1. 结论与边界

B4 R15 技术预览：每个 Check **独立绑定**精确对象和 subject（`inspectB4CandidateObjectIsolation`）。不是权限/政策适用性/真实 CurrentCase 的证据；只有 Main/C 能提交授权决定（`apps/electron/src/main/lib/review/review-v3-b4-object-isolation.ts:1-5`）。薄模块（73 行）：2 interface + 1 函数。

边界：要求显式预期 Check×target 身份，防止作者悄悄漏掉受影响的房间/人/发布动作后用剩余 target 声称全覆盖（`:32-36`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `B4ObjectIsolationBinding` | interface | 10-19 | `{checkKey;targetKey;objectKey;subjectId;sourceVersionIds[];technicalApplicability:'applicable'\|'not-applicable'\|'unknown'; schoolAuthorization:'NOT_VERIFIED'; authorizationGranted:false}` | |
| `B4CandidateIsolation` | interface | 20-27 | `{schemaVersion:'review-v3-b4-object-isolation/1'; candidateOnly:true; publicationAllowed:false; planFingerprint; checkedTargetKeys[]; bindings[]}` | |
| `inspectB4CandidateObjectIsolation` | function | 37-73 | `(draft:B1AuthorDocument, checkKey:string, expectedTargetKeys:readonly string[]) => B4CandidateIsolation` | |

内部：`deny`（`:29-31`，`Error('B4_OBJECT_ISOLATION_'+name)`）。

## 3. 内部逻辑与关键流程

`inspectB4CandidateObjectIsolation`（`:37-73`）：

1. `:40-45` 请求闸（`BAD_REQUEST`）：draft 存在且 `status==='candidate-held'`、templateId 非空、checkKey `^[A-Za-z][A-Za-z0-9._:/-]{0,127}$`、expectedTargetKeys 数组 **≥2** 且无空串且去重。
2. `:46-47` `compileReviewB1Plan(draft)`（B1 适配器）；`descriptor.publicationAllowed!==false` → `UNEXPECTED_PUBLICATION`。
3. `:48-49` 该 checkKey 的绑定数必须等于预期 target 数（`INCOMPLETE_TARGET_COVERAGE`）。
4. `:50-64` 逐 expectedTargetKey：精确命中且不重复（`MISSING_TARGET`），push 绑定（applicability 三态仅技术，`schoolAuthorization:'NOT_VERIFIED'`、`authorizationGranted:false`，`:57-62`）。
5. `:65-67` 三重碰撞闸（`CROSS_OBJECT_COLLISION`）：seen 全覆盖 byTarget（无多余）、objectKey 唯一、subjectId 唯一。
6. `:68-72` 返回（`planFingerprint=descriptor.canonicalPlan.fingerprint`）。

## 4. 调用者与调用链

出向：`./review-template-plan-adapter-v3-b1`（`compileReviewB1Plan` 运行时 + `B1AuthorDocument` 类型，`:6-8`）。

入向（否定结论）：**零引用**——检索式=B4ObjectIsolationBinding|B4CandidateIsolation|inspectB4CandidateObjectIsolation|模块名 `review-v3-b4-object-isolation`，全冻结树；模块名仅作 schemaVersion 字符串在自身出现（`:21,69`）。无测试文件、无产品入口。死模块/预留接口。

## 5. 数据 I/O、读写与副作用

无。`compileReviewB1Plan(draft)` 为纯编译（B1 适配器，实现不在本批）；抛普通 `Error`。

## 6. 分支、失败、取消与恢复

失败=throw（4 码：`BAD_REQUEST`/`UNEXPECTED_PUBLICATION`/`INCOMPLETE_TARGET_COVERAGE`/`MISSING_TARGET`/`CROSS_OBJECT_COLLISION` 共 5 个）。无异步/取消。

## 7. 权限与权威状态

无权限分支；权威否定字面量（`schoolAuthorization:'NOT_VERIFIED'`、`authorizationGranted:false`、`candidateOnly:true`、`publicationAllowed:false`）；注释 `:4-5` 明示只有 Main/C 提交授权决定。

## 8. 修改影响面

零调用方（§4），改动无静态可见影响；`compileReviewB1Plan` 形状（bindingDetails/checkKey/targetKey/applicability）是唯一外部契约。

## 9. 测试证据

无直接/间接测试（全树零引用）。**NOT_RUN**。缺口：5 个 deny 分支与三重碰撞闸无断言。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| ≥2 targets 强制（防单点声称全覆盖） | 已证实 | `:42` |
| objectKey/subjectId 唯一碰撞闸 | 已证实 | `:65-67` |
| 零调用零测试（死模块） | 已证实（否定结论，检索式见 §4，全冻结树） | grep |
| 三态 applicability 仅技术 | 已证实 | `:57-62` |
| 未来接入方式 | 未知 | 无调用点 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 interface + 1 function | §2 | 10-37 | covered |
| 5 步流程/5 deny | §3, §6 | 37-73 | covered（无测试） |
| 接入面 | §10 | — | unknown |
