---
path: packages/shared/src/utils/cslab-plot-svg.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 87cafa6c32cb7337c060f3ab00023d133690b9e2
sha256: 219472b8898bc935af258d220ff6da2dfcad8d1fbe3f7f6637f27b6874a1ed94
lines: 476
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/cslab-plot-svg.ts

## 1. 结论与边界

CSLab **出版绘图 SVG 生成器**（纯函数，主/渲染共用，`packages/shared/src/utils/cslab-plot-svg.ts:1-5`）：文字全部输出 `<text>/<tspan>`、**不嵌入位图**——保证期刊矢量导出可编辑。

边界：坐标/布局来自 `cslab-plot-doc`（computePlotLayout/axisFraction/scaleValue）；单文档多 layer/facet；`__` 前缀两函数为临时导出（`:468-475`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `renderPlotSvg` | function | 338-443 | `(document, preset) => string` | 主入口 |
| `svgToDataUrl` | function | 446-448 | → `data:image/svg+xml;charset=utf-8,…`（encodeURIComponent，免 Buffer/btoa） | |
| `describeAxisRange` | function | 451-456 | `(axis) => string` | `min … max[ scale]`（auto 空位） |
| `hasEditableText` | function | 459-461 | `/<text[\s>]/` 测试 | |
| `hasEmbeddedImage` | function | 464-466 | `/<image[\s>]/` 测试 | |
| `__axisTickValues` | function | 469-471 | 临时刻度导出 | |
| `__scaleValue` | function | 474-476 | 临时坐标映射导出 | |

内部：`escapeXml`（`:25-32`，5 实体）、`tspanFor`（`:34-44`，sub/sup 72%+baseline-shift、italic）、`ptToMm`（`:47-49`，`pt×25.4/72` toFixed(3) **无单位数值**）、`scientificText`（`:51-68`）、`dataBounds`（`:74-103`）、`axisTicks`（`:105-119`，log10/log2 指数刻度≤10 个）、`drawTicks/drawSeries/drawLegend/drawAnnotations/axisTitle/markerSvg/dashArray/seriesPath`（`:121-335`）。

## 3. 内部逻辑与关键流程

`renderPlotSvg`（`:338-443`）：

1. `:347-350` `<svg>` 根（width/height 用 **mm 单位**、viewBox 无单位 mm 数值）+ 箭头 marker defs。
2. `:352-393` 逐可见 layer：x/y 左右 bounds（右轴仅 yAxis==1 系列）；series 按 `facet` 分桶；逐 facet——轴框+四向刻度（bottom/left/右轴条件/top 镜像 `showTopMirror`）+ clipPath + 系列路径/标记（marker 步进 ≤120 个，`:241`）+ 注解（text/line/arrow，手动线性映射 `:295-310`）。
3. `:395-426` 轴标题（首 layer 的 x/y0/y1，`title (unit)` 格式，y 轴 ±90° 旋转）。
4. `:428-438` 标题（baseFontPt+1、fontWeight 600）。
5. `:440-442` 图例（线样+名称，行高 `max(3, fontSize×0.75)`，越界截断）。

关键语义：`seriesPath` 断点跳过（axisFraction null），首点 M 其余 L；`dataBounds` 显式 min/max 优先、log 轴忽略非正值、空数据回 [0,1]、`max<=min` 时 +1（`:97-101`）。

## 4. 调用者与调用链

出向：`../types/cslab-origin-types`（7 类型）、`./cslab-plot-doc`（6 符号）（`:7-23`）。入向（检索=符号名+模块名，全冻结树）：

- `renderPlotSvg`：`apps/electron/src/main/lib/cslab/cslab-figure-export.ts:18,67`（唯一产品调用，main）+ 本批 `cslab-plot-doc.test.ts:14,85`、批外 `cslab-demo.test.ts:16,160`。
- `hasEditableText`/`hasEmbeddedImage`：测试两处（本批+批外）。
- `svgToDataUrl`/`describeAxisRange`/`__axisTickValues`/`__scaleValue`：**零外部引用**（仅 barrel；后两者注释自认「临时导出」）。
- renderer 无调用（`cslab-plot-svg` 仅 main figure-export）。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯字符串生成。

## 6. 分支、失败、取消与恢复

无异常路径（空标题/空系列静默跳过）；无异步/取消。

## 7. 权限与权威状态

本文件不适用（无权限代码）；契约（`:4`）：文字可编辑、无位图（测试 `hasEditableText`/`hasEmbeddedImage` 锚定）。

## 8. 修改影响面

- SVG 字符串形状是导出契约（figure-export）；`ptToMm` toFixed(3) 数值被测试断言（`font-size="2.117"`）。
- `escapeXml` 5 实体面；`scientificText` 依赖 `parseScientificText` 语法。

## 9. 测试证据

本批 `cslab-plot-doc.test.ts:55-95`（6 test 之 1：SVG 可编辑+无位图+字体换算）；批外 `cslab-demo.test.ts:156` 用例。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 文字全 tspan/无位图契约 | 已证实 | `:4,34-44` |
| pt→mm 无单位数值换算 | 已证实 | `:46-49` |
| log10/log2 指数刻度 | 已证实 | `:105-119` |
| 注解手动线性映射（`void xFraction` 死语句 `:296`） | 已证实（照实记录） | `:295-298` |
| `svgToDataUrl`/`describeAxisRange`/`__*` 零外部引用 | 已证实（检索式见 §4，全冻结树） | grep+子 agent |
| 真实渲染器显示效果 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 7 导出 | §2 | 338-476 | covered |
| 渲染主流程 | §3 | 338-443 | covered（1 test 锚） |
| 零引用四函数 | §4 | 446-476 | covered（死导出） |
