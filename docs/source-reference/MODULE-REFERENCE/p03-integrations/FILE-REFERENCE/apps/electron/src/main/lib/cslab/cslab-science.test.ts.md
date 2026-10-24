---
path: apps/electron/src/main/lib/cslab/cslab-science.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2f118b370063dad893d1074e5de8da099f6f6761
sha256: 97d06f4a9ea8b68ddcf3611f7a7635869742fb8703dd4bcdf3c654ffd3a680bf
lines: 160
kind: test
package: p03-integrations
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-science.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

CSLab 科学服务集成测试（`:1-3`）：金红石 CIF 晶体分析（晶胞/原子/化学式/Wyckoff）、PXRD 模拟（峰表+连续谱线）、绘图文档保存/列出/读取往返、SVG 导出（可编辑文字无位图）、plotId 严格判定、非字符串 id 拒绝（不再落成 `undefined.json`）、PDF 页尺寸/视口换算。

## 2. 用例清单

共 7 个 `test(`（`apps/electron/src/main/lib/cslab/cslab-science.test.ts:49,60,69,109,127,138,150`；describe `:48` 4 个、`:126` 3 个）。夹具：真实摄取 `demo-data/cdut-science-rutile/rutile-tio2.cif`（`:17,25-27`，beforeAll 断言 `status==='ok'`）；afterAll 解锁 figures/关库。

| # | 用例（行） | 真实断言 |
| --- | --- | --- |
| 1 | 晶体分析（`:49`） | `atomCount`/`expandedAtomCount` `toBe(6)`；`formula` `'Ti2 O4'`；spaceGroup.symbol 含 `'P'`；`cellVolume` `toBeCloseTo(62.43,1)`；`wyckoff` `toHaveLength(6)` |
| 2 | PXRD 模拟（`:60`） | `peaks.length>0`；`curve.x.length>100`；`wavelengthAngstrom` `toBeCloseTo(1.5406,6)`（Cu Kα）；`peaks[0].twoTheta>0` |
| 3 | 绘图往返（`:69`） | `savePlot` summary.id `'plot-test-1'`；`listPlots` 含之；`loadPlot` title `'金红石 XRD'`、series name `'TiO_2'` |
| 4 | SVG 导出（`:109`） | `result.path.endsWith('.svg')`；svg `startsWith('<svg')`、`toContain('<text')`、`not.toContain('<image')` |
| 5 | plotId 严格判定（`:127`） | `'plot-1a2b3c4d'`/`'plot_test-01'`→true；`undefined`/`123`/`''`/`'..'`/65 字符→false |
| 6 | 非字符串 id 拒（`:138`） | `id:undefined` → `rejects.toThrow('绘图标识非法')`（注释：不再落成 `undefined.json`） |
| 7 | PDF 尺寸（`:150`） | `pdfPageSizeInches(85,60)` `toEqual({width:3.346,height:2.362})`；`pdfViewportPx(85,60)` `toEqual({widthPx:321,heightPx:226})`；视口 ≤ 纸张×96（防横向切页/空白尾页，`:156` 注释） |

## 3. 真实断言

逐条见上表（`:52-57,63-66,101-106,118-122,129-135,145-147,153-158`）。mock 边界：无 mock；真实 CIF 摄取+真实科学计算（`@profer/shared` 纯函数）+真实文件导出。

## 4. 未覆盖与脆弱点

未覆盖：`getVolumeGrid`/`fitPeaks`/`smoothSeries`、资产不存在/格式不可分析抛错、`exportFigure` 其它格式、`getCsLabPromptLabInfo`。用例 1-2 依赖 demo CIF 数值（62.43/1.5406 为金红石物理量）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 个用例 | 已证实 | `grep test(`；`:49-159` |
| 分析/PXRD 数值 | 已证实 | `:52-66` |
| 往返/SVG 无位图 | 已证实 | `:101-122` |
| plotId 严格+undefined.json 修复 | 已证实 | `:129-147` |
| PDF 换算约束 | 已证实 | `:153-158` |
| 其余导出 | 未知 | 未覆盖 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 晶体分析 | 1 | 49-58 | covered |
| PXRD | 2 | 60-67 | covered |
| 绘图往返 | 3 | 69-107 | covered |
| SVG 导出 | 4 | 109-123 | covered |
| plotId 判定 | 5,6 | 127-148 | covered |
| PDF 尺寸 | 7 | 150-159 | covered |
| 体数据/拟合/平滑 | 无 | — | unknown |
