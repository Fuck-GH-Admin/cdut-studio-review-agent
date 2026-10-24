---
path: packages/shared/src/utils/cslab-plot-doc.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f4025bdef5508ff245a070fba07c49132699bdf0
sha256: aa0a4b1a711c7a006ab43166047972ea83a00f5d00da276c32d5b93cba1e160d
lines: 558
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/cslab-plot-doc.ts

## 1. 结论与边界

CSLab **出版绘图数学**纯函数（`packages/shared/src/utils/cslab-plot-doc.ts:1-7`）：期刊预设/布局、线性/对数/倒数刻度+反向轴+轴打断、科学文本子集解析（上下标/希腊字母/常用符号）。主/渲染共用（经 `cslab-plot-svg` 与 origin 渲染器消费）。

边界：文本解析是**子集**（不支持宏保留原文+warning，`:494`）；布局单位 mm。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `JOURNAL_PRESETS` | const | 21-94 | 6 预设（default/nature/science/aps/acs/advanced-materials） | 单/双栏 mm+字体+边距 |
| `defaultAxisConfig` | function | 96-109 | `(title='', unit?) => CsLabPlotAxisConfig` | linear/in/5/2 无打断 |
| `CreatePlotDocumentInput` | interface | 111-118 | `{id;labId;title;presetId?;widthMm?;heightMm?}` | |
| `createPlotDocument` | function | 120-151 | 默认 nature、高=宽×0.75、单 layer（2θ/强度） | |
| `normalizePlotDocument` | function | 158-211 | 补默认/剔非法数值 | 空 layers 回退默认 layer |
| `niceTicks` | function | 214-228 | 1/2/5×10ⁿ 刻度 | |
| `scaleValue`/`scaleInverse` | function | 230-260 | linear/log10/log2/reciprocal 双向 | 非法 → null |
| `detectAxisBreakSegments` | function | 263-281 | 打断后可见区间升序 | |
| `axisFraction` | function | 284-321 | 数据值→0-1 轴位置 | 打断区间内 → null |
| `formatMetric` | function | 323-328 | `≥1e5 或 <1e-3 → 指数`，否则 toFixed(3) 去尾零 | 非有限 → '—' |
| `computePlotLayout` | function | 335-402 | 页面/绘图区/facets/图例（mm） | |
| `parseScientificText` | function | 495-558 | `$…$` 剥壳；`\text/\mathrm/\mathbf`、LATEX_SYMBOLS 45 符号、`_`/`^` 上下标 | |

内部：`clampNumber`（`:153-155`）、`rect`（`:330-332`）、`LATEX_SYMBOLS`（`:404-461`）、`readGroup/readCommand`（`:463-492`）。

## 3. 内部逻辑与关键流程

- `normalizePlotDocument`（`:158-211`）：预设回退 default；宽高钳 ≥20；层/系列补 id/name；`x/y` 过滤非有限；lineWidth ≥0.1、alpha [0,1]、yAxis 二值；轴合并 `defaultAxisConfig` 打底；空 layers 用 `createPlotDocument(...).layers` 回退（`:195-203`）。
- `niceTicks`（`:214-228`）：rough=span/target；步长 1/2/5/10×10ⁿ；`0` 保号清洗（`:225`）。
- `axisFraction`（`:284-321`）：scaleValue 三值任一 null → null；打断区间内 → null（`:309`）；`skipped` 累计压缩可见区间后归一化；`reverse` 反转。
- `computePlotLayout`（`:335-402`）：outside-right 图例加宽右边距 22mm（`:343`）；facets rows×cols 网格（gap 3mm）；图例 5 位置（宽 ≤40/高 ≤18）。
- `parseScientificText`（`:495-558`）：`$` 剥壳；`\` 命令三态（text 组直读/符号表/不支持宏→原文+warning）；`_`/`^` 组→sub/sup token（**不嵌套**，`:540`）；裸花括号跳过；空结果回退原文 token。

## 4. 调用者与调用链

出向：`../types/cslab-origin-types`（9 类型，`:9-19`）。入向（检索=符号名+模块名，全冻结树）：

- **main**：`cslab-science.ts:32,133-201`（normalizePlotDocument）、`cslab-plot-history.ts:13,74,115`、`cslab-demo-plates.ts:22-23,148,166`、`cslab-figure-export.ts:18,66`（JOURNAL_PRESETS/renderPlotSvg 链）。
- **renderer**：`CsLabDatasetView.tsx:25,299`、`CsLabOriginPlotPane.tsx:14,62,332,349,373`、`origin/cslab-plot-export.ts:10,36`、`CsLabPlotExportDialog.tsx:8,40`、`origin/cslab-plot-render-model.ts:15,26,62,80-81`、`origin/canvas-plot-renderer.ts:9-12,27,59,78,87,97`、`origin/CsLabPeakFitDrawer.tsx:13,114,232-251`、`crystal/CsLabVestaCrystalPane.tsx:21,50`。
- utils 内部：`cslab-plot-svg.ts:17-22`（6 符号）。
- 测试：本批 `cslab-plot-doc.test.ts`（6 test）+ 批外 `cslab-plot-history.test.ts`(4)/`cslab-science.test.ts`(7)/`cslab-demo.test.ts`(7)。
- 零外部引用：`CreatePlotDocumentInput`（仅自用）、`detectAxisBreakSegments`（全树零）、`scaleInverse`（仅测试）。
- preload/core/cli 无。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯函数。

## 6. 分支、失败、取消与恢复

无异常路径（非法输入回退/null/warning）；无异步/取消。

## 7. 权限与权威状态

本文件不适用（无权限代码）；预设参数是期刊规格常量（`:21-94`，来源未声明——照实记录）。

## 8. 修改影响面

- `axisFraction`/`niceTicks` 被 SVG 与 canvas 双渲染器共享——口径变化双端联动。
- `parseScientificText` 语法子集与 `cslab-plot-svg.tspanFor` 消费耦合。
- 测试 4 文件 24 test（本批 6 + 批外 18）。

## 9. 测试证据

本批 `cslab-plot-doc.test.ts`（6 test，断言见该篇）；批外 3 文件。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 期刊预设参数 | 已证实 | `:21-94` |
| 打断区间压缩映射+区间内 null | 已证实 | `:299-320` |
| 文本解析不嵌套上下标 | 已证实 | `:540` |
| 不支持宏保留原文+warning | 已证实 | `:530-531` |
| `detectAxisBreakSegments`/`scaleInverse`/`CreatePlotDocumentInput` 零/仅测试引用 | 已证实（检索式见 §4，全冻结树） | grep+子 agent |
| 预设数值来源权威性 | 未知 | 未声明出处 |
| 真实导出效果 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 13 导出 | §2 | 21-558 | covered |
| 刻度/换算/打断 | §3 | 214-321 | covered（6 test 锚） |
| 布局 | §3 | 335-402 | covered |
| 文本解析 | §3 | 495-558 | covered |
