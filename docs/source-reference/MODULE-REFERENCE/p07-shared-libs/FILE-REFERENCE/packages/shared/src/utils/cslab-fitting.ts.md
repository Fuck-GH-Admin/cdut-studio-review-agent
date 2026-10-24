---
path: packages/shared/src/utils/cslab-fitting.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 216687ba324f1bd914a53bfd1987de54bad468f4
sha256: 3a22a09f98907b7f57ef59edb8bebe64991a3f553a157b484b3af60047c20222
lines: 691
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/cslab-fitting.ts

## 1. 结论与边界

CSLab **曲线拟合与信号处理**纯函数（`packages/shared/src/utils/cslab-fitting.ts:1-11`）：高斯/洛伦兹/Pseudo-Voigt 峰形、Levenberg-Marquardt 非线性最小二乘、多项式与 AsLS 基线（Eilers & Boelens）、Savitzky-Golay/移动平均/FFT 低通、梯形积分/峰面积/FWHM/重心。**红线**（`:10`）：拟合失败或未收敛必须如实返回 `converged=false` 与 warnings，不伪造结果。

边界：FFT 实现假定长度 2 幂（补齐到 2 幂，`:656-657`）；LM 数值雅可比（中心差分）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `gaussian` | function | 26-31 | `(x,center,height,fwhm)` | fwhm≤0 → 0 |
| `lorentzian` | function | 33-38 | 同上 | |
| `pseudoVoigt` | function | 40-49 | `+eta`（钳 [0,1]） | eta 权洛伦兹 |
| `profileArea` | function | 52-64 | 解析峰面积 | gaussian/lorentzian/pv 三态 |
| `integrateTrapezoid` | function | 66-74 | 梯形积分 | <2 点 → 0 |
| `centroid` | function | 76-86 | 负值截断加权重心 | total≤0 → NaN |
| `fwhmFromCurve` | function | 89-116 | 离散曲线半高宽（线性插值） | <3 点/非正峰/单侧缺失 → NaN |
| `polynomialBaseline` | function | 145-174 | 多项式最小二乘基线 | 阶钳 [0,6]；奇异 → 全 0 |
| `aslsBaseline` | function | 181-264 | `(y, λ=1e6, p=0.01, maxIter=12)` | 五对角带状 Cholesky |
| `LevenbergMarquardtOptions` | interface | 266-272 | `{maxIterations?;tolerance?;lower?;upper?;locked?}` | |
| `LevenbergMarquardtResult` | interface | 274-279 | `{params;iterations;converged;chiSquare}` | |
| `levenbergMarquardt` | function | 288-392 | `(residualFn, initial, options)` | |
| `fitPeaks` | function | 433-576 | `(CsLabFitRequest) => CsLabFitResult` | 多峰解叠主入口 |
| `smoothSeries` | function | 678-682 | moving-average/savgol/fft-lowpass | |
| `profileAt` | function | 685-691 | 峰形值复用 | |

内部：`solveLinearSystem`（`:118-142`，列主元高斯消元，奇异 → null）、`clampParams`（`:281-286`）、`buildBaseline`（`:394-417`，none/constant/linear/polynomial/asls）、`profileValue`（`:419-430`）、`movingAverage/savitzkyGolay`（`:578-612`）、`fftInPlace/fftLowpass`（`:614-676`，蝶形 radix-2+共轭逆变换）。

## 3. 内部逻辑与关键流程

### 3.1 `levenbergMarquardt`（`:288-392`）

λ 初值 1e-3；每轮：自由参数集（`locked` 排除，全锁 → converged）；数值雅可比（步长 `max(1e-7,|p|·1e-6)` 中心差分，`:323-334`）；正规方程+阻尼 `λ·max(1e-12,diag)`（`:354-357`）；解失败 → λ×10 重试（≤8 次）；chi 下降才接受并 λ/10，改进 <tolerance → converged；8 次全失败 → break（**converged 保持 false**，红线）。

### 3.2 `fitPeaks`（`:433-576`）

1. 校验（`:436-439`）：x/y 等长且 ≥5 点、至少 1 峰，否则抛。
2. 基线策略（`:441-462`）：constant/linear 作为**自由参数**参与拟合（`:479-489`）；polynomial/asls 固定扣除。
3. 峰参数打包（`:464-476`）：每峰 center/height/fwhm 三元；height 缺省取最近点校正值；bounds（center∈[xMin,xMax]、height≥0、fwhm∈[…]）；`locked` 三元同步。
4. LM 拟合（`:516-522`）；未收敛 → warning（`:524`）。
5. 输出（`:526-575`）：`profileArea` 解析面积+`areaFraction` 归一（totalArea≤0 → 0）；fwhm≤0 → warning；fitted=数据+residual（`:552-556` 注释说明符号）；R²/RMSE。

### 3.3 平滑（`:578-682`）

moving-average（边界自适应窗口）；savgol（`size|1` 奇化、逐窗口多项式拟合取中心值，`:594-612`）；fft-lowpass（补齐 2 幂、cutoff 钳 [0.01,1]、频率对称截断、共轭法逆变换）。

## 4. 调用者与调用链

出向：`../types/cslab-origin-types`（7 类型，`:13-21`）。入向（检索=符号名+模块名，全冻结树）：

- `pseudoVoigt`：`cslab-pxrd.ts:23,263`（PXRD 谱线）、`apps/electron/src/main/lib/cslab/cslab-demo-plates.ts:26,349`、内部 `:429`。
- `fitPeaks`：`apps/electron/src/renderer/workers/cslab-fitting.worker.ts:5,24`、`cslab-demo-plates.ts:24,324`、`cslab-science.ts:31,83`（同名包装 `fitPeaksCore`）、批外 `cslab-cv-cas`/`cslab-scientific-tools.ts:264`（经包装）。**桥接同名警示**：preload `:1927,4408`（IPC 名）。
- `smoothSeries`：fitting worker `:5,28`、`cslab-science.ts:37,88`（包装）、preload `:1928,4409`（桥接名）。
- `integrateTrapezoid`：`cslab-demo-plates.ts:25,358`。
- `aslsBaseline`/`gaussian`：本批测试（4 test）+ 内部调用。
- **零外部引用**：`lorentzian`/`profileArea`/`polynomialBaseline`/`levenbergMarquardt`/`LevenbergMarquardtOptions`/`LevenbergMarquardtResult`/`centroid`（另有 polyhedra 局部变量同名碰撞）/`fwhmFromCurve`/`profileAt`——仅内部互调或 barrel。
- 产品入口：main ✅（demo-plates/science 直引；scientific-tools/router 经 science 包装）、renderer ✅（fitting worker）、preload 仅桥接名、core/cli ❌。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯函数。

## 6. 分支、失败、取消与恢复

抛错 2 处（fitPeaks 数据校验，`:436-439`）；未收敛 = `converged:false`+warning（红线）；奇异系统 → null→λ 放大/基线全 0；无异步/取消。

## 7. 权限与权威状态

本文件不适用（无权限代码）；红线即口径（`:10`）：不伪造收敛。

## 8. 修改影响面

- LM 阻尼/容差口径影响 fitting worker 与 science 包装的结果稳定性。
- `pseudoVoigt` 语义（eta 混合）是 PXRD 谱线契约。
- 测试：本批 `cslab-fitting.test.ts`（4 test，回收率 >98% 断言）。

## 9. 测试证据

直接测试 `packages/shared/src/utils/cslab-fitting.test.ts`（本批，88 行/4 test，断言见该篇）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 红线（未收敛如实报告） | 已证实 | `:10,524` |
| 带状 Cholesky AsLS | 已证实 | `:208-253` |
| locked 参数/边界钳制 | 已证实 | `:281-286,312-314,474` |
| FFT 2 幂补齐+共轭逆变换 | 已证实 | `:656-674` |
| 9 导出零外部引用（含 centroid 碰撞） | 已证实（检索式见 §4，全冻结树） | grep+子 agent |
| 数值稳定性边界（病态矩阵） | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 15 导出 | §2 | 26-691 | covered |
| LM 主循环 | §3.1 | 288-392 | covered |
| fitPeaks 全流程 | §3.2 | 433-576 | covered（4 test 锚） |
| 平滑三法 | §3.3 | 578-682 | covered（savgol 1 test） |
