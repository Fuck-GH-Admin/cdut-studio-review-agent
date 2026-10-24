---
path: apps/electron/src/main/lib/ppt-layout-engine.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ebb070337a100b0d34d4867e3195508324038b2e
sha256: 08b125cddbad270296586cf11c566e643e2cd9280b3f12d821037abd70857fea
lines: 120
kind: source
package: p03-integrations
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/ppt-layout-engine.ts

## 1. 结论与边界

PPT 版式引擎：按视觉角色+样式包网格生成布局计划（slide/header/content/sidebar/footer 五矩形），并做文本溢出/密度预算/未知布局三类检查。

## 2. 导出与关键符号

`export` 逐条核对：3 个接口 + 3 个函数 = 6 个导出（类/常量导出 0）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `PptRect` | 接口（导出） | 4-9 | `{x,y,w,h}` |
| `PptLayoutPlan` | 接口（导出） | 11-20 | 五矩形+`visualRole`/`layoutIntent`/`densityBudget` |
| `PptLayoutIssue` | 接口（导出） | 22-25 | `TEXT_OVERFLOW_RISK\|DENSITY_OVER_BUDGET\|UNKNOWN_LAYOUT` |
| `estimateTextHeight` | 函数（导出） | 34-40 | 文本高度估算（行宽/字号/行高，最小 0.22in） |
| `createLayoutPlan` | 函数（导出） | 90-112 | 计划+issues |
| `assertRectInsideSlide` | 函数（导出） | 114-120 | 越界抛 `布局越界: …`（容差 0.001） |
| `SLIDE_WIDTH`/`SLIDE_HEIGHT`/`clamp`/`gridColumn`/`planByRole` | 内部 | 27-88 | 13.333×7.5；网格列计算；10 种视觉角色硬编码矩形 |

## 3. 内部逻辑与关键流程

- `planByRole`（`:55-88`）：title/section/chart/mechanism_diagram/comparison/image_with_annotation/limitations/conclusion/references/assertion_evidence(default) 各自硬编码 content/sidebar 矩形（基于 `gridColumn` 网格）。
- `createLayoutPlan`（`:90-112`）：`layoutGrammar[role][density]` 不含 `layoutIntent` → `UNKNOWN_LAYOUT`；`estimateTextHeight` 超密度上限（low 2.45/medium 3.85/else 5.0 in，`:103`）→ `TEXT_OVERFLOW_RISK`；low 密度文本比>3.5 → `DENSITY_OVER_BUDGET`（改写或拆页，`:108-109`）。
- `estimateTextHeight`（`:34-40`）：每行字符数≈宽×11×(16/字号clamp8-72)；逐行 ceil；`lineCount×(pt/72)×lineHeight+0.06`。

## 4. 调用者与调用链

入向：PPT 生成链（slide-components/装配）；测试：本批**无专属测试**（scope 无 `.test.ts`）。出向：`@profer/shared`（类型）、`./ppt-style-pack-service.ts:2`（`PptStylePackDefinition`）。

## 5. 数据 I/O、读写与副作用

纯函数：无 IO/状态。

## 6. 分支、失败、取消与恢复

三类 issue（§3）+越界抛错；无取消概念。

## 7. 权限与权威状态

布局权威=样式包 tokens（网格/排版）+硬编码角色矩形；密度预算显式分级。

## 8. 修改影响面

改矩形/估算影响幻灯片排版质量；影响 slide-components 与测试。

## 9. 测试证据

本批**无专属测试**（scope 事实）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三类 issue 语义 | 已证实 | `:90-112` |
| 角色矩形族 | 已证实 | `:55-88` |
| 真实排版渲染 | 未知 | 未运行 |
| 测试覆盖 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 估算/网格/角色 | §2,§3 | 27-88 | covered |
| 计划+检查 | §3 | 90-112 | covered |
| 越界断言 | §3 | 114-120 | covered |
| 断言 | §9,§10 | — | unknown |
