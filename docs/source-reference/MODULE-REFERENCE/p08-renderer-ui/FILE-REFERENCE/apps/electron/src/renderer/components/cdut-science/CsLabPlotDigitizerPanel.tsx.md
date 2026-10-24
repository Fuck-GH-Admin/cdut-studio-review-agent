---
path: apps/electron/src/renderer/components/cdut-science/CsLabPlotDigitizerPanel.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7a096d76835fa85739cd29f3b14414872b61d04c
sha256: 54a890128037d4911bfb06a790f62232e1a0481811c160609a394bef9592e893
lines: 573
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/CsLabPlotDigitizerPanel.tsx

## 1. 结论与边界

图表逆向数字化抽屉（头注释 :2-6）：流程=三点标定→颜色取样→自动提取→拖动控制点磁性吸附→保存为 fig+table；**评审加固**：吸附用 shared 纯几何函数（mapPixelToValue/snapPointToPolyline）；Python 缺失展示缺失包+一键安装。

## 2. 导出与关键符号

导出 1 条（`export` :50）：`CsLabPlotDigitizerPanel({labId, selection?, onSaved})`（:50-）。内部：`MAX_TICKS=3`（:36）、`DEMO_DIGITIZER_TICKS`（:39）。

## 3. 内部逻辑与关键流程

（头部+大纲级，573 行）：jotai 两原子（toolDepsProgress/toolRuntime :22-24）；标定/取样/提取/吸附/保存五步状态机；共享纯函数吸附（:12-13）。

## 4. 调用者与调用链

入向（子agent 交叉核）：唯一 `CsLabWorkspaceView.tsx:90` → :2321（drawer.mode=plot :2320）。出向：snapPointToPolyline（:13→:237）、mapPixelToValue（:12→:240-241）；electronAPI digitizePlot:163/installToolDeps:266/saveDigitizedFigure:285/getToolRuntime:83-84/:176。

## 5. 数据 I/O、读写与副作用

触发 Python 提取（工具执行链）；保存 fig+table。

## 6. 分支、失败、取消与恢复

Python 缺失→安装引导（:5）；不适用取消/恢复。

## 7. 权限与权威状态

吸附纯函数权威（评审加固 :5）；保存产物契约（fig+table）。

## 8. 修改影响面

- 消费面：数字化工作流。
- 依赖面：shared 几何纯函数、工具运行时（Python）。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条；五步流程+加固 | 已证实 | :2-6/:36 |
| 面板实现逐行 | 推断（头+大纲级） | :50-572 |
| 通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+流程契约 | §2/§7 | :2-50 | covered |
| 面板实现 | §3/§10 | :50-572 | 推断 |
