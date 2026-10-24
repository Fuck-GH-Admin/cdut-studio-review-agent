---
path: apps/electron/src/main/lib/ppt-delivery-audit-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e9677fb9778574f1e68caaf424410da8943c04e2
sha256: 64be1db2f53e577e12505d991738866c03561e84037cf0f446a2abf68ae1d388
lines: 117
kind: source
package: p03-integrations
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/ppt-delivery-audit-service.ts

## 1. 结论与边界

PPT 视觉交付审计：从 PPTX（zip）统计媒体/图表/形状/文本，对照视觉计划产出每页问题与整套验收结论。核心是**反模板化形状输出**——无嵌入图片/图表即判定需返修（`:109`）。

## 2. 导出与关键符号

`export` 逐条核对：1 个 type + 4 个接口 + 3 个函数 = 8 个导出（类/常量导出 0）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `PptHeroVisual` | type（导出） | 5 | `real_image/chart/diagram/data_typography` |
| `PptVisualPlanSlide`/`PptVisualPlan` | 接口（导出） | 7-18 | 计划页（含 `materialQuery`/`fallbackReason`）/计划 |
| `PptDeliveryAuditSlide`/`PptDeliveryAudit` | 接口（导出） | 20-39 | 每页统计+issues / 整套审计（`needsRevision`+reasons） |
| `planPptVisuals` | 函数（导出） | 54-78 | 大纲→主视觉计划（正则启发式） |
| `auditPptDelivery` | 函数（导出） | 80-113 | PPTX 审计 |
| `assertPptDeliveryAccepted` | 函数（导出） | 115-117 | 需返修抛 `PPT 未通过视觉交付验收：…` |
| `HERO_VISUALS`/`countMatches`/`getSlideEntries` | 内部 | 41-52 | 四视觉；正则计数；`ppt/slides/slideN.xml` 按页号排序 |

## 3. 内部逻辑与关键流程

- `planPptVisuals`（`:54-78`）：`deckIntent` 空抛 `deckIntent 必填`、无页抛 `至少需要一页大纲`；启发式（趋势→chart、流程→diagram、案例→real_image、否则 data_typography，`:63-69`）；real_image 附 `materialQuery`（截 200），其余附 `fallbackReason`（**避免无关库存图**，`:74`）。
- `auditPptDelivery`（`:80-113`）：仅 `.pptx`（否则抛）/存在性校验；media/chart/embeddings 按条目名正则计数；每页 `<a:blip>/<c:chart>/<p:sp>/<a:t>` 计数；三类 issue（计划要图无图/计划要图表无图表且文本<3/纯文本形状缺主视觉，`:101-103`）；整套 reasons（无幻灯片/无图无图表=模板化形状输出/计划页数不符/逐页 issue）。

## 4. 调用者与调用链

入向：PPT 交付验收（Agent 工具 `plan_ppt_visuals`/`audit_ppt_delivery`，pi-builtin-tools nb-53）；测试：本批**无专属测试**（scope 无 `.test.ts`）。出向：`adm-zip`、`node:fs/path`。

## 5. 数据 I/O、读写与副作用

读：pptx zip 条目文本；无写/副作用（`resolve` 归一路径）。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| deckIntent 空/无页 | 抛 | 55-56 |
| 非 .pptx/不存在 | 抛 | 82-83 |
| 模板化输出 | `needsRevision`+reason | 109 |
| 页数不符 | reason | 110 |
| 验收不过 | `assertPptDeliveryAccepted` 抛 | 115-117 |

## 7. 权限与权威状态

验收权威=统计事实（媒体/图表/文本计数）+视觉计划一致性；「真实图片优先、避免无关库存图」（`:74`）为设计取向。

## 8. 修改影响面

改判定影响交付验收门槛；影响 PPT 工具链。

## 9. 测试证据

本批**无专属测试**（scope 事实）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 反模板化判定 | 已证实 | `:101-109` |
| 启发式主视觉 | 已证实 | `:63-74` |
| 真实 pptx 解析 | 未知 | 未运行 |
| 测试覆盖 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 计划 | §3 | 54-78 | covered |
| 审计 | §3 | 80-113 | covered |
| 断言 | §9,§10 | — | unknown |
