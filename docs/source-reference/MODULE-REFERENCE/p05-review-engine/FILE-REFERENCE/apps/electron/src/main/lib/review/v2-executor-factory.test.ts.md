---
path: apps/electron/src/main/lib/review/v2-executor-factory.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: dd08583ad2a3b2950c67392f10d35ecde35be041
sha256: cbec86f6b9b9b9e5d029b374fb7505a760b2dd49d232b3d6b78a472485376906
lines: 265
kind: test
package: p05-review-engine
author: docs-r07-author-nb-47-20261023
reviewer: p05-review-engine
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/v2-executor-factory.test.ts

## 1. 测试目标

「V2 规则执行正确性门禁」：`collectV2VisionImages`（视觉只读激活材料）、`recognizeV2VisionBatches`（分批+逐张校验）、`recognizeDocumentImages`、`resolveEffectiveFieldValue`（RUN-35 优先级）、`buildDeterministicRuleChecks`（分项隔离/约束分支/人工修正入 basis）。不运行（`NOT_RUN`）。

## 2. 用例清单

用例数 13（`test(`/`it(` grep 计 13），1 describe。fixture：`makeAggregate()`（:13-38，双事项 study/service 分项）、`rule()`（:40-55）。逐条要点：
1. 视觉只读激活材料（:57-84）：建 png 资产+激活/失效文档，断言 1 张+`data:image/png;base64,` 前缀。
2. 分批识别（:86-110）：10 张→批 8+2（batchSizes toEqual `[8,2]`）、10 条 recognized、failed 0；逐张映射回原 blockId。
3-5. recognizeDocumentImages/识别失败反例/不可用端口等（:112-160 区间）。
6-7. 分项隔离：subject 隔离同名字段（:151）、同案分项规则只查本分项（:158）。
8. 嵌套 all/any/not 条件完整处理（:165）。
9-11. semantic 交模型/manual 进待确认（:173）、人工确认事实优先（:182，RUN-35 相关）、预算规则逐行求和排除合计行（:190）。
12. 重复票号报具体行、金额缺失不按零（:218）；13. 等级映射用人工更正值保留出处链（:244）。
12-13. 人工修正观察入 basis：`observationIds` 含修正观察、`evidenceLinkIds` 含 link、sourceRefs 含证书版本（:236-264）。

## 3. 真实断言

代表行：`expect(images).toHaveLength(1)`+`toStartWith('data:image/png;base64,')`（:81-82）；`expect(batchSizes).toEqual([8,2])`（:105）；`expect(check.status).toBe('compliant')`、`expect(check.basis?.observationIds).toContain('observation-corrected-level')`、`expect(check.basis?.evidenceLinkIds).toContain('link-certificate')`、`expect(check.sourceRefs.some(...)).toBeTrue()`（:259-263）。

## 4. 未覆盖与脆弱点

未覆盖：`assembleV2Executors` 装配整体、piExtract/summarize 模型路径、OCR 可用路径。mock 边界：假 Pi client（openai-chat 形状）、真实文件系统 tmp（VISION_ROOT :10-11）。脆弱点：`expect(...).toBeTrue()` 系断言依赖 bun 扩展。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 13 用例计数 | 已证实 | grep `test(\|it(` |
| 断言行如 §3 | 已证实 | 逐行读 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 被测符号 | 用例 | 状态 |
| --- | --- | --- |
| `collectV2VisionImages`/`recognizeV2VisionBatches` | #1-#2 | covered |
| `recognizeDocumentImages` | #3-#5 | covered |
| `resolveEffectiveFieldValue` | — | unknown（无直接断言；仅 case #10 人工确认优先间接相关） |
| `buildDeterministicRuleChecks` | #9-#13 | covered |
| `assembleV2Executors` | — | unknown |
