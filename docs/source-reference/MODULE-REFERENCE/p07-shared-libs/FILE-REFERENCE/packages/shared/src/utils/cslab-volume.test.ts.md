---
path: packages/shared/src/utils/cslab-volume.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3542f2da30e0c5842c43bbd3200e50941cd39990
sha256: ee50dd4f3b97348de15fad10b51a01fa0d2c8cbc0e3cdca95f5a88912894ed4b
lines: 187
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/cslab-volume.test.ts

## 1. 测试目标

体数据与等值面（`packages/shared/src/utils/cslab-volume.test.ts:43,124`）：Cube/CHGCAR/LOCPOT 解析、球体等值面、三线性采样、差分网格（含 fail-closed）。被测 `parseCube`/`parseChgcar`/`parseLocpot`/`sampleGrid`/`computeDifferentialGrid`/`CsLabVolumeParseError` + `extractIsosurfaceCpu`（cslab-isosurface 跨模块）。夹具：`sphereGrid()`（解析球标量场，`:13-41`）、`MINIMAL_VASP_HEADER`（`:89-103`）、`constantGrid()`（`:105-122`）。

## 2. 用例清单

共 **8 个 `test(`**（2 个 `describe`）：

### D1「体数据与等值面」（3）

| # | 行 | 用例 | 断言要点 |
| --- | --- | --- | --- |
| 1 | 44-56 | 小型 Cube → 网格尺寸与数值正确 | dimensions [2,2,2]、atomCount 1、values 8 数逐位、min 1/max 8 |
| 2 | 58-79 | 球体零等值面 → 顶点在球面附近 | triangleCount >100、positions/normals 等长、逐顶点 \|dist-0.35\|<1/24+1e-6（抽 40 点）、法线模 >0.9 |
| 3 | 81-85 | 三线性采样端点返回原始体素值 | `sampleGrid(grid,0,0,0)` toBeCloseTo values[0] |

### D2「VASP 体数据与差分网格」（5）

| # | 行 | 用例 | 断言要点 |
| --- | --- | --- | --- |
| 4 | 125-133 | 最小 CHGCAR → 维度极值正确 | format 'chgcar'、values 8 数、min/max、warnings 含 'PAW' |
| 5 | 135-141 | LOCPOT 支持负值静电势 | format 'locpot'、min -1.5/max 2.5 |
| 6 | 143-153 | 总量+两减数 → 逐格点 total−A−B | values 全 1.25、min/max 1.25、warning 含 'Δρ' |
| 7 | 155-161 | 单减数 → 两体差值 | values 全 1.75 |
| 8 | 163-184 | 非法输入 → 明确报错 | 4 抛错：无减数(toThrow 类)、维度不一致('维度')、数值数不匹配('数值数')、NaN('非有限数值') |

## 3. 真实断言

逐条见 §2（关键锚）：`:51-55` 逐位数组；`:65-77` 球面/法线循环断言；`:84`；`:129-132`；`:139-140`；`:149-152`；`:159-160`；`:167-183` 四类 toThrow（含错误类断言）。

## 4. 未覆盖与脆弱点

- `downsampleGrid`/`gridSlice` 无用例（与源手册 §9 缺口一致）。
- 用例 1 的 Cube 头格式为最小合成（真实 Cube 变体（负原子数多数据集）未测）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 test/2 describe、三夹具工厂 | 已证实 | 全文 |
| 差分 fail-closed 四类报错 | 已证实 | `:163-184` |
| 等值面球面+法线数值锚 | 已证实 | `:65-77` |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| parseCube | §2/§3 | 1 | covered |
| extractIsosurfaceCpu | §2/§3 | 2 | covered |
| sampleGrid | §2/§3 | 3 | covered |
| parseChgcar/parseLocpot | §2/§3 | 4-5 | covered |
| computeDifferentialGrid | §2/§3 | 6-8 | covered |
| downsampleGrid/gridSlice | §4 | — | unknown |
