---
path: apps/electron/src/main/lib/review/review-v3-fallback-template-draft.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 48d2af6117f69fdd9e37a9f339d0b7d49a4300c2
sha256: ee1a72541edbd8df158b1ca516aaa86ce5ed44e378e17f16f8c0ca26b4c6dd8b
lines: 149
kind: source
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-fallback-template-draft.ts

## 1. 结论与边界

未匹配业务→T01 可编辑模板草稿的最小桥接（文件头 `:1-17`，M4 公共兜底 P1）：B29 未匹配产出是 `B1AuthorDocument`（candidateOnly/禁发布/未验证校方政策），正式 Run 需**已发布** `TemplateVersion`+负责人确认约束；本模块只做**脚手架转换**。刻意不做：不生成 policyVersionIds/policyRefs（不虚构学校政策）；不生成 deterministicConstraint；判据一律 `execution:'semantic'` 待 T01 负责人确认；产出 `status:'draft'` 不发布、不写 Case/Run。纯函数。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `FallbackDraftResult` | interface | `:93-99` | `{template; sourceCandidates[{documentVersionId,locator,rawSha256?}]; notes[]}`（来源只供核对不进 policyRefs，`:95`；notes 明示非已发布模板，`:97`） |
| `fallbackDraftFromB1` | function | `:104-149` | `(document: B1AuthorDocument, templateId) => FallbackDraftResult` |

内部：`DRAFT_VERSION=1`（`:22`，scaffold 固定 1，升级走发布流程）；`fieldKindOf`（`:24-35`，number/date/boolean/enum 直映，**evidence 落 text 不参与判定**）；`fieldSpecOf`（`:37-51`，visibility 恒 `'public'` 待负责人再调、subjectScoped→scope subject）；`sectionOf`（`:54-76`，一模块一分项；title 截 40 加省略号；判据全 `semantic/case`）；`stagesOf`（`:79-91`，只取 `mode==='manual'` 阶段——**技术阶段不进业务链**，角色 teacher→teacher 否则 reviewer、串 nextStageId；无手审时补最小 `initial-review`）。

## 3. 内部逻辑与关键流程

`fallbackDraftFromB1`：模板 ID 空 → throw“缺少模板 ID”；字段空 → “没有字段”（`:105-108`，测试注释“不产出空模板”）。组装 `TemplateVersion`：`status:'draft'`、`schemaVersion:2`、`displayName` 按 objectType、`fields`/`sections`（每 B1 模块）/`stages`、`policyVersionIds:[]`/`policyRefs:[]`、`outputs:[{id:'review-output',kind:'approval',…}]`、`materialSlots:[]`（B1 候选材料不冒充模板槽，`:118` 注释）、`createdAt=now`。`sourceCandidates` 来自 `document.sources`；`notes` 显式列“未绑定任何学校政策/所有判据为语义执行待确认/草稿未发布”。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（排除测试）：未匹配业务兜底链路（T01 草稿入口前的转换）调用；直接测试 `review-v3-fallback-template-draft.test.ts`。出向仅 `@profer/shared` 与 `review-template-plan-adapter-v3-b1` 类型。

## 5. 数据 I/O、读写与副作用

纯函数；无 I/O；`createdAt` 取系统时间。输出 draft 对象不落盘。

## 6. 分支、失败、取消与恢复

throw：缺模板 ID/缺字段（`:105-108`）；其余分支为映射降级（evidence→text、技术阶段过滤、空手审补默认）。无异步/取消/恢复。

## 7. 权限与权威状态

诚实边界：不虚构政策/规则（文件头）；判据 semantic 待负责人确认；`status:'draft'` 不发布；notes 明示边界；visibility 先 public 由负责人再调（`:44-45`）。

## 8. 修改影响面

改字段/分项/阶段映射 → 影响 T01 草稿起点与发布校验；`B1AuthorDocument` 契约联动 `review-template-plan-adapter-v3-b1`。

## 9. 测试证据

本轮 `NOT_RUN`。直接测试 `review-v3-fallback-template-draft.test.ts`（详见其手册）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 不虚构政策/确定性规则、全 semantic | 已证实 | 文件头、`:61-68` |
| 技术阶段不进业务链、空手审补默认 | 已证实 | `:79-91` |
| evidence 字段落 text 不参与判定 | 已证实 | `:30-33` |
| draft 不发布 | 已证实 | `:13`、输出形状 |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `FallbackDraftResult` | 2 | `:93-99` | covered |
| `fieldKindOf`/`fieldSpecOf` | 2 | `:24-51` | covered |
| `sectionOf` | 2 | `:54-76` | covered |
| `stagesOf` | 2 | `:79-91` | covered |
| `fallbackDraftFromB1` | 3 | `:104-149` | covered |
