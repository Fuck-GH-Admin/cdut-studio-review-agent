---
path: apps/electron/src/renderer/components/content-review/review-v3-t01-brief-authoring.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 888f7bb09c76c3320ecf85e0e714d399e5dc93c8
sha256: 40b7f7518cc4892d770881e2c320c9f4338e5a39337f6594a7fae376056ec750
lines: 208
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-t01-brief-authoring.ts

## 1. 结论与边界

**T01 显式语言起草**（`apps/electron/src/renderer/components/content-review/review-v3-t01-brief-authoring.ts:1-10`）：从用户简报提取字段/材料/流程/条件为可编辑草案。**Only explicit statements become editable draft data. No fabricated policy refs**（`:112`）——不明值进 questions。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `T01BriefDraft` | interface | `:12-55` | 草案（template/extracted/questions/supportedBy） |
| `draftT01FromBrief` | 函数 | `:113-208` | `(raw, templateId, createdAt) => T01BriefDraft` |

内部：`sourceKey`（`:56-63`，去重键）、`numericKind`（`:64-68`，标签→字段类型）、`explicitField`（`:69-79`）、`toSlot`（`:80-89`，材料槽）、`stageKind`/`stagePlan`（`:90-111`，流程阶段）。

## 3. 内部逻辑与关键流程

`draftT01FromBrief`（`:113-208`）：解析冒号标签行（字段/材料/流程/适用条件…）→只取**显式声明**建 `FieldSpec`/`MaterialSlotSpec`/`WorkflowStageSpec`→`schemaVersion:2 status:draft` 模板→不明/主观要求进 `questions`（不落规则）→`supportedBy` 标注。test 锁定：普通段落不误提取、未知主观要求不变成可执行政策规则、自由简报留 questions、重复起草不改七个业务种子、显式下界是草案检查但不能声称 T04 执行。

## 4. 调用者与调用链

- 消费方：T01 简报起草；`model-draft-port`（seed）。
- 出向：`@profer/shared` 类型。

## 5. 数据 I/O、读写与副作用

纯函数；无写。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 冒号标签行 | `:69-111` | 提取为草案数据 |
| 普通段落/主观要求 | — | 进 questions（不落规则） |
| 重复起草 | — | 种子不变（test 锁定） |

## 7. 权限与权威状态

「不虚构政策引用」（`:112`）；显式声明才入草案——诚实不确定性红线。

## 8. 修改影响面

- 标签解析口径（`explicitField`/`toSlot`/`stagePlan`）影响起草质量。
- `T01BriefDraft` 是 model-draft-port 的交换形状。

## 9. 测试证据

`review-v3-t01-brief-authoring.test.ts`（98 行，7 用例）直接覆盖。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 个导出、显式提取红线 | 已证实 | `:12-208` |
| 不落主观要求 | 已证实 | `:112` |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 2 个导出 | `:12-208` | covered |
| 解析链 | `:56-111` | covered |
