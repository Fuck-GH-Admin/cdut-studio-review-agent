---
path: apps/electron/default-skills/pptx/scripts/chartlib.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a5032259dad646776260d343d16111da9ecf7ab4
sha256: 63e532c7998387f663db464204d2d1bc5770c7096061274db5cf7ee31823a8ce
lines: 493
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/default-skills/pptx/scripts/chartlib.py

## 1. 结论与边界

**高级图表封装库**（python-pptx，`chartlib.py:1-23`）：解决 pptxgenjs 做不了的组合图/双 Y 轴/84 种图表类型/精细美化；统一接口=传数据+选类型+配色，不碰底层 XML。依赖 `python-pptx`（`:25-31`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CHART_ALIASES` | 常量 | `:35` | 12 简写→XL_CHART_TYPE（别名表+任意枚举名经 `getattr` 解析 `:51-59`） |
| `PALETTES` | 常量 | `:62` | **10 套配色**（midnight/forest/coral/terracotta/ocean/charcoal/teal/berry/sage/cherry，各 6 色；与设计系统对齐注释 `:61`） |
| `add_chart` | 函数 | `:85` | 统一入口：`slide, chart_type, data, x,y,w,h, palette='midnight', title, show_legend, show_value, value_font_size, line_smooth, val_gridline, cat_gridline, rounded_corners, **extra`——支持 `COLUMN_LINE` 组合图（series 内 `chart_type`/`secondary_axis`） |
| `new_presentation` | 函数 | `:470` | `w=10,h=5.625`（16:9 英寸） |
| `add_blank_slide` | 函数 | `:477` | 空白版式 `slide_layouts[6]` |
| `_rgb/_palette/_resolve_chart_type` | 内部 | `:75,81,51` | 颜色/配色/类型解析 |

## 3. 内部逻辑与关键流程

`add_chart`（`:85-`，中段为样式细节）：数据→CategoryChartData/ChartData→按类型插图→配色/标题/图例/数值标签/网格线/圆角等美化参数逐项应用→组合图走 XML 组合（`copy`+`qn` 操作 `:30-31`，secondary_axis 挂副轴）。`__main__` 自测（`:481-493`）：生成 `chartlib-self-test.pptx`（柱+线双轴组合图）。

## 4. 调用者与调用链

- 入向：pptx 技能脚本（`from chartlib import add_chart, CHARTS`，域外）；CLI 自测。**注释 vs 实现差异照实：头注释用法引用 `CHARTS` 常量，实际导出为 `CHART_ALIASES`（`CHARTS` 符号不存在，`:6` 用法行 vs `:183` 导出面）**。
- 出向：`python-pptx` 全家（Presentation/ChartData/XL_CHART_TYPE/RGBColor/`pptx.oxml.ns.qn`）。

## 5. 数据 I/O、读写与副作用

纯内存建图；CLI 自测写 `chartlib-self-test.pptx`。

## 6. 分支、失败、取消与恢复

未知图表类型→`ValueError`（`:59`）；非法颜色→_rgb 解析异常；无取消。

## 7. 权限与权威状态

无权限分支，依据：本地文档生成；配色权威=PALETTES（设计系统对齐声明 `:61`，域外一致性未核）。

## 8. 修改影响面

技能图表产出面；别名表/配色变更影响 Agent 调用稳定性。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无 test 文件）；`__main__` 自测脚本非测试框架（NOT_RUN）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 别名/配色/入口签名/组合图语义 | 已证实 | `:1-493` 全文（中段样式实现逐段读） |
| python-pptx 组合图 XML 效果 | 边界 | 第三方库域外 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 5+ 导出+内部 | §2/§3 | 35-493 | covered |
