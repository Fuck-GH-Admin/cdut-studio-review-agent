---
path: apps/electron/src/renderer/components/cdut-science/origin/CsLabPeakFitDrawer.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 57f8641c7e2834e7eb1ee720f04888fd61ba7f84
sha256: 21ddadf5286b057f53cd6b7b4f04cf0201356457c2461f5892d9c6533b6f9635
lines: 270
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/origin/CsLabPeakFitDrawer.tsx

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

多峰解叠拟合抽屉（270 行，头注 :1-3）：自动检峰（局部极大+间距限制）→人工调参→worker 拟合（gaussian/lorentzian/pseudo_voigt × 5 种基线）→结果表→「应用为图层」。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CsLabFitData` | interface | 16-19 | x[]/y[] |
| `CsLabPeakFitDrawer` | 组件 | 54-270 | 拟合抽屉 |

内部：`CsLabPeakFitDrawerProps`（:21-27）、`detectPeaks`（:29-53，窗口极大值+span/30 最小间距+上限 6 峰）。

## 3. 内部逻辑与关键流程

1. **`detectPeaks`**（:29-53）：`window=max(2,len/120)` 局部极大→按高度降序→间距 `span/30` 过滤→前 6→center 升序；初始 `fwhm=max(span/80,1e-6)`、`height=max(1e-6,peak.y)`。
2. **状态**（:58-73）：open+data 变化→重检峰清结果。
3. **`runFit`**（:85-108）：`cslabWorkers.fit({x,y,peaks,model,baseline,polynomialOrder: baseline==='polynomial'?2:undefined})`；收敛→success toast 含 R²；未收敛→info `拟合未完全收敛，请检查初始峰`。
4. **结果区**（:209-267）：R²/RMSE/收敛状态；峰表（中心/高度/FWHM/面积/占比%）；`onApply(result, data)` 应用为图层。

## 4. 调用者与调用链

入向：Origin 谱图编辑器（打开抽屉+应用图层）。出向：`@/lib/cslab/cslab-worker-client`（worker 拟合）、`@profer/shared`（formatMetric/类型）。

## 5. 数据 I/O、读写与副作用

worker 计算；无磁盘。

## 6. 分支、失败、取消与恢复

无峰→info 提示；拟合异常→toast error；busy 防重入。

## 7. 权限与权威状态

- 科学诚实：未收敛明示「未完全收敛」不冒充成功（:98-104）；检峰为启发式初始值可编辑。无 sender/role 检查。

## 8. 修改影响面

谱图峰拟合工作流：Origin 谱图编辑器打开抽屉→自动检峰→worker 拟合→应用为图层。
- 波及面：`cslabWorkers.fit` 契约（peaks/model/baseline/polynomialOrder）、`onApply` 图层写回、结果表渲染。
- 回归关注：未收敛明示「未完全收敛」不冒充成功、检峰启发式初值可编辑、busy 防重入。
- 无专属测试文件（全树检索确认）；回归须靠 worker 拟合人工验证。

## 9. 测试证据

直接测试：无。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出/内部符号/行号 | 已证实 | 逐行核对 |
| 检峰/收敛诚实语义 | 已证实 | :29-53/:85-108 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `detectPeaks` | §3.1 | 29-53 | covered（未测） |
| `CsLabPeakFitDrawer` | §3.2-3.4 | 54-270 | covered（未测） |
