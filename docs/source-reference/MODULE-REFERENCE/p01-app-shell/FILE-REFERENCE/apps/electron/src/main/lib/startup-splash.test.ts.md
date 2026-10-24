---
path: apps/electron/src/main/lib/startup-splash.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e1591f6dce4b6f2a53fd0c9b3d166a03018c6c57
sha256: 7eb4d3cc95d0c1e97a73dd5af6f2bb3477d3f6c5c408d218f489f3dc4a4e6267
lines: 39
kind: test
package: p01-app-shell
author: docs-r07-author-extra-01-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/startup-splash.test.ts

## 1. 测试目标

`startup-splash`（同批深读）的纯生成契约：bounds 1/4 居中几何、主题化原始 WebGL Splash HTML（canvas/webgl/主题色/拖拽/禁选）、共享 shader 片段与 canvas 尺寸同步（ResizeObserver）在场。框架 `bun:test`；无 mock（纯函数字符串断言）。

## 2. 用例清单

用例计数：`test(` **3**（`:5,15,28`），`it(` 0——与源码计数一致。无 describe（3 个顶层 test）。

| # | 用例 | 动作 | 依赖顺序 |
| --- | --- | --- | --- |
| 1 | 初始 Splash 按所选显示器工作区 1/4 居中（`:5-13`） | `createCenteredStartupSplashBounds` 两次（1920×1080@0,0 与 2560×1440@1920,40） | 独立 |
| 2 | 主题化原始 WebGL 启动页（`:15-26`） | `createStartupSplashHtml(true/false)` 断言片段 | 独立 |
| 3 | 原版 shader + 尺寸同步 canvas（`:28-38`） | `createStartupSplashHtml(true)` 断言 shader/resize 片段 | 独立 |

## 3. 真实断言

（逐条引用 expect 行）

1. `createCenteredStartupSplashBounds({x:0,y:0,width:1920,height:1080})` `toEqual({x:720,y:405,width:480,height:270})`；`({x:1920,y:40,width:2560,height:1440})` `toEqual({x:2880,y:580,width:640,height:360})`（`:6-12`）。
2. `darkHtml` `toContain('<canvas id="fluid"></canvas>')`/`'getContext(\'webgl\''`/`'background:#0b0b0c'`/`'-webkit-app-region:drag'`/`'user-select:none'`/`'-webkit-user-select:none'`；`lightHtml` `toContain('background:#f7f7f5')`（`:19-25`）。
3. `html` `toContain('float splashValue(')`/`'float s0 = splashValue'`/`'float s1 = splashValue'`/`'float s2 = splashValue'`/`'getBoundingClientRect()'`/`'new ResizeObserver(resize).observe(c)'`/`'gl.uniform1f(continuous,0)'`/`'requestAnimationFrame(draw)'`（`:31-38`）。

## 4. 未覆盖与脆弱点

- 未覆盖：`isDark` 中间色分支细节、内联 GL 脚本失败路径（编译/link 失败静默）、bounds 退化工作区（0/负值 `max(1,…)` 兜底）、HTML 动画时序。
- 脆弱点：用例 2/3 为**字符串包含断言**——HTML 重构（类名/脚本片段变化）会红，但不验证渲染行为；`splashValue`/`s0/s1/s2` 断言锚定共享 shader 的结构特征（防换 shader 静默漂移）。
- 视觉/闪动规避效果（ANGLE D3D11on12 注释）未测（NOT_RUN）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 test/0 it 计数 | 已证实 | 全文件 `test(`/`it(` 机械计数 |
| 断言逐条如 §3 | 已证实 | `startup-splash.test.ts:6-38` |
| 无 mock/纯函数字符串断言 | 已证实 | 全文仅 import 被测符号（`:3`） |
| 测试通过与否 | 未知 | NOT_RUN（本轮未执行 bun test） |
| 渲染/视觉行为 | 未知 | 无用例（§4） |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| bounds 1/4 居中 | §2/§3 | 5-13 | covered |
| 主题 HTML 片段 | §2/§3 | 15-26 | covered |
| shader/resize 片段 | §2/§3 | 28-38 | covered |
| GL 失败/动画/视觉 | §4 | — | unknown |
| 运行结果 | §5 | — | unknown（NOT_RUN） |
