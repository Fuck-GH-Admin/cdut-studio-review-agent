# nb-98 独立复核结果（accepted）

- 批次 `nb-98`（二次再平衡新单，`p08.cdut-science-ui`，18 source/7601 行，0 测试随批）；冻结 `05fb2565e2…`；复核者 `docs-r07-qa-ui-20261023`；2026-10-24T04:40:00Z
- **batchVerdict: accepted（18/18）**。1 条低级（N98-1）。NOT_RUN（产品测试/typecheck/构建/GUI/真实模型）。

## 封版绑定（seal v2）

READY `7bbbe56d…`、DONE `cfa9b6ff…`、ZIP `dd432cce…`（33975 B，21 entries）。G0 PASS：18 篇四方哈希一致；源 18/18 blob+sha+行数复算一致；ZIP 安全、无漂移、链自洽。G1：18 source 11 章；§2 符号行号严格核验 18/18 全过。

## G2

- **导出覆盖 18/18 COMPLETE**（各 1 组件导出，0 缺）。
- **预读对照吻合**（SOURCE-CHECKLIST-qa-ui 事实 vs 交付正文）：
  - CdutScienceView：`cslab.getAuthStatus()` 首屏同步 + **失败安全降级「需要验密」**（`:36`）✓
  - CsLabComposerLock `:22-38` 输入锁定占位（模型/附件/发送不可用，引导前往科学工作台）✓
  - CsLabDeleteLabDialog：**完整名称输入红线**（防误触）→ 主进程停止监听/关 SQLite/物理删除沙箱 ✓
  - IPC 桥 `electronAPI.cslab.*` 口径与预读扫描（158 处）一致 ✓
- 4 处省略号中 3 处为 UI 文案/形状省略；1 处行段见 N98-1。

## N98-1（low，非阻断）

`CsLabIronCageTable.tsx.md` §2 `IronCageTableProps` 行段 `:12-…` 尾省略号 → 改实值。

## acceptedHashes（18，exact 见 `reviews/nb-98/REVIEWED-HASHES.json`）

CdutScienceView/CsLabAgentGuards/CsLabAssetRail/CsLabAuthGate/CsLabCreateLabDialog/CsLabDagCanvas/CsLabDatasetView/CsLabDeleteLabDialog/CsLabFigureView/CsLabFormulaPanel/CsLabHpcPanel/CsLabIronCageTable/CsLabLiteratureBrainPanel/CsLabManuscriptEditor/CsLabMolstarViewer/CsLabNetworkSharePanel/CsLabNotesPanel/CsLabOriginPlotPane（各 `.tsx.md`）。

## 边界

未改源码/作者正文/candidate/全局总账；旧 seal/旧组预读不回写；accepted 仅限静态文档 scope；运行期行为未知。
