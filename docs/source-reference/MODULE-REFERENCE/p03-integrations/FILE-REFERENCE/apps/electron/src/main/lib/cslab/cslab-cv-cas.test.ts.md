---
path: apps/electron/src/main/lib/cslab/cslab-cv-cas.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ee8085abba48c78a80b031559c8415c77d0602df
sha256: 08ccd5211db45245ca12224b740accac4f1016d638ddbd814d3d104ff4d507d4
lines: 114
kind: test
package: p03-integrations
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-cv-cas.test.ts

## 1. 测试目标

**图表标定纯函数 + 磁性吸附**（`apps/electron/src/main/lib/cslab/cslab-cv-cas.test.ts:13`、`:66`）：`fitAxisScale`/`mapPixelToValue`（线性/对数拟合、轴向选择）与吸附投影（阈值内/外）。

## 2. 用例清单

2 describe / 9 test（纯函数，无 I/O）。

| describe | # | 断言要点 | 行 |
| --- | --- | --- | --- |
| 图表标定纯函数 | 1 | 线性拟合 `scale==='linear'`、`r2≈1`；`mapPixelToValue(150,…)` | `:14-30` |
| | 2 | 对数自动优先 `scale==='log'`；`mapPixelToValue(150)≈31.62` | `:32-41` |
| | 3 | 对数遇非正数回退线性 | `:44-50` |
| | 4 | **Y 轴按 py 拟合**（同一 px 垂直线不再失效）：`mapPixelToValue(419.5,…,'py')≈0`、`230→≈50`、`40.5→≈100` | `:52-63` |
| 磁性吸附 | 5 | 阈值内投影最近线段：`point≈(50,0)`、`distance≈3` | `:72-77` |
| | 6 | 阈值外保持原坐标、`segmentIndex===-1` | `:79-83` |

| 7 | 多折线选择最近段 | `:85` |
| 8 | Windows Scripts/python.exe | `:103` |
| 9 | POSIX bin/python | `:109` |
## 3. 真实断言

- `expect(fit?.r2).toBeCloseTo(1, 6)`（`:24`、`:40`、`:59`）。
- `expect(mapPixelToValue(419.5, ticks, 'auto', 'py')).toBeCloseTo(0, 6)`（`:60`）。
- `expect(result.point).toEqual({ x: 50, y: 30 })`（`:81`）。

## 4. 未覆盖与脆弱点

- 未覆盖：`fitAxisScale` 非法 ticks、。
- 脆弱点：`toBeCloseTo` 精度断言（6 位）绑定浮点实现。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 用例覆盖拟合/映射/吸附 | 已证实 | `:14-83` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 线性/对数拟合 | 1-3 | `:14-50` | covered |
| Y 轴 py 拟合 | 4 | `:52-63` | covered |
| 吸附阈值内/外 | 5-6 | `:72-83` | covered |
