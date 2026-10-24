---
path: apps/electron/src/main/lib/cslab/cslab-dataset-store.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 23c80758a62ef45421d386528904f3af93283bad
sha256: fa989276b3acb49ac2677b143959534c8653b62b875087e23b75041eb6a8acaa
lines: 197
kind: source
package: p03-integrations
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-dataset-store.ts

## 1. 结论与边界

CSLab **数字化图表持久化**（`apps/electron/src/main/lib/cslab/cslab-dataset-store.ts`，197 行）：把框选数字化的曲线序列+图像落库（`central_meta.sqlite`）。核心校验：无曲线/点不足/图像非法均**如实抛错**（`:115-117`、`:100-102`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `persistDigitizedFigure` | 函数 | `:110-197` | `(input: CsLabDigitizedFigureInput, …) => …` 主流程（async） |

类型（同文件上方）：`CsLabDigitizedFigureInput`（含 `labId/title?/series/imageDataUrl`，`:25-37` 区段）。内部：`cleanSeries`（`:39-60`，清洗为 `CleanSeries[]`）、`alignSeries`（`:62-96`，取主序列 xGrid 线性插值对齐 → `buildDataset`）、`decodePng`（`:98-104`，data URL 正则解码）、`labDb`（`:106-108`，`resolveLabDir(labId)/db/central_meta.sqlite`）。

## 3. 内部逻辑与关键流程

`persistDigitizedFigure`（`:110-197`）：`assertLabId`（`:113`）→ `cleanSeries`（空则抛「没有可保存的数字化曲线」，`:115`）→ `alignSeries`（主序列=点最多的序列 `:64-65`，x 网格线性插值 `:69-85`；点不足抛「曲线点不足」，`:117`）→ `decodePng`（png/jpeg data URL，非法/空抛错，`:98-104`）→ 生成 `fig-${randomUUID().slice(0,8)}`（`:122`）落库。

## 4. 调用者与调用链

- 消费方：数字仪（digitizer）持久化入口。
- 出向：`buildDataset`、`getCsLabDatabase`/`resolveLabDir`、`assertLabId`（cslab-db/工具系）。

## 5. 数据 I/O、读写与副作用

**DB 写**：`central_meta.sqlite`（数据集+图像 blob）；无网络。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| labId 非法 | `:113` | 抛（assertLabId） |
| 无曲线 | `:115` | 抛 |
| 点不足 | `:117` | 抛 |
| 图像格式无效/空 | `:100-102` | 抛 |
| title 缺省 | `:119` | 「数字化图表」 |

## 7. 权限与权威状态

`assertLabId` 边界校验；落库为 lab 级持久化（无用户身份维度）。

## 8. 修改影响面

- 插值口径（主序列 xGrid 线性插值）影响数据表精度。
- `fig-` 前缀 ID 与下游检索耦合。

## 9. 测试证据

`cslab-dataset-store.test.ts`（213 行）直接覆盖（见该测试手册）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 主流程与四类抛错 | 已证实 | `:98-122` |
| 主序列=点最多、线性插值 | 已证实 | `:64-85` |
| DB 落库行为 | 未知 | 未运行 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `persistDigitizedFigure` | `:110-197` | covered |
| 清洗/对齐/解码 | `:39-108` | covered |
| 测试证据 | 9 | covered |
