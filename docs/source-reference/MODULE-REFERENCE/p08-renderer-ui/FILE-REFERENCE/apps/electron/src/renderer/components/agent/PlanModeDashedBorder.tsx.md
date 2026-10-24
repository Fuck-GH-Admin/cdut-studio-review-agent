---
path: apps/electron/src/renderer/components/agent/PlanModeDashedBorder.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9d10c1fa64ee531d62ce01eceac05ae77e9028ab
sha256: dbcba309406e48015b3acf17f280d2fc2868e81c0a7a98c4670d80a5cc2bd41e
lines: 110
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/PlanModeDashedBorder.tsx

## 1. 结论与边界

**计划模式输入框虚线边框叠加层**（`apps/electron/src/renderer/components/agent/PlanModeDashedBorder.tsx:1-11`）：SVG `<rect>` 精确虚线（绝对定位不扰布局）。**几何契约：虚线中心线与输入框外边框同心**；半径一律取计算样式（宿主可能是 `rounded-[17px]`/`--radius`/终端主题 `border-radius: 0`），**不能硬编码**否则四角错位双层轮廓。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `PlanModeDashedBorder` | 组件 | `:37-110` | 叠加层 |

内部：`DASH_LENGTH=9`/`DASH_GAP=7`/`STROKE_WIDTH=2`/`OFFSET=2`/`FALLBACK_RADIUS=17`（`:15-19`）、`parseRadius`（`:22-25`，**合法 0 保留、只对 NaN 回退**）、`BorderMetrics`（`:27-35`）。

## 3. 内部逻辑与关键流程

- `updateMetrics`（`:52-61`）：父容器 `getBoundingClientRect`+`getComputedStyle`——半径取 `borderTopLeftRadius`、边框宽取 `borderTopWidth`（绝对定位基准 padding box↔border box 换算，`:50-51`）。
- `ResizeObserver` 跟踪尺寸（`:64-66`）。
- 同心公式（`:69-74`）：`dashedRadius = metrics.radius + OFFSET - STROKE_WIDTH/2`（SVG rect 内缩半 stroke）；`wrapperInset = -(OFFSET + metrics.borderWidth)`。

## 4. 调用者与调用链

- 消费方：AgentView（计划态挂载，test 锁定 `AgentView.tsx` 挂载条件）。
- 出向：React、ResizeObserver。

## 5. 数据 I/O、读写与副作用

DOM 测量；无 I/O。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 圆角 NaN | `:22-25` | 回退 17 |
| 圆角 0（终端主题） | `:22-25` | **保留 0**（不误判缺失） |
| 尺寸变化 | `:64-66` | ResizeObserver 重算 |

## 7. 权限与权威状态

无身份语义；同心几何是视觉契约（test 锁定公式）。

## 8. 修改影响面

- 硬编码半径会破坏同心（test `:25-29` 锁定公式）。
- 描边色回落 `--plan-mode-stroke-color`→primary（skin-base，test `:40-42`）。

## 9. 测试证据

`PlanModeDashedBorder.test.ts`（42 行，3 用例——源码文本断言）直接覆盖。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 个导出、同心公式/实测半径 | 已证实 | `:37-110` |
| 0 保留/NaN 回退 | 已证实 | `:22-25` |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `PlanModeDashedBorder` | `:37-110` | covered |
| 同心公式/度量 | `:22-74` | covered |
