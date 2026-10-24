---
path: packages/shared/src/utils/cslab-fitting.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e787c008db121c798ad82bf8ae35a464c3cde1d6
sha256: e8d9f38a99938c383a8ffee1fce172837067f19625f3175bdca90cfc79dc0e1e
lines: 88
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/cslab-fitting.test.ts

## 1. 测试目标

曲线拟合（`packages/shared/src/utils/cslab-fitting.test.ts:27`）：双高斯重叠谱参数回收率 >98%、AsLS 基线、Savitzky-Golay 平滑峰位不变、未锁定峰面积占比和=1。被测 `fitPeaks`/`aslsBaseline`/`smoothSeries`/`gaussian`。夹具 `syntheticDoublePeak()`（`:9-25`：LCG 伪随机种子 123456789、1501 点、双高斯 20/1.2 + 24/1.8 + 5% 白噪——确定性可复现）。

## 2. 用例清单

共 **4 个 `test(`**（1 个 `describe`）：

| # | 行 | 用例 | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- | --- |
| 1 | 28-54 | 双高斯重叠谱 → 峰参数回收率 >98% | 初值偏移（19.6/24.4），`model:'gaussian'`、`baseline:'constant'` | `fitPeaks` | 独立 |
| 2 | 56-62 | 缓慢抬升背景 → AsLS 基线低于峰顶且随数据抬升 | `y=20+i*0.05+gaussian`，λ=1e5,p=0.01 | `aslsBaseline` | 独立 |
| 3 | 64-71 | 含噪曲线 S-G 平滑 → 峰位基本不变 | `kind:'savgol',window:11,order:2` | `smoothSeries` | 独立 |
| 4 | 73-87 | 未锁定峰 → 面积占比和=1 | `model:'pseudo_voigt'`、`baseline:'linear'` | `fitPeaks` | 独立 |

## 3. 真实断言

- `:41-53` `converged` toBe true、peaks 长度 2、`rSquared` toBeGreaterThan 0.94、中心相对误差 <2%（20/24）、fwhm 相对误差 <2%（1.2/1.8）、`areaFraction` 和 toBeCloseTo(1, 3)。
- `:59-61` `baseline[0]` <25、`baseline[399]>baseline[0]`、`baseline[200]<y[200]`。
- `:67-70` 平滑后长度不变、最大值位置 x 偏移 <0.2。
- `:85-86` `areaFraction` 和 toBeCloseTo(1, 6)。

## 4. 未覆盖与脆弱点

- `lorentzian`/`pseudoVoigt` 单峰面、`polynomialBaseline`、`levenbergMarquardt` 直接面未锚（经 fitPeaks 间接）。
- 用例 1 的 `rSquared>0.94` 依赖 LCG 噪声实现（确定性但与实现耦合）。
- `fwhmFromCurve`/`centroid`/`profileArea` 等零引用导出无锚（与其死导出面一致）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 test、确定性夹具 | 已证实 | `:9-25` |
| 参数回收率断言（>98%） | 已证实 | `:47-51` |
| AsLS/S-G 行为锚 | 已证实 | `:56-70` |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| fitPeaks gaussian+constant | §2/§3 | 1 | covered |
| aslsBaseline | §2/§3 | 2 | covered |
| smoothSeries savgol | §2/§3 | 3 | covered |
| fitPeaks pseudo_voigt+linear | §2/§3 | 4 | covered |
| 零引用导出面 | §4 | — | unknown |
