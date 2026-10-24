---
path: packages/shared/src/utils/cslab-pxrd.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: df4b4106de0788329346516962b624671814395d
sha256: fc21fa4fcb69ec9b757f92abf9004e7f0b345ec089352fcb7e6d8a74dff7db8b
lines: 304
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/cslab-pxrd.ts

## 1. 结论与边界

CSLab 理论粉末 XRD（PXRD）模拟纯函数（`packages/shared/src/utils/cslab-pxrd.ts:1-12`）：运动学近似 `I(hkl) ∝ |F|²·M·Lp(θ)`；Cromer-Mann 形状因子、空间群多重度（Laue 类+Friedel 对）、Lorentz-极化 + Pseudo-Voigt 展宽。**明确不支持** Rietveld 精修/吸收校正/异常散射/择优取向；结果仅用于峰位对照（`:11`）。

边界：`maxIndex` 钳 [1,12]、`stepDeg` 钳 [0.005,0.1]（`:172-173`）；曲线点数 ≤20000（`:255`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `CsLabFormFactorResult` | interface | 30-33 | `{value; missingCoefficients}` | |
| `atomicFormFactor` | function | 36-54 | `(element, s) => CsLabFormFactorResult` | 缺系数 → 原子序数回退+标记 |
| `reflectionMultiplicity` | function | 116-123 | `(h,k,l,operations) => number` | 轨道长度（含 Friedel 对） |
| `lorentzPolarization` | function | 126-133 | `(twoTheta) => number` | `(1+cos²2θ)/(sin²θcosθ)`；sin/cos≤0 → 0 |
| `simulatePxrd` | function | 163-285 | `(structure, options?) => CsLabPxrdPattern` | 主入口 |
| `dFromTwoTheta` | function | 288-293 | `(twoTheta, λ) => number` | sin≤0 → NaN |
| `reflectionTwoTheta` | function | 296-304 | `(structure,h,k,l,λ) => number` | dSpacing+twoThetaFromD 组合 |

内部：`reciprocalIndices`（`:56-92`，`h'=R^{-T}h` 整数逆+转置）、`reflectionOrbit`（`:94-113`，去重+排序）、`structureFactor`（`:140-160`，含 bIso 热因子 `exp(-B s²)` 与占据率权重）。

## 3. 内部逻辑与关键流程

`simulatePxrd`（`:163-285`）：

1. `:167-177` 选项默认（Cu-Kα/5-90°/fwhm 0.12/eta 0.5/maxIndex 8/step 0.02/零点位移 0）；波长非正或区间非法 → **抛错**。
2. `:180-190` `expandAtoms`（空 → warning）；`enumerateReflections`（limit 50000；空 → warning）。
3. `:196-227` 逐反射：`systematicAbsence` 消光跳过；`reflectionOrbit` 轨道去重（轨道首元素为 key）；`structureFactor`（缺系数 → `usedFallback`）；`rawIntensity=|F|²×multiplicity×Lp`（≤1e-12 跳过）。
4. `:229-247` 归一化相对强度（最高=100）；按 2θ 升序；全零 → warning。
5. `:249-251` 缺系数 warning「强度不可靠」。
6. `:253-266` 谱线曲线：步进采样，峰窗 `±20×fwhm` 内 `pseudoVoigt` 叠加。
7. `:268-284` 返回 peaks/curve/wavelength/回填归一化 options/warnings。

## 4. 调用者与调用链

出向：`../types/cslab-vesta-types`（6 类型）、`./cslab-crystal`（4 符号）、`./cslab-fitting`（pseudoVoigt）、`./cslab-scattering-data`（2 表）、`./cslab-symmetry`（expandAtoms/systematicAbsence）（`:14-28`）。入向（检索=符号名+模块名，全冻结树）：

- `simulatePxrd`：`cslab-pxrd.test.ts`（本批）、`apps/electron/src/renderer/workers/cslab-crystallography.worker.ts:19,77`、`apps/electron/src/main/lib/cslab/cslab-science.ts:36,79`、`cslab-demo-plates.ts:27,251,408`、批外 `cslab-demo.test.ts:17,119`。**桥接同名警示**：`cslab-worker-client.ts:107,196-197`（client 方法/IPC facade）、`preload/index.ts:1922,4406`（桥接名，非直引）。
- `atomicFormFactor`：内部 `:151` + 本批测试 `:48`。
- `reflectionMultiplicity`/`dFromTwoTheta`/`reflectionTwoTheta`：**全树零调用（含模块内）**；`lorentzPolarization` 仅自调（`:211`）。
- 产品入口：main（science/demo-plates）+ renderer（worker）；preload 仅桥接名；core/cli 无。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯函数。

## 6. 分支、失败、取消与恢复

抛错 2 处（波长/区间，`:176-177`）；warning 4 类（无原子/无反射/全零强度/缺系数）；无异步/取消。

## 7. 权限与权威状态

本文件不适用（无权限代码）；口径声明（`:11`）：仅峰位对照，不冒充精修。

## 8. 修改影响面

- 归一化/轨道去重/缺系数回退语义影响 demo 与科学工具展示。
- 测试：本批 `cslab-pxrd.test.ts`（3 test，NIST 峰位对标）+ 批外 `cslab-demo.test.ts`。

## 9. 测试证据

直接测试 `packages/shared/src/utils/cslab-pxrd.test.ts`（本批，60 行/3 test，断言见该篇）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 运动学公式与四物理因子 | 已证实 | `:4-9,140-160,210-212` |
| 缺系数原子序数回退+标记 | 已证实 | `:36-54,249-251` |
| 轨道去重+Friedel 对 | 已证实 | `:94-113,201-204` |
| `reflectionMultiplicity`/`dFromTwoTheta`/`reflectionTwoTheta` 全树零调用 | 已证实（检索式见 §4，全冻结树） | grep+子 agent |
| 真实谱图对比 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 7 导出 | §2 | 30-304 | covered |
| simulatePxrd 全流程 | §3 | 163-285 | covered（3 test 锚） |
| 零调用三函数 | §4 | 116-304 | covered（死导出） |
