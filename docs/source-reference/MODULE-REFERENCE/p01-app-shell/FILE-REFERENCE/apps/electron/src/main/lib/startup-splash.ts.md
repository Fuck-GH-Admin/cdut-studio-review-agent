---
path: apps/electron/src/main/lib/startup-splash.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: dfb80bca14cda12f47a0cf5f0e445ea483124773
sha256: 915ed2ff8e3d361a493441e566ce5c89b962409b35caae343984d873a5cfa316
lines: 45
kind: source
package: p01-app-shell
author: docs-r07-author-extra-01-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/startup-splash.ts

## 1. 结论与边界

**冷启动 Splash 窗口的 bounds 计算与原始 WebGL HTML 生成**（45 行，纯字符串/几何，主进程用）：`createCenteredStartupSplashBounds` 按显示器工作区 1/4 尺寸居中；`createStartupSplashHtml` 生成含共享 intro-fluid 着色器的自包含 HTML（Logo/辉光/Loading 动画 + WebGL 液态背景）。

边界：不管理窗口生命周期（`index.ts` 创建/销毁）；着色器源与渲染端 `IntroFluidBackground` 共享（`../../shared/intro-fluid-shader`）；HTML 内脚本为内联自执行（无外部依赖）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `StartupSplashBounds` | 导出接口 | 3-8 | `{x, y, width, height}` | |
| `createCenteredStartupSplashBounds` | 导出函数 | 11-20 | `(workArea) => StartupSplashBounds` | 1/4 尺寸居中 |
| `createStartupSplashHtml` | 导出函数 | 28-45 | `(isDark: boolean) => string` | Splash HTML |

导出计数：`export` 3 条（`:3`、`:11`、`:28`），与源码一致。

## 3. 内部逻辑与关键流程

- **bounds**（`:11-20`）：`width=max(1, round(w*0.25))`、`height` 同；`x = workArea.x + round((w-width)/2)`、`y` 同——以工作区为基准居中（多显示器安全）。
- **HTML**（`:28-45`）：主题四色由 `isDark` 决定（`:29-32`）；着色器经 `JSON.stringify` 注入（`:33-34`）；结构=CSS（Logo `rise` 1.1s、辉光 `breathe` 2.8s、状态 `pulse` 1.8s，`:36-41`）+ `<canvas id="fluid">` + 内联脚本（`:43`）：webgl 上下文（`alpha:false, antialias:false`）→ shader 编译（失败静默 return）→ link → 7 uniform/attrib 校验 → 全屏 quad → `resize`（`dpr≤1.5`）+ ResizeObserver/resize 监听 → rAF 循环 `draw`（`uTime=elapsed/625`、`uThemeLight=dark?0:1`、`uContinuous=0` 一次性 splash、清屏色随主题）。
- 注释（`:22-27`）：Windows 主进程默认选 ANGLE D3D11on12 规避 NVIDIA+D3D11 闪动；shader 视觉结构不变。

## 4. 调用者与调用链

- 入向（全冻结树 `grep startup-splash|两导出名`，apps+packages 全类型）：
  - `apps/electron/src/main/index.ts:163` import；`:661` `createCenteredStartupSplashBounds(display.workArea)`（splash 窗口初始 bounds）；`:688` `loadURL(data:text/html,…,createStartupSplashHtml(resolveStartupSplashDark()))`。
  - **直接测试**：`apps/electron/src/main/lib/startup-splash.test.ts`（39 行，**3 test**，同批）。
- 出向：`../../shared/intro-fluid-shader` 的两个着色器常量（`:1`）。

## 5. 数据 I/O、读写与副作用

- 纯函数：输入布尔/矩形，输出字符串/矩形；无 I/O、无副作用（HTML 由调用方加载）。
- HTML 内副作用（运行时）：WebGL 渲染、rAF、ResizeObserver（在 splash 窗口内）。

## 6. 分支、失败、取消与恢复

- 不适用（纯生成函数，依据：本文件无控制流异常路径——HTML 内脚本的失败静默 return 属生成内容行为，`:43`）。
- `isDark` 二值决定主题；bounds 对 0/负工作区有 `max(1,…)` 兜底（`:12-13`）。

## 7. 权限与权威状态

- 无权限分支，依据：纯生成函数；dark 判定 `resolveStartupSplashDark()`（域外）为权威输入。

## 8. 修改影响面

- `index.ts:661/688`（splash 窗口视觉）；共享着色器 `intro-fluid-shader` 与渲染端 `IntroFluidBackground`（p08 手册）同源，改动双端同感。
- `startup-splash.test.ts` 3 用例硬编码断言 HTML 关键片段（`float splashValue(`/`getBoundingClientRect()`/`ResizeObserver` 等），改动 HTML 结构需同步。

## 9. 测试证据

- 直接测试：`startup-splash.test.ts`（39 行，bun:test，**3 test**，NOT_RUN）——①bounds 1/4 居中双显示器用例 `toEqual({x:720,y:405,w:480,h:270})`/`{x:2880,y:580,w:640,h:360}`（`:5-13`）；②主题 HTML 断言（canvas/webgl/`background:#0b0b0c`/drag/user-select/浅色 `#f7f7f5`，`:15-26`）；③原版 shader 与尺寸同步断言（`float splashValue(`/`s0/s1/s2 = splashValue`/`getBoundingClientRect()`/`ResizeObserver`/`uniform1f(continuous,0)`/`requestAnimationFrame(draw)`，`:28-38`）。
- 未覆盖：`isDark` 之外的主题分支、GL 失败路径（内联脚本行为）、bounds 退化工作区。
- `NOT_RUN`：未运行 bun test/产品测试/typecheck/build/GUI；测试断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出与 bounds 几何 | 已证实 | `:3-20` |
| HTML 结构/动画/内联 GL 脚本 | 已证实 | `:28-45` |
| 着色器与渲染端共享 | 已证实 | `:1`（对照 `IntroFluidBackground.tsx:14`） |
| ANGLE D3D11on12 规避声明 | 已证实 | `:22-27` 注释（运行效果未测） |
| 3 用例断言 | 已证实 | `startup-splash.test.ts:5-38` |
| splash 实际视觉/闪动规避效果 | 未知 | NOT_RUN |
| 测试通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `createCenteredStartupSplashBounds` | §3/§9 | 11-20 | covered |
| `createStartupSplashHtml`（CSS/GL 脚本） | §3 | 28-45 | covered |
| 共享 shader 契约 | §4/§8 | 1,33-34 | covered |
| GL 失败路径 | §9 | 43 | partial（无测试） |
| 运行观感 | §10 | — | unknown（NOT_RUN） |
