---
path: apps/electron/src/main/lib/cslab/cslab-science.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5cc260313518e8881df2948db0ee6d9d2dab08a1
sha256: fd85f37b7afe6bbc78ed1aa04707198de906021b5c9603695ef02caf7d9aec76
lines: 247
kind: source
package: p03-integrations
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-science.ts

## 1. 结论与边界

CSLab 科学计算服务（主进程）（文件头 `apps/electron/src/main/lib/cslab/cslab-science.ts:4-9`）：统一承接晶体分析、PXRD 模拟、峰拟合、体数据读取、绘图文档存取与出版图导出。**结构/谱图计算全复用 `@profer/shared` 纯函数，主进程只负责文件 IO 与路径安全**。

## 2. 导出与关键符号

`export` 逐条核对：12 个函数 = 12 个导出（类/接口/常量 0）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `analyzeCrystalAsset` | 函数（导出） | 63-70 | 空间群/体积/密度/Wyckoff/等价原子（`analyzeCrystalText`） |
| `simulatePxrdAsset` | 函数（导出） | 73-80 | 理论 PXRD（`buildStructureFromText`+`simulatePxrd`） |
| `fitPeaks` | 函数（导出） | 83-85 | 多峰解叠（`fitPeaksCore`，Agent 工具用） |
| `smoothSeries` | 函数（导出） | 88-93 | 平滑（y 截取对齐 x） |
| `getVolumeGrid` | 函数（导出） | 96-111 | Cube/CHGCAR/LOCPOT 解析；`maxDimension` clamp 16-256 降采样（`:107-109`） |
| `isValidPlotId` | 函数（导出） | 118-120 | **严格字符串判定**（防 `RegExp.test(undefined)` 强转误判，`:117`） |
| `plotPath` | 函数（导出） | 122-125 | 非法 id 抛 `绘图标识非法` |
| `savePlot` | 函数（导出） | 128-145 | `normalizePlotDocument`+labId 匹配+原子写 |
| `listPlots` | 函数（导出） | 148-175 | 摘要列表（坏文件跳过不阻塞，`:170-172`） |
| `loadPlot` | 函数（导出） | 178-191 | labId 不符→null |
| `exportFigure` | 函数（导出） | 194-214 | 未指定 targetPath 自动写 `vault/figures`（`sanitizeFileName`） |
| `getCsLabPromptLabInfo` | 函数（导出） | 218-247 | 提示词装配（失败 warn+undefined） |
| `PLOT_ID_RE`/`structureFormatOf`/`readStructureAsset`/`plotsDir` | 内部 | 44-115 | `^[A-Za-z0-9_-]{1,64}$`；cif/poscar/xyz 白名单；结构资产读取（跨 lab/格式错抛错）；`vault/plots` |

## 3. 内部逻辑与关键流程

- 结构读取（`readStructureAsset`，`:51-60`）：`getMolAsset`（已登记 URI+沙箱）→ 格式须 cif/poscar/xyz 否则抛 `资产格式 X 不是可分析的结构格式`。
- 绘图安全（`:117-125`）：`isValidPlotId` 严格类型+正则；`plotPath` 拒非法 id（路径穿越防护）。
- `savePlot`（`:128-145`）：normalize→id/labId 校验→`writeTextAtomic`→返回摘要。
- `exportFigure`（`:194-214`）：默认目标 `vault/figures/sanitizeFileName(fileName??plotId.ext)`。

## 4. 调用者与调用链

入向：科学计算 IPC/Agent 工具（fitPeaks 等）+ 绘图存取/出版图导出 + 提示词装配；测试：`cslab-science.test.ts`（160 行，本批）。出向：`@profer/shared`（全部纯计算）、`./cslab-atomic.ts`、`./cslab-figure-export.ts`、`./cslab-mol.ts`、`./cslab-paths.ts`、`./cslab-manager.ts:1`、`./cslab-db.ts:2`。

## 5. 数据 I/O、读写与副作用

读写：`vault/plots/*.json`（原子写）+ `vault/figures/` 导出；读：结构/体数据资产、sqlite。副作用：`console.warn`。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| 资产不存在/跨 lab | 抛错 | 56,102 |
| 格式不可分析 | 抛错 | 58 |
| 非法 plotId | 抛 `绘图标识非法` | 123 |
| plot.labId 不符 | 抛（save）/null（load） | 135,186 |
| 坏 JSON/损坏文件 | 跳过/null | 170-172,188-189 |
| 提示词失败 | warn+undefined | 243-245 |

## 7. 权限与权威状态

- 路径安全权威：`assertLabId`/`resolveLabDir`/`sanitizeFileName`/plotId 白名单。
- 计算权威：`@profer/shared` 纯函数（主进程零算法，`:8`）。

## 8. 修改影响面

改路径安全影响沙箱；改纯函数复用面影响科学计算契约；影响 `cslab-science.test.ts`。

## 9. 测试证据

直接测试：`cslab-science.test.ts`（160 行，详见其手册）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 计算纯函数/IO 唯一职责 | 已证实 | `:4-9` |
| plotId 严格判定 | 已证实 | `:117-125` |
| 损坏文件容错 | 已证实 | `:170-172` |
| downsample clamp | 已证实 | `:107-109` |
| shared 算法内部 | 未知 | 文件外 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 计算四函数 | §2 | 63-111 | covered |
| 绘图四函数 | §2,§3 | 118-191 | covered |
| 导出/提示词 | §2 | 194-247 | covered |
| 断言 | §9,§10 | — | 见测试手册 |
