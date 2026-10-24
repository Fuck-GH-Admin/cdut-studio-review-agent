---
path: apps/electron/src/main/lib/mac-traffic-light.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f9a33e57f9a514bed534b0ab226f91fbf6a908ab
sha256: 60ab350c2c132f1133ae216dc18b6906927680a0740dba1d28a4e0ffd791c910
lines: 20
kind: test
package: p01-app-shell
author: docs-r07-author-extra-01-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/mac-traffic-light.test.ts

## 1. 测试目标

`mac-traffic-light.ts`（`resolveTrafficLightPosition` 与 `DEFAULT_MAIN_WINDOW_ZOOM_FACTOR`；被测源文件不在本批 scope，属他批主手册）的纯计算行为：默认位置、缩放倍率换算取整、异常倍率回退、主窗口默认缩放常量。框架 `bun:test`；无 mock、无 Electron 运行时调用（只测纯函数与常量）。

## 2. 用例清单

用例计数：`test(` **4**（`:4`、`:8`、`:12`、`:17`），`it(` 0——与源码计数一致。无 `describe`，4 个顶层 `test`。

| # | 用例（test 名） | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- |
| 1 | `macOS 红绿灯在标准缩放下保持默认位置`（`:4-6`） | — | `resolveTrafficLightPosition(1)` | 独立 |
| 2 | `主窗口默认缩放为 110%，用于启动和 ⌘0 重置`（`:8-10`） | — | 读常量 `DEFAULT_MAIN_WINDOW_ZOOM_FACTOR` | 独立 |
| 3 | `macOS 红绿灯位置随页面缩放倍率同步放大并取整`（`:12-15`） | — | `resolveTrafficLightPosition(1.5)`、`(2)` | 独立 |
| 4 | `异常缩放倍率回退到标准倍率`（`:17-20`） | — | `resolveTrafficLightPosition(0)`、`(Number.NaN)` | 独立 |

依赖：`./mac-traffic-light` 的 `DEFAULT_TRAFFIC_LIGHT_POSITION`、`DEFAULT_MAIN_WINDOW_ZOOM_FACTOR`、`resolveTrafficLightPosition`（`:2`）。无顺序依赖。

## 3. 真实断言

（逐条引用 expect 行）

1. `expect(resolveTrafficLightPosition(1)).toEqual(DEFAULT_TRAFFIC_LIGHT_POSITION)`（`:5`）。
2. `expect(DEFAULT_MAIN_WINDOW_ZOOM_FACTOR).toBe(1.1)`（`:9`）。
3. `expect(resolveTrafficLightPosition(1.5)).toEqual({ x: 27, y: 27 })`；`expect(resolveTrafficLightPosition(2)).toEqual({ x: 36, y: 36 })`（`:13-14`）。
4. `expect(resolveTrafficLightPosition(0)).toEqual(DEFAULT_TRAFFIC_LIGHT_POSITION)`；`expect(resolveTrafficLightPosition(Number.NaN)).toEqual(DEFAULT_TRAFFIC_LIGHT_POSITION)`（`:18-19`）。

数值自洽性（与被测源码对照，`mac-traffic-light.ts:11`、`:15-21`）：默认 `{x:18,y:18}`；1.5×→`round(27)=27`；2×→`round(36)=36`；`scale` 判定 `Number.isFinite(zoomFactor) && zoomFactor > 0 ? zoomFactor : 1` 使 0/NaN 落 1。

## 4. 未覆盖与脆弱点

- 未覆盖（对照被测源码 `mac-traffic-light.ts`）：`syncMacTrafficLightPosition`（`:24-27`）、`setWindowZoomLevel`（`:30-34`）、`adjustWindowZoom`（`:36-39`）、`resetWindowZoom`（`:42-46`）、`installMacTrafficLightZoomSync`（`:49-69`）——全部涉及 `BrowserWindow`/`webContents`，无测试；负倍率/超大倍率、`base` 自定义参数、取整边界（如 1.25×→22.5→round 22/23）未测。
- 脆弱点：用例 3 的期望值 `{x:27,y:27}`/`{x:36,y:36}` 硬编码，依赖 `DEFAULT_TRAFFIC_LIGHT_POSITION` 为 `{18,18}`（若默认位置调整需同步）；`toEqual` 全等对象比较。
- 平台行为（macOS 原生按钮移动）完全未测（NOT_RUN，且非 macOS 环境不可测）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 test/0 it 计数 | 已证实 | 全文件 `test(`/`it(` 机械计数 |
| 断言逐条如 §3 | 已证实 | `mac-traffic-light.test.ts:5-19` |
| 纯函数测试、无 mock/无 Electron | 已证实 | 全文仅 import `bun:test` 与被测符号（`:1-2`） |
| 测试通过与否 | 未知 | NOT_RUN（本轮未执行 bun test） |
| 窗口同步函数行为 | 未知 | 无用例（§4） |
| macOS 真机红绿灯效果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `resolveTrafficLightPosition(1)` 默认 | §2/§3 | 4-6 | covered |
| `DEFAULT_MAIN_WINDOW_ZOOM_FACTOR` | §2/§3 | 8-10 | covered |
| 缩放取整（1.5/2） | §2/§3 | 12-15 | covered |
| 异常倍率回退（0/NaN） | §2/§3 | 17-20 | covered |
| 窗口同步/快捷键函数 | §4 | — | unknown |
| 运行结果 | §5 | — | unknown（NOT_RUN） |
