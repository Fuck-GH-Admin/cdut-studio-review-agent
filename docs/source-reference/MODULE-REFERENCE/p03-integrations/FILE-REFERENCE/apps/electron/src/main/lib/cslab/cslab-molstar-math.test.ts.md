---
path: apps/electron/src/main/lib/cslab/cslab-molstar-math.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 63e2af7d40615ae4fffa880e8c4cdbf5ba9df8e3
sha256: ef071915797e82a4a5d002c7f80e506ae92b1eec6af11e47d51311ac49f9e925
lines: 175
kind: test
package: p03-integrations
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-molstar-math.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

CSLab 晶体学数学与旁注排程测试（`:1-3`，被测函数均来自 `@profer/shared` 纯函数）：CIF 晶胞解析（剥不确定度/空间群/体积/三斜/晶胞中心）、d 间距与 2θ、2θ 反查晶面、Bragg 截断枚举、倒易法向量、Miller 面组合、旁注一维重力松弛与贝塞尔引线。

## 2. 用例清单

共 13 个 `test(`（5 个 describe：`:35` 3 个、`:63` 3 个、`:88` 2 个、`:121` 2 个、`:142` 3 个 = 3+3+2+2+3）。夹具 `RUTILE_CIF`（带不确定度 `4.5937(3)`，`:20-29`）；`close()` 容差比较（`:31-33`）。

| # | 用例（行） | 真实断言 |
| --- | --- | --- |
| 1 | 晶胞解析（`:36`） | a/b/c `toBeCloseTo(4.5937/4.5937/2.9587,4)`、`alpha` `90`、`spaceGroup` `'P 42/m n m'`、volume≈a·b·c（容差 1e-2） |
| 2 | 缺字段/PDB→null（`:47`） | 三种输入均 `toBeNull()` |
| 3 | 三斜体积/中心（`:53`） | volume ∈ (150,230)；center 全 finite |
| 4 | (110) d 与 2θ（`:66`） | d `toBeCloseTo(4.5937/√2,3)`；θ≈27.44±0.08（Cu Kα 1.5406） |
| 5 | 2θ 反查（`:73`） | `assignReflections(27.44,…)` 首个 `(1,1,0)`、`delta<0.35` |
| 6 | 容差外空数组（`:82`） | `assignReflections(20,…,0.05)` `toEqual([])`（**诚实返回**） |
| 7 | Bragg 枚举（`:91`） | 区间 20-60、limit 40、升序、含 (110)≈27.44±0.1 |
| 8 | 去重无 (000)（`:109`） | 无全零；正反晶面族 key 集合唯一 |
| 9 | 法向量（`:124`） | (110) `[√½,√½,0]`（1e-6）且模长 1（1e-9） |
| 10 | buildMillerPlane（`:133`） | h=1、d≈4.5937/√2、twoTheta 已定义 |
| 11 | 重力松弛（`:143`） | 顺序 a/b/c；`actualTop` 100/196/400、`connectorOffset` 0/-76/0（`:154` 注释：196+80+16<400 不重叠） |
| 12 | 乱序+过滤/贝塞尔（`:159,169`） | NaN 过滤后 `['early','late']`；路径 `startsWith('M 10 20 C')` 含 `'60 20'`/`'110 80'` |

## 3. 真实断言

逐条见上表（`:38-174`）。mock 边界：无 mock；纯函数+固定数值（金红石物理量/√½ 等解析值）。

## 4. 未覆盖与脆弱点

未覆盖：`parseCifLattice` 其它晶系/更多 CIF 边角、`enumerateReflections` limit 截断细节、`calculateMarginaliaLayout` 三卡以上复杂重叠。数值断言依赖数学常量（tolerance 1e-2~1e-9）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 13 个用例 | 已证实 | `grep test(`；`:36-174` |
| 解析/不确定度剥离 | 已证实 | `:38-44` |
| d/2θ/反查/枚举/法向 | 已证实 | `:67-138` |
| 诚实空数组 | 已证实 | `:84` |
| 松弛/贝塞尔 | 已证实 | `:149-173` |
| 其它晶系 | 未知 | 未覆盖 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| CIF 解析 | 1-3 | 36-61 | covered |
| d/2θ/反查 | 4-6 | 66-86 | covered |
| 枚举/去重 | 7,8 | 91-119 | covered |
| 法向/Miller | 9,10 | 124-140 | covered |
| 松弛/引线 | 11,12 | 143-175 | covered |
| 其它晶系 | 无 | — | unknown |
