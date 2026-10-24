---
path: packages/ui/src/lib/wheel-zoom.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7e2a240fe02b7f54bdfb953e30a9ab1d3710e516
sha256: 6f50f53fa89aef9dbb8b7e128e45ac3c9704543e58d9f937cec10e0ddfa34524
lines: 79
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/ui/src/lib/wheel-zoom.test.ts

## 1. 测试目标

验证 `packages/ui/src/lib/wheel-zoom.ts` 的滚轮归一化与缩放乘数（panzoom 模型）：三种 deltaMode 换算、单步钳制、方向语义、min/max 钳制。被测对象主手册见 `wheel-zoom.ts.md`。

## 2. 用例清单

共 **11 个 `test()`**，3 个 describe。夹具：`ev(deltaY, deltaMode=0)` 最小 WheelEvent 形状构造（`:10-13`）；导入 `applyWheelZoom/normalizeWheelDelta/wheelZoomMultiplier/DEFAULT_WHEEL_ZOOM`（`:2-7`）。

| describe | 用例 | 行 |
| --- | --- | --- |
| `normalizeWheelDelta`（3） | 像素原样 / 行×33 / 页×400 | `:16-25` |
| `wheelZoomMultiplier`（6） | 一格≈6% / 向下缩小 / 单步钳制 / 捏合小步 / delta=0 / 方向 | `:29-63` |
| `applyWheelZoom`（2） | 累乘+钳制 / 一格<1.2 | `:67-78` |

## 3. 真实断言

- `expect(normalizeWheelDelta(ev(120,0))).toBe(120)`（`:17`）、`ev(-3,0)`→`-3`（`:18`）、`ev(3,1)`→`99`（`:21`）、`ev(1,2)`→`400`（`:24`）。
- 乘数区间断言：`ev(-120)` ∈ (1, 1.1)（`:31-32`）；`ev(120)` ∈ (0.9, 1)（`:37-38`）；`ev(±10000)` 钳到 `1±maxStep`（`:44/:46`，用 `DEFAULT_WHEEL_ZOOM.maxStep`）；`ev(-2)` ∈ (1, 1.005)（`:52-53`）；`ev(0)`===1（`:57`）；方向对 `ev(±50)`（`:61-62`）。
- `applyWheelZoom(1, ev(-120)) > 1`（`:68`）；`applyWheelZoom(0.5, ev(120), {minZoom:0.5})` `toBe(0.5)`（`:70`）；`applyWheelZoom(5, ev(-120), {maxZoom:5})` `toBe(5)`（`:72`）；一格 `<1.2`（`:77`）。

## 4. 未覆盖与脆弱点

- 未覆盖：自定义 speed/maxStep 组合、非法 options（minZoom>maxZoom）、deltaMode 未知值。
- 脆弱点：区间断言（`toBeLessThan(1.1)` 等）容忍实现漂移，仅边界值精确（`toBe(99)/toBe(400)/toBe(0.5)/toBe(5)/toBe(1)`）。
- **NOT_RUN**：本轮未执行本文件。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 用例断言如 §3 | 已证实 | 逐行读 `:1-79` |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 状态 |
| --- | --- | --- |
| normalizeWheelDelta 三态 | 3 用例 | covered |
| multiplier 钳制/方向/零值 | 6 用例 | covered |
| applyWheelZoom 钳制 | 2 用例 | covered |
| 自定义/非法 options | — | unknown |
