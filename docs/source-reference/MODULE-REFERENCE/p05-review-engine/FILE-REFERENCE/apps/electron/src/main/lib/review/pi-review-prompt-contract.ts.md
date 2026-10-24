---
path: apps/electron/src/main/lib/review/pi-review-prompt-contract.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b185056a6985d8a787eb351ca1d4239ae0354829
sha256: d7516b89de398aab59175fa117f40ba66aabcb689725a0104b87c8d2b18476b2
lines: 42
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/pi-review-prompt-contract.ts

## 1. 结论与边界

把模板已声明的 FieldSpec 如实列进 Pi 审核提示词的「可提交事实字段」段落（头注 :2-11）：解决 `pi-case-review-service` **事后**校验 fieldKey 而提示词**事前**不告知的问题。纯文本生成，无 I/O、无授权语义变化——字段真值仍是模板（注释 :9-10）。

边界：不判断业务、不增删字段、不校验提交结果（校验在 `pi-case-review-service.submitPiReviewResultV2` :944-950）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `piObservationFieldContract` | fn | 21 | `(template: Pick<TemplateVersion,'fields'>, caseId: string) => string` | 唯一导出 |

无内部函数/常量。

## 3. 内部逻辑与关键流程

两分支（:25-41）：`fields` 为空 → 返回两行文本（:27-30）：要求 `observations` 省略或 `[]`、禁止为对象键/场景/条件/材料名/claim_item 自造 fieldKey；`fields` 非空 → 首行声明仅允许列出的 FieldSpec（:33），逐字段一行 `- key | kind | scope… | label`（:34-39）：`scope==='case'` 写 `case（subjectId 必须是 ${caseId}）`（:35-36），否则 `subject（subjectId 必须属于本案、匹配分项）`（:37）；`sectionId` 存在时追加 ` | sectionId=…`（:38）；末行要求引文与 blockId 真实、未经用户确认只能是事实候选、禁止未列出 fieldKey（:40）。

## 4. 调用者与调用链

入向：`pi-case-review-service.ts:5` 导入，唯一调用点 `promptFor` 内 `:418`（拼进 `preparePiReviewRunV2` 的 userMessage）；`pi-review-prompt-contract.test.ts:2`。出向：仅 `@profer/shared` 类型（:12）。

## 5. 数据 I/O、读写与副作用

纯函数：读 `template.fields` 形状（key/kind/scope/sectionId/label），输出字符串；无磁盘/网络/日志。

## 6. 分支、失败、取消与恢复

无 throw 路径、无状态、无取消概念。字段数组缺 key/kind 时按 `undefined` 字符串插值（无校验）——文本层不做形状把关。

## 7. 权限与权威状态

无权限分支（依据：无 sender/actor 检查）。语义上只是把模板权威（FieldSpec）提前告知模型，不产生授权；「未经用户确认只能为事实候选」是提示文本（:40），实际强制在 `pi-case-review-service.ts:963`（`extractedBy:'ai', confirmed:false`）。

## 8. 修改影响面

改文案影响 `preparePiReviewRunV2`/续审 prompt 内容与 `pi-review-prompt-contract.test.ts` 的子串断言；改动字段列出规则会影响模型提交行为（间接影响 submission 拒绝率），不影响校验逻辑。

## 9. 测试证据

直接测试 `pi-review-prompt-contract.test.ts`（3 用例 / 1 describe，纯函数，NOT_RUN）：
1. `:5-9` 无字段：断言含 `'observations 必须省略或为 []'` 与 `'不要为对象键、场景、条件、材料名'`。
2. `:11-23` 三字段（默认 subject / `scope:'case'` / 带 `sectionId:'awards'`）：断言含 `'studentName | text | subject'`、`'academicYear | text | case（subjectId 必须是 case-abc）'`、`'awardDate | date | subject（subjectId 必须属于本案、匹配分项） | sectionId=awards'`、`'禁止添加任何未列出的 fieldKey'`。
3. `:25-32` 唯一字段：`- ` 开头行恰 1 条且含 `onlyOne`（不增删字段）。

未覆盖：字段 label 含特殊字符、`kind` 为 object/rows/attachment 的展示、caseId 含特殊字符；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 单导出、两分支文本生成 | 已证实 | :21-42 |
| 事后校验在 pi-case-review-service（:944-950） | 已证实 | 跨文件核对 |
| 强制 confirmed:false 在 :963 | 已证实 | pi-case-review-service.ts:963 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 无字段分支 | §3 | 25-31 | covered |
| 有字段分支（scope/sectionId 变体） | §3 | 32-41 | covered |
| 特殊字段 kind 展示 | §9 | — | unknown（未测） |
