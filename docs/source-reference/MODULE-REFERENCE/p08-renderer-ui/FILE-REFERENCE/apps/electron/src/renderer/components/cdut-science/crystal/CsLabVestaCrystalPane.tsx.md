---
path: apps/electron/src/renderer/components/cdut-science/crystal/CsLabVestaCrystalPane.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 59068cad96a102e0d1508d273eef421051b94f85
sha256: fb1b29ecdb9bf759c21cbee5c275741c0de6aa87dd84473b883870c1dcfd0a1f
lines: 549
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/crystal/CsLabVestaCrystalPane.tsx

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

VESTA 级晶体工作台（549 行，头注 :1-5）：左侧控制栏（结构信息/超胞/Miller 晶面/配位多面体/等值面）+中间 Mol* 视图+底部理论 PXRD 对照谱。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CsLabVestaCrystalPane` | 组件 | 61-549 | 晶体工作台 |

内部：`WAVELENGTH_OPTIONS`（:30-34，Cu/Co/Mo Kα）、`structureFormatOf`（:36-39，cif/poscar/xyz）、`formatValue`（:41-43）、`toTableSeries`（:45-56）。

## 3. 内部逻辑与关键流程

1. **结构分析 effect**（:84-113）：`analyzeCrystal`；非结构格式→错误文案「结构分析不可用」；金属/阴离子自动猜测（首个非 O/H 为金属，:103-104）。
2. **PXRD effect**（:116-138）：`simulatePxrd({wavelengthAngstrom,fwhmDeg,maxIndex:8,minTwoTheta:5,maxTwoTheta:90})`。
3. **体数据 effect**（:141-192）：`listAssets` 滤 cube/chgcar/locpot；`getVolumeGrid(maxDimension:192)`→isovalue 初值 `±max|grid|×0.6`。
4. **配位多面体**（:199-215）：`cslabWorkers.polyhedra(text,format,center,[neighbor],cutoff)`。
5. **PXRD 拾峰联动**（:520-545）：`onPick` 最近峰 <0.6°→填 hkl 并 `buildMillerPlane` 自动建面。
6. 结构信息栏（:246-285）：空间群（`assumed-p1` 标注「P1 降级」，:262）、化学式/晶胞/体积/密度/原子数；warnings 显首条。

## 4. 调用者与调用链

入向：舞台晶体窗格。出向：`window.electronAPI.cslab.*`（analyzeCrystal/simulatePxrd/listAssets/getVolumeGrid）、`@/lib/cslab/cslab-worker-client`、`@/lib/webgpu/use-cslab-isosurface`、`../CsLabMolstarViewer`、`../CsLabSpectrumStrip`、`@profer/shared`（buildMillerPlane/CSLAB_XRAY_WAVELENGTHS）。

## 5. 数据 I/O、读写与副作用

4 个 IPC + worker 计算；无直接磁盘。

## 6. 分支、失败、取消与恢复

各 effect `cancelled` 防卸载后 setState；分析/模拟失败→error 文案或 toast；非结构格式降级文案。

## 7. 权限与权威状态

- 科学诚实：空间群降级标注（`assumed-p1`→「P1 降级」:262）；PXRD 明示「理论」（:479）；晶面构建失败提示「无法构建合法晶面」（:343-346）。无 sender/role 检查。

## 8. 修改影响面

晶体分析/模拟工作台：舞台晶体窗格、`CsLabMolstarViewer` 传参（polyhedra/isosurface/supercell/plane）、底部 PXRD 谱。
- 波及面：analyzeCrystal/simulatePxrd/listAssets/getVolumeGrid 四条 IPC 链、worker 多面体、拾峰→建面联动；任一 effect 依赖序（analysis→pattern）改变会打断 PXRD。
- 回归关注：空间群「P1 降级」标注、理论 PXRD 明示、cancelled 防卸载 setState 不变。
- 无专属测试文件（全树检索确认）；回归须靠 Electron/GUI 人工验证。

## 9. 测试证据

直接测试：无。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 组件/内部符号/行号 | 已证实 | 逐行核对 |
| P1 降级标注/理论 PXRD 语义 | 已证实 | :262/:479 |
| Mol*/WebGPU 真实渲染 | 未知 | 无测试、NOT_RUN |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 四个数据 effect | §3.1-3.3 | 84-192 | covered（未测） |
| 多面体/晶面/拾峰联动 | §3.4-3.5 | 199-215/520-545 | covered（未测） |
| 控制栏/信息栏 UI | §3.6 | 217-549 | covered（未测） |
