---
path: apps/electron/src/renderer/components/onboarding/IntroFluidBackground.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 24fe3923822188e9d6589453f8455fa761eed890
sha256: cb895d564c1f4b7251c74cb800290382287f1de56a247796114545068a688d71
lines: 156
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-01-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/onboarding/IntroFluidBackground.tsx

## 1. 结论与边界

**开屏 WebGL 液态玻璃背景**（156 行）：单着色器全屏 quad，时间驱动 splat 扰动，30fps 节流 + 像素化降采样（0.25 scale），一次性（intro 开屏）或循环（功能导览）两种模式；实现参考 WebGL-Fluid-Simulation（MIT, Pavel Dobryakov，注释 `:4-9` 明确为重新实现、不复制上游 demo）。

边界：只管渲染与清理，不做交互/业务；着色器源在 `../../../shared/intro-fluid-shader`（共享给主进程启动页）；`DEBUG_SOLID_OUTPUT` 常量仅供排障且必须保持 false（`:16-17`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `IntroFluidBackground` | 导出函数组件 | 19-153 | `({durationMs, repeat=false, fadeOut=true}) => ReactElement` | 唯一导出 |
| `DEBUG_SOLID_OUTPUT` | 内部常量 | 17 | `false` | 排障开关（须关闭） |
| `PIXEL_SCALE` | 内部常量 | 80 | `0.25` | 内部分辨率降采样 |
| `FRAME_INTERVAL_MS` | 内部常量 | 105 | `1000/30` | 30fps 节流 |

导出计数：`export` 1 条（`:19`），与源码一致。

## 3. 内部逻辑与关键流程

- **初始化**（`:22-72`）：`canvas.getContext('webgl', {alpha:false, antialias:false, powerPreference:'high-performance'})`，无 gl 直接 return（黑底 canvas 保留）；**先 `clearColor(0,0,0,1)` 清黑**（注释 `:27`：绝不暴露未初始化白屏）；`compile` 编译 vertex/fragment（失败 console.error 详单+deleteShader，`:31-45`）；link 失败 return（`:54-57`）；取 7 个 uniform/attrib 位置（`aPosition/uTime/uResolution/uOpacity/uSeed/uThemeLight/uContinuous`），任一缺失 console.error + return（`:59-72`）。
- **resize**（`:81-91`）：`rect × min(devicePixelRatio,1.5) × 0.25`（总像素约 1/16，注释 `:78-79`），`ResizeObserver` 驱动。
- **render**（`:107-140`）：30fps 节流（`canRender`）；`animationElapsed = repeat ? elapsed % durationMs : elapsed`（`:113`）；envelope（`:118-122`）：repeat 模式 `min(1, progress*3.2)`；`fadeOut=false` 模式 `min(1, elapsed/2200)`；一次性模式 `min(1,progress*3.2)` × 尾部 0.84→1.0 渐隐；uniform 设定（`themeLight=0`、`continuous=repeat?1:0`，`:134-136`）；`drawArrays(TRIANGLE_STRIP, 0, 4)`；`repeat || progress<1` 才续帧（`:139`）。
- **清理**（`:143-152`）：cancelAnimationFrame + `observer.disconnect` + delete buffer/program/shaders；注释 `:150-151` **不主动 `loseContext`**（React Strict Mode cleanup 后重挂载会导致二次编译失败）。
- 首帧/初始化打 `console.info`（`:92-96`、`:109-112`，含 contextLost/error/尺寸）。

## 4. 调用者与调用链

- 入向（全冻结树 `grep IntroFluidBackground|intro-fluid-shader|INTRO_FLUID`，apps+packages 全类型）：
  - `apps/electron/src/renderer/components/onboarding/IntroWaterRipple.tsx:9`、`:82`（开屏，`durationMs=5000` 一次性）。
  - `apps/electron/src/renderer/components/onboarding/FeatureTour.tsx:17`、`:114`（`durationMs=18000 repeat` 循环）。
  - `apps/electron/src/renderer/components/onboarding/OnboardingView.tsx:25`、`:243`（诗意插页 `durationMs=6000`）。
  - 共享着色器：`apps/electron/src/main/lib/startup-splash.ts:1` import `INTRO_FLUID_*_SHADER`，`:33-34` 序列化注入主进程原生启动页（本组件的渲染器兄弟实现）。
- 出向：`../../../shared/intro-fluid-shader` 的 `INTRO_FLUID_VERTEX_SHADER`/`INTRO_FLUID_FRAGMENT_SHADER`（`:14`）。

## 5. 数据 I/O、读写与副作用

- 无磁盘/网络；副作用=WebGL 上下文/着色器/buffer 资源（显式释放，`:143-149`）、`ResizeObserver`、rAF 循环、console 日志。
- 内存：canvas 内部尺寸受 `PIXEL_SCALE` 约束（低负载）。

## 6. 分支、失败、取消与恢复

- gl 不可用/编译失败/link 失败/位置缺失：各自 console.error 后 return，canvas 保持黑底（`:25-72`）——无异常抛出到 React。
- 取消：effect cleanup 全量释放（rAF/observer/GL 资源）。
- 重挂载：不 `loseContext` 的取舍（`:150-151`）保证 Strict Mode 下二次挂载正常。
- `repeat=true` 时动画取模永续（`:113`、`:139`）；一次性模式 progress≥1 停帧。

## 7. 权限与权威状态

- 无权限分支，依据：本文件无 sender/role 检查、无外部输入（props 仅时序参数）；纯 GPU 渲染。

## 8. 修改影响面

- 消费组件：`IntroWaterRipple`/`FeatureTour`/`OnboardingView`（props 契约 `durationMs/repeat/fadeOut`）。
- 共享着色器 `intro-fluid-shader`：主进程 `startup-splash.ts` 同源消费，改 shader 影响原生启动页与开屏一致性。
- `PIXEL_SCALE`/`FRAME_INTERVAL_MS` 影响 GPU 负载与观感；CSS `image-rendering: pixelated`（`:155`）配套。

## 9. 测试证据

- 直接测试：**无**。检索范围：冻结树 `*.test.ts(x)` 引用（`IntroFluidBackground|intro-fluid-shader`）0 命中（`startup-splash.test.ts` 测主进程启动页，非本组件）。
- 间接证据：无。
- 未覆盖：WebGL 初始化失败路径、resize、envelope 三模式、Strict Mode 重挂载。
- `NOT_RUN`：未运行 bun test/产品测试/typecheck/build/GUI/WebGL；测试断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出与三模式 envelope | 已证实 | `:19`、`:118-122` |
| 初始化先清黑防白屏 | 已证实 | `:27-29` |
| 30fps 节流 + 0.25 降采样 | 已证实 | `:80`、`:105-115` |
| 不主动 loseContext（Strict Mode 取舍） | 已证实 | `:150-151` |
| 着色器与主进程启动页共享 | 已证实 | `startup-splash.ts:1,33-34` |
| 上游 MIT 署名/不复制声明 | 已证实 | `:4-9` 注释 |
| GPU 实际表现/失败路径 | 未知 | NOT_RUN |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 初始化/编译/link/位置校验 | §3/§6 | 22-72 | covered |
| resize/降采样 | §3 | 76-91 | covered |
| render/envelope/节流 | §3 | 100-141 | covered |
| 清理与 Strict Mode 取舍 | §6 | 143-152 | covered |
| 消费者/共享 shader | §4 | — | covered |
| WebGL 运行表现 | §10 | — | unknown（NOT_RUN） |
