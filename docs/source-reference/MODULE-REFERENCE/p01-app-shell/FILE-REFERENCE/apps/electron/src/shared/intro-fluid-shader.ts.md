---
path: apps/electron/src/shared/intro-fluid-shader.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f1365c0004428ebfd673938f414d049dbb0ac45a
sha256: 874ab7d9ddc97c3c089f4373c61fdae9d40a86d7ee68ced05273624d06686a1d
lines: 111
kind: source
package: p01-app-shell
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/shared/intro-fluid-shader.ts

## 1. 结论与边界

两个 GLSL 着色器源码字符串常量（顶点 + 片元）：实现开屏/循环背景的“流体飞溅（splash）”光效——环形波纹+尾迹、时间方向运动模糊、fbm 噪声焦散、深浅双主题配色（`apps/electron/src/shared/intro-fluid-shader.ts:1-111`）。纯字符串导出，无 TS 逻辑。

边界：不含 WebGL 装配/绘制（消费者 `IntroFluidBackground.tsx` 编译绘制、`startup-splash.ts` 注入启动屏 HTML）；不含动画计时（`uTime` 由外部传入）。

## 2. 导出与关键符号

`export` 逐条核对：2 个常量（无函数/类/接口）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `INTRO_FLUID_VERTEX_SHADER` | 常量（导出） | 1-7 | GLSL string | 全屏四边形：`aPosition`→`vUv`/`gl_Position` |
| `INTRO_FLUID_FRAGMENT_SHADER` | 常量（导出） | 9-111 | GLSL string | 片元主程序（见 §3） |

GLSL 内部函数（字符串内，非 TS 符号）：`hash`（`:19-21`）、`noise`（`:23-28`）、`fbm` 4 阶（`:30-39`）、`random(index)`（用 `uSeed` 派生，`:41-43`）、`splashValue`（`:45-57`）、`splash`（`:61-79`）、`main`（`:81-111`）。

## 3. 内部逻辑与关键流程

片元 uniform（`:12-17`）：`uResolution/uTime/uOpacity/uSeed/uThemeLight/uContinuous`。

1. `splashValue(p, center, start, size, phase, age)`（`apps/electron/src/shared/intro-fluid-shader.ts:45-57`）：宽高比校正 + 相位抖动（`:48`）+ 旋转矩阵（`:51`）；半径随 age 增长（`:52`）；`ring = exp(-((d-radius)*(34-age*2))^2)` + `wake = exp(-d*5.5)*(0.5+0.5*sin(...))`（`:54-55`）；返回 `(ring*.75+wake*.18)*exp(-age*.19)*step(start,uTime)`（未启动前为 0）。
2. `splash`（`:61-79`）：`age = max(0, uTime-start)`；**时间方向运动模糊**：age±0.05 三点采样加权 `.25/.5/.25`（注释 `:59-60`：抹开运动轨迹防“闪屏”）；**持续模式**（`uContinuous>0.5`）：`useAge=mod(age, 3.8)` + smoothstep 淡入淡出窗口（`:69-73`，注释 `:67-68`：周期重生如水面涟漪，用于循环背景）；一次性模式（intro 开屏）保持原行为。
3. `main`（`:81-111`）：8 个 splash 叠加（`start` .10→2.72、权重 .24→.08，`:85-92`）；`h = h/(1+h*1.2)` 软归一（`:93`）；fbm warp 位移（`:94-97`）+ fragment/`caustic`（`:98-99`）；`mask`（左下角衰减 `:100`）与 `sheen`（`:101`）；亮度 clamp `min(...,0.20)`/`min(...,0.06)`（`:102-103`）；深色直接输出、浅色用 `lightBase=.969/.969/.957` 减反射（注释 `:105`：Canvas 不透明，浅色底必须写进 shader）；`mix(darkColor, lightColor, uThemeLight)`（`:109`）；alpha 恒 1（`:110`）。

## 4. 调用者与调用链

入向（冻结树 grep）：`apps/electron/src/main/lib/startup-splash.ts:1`（import）、`startup-splash.ts:33-34`（`JSON.stringify` 注入启动屏 HTML 的 WebGL 脚本）；`apps/electron/src/renderer/components/onboarding/IntroFluidBackground.tsx:14`（import）、`IntroFluidBackground.tsx:46-47`（`compile(gl.VERTEX_SHADER/FRAGMENT_SHADER, ...)` 编译绘制）。

出向：无（纯字符串）。

## 5. 数据 I/O、读写与副作用

无 TS 侧副作用；GLSL 在 GPU 执行纯绘制（写帧缓冲），无数据读写。uniform 值（时间/透明度/种子/主题/持续模式）全部由消费者注入（未在本文件）。

## 6. 分支、失败、取消与恢复

TS 层不适用（无控制流）。GLSL 分支如实记录：`uContinuous>0.5` 持续/一次性双模式（`:69-73`）；`step(start, uTime)` 启动门（`:56`）；`age<=0` 返回 0（`:63`）。着色器编译失败由消费者处理（`IntroFluidBackground.tsx` 的 `compile`，文件外）。

## 7. 权限与权威状态

本文件不适用，依据：无权限逻辑；主题权威（`uThemeLight`）由消费者传入。

## 8. 修改影响面

- 改任一 shader 字符串影响启动屏（`startup-splash.ts` 注入的 HTML）与 Onboarding 背景两处视觉。
- uniform 集合变更需同步两个消费者的 uniform 传参。
- 无测试锁定视觉输出（§9）。

## 9. 测试证据

**无直接测试**：冻结树 `*.test.ts`/`*.test.tsx` 对本文件 0 命中（检索范围：冻结树 apps/ 与 packages/，不含 docs）。间接：无。

`NOT_RUN`：本轮未执行 typecheck/构建/GUI/真实 GPU 渲染。测试断言仅指静态读到的 expect 行——本文件没有。

缺口（静态判断）：视觉输出无断言可写（GLSL），维护者验证=启动应用/Onboarding 观感 + 深浅主题切换。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 个导出常量 | 已证实 | `grep -c '^export'`=2，`:1,9` |
| 双模式（uContinuous）语义 | 已证实 | `:67-73` 注释与代码一致 |
| 浅色底必须写入 shader | 已证实 | `:105-108` 注释+代码 |
| 两个消费者 | 已证实（检索） | `startup-splash.ts:1,33-34`、`IntroFluidBackground.tsx:14,46-47` |
| GPU 实际渲染效果 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 顶点 shader | §2 | 1-7 | covered |
| `splashValue`/`splash`/运动模糊 | §3 | 45-79 | covered |
| `main` 叠加/配色 | §3 | 81-111 | covered |
| uniform 契约 | §3 | 12-17 | covered |
| 测试 | §9 | — | unknown |
