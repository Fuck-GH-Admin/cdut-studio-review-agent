---
path: apps/electron/src/main/lib/cslab/cslab-scientific-tools.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 64d4124200ab90554878a188872e68733f9b8e24
sha256: 55526ed373fd31f03de3881bc805174a22ad1213c0a0fa50bf8f7c89deaf9985
lines: 521
kind: source
package: p03-integrations
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-scientific-tools.ts

## 1. 结论与边界

**CSLab 科学引擎 × Pi Agent 工具集**（`cslab-scientific-tools.ts:5-10` 注释）：只读工具（晶体分析、PXRD 模拟、峰拟合）+ 写操作工具（更新画板、导出出版图，**保留逐次审批** `:9`）；另含结构资产创建/3D 视窗聚焦/快照。**未绑定实验室返回空数组**（`:73/:79`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `PiCsLabScienceToolsContext` | interface（export） | `:42-44` | `{sessionId}` |
| `buildCsLabScienceTools` | function（export） | `:74-521` | `(sdk, ctx) => ToolDefinition[]`（8 工具，§3） |

内部：`jsonToolResult`/`jsonToolError`（统一结果/错误信封 `:46-59`）、`downsampleCurve`（>2000 点抽稀 `:61-71`）、`PiSdkLike`（`:40`）。

## 3. 内部逻辑与关键流程（8 工具，`:90-518`）

| 工具 | 行 | 行为要点 |
| --- | --- | --- |
| `cslab_analyze_crystal` | `:91-124` | CIF/POSCAR/XYZ→空间群/晶胞/密度/化学式/Wyckoff（`analyzeCrystalAsset`） |
| `cslab_simulate_pxrd` | `:127-170` | 理论粉末 XRD（峰位/强度/hkl/d/2θ/多重度+曲线抽稀 `:162`） |
| `cslab_fit_peaks` | `:173-281` | 多峰解叠（gaussian/lorentzian/pseudo_voigt；baseline 5 模式 `:195-203`）；三取数源：x/y 直供、tableUri（`getTableSeries` 2 万点 `:222`，yKey 缺省取首非 x 列 `:225-228`）、plotId（首条可见曲线+ROI `:231-249`，ROI<5 点拒 `:246`）；数据校验（长度≥5 `:250-252`）；初始 fwhm=span/80（`:259`） |
| `cslab_render_plot` | `:284-351` | 保存绘图并推送画板：plot 全量（**id 不合规兜底生成** `:306-310`）或 plotId+appendSeries（首图层追加 `:313-325`）；**覆盖前留 undo 快照**（`:330-331`）；广播 ON_PLOT_UPDATED 含 undoToken |
| `cslab_export_figure` | `:354-399` | SVG/PDF/PNG/TIFF，dpi 300/600/1200（默认 600 `:387`）、20-500mm 物理尺寸 |
| `cslab_create_structure` | `:403-443` | CIF/POSCAR 文本→临时文件→**`ingestMolAsset` 铁笼校验入笼**（`:422`）→广播 ON_ASSET_CHANGED；finally 清临时文件（`:438-439`）；标题 sanitize（`:419`） |
| `cslab_focus_structure` | `:447-486` | 广播 ON_STRUCTURE_FOCUSED（VESTA 视窗，超晶胞 1-5、多面体高亮 `:454-461`） |
| `cslab_snapshot_structure` | `:490-518` | `requestStructureSnapshot`（默认 2× 超采样 `:506`）落 vault/figures/ |

## 4. 调用者与调用链

- 入向：Pi Agent 工具装配（adapters/pi-cslab-tools / agent-service，跨文件）。
- 出向：`../agent-session-manager`、`./cslab-science`（7 符号 `:30-38`）、`./cslab-mol`（getTableSeries/ingestMolAsset）、`./cslab-plot-history`、`./cslab-structure-snapshot`、`./cslab-events`/`./cslab-paths`/`./cslab-types`、typebox/`@earendil-works/pi-*` 类型、electron（app.getPath('temp')）。

## 5. 数据 I/O、读写与副作用

写：vault/plots（savePlot）、vault/figures（导出）、临时文件；广播 3 类事件；读结构/表/绘图资产。无网络。

## 6. 分支、失败、取消与恢复

每工具 catch→`jsonToolError`（不抛）；参数经 TypeBox 约束（min/max/literal）；undo 快照可回退画板（`:331/:344`）。不适用取消/恢复。

## 7. 权限与权威状态

写操作保留**逐次审批**（`:9`）；结构创建经铁笼校验（`:422`）；会话未绑定实验室不装配（`:79`）。

## 8. 修改影响面

改工具 → Agent 科学工作流（分析/模拟/拟合/画板/导出/结构/3D）；结果信封形状牵动调用方解析。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 8 工具名与 `buildCsLabScienceTools` → 0 命中；底层 cslab-science 拟合经调用方测试非本批）。**NOT_RUN**（Agent 执行）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出+3 内部+8 工具全链 | 已证实 | 逐行读 `:1-521` |
| cslab-science 计算正确性 | 未知 | 跨文件 |
| Agent 实际调用行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 8 工具 | §3 | `:90-518` | covered |
| 信封/抽稀 | §2 | `:40-71` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
