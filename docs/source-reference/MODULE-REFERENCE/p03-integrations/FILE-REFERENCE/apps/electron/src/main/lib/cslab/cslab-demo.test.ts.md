---
path: apps/electron/src/main/lib/cslab/cslab-demo.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2e48c2eb5f08bdae5e92b06fc9258469a1e554a4
sha256: 7d795fb18e67bd390069fee558fcad0c57890460dbf0faae583cfa71733991b2
lines: 174
kind: test
package: p03-integrations
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-demo.test.ts

## 1. 测试目标

**演示实验室**（`apps/electron/src/main/lib/cslab/cslab-demo.test.ts:64`）：一键创建资产+四套图版、幂等、曲线完整、NIST 对标/拉曼处理/SVG 矢量/Nature 图版规格。

## 2. 用例清单

1 describe / 7 test（真实演示数据/DB 夹具）。

| # | 名称 | 断言要点 | 行 |
| --- | --- | --- | --- |
| 1 | 一键创建资产+四套图版齐备 | 资产清单与 4 图版 | `:65-89` |
| 2 | 再次创建幂等、绘图覆盖不累积 | 无重复 | `:90-100` |
| 3 | 四套图版曲线数据完整 | 曲线非空 | `:101-115` |
| 4 | 硅 NIST SRM 640 对标 | **前 6 峰偏差 < 0.05°** | `:116-141` |
| 5 | 拉曼 AsLS 基线扣除+分峰 | **R² 与面积守恒达标** | `:142-155` |
| 6 | SVG 导出 | 纯矢量、文字可编辑 | `:156-166` |
| 7 | Nature 图版 | 双 Y 轴、89 mm 单栏成立 | `:167-173` |

## 3. 真实断言

- `:116-141`（前 6 峰偏差 < 0.05° 断言组）；`:142-155`（R²/面积守恒）；`:156-166`（SVG 矢量/可编辑文字）；`:167-173`（双 Y 轴/89mm）。

## 4. 未覆盖与脆弱点

- 未覆盖：`createDemoLab` 异常路径（演示文件缺失）。
- 脆弱点：科学精度断言（0.05°/R²）绑定演示数据与算法实现。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 用例覆盖创建/幂等/4 plate/科学规格 | 已证实 | `:65-173` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 创建/幂等 | 1-2 | `:65-100` | covered |
| 曲线完整 | 3 | `:101-115` | covered |
| NIST/拉曼规格 | 4-5 | `:116-155` | covered |
| SVG/Nature 规格 | 6-7 | `:156-173` | covered |
