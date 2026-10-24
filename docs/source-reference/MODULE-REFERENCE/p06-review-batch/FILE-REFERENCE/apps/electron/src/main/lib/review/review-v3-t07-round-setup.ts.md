---
path: apps/electron/src/main/lib/review/review-v3-t07-round-setup.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 767093d42e1ed29a34a01945d7dc640f2397ae24
sha256: bfdf2b1838a13be74f7ea83dd38290631a140a9246abd91e84039730053fe12e
lines: 88
kind: source
package: p06-review-batch
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t07-round-setup.ts

## 1. 结论与边界

从**锁定批次 + 正式发布模板**建立 T07 评分轮次初始状态（运行时代码，纯函数）。文件头 `apps/electron/src/main/lib/review/review-v3-t07-round-setup.ts:1`：禁止使用演示量表代替业务规则。只做校验与状态构造，不持久化、无 I/O。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `createT07RoundFromPublishedTemplate` | 导出函数 | 67-88 | `(batch: ReviewBatch, template: TemplateVersion \| undefined): T07State` | 建轮次 |

内部：`assertFixedDecimal`（`:7-14`）、`checkedRubric`（`:16-65`）。导入 `decimalT04`（`./review-v3-t04-rules-scoring`，`:4`）与类型（`:2-3`）。

## 3. 内部逻辑与关键流程

- `assertFixedDecimal`（`:7-14`）：非有限抛 `<label>不是有效数值`；`decimalT04(Number(value.toFixed(6)))` 抛错转 `<label>最多支持六位小数`（与 F08 定点内核一致，`:6` 注释）。
- `checkedRubric`（`:16-65`）：量表缺失/空维度抛 `'批次绑定的模板未发布评分量表，请先在模板中配置并发布'`；`totalPrecision` 须 0-6 整数；`missingStrategy` 仅 `block|exclude`；`minEffectiveJudges` 若定义须正整数；逐维：id 非空唯一、min/max 有限且 min≤max、weight 有限≥0（`:24-28`）；总权重>0（`:32`）；`quota` 须非负安全整数（注释：负名额会让「入选名单为空」被当成成功冻结，`:33-36`）；`tieBreaker==='by-dimension'` 需≥1 维度（`:37-39`）；逐维定点校验 min/max/weight 与 `scaleConversion.fromMax/toMax`、`divergenceThreshold`（`:40-49`）；换算量尺须有限>0（`:50-54`）；返回 `structuredClone(rubric)`（`:55`→`:65`）。
- `createT07RoundFromPublishedTemplate`（`:67-88`）：模板须存在、`status==='published'`、`templateId===batch.templateId`、`version===batch.templateVersion`（`:68-71`，否则 `'无法取得与批次锁定版本一致的已发布模板，评分轮次未建立'`）；`caseIds` 非空/无重复/无空白（`:72-75`）；`rubricVersion = template.version`（注释：RubricSpec 无独立版本号，以发布模板版本锁定量表身份，`:79`）；cases 盲签 `匿名项目 ${index+1 补 3 位}`（`:82-84`）；初始 `rounds:[{number:1, assignments:[], votes:[], divergenceReasons:{}, tieOrders:{}}]`（`:86`）。

## 4. 调用者与调用链

入向：`apps/electron/src/main/lib/review/review-v3-t07-main-service.ts:15`；`apps/electron/src/main/lib/review/review-ipc.ts:797`（`require` 动态加载）；`apps/electron/src/renderer/components/content-review/ReviewV3T07Workbench.tsx:18`（渲染端直接 import main/lib）；测试 `review-v3-t07-round-setup.test.ts:3`。出向：`@profer/shared` 类型（`:2`）、`./review-v3-t07-rating-workflow`（`T07State` 类型，`:3`）、`./review-v3-t04-rules-scoring`（`decimalT04`，`:4`）。

## 5. 数据 I/O、读写与副作用

无（纯函数；`structuredClone` 复制量表防外部改写）。

## 6. 分支、失败、取消与恢复

失败全部 throw 中文可读错误（§3）；无取消/恢复概念。设计红线：绝不回退演示量表（缺模板/版本不符/未发布一律拒绝，测试锚定 `review-v3-t07-round-setup.test.ts:35-39`）。

## 7. 权限与权威状态

无权限分支（无 actor 判定——调用方 Main 负责授权）；权威状态：模板发布状态与批次锁定版本（`templateId/templateVersion`）是建轮次的唯一依据。

## 8. 修改影响面

改校验/构造影响 `review-v3-t07-main-service.ts`、`review-ipc.ts:797`、`ReviewV3T07Workbench.tsx`（渲染端建轮次入口）；盲签格式 `匿名项目 NNN` 被 UI 显示与测试（`:30-31`）锚定。

## 9. 测试证据

直接测试 `apps/electron/src/main/lib/review/review-v3-t07-round-setup.test.ts`（54 行、3 用例；NOT_RUN，断言见 `review-v3-t07-round-setup.test.ts.md`）：覆盖锁定版本加载/60 案卷盲签、四类拒绝（未发布/版本不匹配/缺量表/draft）、四类量表缺陷（缺精度/重复维度/零权重/重复案卷）。未覆盖：`assertFixedDecimal` 六位小数边界、`quota` 非法分支、`tieBreaker==='by-dimension'` 无维度分支、`divergenceThreshold`/`scaleConversion` 非法分支。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出与校验分支全列 | 已证实 | `:7-88` |
| 拒绝演示量表回退（4 种拒绝） | 已证实 | `:68-71` + test:35-39 |
| 盲签补 3 位格式 | 已证实 | `:82-84` + test:30-31 |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `createT07RoundFromPublishedTemplate` | §3 | 67-88 | covered |
| `checkedRubric` 全校验 | §3 | 16-65 | covered |
| `assertFixedDecimal` | §3 | 7-14 | covered |
| 测试断言 | §9 | test:24-51 | covered |
| 定点/换算/分歧阈值非法分支 | §9 | — | partial（无断言） |
| 运行行为 | §10 | — | unknown（NOT_RUN） |
