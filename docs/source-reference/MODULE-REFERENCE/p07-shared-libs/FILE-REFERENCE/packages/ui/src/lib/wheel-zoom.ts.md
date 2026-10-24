---
path: packages/ui/src/lib/wheel-zoom.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: cc4d9ebdbf6192593df26bf4d21a5e3871c46b97
sha256: 7319aefb15b584526873231c5814f883808d4209aa7d45527d814fe3cfadfb74
lines: 89
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/ui/src/lib/wheel-zoom.ts

## 1. 结论与边界

**统一滚轮/触控板捏合缩放纯函数核心**（`packages/ui/src/lib/wheel-zoom.ts:1-26` 注释）：照搬 anvaka/panzoom 模型（delta 按 128 归一化、单步乘数钳制、线性 `1±step` 而非 exp）。不依赖 React/DOM（`:24`）；平滑过渡由调用方渲染层负责（`:25`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `WheelZoomOptions` | interface（export） | `:28-36` | `{ speed?; maxStep?; minZoom?; maxZoom? }` | 可选覆盖 |
| `DEFAULT_WHEEL_ZOOM` | const（export） | `:38-43` | `{ speed:0.085, maxStep:0.12, minZoom:0.5, maxZoom:5 }` | 注释 `:29` 称默认 0.065≈8%，**实际 0.085**（见 §10 矛盾 1） |
| `normalizeWheelDelta` | function（export） | `:49-59` | `({deltaY, deltaMode}) => number` | deltaMode 0/1/2 归一 |
| `wheelZoomMultiplier` | function（export） | `:65-76` | `(event, options?) => number` | 单步乘数，不钳 min/max |
| `applyWheelZoom` | function（export） | `:81-89` | `(currentZoom, event, options?) => number` | 累乘 + 钳制 |

## 3. 内部逻辑与关键流程

1. `normalizeWheelDelta`（`:53-58`）：像素（mode 0）原样；行（mode 1）×33；页（mode 2）×400。
2. `wheelZoomMultiplier`（`:69-75`）：合并默认值 → delta 0 返回 1（`:71`）→ `step = min(maxStep, |speed*delta/128|)`（`:73`）→ 返回 `1 - sign*step`（向下滚 delta>0 缩小，`:74-75`）。
3. `applyWheelZoom`（`:86-88`）：`next = currentZoom * multiplier`，`min(maxZoom, max(minZoom, next))` 钳制。

分支：deltaMode 三态、delta=0、钳制上下限。全部纯函数。

## 4. 调用者与调用链

- 入向（包内）：`packages/ui/src/hooks/use-smooth-zoom.ts:2`（`applyWheelZoom/DEFAULT_WHEEL_ZOOM/WheelZoomOptions`，wheel 高频路径）。
- 入向（包外）：`applyWheelZoom`/`DEFAULT_WHEEL_ZOOM` **无包外消费者**（冻结树检索 0 命中；`packages/ui/src/index.ts:13-14` 已再导出但无人用）——负向结论，检索口径见 §10。
- 测试入向：`packages/ui/src/lib/wheel-zoom.test.ts`（11 用例，§9）。
- 出向：无（纯函数）。

## 5. 数据 I/O、读写与副作用

无 I/O、无状态、无副作用；确定性输出。

## 6. 分支、失败、取消与恢复

不抛错；`options` 覆盖值非法（如 maxZoom<minZoom）行为未定义（无校验，`:86` 直接用）。不适用取消/恢复：纯函数。

## 7. 权限与权威状态

无权限分支（纯工具）。

## 8. 修改影响面

改公式/默认值 → `use-smooth-zoom.ts` 全部 4 个消费者（FilePreviewDialog/DiffTabContent/InteractivePreviewViewport/preview-viewport-context）的缩放手感；`wheel-zoom.test.ts` 11 用例的数值区间断言会碎（§9）。

## 9. 测试证据

**直接测试 `packages/ui/src/lib/wheel-zoom.test.ts`（11 个 `test()`，bun:test，NOT_RUN）**：

- `normalizeWheelDelta`（3 用例，`:15-26`）：像素原样（`:17-18`，120→120/-3→-3）、行模式 3→99（`:21`）、页模式 1→400（`:24`）。
- `wheelZoomMultiplier`（6 用例，`:28-64`）：一格 120 放大 ~6%（`(1,1.1)` 区间 `:31-32`）、向下滚缩小 `(<1, >0.9)`（`:37-38`）、单步钳制 `≤1+maxStep`/`≥1-maxStep`（`:44/:46`）、捏合小增量 `(1,1.005)`（`:52-53`）、delta=0 恒 1（`:57`）、方向（`:61-62`）。
- `applyWheelZoom`（2 用例，`:66-78`）：累乘+钳制（`minZoom:0.5` 保底 `:70`、`maxZoom:5` 封顶 `:72`）；一格滚轮 <1.2（`:77`）。

未覆盖：自定义 speed/maxStep 组合、minZoom>maxZoom 非法输入。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出、公式与钳制全分支 | 已证实 | 逐行读 `:1-89` |
| 11 用例断言 | 已证实 | 测试逐行读 |
| `applyWheelZoom/DEFAULT_WHEEL_ZOOM` 无包外消费者 | 已证实（负向） | 冻结树 apps+packages 全 `*.ts(x)` 检索，仅 `use-smooth-zoom.ts`/`index.ts`/测试命中 |
| 手感数值 | 未知 | NOT_RUN |

**现存实现矛盾（照实记录）**：`WheelZoomOptions.speed` 注释称"默认 0.065 ≈ 鼠标一格 8%"（`:29`），实际 `DEFAULT_WHEEL_ZOOM.speed = 0.085`（`:39`）——注释与值不一致（且测试 `:52` 的 0.001 注释用 0.065 推算，`m≈1.001` 断言区间 (1,1.005) 对 0.085 仍成立）。

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 5 导出 + 三函数 | §2/§3 | `:28-89` | covered |
| deltaMode 三态/钳制/方向 | §3/§9 | 分支行号 | covered |
| 测试 11 用例 | §9 | 测试行号 | covered（NOT_RUN） |
| 注释与默认值矛盾 | §10 | `:29` vs `:39` | covered |
