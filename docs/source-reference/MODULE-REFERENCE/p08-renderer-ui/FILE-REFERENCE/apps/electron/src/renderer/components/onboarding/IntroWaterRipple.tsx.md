---
path: apps/electron/src/renderer/components/onboarding/IntroWaterRipple.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c93408f50a64349e91a6ab3e9dad33c9ca224f0a
sha256: a1a5d9c68b45d82862d6d70756008681f63cb7532dffb87edf2dde8764d707bd
lines: 112
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-01-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/onboarding/IntroWaterRipple.tsx

## 1. 结论与边界

**开屏遮罩与品牌铭牌组件**（112 行）：portal 全屏黑底 + WebGL 液态背景 + 「CDUT Studio」铭牌动画（rAF 驱动透明度/位移/投影渐变），默认 5s 后自动 `onDone`，点击可跳过。

边界：背景渲染在 `IntroFluidBackground`（同批手册）；本组件只做铭牌时间线、跳过与完成回调；无业务副作用。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `IntroWaterRipple` | 导出函数组件 | 24-111 | `({onDone, durationMs = 5000}) => ReactElement` | 唯一导出 |
| `TIMING` | 内部常量 | 11-15 | `{nameRiseStart:0.24, nameRiseEnd:0.66, fadeOutStart:0.86}` | 铭牌时间线（进度比例） |
| `clamp01`/`easeOutCubic`/`easeInOutCubic` | 内部函数 | 17-22 | 缓动工具 | |
| `nameRef`/`onDoneRef`/`doneFiredRef` | 内部 ref | 28-30 | 铭牌 DOM/回调镜像/一次性闩 | |

导出计数：`export` 1 条（`:24`），与源码一致。

## 3. 内部逻辑与关键流程

- **铭牌动画**（`useLayoutEffect`，`:34-61`）：`performance.now()` 起点，rAF 逐帧算 `progress = (now-start)/durationMs`；rise = easeInOutCubic((p-0.24)/0.42)、fadeIn = easeOutCubic((p-0.24+0.07)/0.25)、fadeOut = 1-easeInOutCubic((p-0.86)/0.14)，`opacity = clamp01(rise*fadeIn*fadeOut)`；transform 位移 22px 上浮 + skewX(-7deg) + scale 0.96→1.0（`:47`）；drop-shadow 投影随 rise 增强（`:48`）。progress≥1 时经 `doneFiredRef` 一次性 `setDone(true)`（`:50-55`）。
- **完成回调**（`:63-67`）：`done` 后 180ms setTimeout 调 `onDoneRef.current()`（ref 镜像防闭包过期）。
- **跳过**（`:69-74`）：点击任意处 → 同一 `doneFiredRef` 闩 → `setDone(true)`（动画跳尾、走同一 180ms 回调路径）。
- **渲染**（`:76-111`）：portal 到 `document.body`，`Z_LAYER.overlay` 全屏 div（onClick=skip，`role="presentation"`）；`IntroFluidBackground durationMs={durationMs}` 一次性；径向渐变罩（中心透明，注释 `:83`：避免压黑 WebGL 细节）；`h1` 铭牌（`aria-label="CDUT Studio"`，渐变文字 clip）；底部 "Click to skip"。

## 4. 调用者与调用链

- 入向（全冻结树 `grep IntroWaterRipple`，apps+packages 全类型）：
  - `apps/electron/src/renderer/App.tsx:12` import；`:194-197`「首次欢迎导览」重播路径渲染（`replayIntroOpenAtom` 触发，onDone 接力首导，注释 `:178-180` 不改 `onboardingCompleted`）。
  - `apps/electron/src/renderer/components/onboarding/OnboardingView.tsx:24` import、`:86-93` intro 阶段渲染（`onDone` → `setStep('welcome')`）。
- 出向：`IntroFluidBackground`（`:9`、`:82`）、`@profer/ui` 的 `Z_LAYER`（`:7`）、`react-dom.createPortal`。

## 5. 数据 I/O、读写与副作用

- 无磁盘/网络/持久化；副作用=rAF 循环、setTimeout、keydown 无（本组件未监听键盘——区别于 OnboardingView 的 PoetryInterlude，照实记录）；DOM portal。
- 完成回调是唯一对外效果（父组件据此推进流程）。

## 6. 分支、失败、取消与恢复

- 一次性闩 `doneFiredRef` 保证 `onDone` 只触发一次（`:50-53`、`:69-73`）；跳过与自然完成走同一 `done` 路径。
- cleanup：`cancelAnimationFrame`（`:60`）、`clearTimeout`（`:66`）；中途卸载不触发 onDone（定时器被清）。
- 无错误路径；无恢复概念（纯一次性动画）。

## 7. 权限与权威状态

- 无权限分支，依据：本文件无 sender/role 检查、无 electronAPI 调用。

## 8. 修改影响面

- 消费方：`App.tsx:194`（重播路径）与 `OnboardingView.tsx:87`（intro 阶段）；props 契约 `onDone/durationMs`。
- 铭牌样式常量（TIMING/渐变/位移）影响开屏观感；`Z_LAYER.overlay` 层级约定。
- 与 `FeatureTour`/`OnboardingView` 共享 `IntroFluidBackground`，背景行为改动三处同感。

## 9. 测试证据

- 直接测试：**无**。检索范围：冻结树 `*.test.ts(x)` 引用（`IntroWaterRipple`）0 命中。
- 间接证据：无。
- 未覆盖：动画时间线、跳过闩、180ms 回调延迟。
- `NOT_RUN`：未运行 bun test/产品测试/typecheck/build/GUI；测试断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出与默认 5s | 已证实 | `:24` |
| 铭牌时间线公式（0.24/0.66/0.86） | 已证实 | `:11-15`、`:42-48` |
| doneFiredRef 单次闩 | 已证实 | `:50-53`、`:69-73` |
| 180ms 延迟 onDone | 已证实 | `:63-67` |
| 无键盘监听（点击跳过） | 已证实 | 全文无 keydown |
| 动画实际观感 | 未知 | NOT_RUN |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `IntroWaterRipple` 主体 | §3 | 24-111 | covered |
| 铭牌 rAF 动画 | §3 | 34-61 | covered |
| 跳过/一次性闩 | §6 | 50-74 | covered |
| 消费者 | §4 | — | covered |
| 运行观感 | §10 | — | unknown（NOT_RUN） |
