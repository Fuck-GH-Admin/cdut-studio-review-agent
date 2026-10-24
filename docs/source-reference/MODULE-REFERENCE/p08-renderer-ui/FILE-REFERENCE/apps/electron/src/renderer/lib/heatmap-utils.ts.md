---
path: apps/electron/src/renderer/lib/heatmap-utils.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c10989d717ab66dfc38432d69a5e61cd9dd1c649
sha256: 420c745b28c50f8a69c76bb0e404a2d252d30be44bd00f06475f1689087cdb2d
lines: 48
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/heatmap-utils.ts

## 1. 结论与边界

**工作区热力图类型与工具**（48 行）：复用 OpenCovibe 百分位分级（P25/P50/P75 为颜色阈值而非固定值——"颜色深度相对自身历史，不会全绿全白" `:4-6`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `WorkspaceHeatmapEntry` | `:10-15` | `{date: ISO, tokens}` |
| `computePercentileThresholds` | `:18-26` | 非零值排序取 [p25,p50,p75]；空→[0,0,0] |
| `valueToLevel` | `:29-35` | 值→0-4 级（阈值边界含等号向上归级） |
| `toCalendarData` | `:41-48` | entries→日历渲染格式（每条 level 由全局百分位定） |

## 3. 内部逻辑与关键流程

百分位（floor 下标取值）→分级映射→日历转换。

## 4. 调用者与调用链

工作区热力图组件；纯函数无出向。

## 5. 数据 I/O、读写与副作用

纯函数。

## 6. 分支、失败、取消与恢复

全零/空→[0,0,0] 全 0 级。

## 7. 权限与权威状态

相对分级语义（阈值来自自身分布非固定值）。

## 8. 修改影响面

改阈值算法影响热力图观感；相对分级语义是产品口径（颜色深度随自身历史），改为固定阈值会违背设计意图（见 §1 引注）。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件 | 已证实 | 48 行全读 |
| 实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；实效 unknown。
