---
path: apps/electron/src/main/lib/cslab/cslab-demo-plates.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 42c4be4e5ee9c588e9019cbf56386eaa9c4bbb66
sha256: e346a4b7e25770da5ef9690f2a0efa8e9bda80f59470801f2224bf6257c2fcd0
lines: 476
kind: source
package: p03-integrations
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-demo-plates.ts

## 1. 结论与边界

CSLab **演示出版图生成**（`apps/electron/src/main/lib/cslab/cslab-demo-plates.ts`，476 行）：4 套演示 plate（Rutile XRD/Silicon NIST/Raman/Nature 风格）从演示数据构建 `CsLabPlotDocument`。供 `cslab-demo.ts` 的 `createDemoLab` 预生成。

## 2. 导出与关键符号

`export` 共 **5 个**。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `DemoPlateInput` | interface | `:31-38` | 输入（labId/数据集等） |
| `DemoPlateStats` | interface | `:39-44` | 统计输出 |
| `DemoClusteredPeak` | interface | `:45-50` | 聚峰结果 |
| `clusterPeaks` | 函数 | `:69-116` | 峰聚类（导出供测试） |
| `buildDemoPlates` | 函数 | `:450-476` | async，构建 4 套 plate |

内部：`PLATE_IDS`（`:51-68`）、`readTableY`/`requireTable`/`normalize100`/`axis`/`makeSeries`/`basePlot`/`withLayer`（`:117-198`）、`parseBenchmark`（`:199-212`）、`buildRutileXrdPlate`（`:213-243`）、`buildSiliconNistPlate`（`:244-317`）、`buildRamanPlate`（`:318-404`）、`buildNaturePlate`（`:405-449`）。

## 3. 内部逻辑与关键流程

- `clusterPeaks`（`:69-116`）：峰位聚类（容差合并邻近峰）→`DemoClusteredPeak[]`。
- 四个 plate 构造器（`:213-449`）：各自读表（`requireTable`，缺表抛）、归一化（`normalize100`）、造轴/系列（`axis`/`makeSeries`）、叠加图层（`withLayer`）；Silicon NIST/`buildNaturePlate` 为 async（读基准数据 `parseBenchmark`）。
- `buildDemoPlates`（`:450-476`）：顺序构建 4 套并落库（配合 `cslab-demo`）。

## 4. 调用者与调用链

- 调用者：`cslab-demo.ts`（`createDemoLab` 预生成）。
- 出向：cslab-db/表格读取、绘图文档构造。

## 5. 数据 I/O、读写与副作用

读演示数据表/基准文本；写绘图文档（落库）；无网络。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 表缺失 | `:122-133` | `requireTable` 抛 |
| 峰聚类容差 | `:69-116` | 合并邻近峰 |

## 7. 权限与权威状态

无身份语义；演示数据为固定资源。

## 8. 修改影响面

- `PLATE_IDS`/四构造器与演示资源耦合；`clusterPeaks` 导出被测试直接断言。

## 9. 测试证据

`cslab-demo.test.ts`（174 行）覆盖 demo 链（含 plates 间接）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 个导出、4 套 plate | 已证实 | `:31-476` |
| `clusterPeaks` 语义 | 已证实 | `:69-116` |
| 绘图实际渲染 | 未知 | 未运行 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 5 个导出 | `:31-476` | covered |
| 聚类/归一化 | `:69-198` | covered |
| 4 构造器 | `:213-449` | covered |
