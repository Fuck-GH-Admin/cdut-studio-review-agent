---
path: apps/electron/src/renderer/components/agent/PlanModeDashedBorder.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d579e5e252cc2c7607806bf2350f6cba38c28c52
sha256: 2b42cc56e9037e923ab94f896b127ce48464dba7a6b30a27652455e0803b8a3c
lines: 42
kind: test
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/PlanModeDashedBorder.test.ts

## 1. 测试目标

**计划模式边框源码契约**（`apps/electron/src/renderer/components/agent/PlanModeDashedBorder.test.ts`）：保留 SVG 视觉实现+计划态挂载、同心半径实测非硬编码、皮肤 token 回落——**源码文本断言**（读 `AgentView.tsx`/`PlanModeDashedBorder.tsx`/`skin-base.css` 字符串匹配，`:5-8`）。

## 2. 用例清单

3 test（无 describe）。

| # | 名称 | 断言要点 | 行 |
| --- | --- | --- | --- |
| 1 | 保留 SVG 实现+计划态挂载 | AgentView 挂载条件；常量 9/7/2/2；`strokeDasharray`/`strokeWidth`/`strokeLinecap="round"`/`pointer-events-none`/`ResizeObserver`/`<svg` | `:10-22` |
| 2 | 同心半径实测非硬编码 | `dashedRadius = metrics.radius + OFFSET - STROKE_WIDTH/2`、`rx={dashedRadius}`、**不含 `rx={BORDER_RADIUS + OFFSET}`**；`getComputedStyle(parent)`/`borderTopLeftRadius`/`borderTopWidth`；`Number.isFinite(parsed) ? parsed : FALLBACK_RADIUS`（0 保留）；`wrapperInset = -(OFFSET + metrics.borderWidth)` | `:24-38` |
| 3 | 皮肤 token 回落 | skin-base 含 `stroke: var(--plan-mode-stroke-color, hsl(var(--primary) / 0.45));` | `:40-42` |

## 3. 真实断言

- `expect(border).not.toContain('rx={BORDER_RADIUS + OFFSET}')`（`:29`）。
- `expect(border).toContain('Number.isFinite(parsed) ? parsed : FALLBACK_RADIUS')`（`:35`）。
- `expect(skinBase).toContain('stroke: var(--plan-mode-stroke-color, hsl(var(--primary) / 0.45));')`（`:41`）。

## 4. 未覆盖与脆弱点

- 未覆盖：视觉渲染（源码文本断言非渲染断言）。
- 脆弱点：源码重构（如常量改写形式）会破坏字符串断言。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例覆盖实现/几何/皮肤 | 已证实 | `:10-42` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 实现/挂载 | 1 | `:10-22` | covered |
| 同心几何 | 2 | `:24-38` | covered |
| 皮肤回落 | 3 | `:40-42` | covered |
