---
path: apps/electron/src/main/lib/mac-traffic-light.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3341a4a84d753a0b385448351300a5120697c1f2
sha256: 96f058812b618b0d001e14adfd05e839849050387153692224b9190fbe83f794
lines: 69
kind: source
package: p01-app-shell
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/mac-traffic-light.ts

## 1. 结论与边界

macOS 原生红绿灯（窗口按钮）位置与窗口页面缩放的同步工具（69 行，头注释 `:1-7`）：页面缩放后原生按钮不随 Chromium 缩放移动，本模块按 DIP×倍率换算按钮位置，并集中监听缩放入口与 ⌘±/⌘0 快捷键。

**边界**：不涉及 renderer 侧自制红绿灯组件（`renderer/components/app-shell/MacTrafficLights.tsx` 的 `mac-traffic-lights` 类名是另一套渲染层实现，与本模块无 import 关系——全树检索 `mac-traffic-light` 仅命中本文件、`menu.ts:2`、`main/index.ts:251`、`mac-traffic-light.test.ts:2` 及 CSS/MacTrafficLights.tsx 的同名类字符串）；不持久化任何配置；非 macOS 除 `setWindowZoomLevel`/`adjustWindowZoom`/`resetWindowZoom` 的缩放调用外不做任何事。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `DEFAULT_TRAFFIC_LIGHT_POSITION` | 常量（导出） | 11 | `Point = { x: 18, y: 18 }` | 红绿灯基准 DIP 位置 |
| `DEFAULT_MAIN_WINDOW_ZOOM_FACTOR` | 常量（导出） | 13 | `= 1.1` | 主界面默认缩放；⌘0 回到此倍率 |
| `resolveTrafficLightPosition` | 函数（导出） | 15-21 | `(zoomFactor: number, base = DEFAULT_TRAFFIC_LIGHT_POSITION) => Point` | 倍率换算+取整 |
| `syncMacTrafficLightPosition` | 函数（导出） | 24-27 | `(win: BrowserWindow) => void` | 按当前 zoomFactor 移动按钮 |
| `setWindowZoomLevel` | 函数（导出） | 30-34 | `(win: BrowserWindow, level: number) => void` | setZoomLevel + 同步红绿灯 |
| `adjustWindowZoom` | 函数（导出） | 36-39 | `(win: BrowserWindow, delta: number) => void` | 当前 zoomLevel+delta 夹取 [-9,9] |
| `resetWindowZoom` | 函数（导出） | 42-46 | `(win: BrowserWindow) => void` | setZoomFactor(1.1) + 同步红绿灯 |
| `installMacTrafficLightZoomSync` | 函数（导出） | 49-69 | `(win: BrowserWindow) => void` | darwin 安装缩放同步与快捷键拦截 |

导出合计 8（2 常量 + 6 函数）；无内部函数（`Number.isFinite` 判定内联在 `:16`）。

## 3. 内部逻辑与关键流程

1. **位置换算**（`:15-21`）：`scale = Number.isFinite(zoomFactor) && zoomFactor > 0 ? zoomFactor : 1`（`:16`，非有限或 ≤0 回退 1）；返回 `{x: Math.round(base.x*scale), y: Math.round(base.y*scale)}`（`:17-20`）。
2. **同步**（`:24-27`）：`process.platform !== 'darwin' || win.isDestroyed()` 直接 return（`:25`）；否则 `win.setWindowButtonPosition(resolveTrafficLightPosition(win.webContents.getZoomFactor()))`（`:26`）。
3. **setZoomLevel 链**（`:30-34`）：destroyed 短路（`:31`）→ `webContents.setZoomLevel(level)`（`:32`，Chromium 相对缩放 API）→ `syncMacTrafficLightPosition`（`:33`）。
4. **adjust**（`:36-39`）：destroyed 短路 → `setWindowZoomLevel(win, Math.max(-9, Math.min(9, win.webContents.getZoomLevel() + delta)))`（`:38`），delta 直接加在当前 `getZoomLevel()` 上并夹取 ±9。
5. **reset**（`:42-46`）：destroyed 短路 → `webContents.setZoomFactor(DEFAULT_MAIN_WINDOW_ZOOM_FACTOR)`（`:44`，**注意与 setZoomLevel 是不同 API**：reset 用绝对倍率 1.1，不是回 Chromium 100%）→ 同步红绿灯（`:45`）。
6. **install**（`:49-69`）：仅 `process.platform === 'darwin'`（`:50`）；先同步一次（`:52`）；`zoom-changed` 事件回调同步（`:53`）；`before-input-event`（`:54-68`）：`input.type !== 'keyDown' || !input.meta || input.control || input.alt` 忽略（`:55`）；key 小写后：`'0'` → preventDefault+reset（`:58-60`）；`['=','+','add','numadd']` → preventDefault+adjust(+0.5)（`:61-63`）；`['-','subtract','numsub']` → preventDefault+adjust(-0.5)（`:64-66`）。

## 4. 调用者与调用链

- 入向（全冻结树检索 `mac-traffic-light` + 各导出符号）：
  - `apps/electron/src/main/index.ts:250-251`（import）→ `main/index.ts:596` `installMacTrafficLightZoomSync(mainWindow)`（主窗口创建后唯一接线点）。
  - `apps/electron/src/main/menu.ts:2`（import `DEFAULT_MAIN_WINDOW_ZOOM_FACTOR`、`resetWindowZoom`）→ `menu.ts:238-239`：darwin 分支 `resetWindowZoom(win)`（⌘0 项），非 darwin 分支 `win.webContents.setZoomFactor(DEFAULT_MAIN_WINDOW_ZOOM_FACTOR)`。
  - 常量消费点：`DEFAULT_TRAFFIC_LIGHT_POSITION` 用于 `main/index.ts:491`（BrowserWindow 选项 `trafficLightPosition:`）；`DEFAULT_MAIN_WINDOW_ZOOM_FACTOR` 用于 `main/index.ts:521`（主窗口启动 `setZoomFactor`）与 `menu.ts:239`（非 darwin ⌘0 分支）。
  - `apps/electron/src/main/lib/mac-traffic-light.test.ts:2`（批外直接测试，import 3 个符号）。
  - `setWindowZoomLevel`/`adjustWindowZoom`/`syncMacTrafficLightPosition`/`resolveTrafficLightPosition` 冻结树内无其他调用者（检索范围：baseline/source 全树，命中仅本文件内部与测试）。
- 出向：仅 `electron` 的 `BrowserWindow`/`Point` 类型（`:9`）与 `win.webContents`（`getZoomFactor/setZoomLevel/getZoomLevel/setZoomFactor`、`on('zoom-changed'/'before-input-event')`）、`win.setWindowButtonPosition`、`win.isDestroyed`。无业务模块依赖。

## 5. 数据 I/O、读写与副作用

无磁盘/网络/缓存（不适用，依据：全文无 fs/net/storage 引用）。副作用：改 BrowserWindow 原生按钮位置（`:26`）、窗口缩放（`:32`/`:44`）、注册两个 webContents 事件监听（`:53`/`:54`）、`event.preventDefault()` 拦截快捷键（`:59`/`:62`/`:65`）。无进程/日志/遥测。

## 6. 分支、失败、取消与恢复

- 非有限/≤0 zoomFactor → scale=1（`:16`）；`Math.round` 取整（`:18-19`）。
- 平台守卫：`sync`/`install` 在非 darwin 直接 return（`:25`/`:50`）。
- 销毁守卫：`sync`/`setWindowZoomLevel`/`adjustWindowZoom`/`resetWindowZoom` 均 `win.isDestroyed()` 短路（`:25`/`:31`/`:37`/`:43`）。
- 无 throw/异步/取消路径；无错误码与用户文案（不适用，依据：全文无 throw/Error）。
- 恢复：不适用（无持久状态，纯窗口 API 调用）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role/权限检查，仅窗口对象操作；快捷键拦截（`:54-68`）是输入处理而非权限。权威状态=webContents 当前缩放（getZoomFactor/getZoomLevel 读取）。

## 8. 修改影响面

- 调用方：`main/index.ts:596`（安装同步）、`menu.ts:238-239`（⌘0 重置，darwin/非 darwin 双分支）、`mac-traffic-light.test.ts`（4 用例）；常量消费：`main/index.ts:491`（DEFAULT_TRAFFIC_LIGHT_POSITION）、`main/index.ts:521`/`menu.ts:239`（DEFAULT_MAIN_WINDOW_ZOOM_FACTOR）。
- 行为耦合：`DEFAULT_MAIN_WINDOW_ZOOM_FACTOR=1.1` 同时是菜单文案/测试期望（`mac-traffic-light.test.ts:9`）与 renderer 左上安全区布局的换算基准（头注释 `:5-6`）；改基准位置或倍率需同步评估侧栏布局与测试。
- `setZoomLevel`（相对）与 `setZoomFactor`（绝对）混用是有意设计（⌘0 回 1.1 而非 100%）；统一 API 会改变用户可见行为。
- 需同步修改的测试：`apps/electron/src/main/lib/mac-traffic-light.test.ts`。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/mac-traffic-light.test.ts`（批外，bun:test，4 test/6 expect）。断言逐条：
1. `:4-6` 标准缩放下 `resolveTrafficLightPosition(1)` toEqual `DEFAULT_TRAFFIC_LIGHT_POSITION`。
2. `:8-10` `DEFAULT_MAIN_WINDOW_ZOOM_FACTOR` toBe `1.1`。
3. `:12-15` 倍率同步取整：`(1.5)`→`{x:27,y:27}`、`(2)`→`{x:36,y:36}`。
4. `:17-20` 异常倍率回退：`(0)`、`(Number.NaN)` → 均 toEqual 默认位置。

未覆盖：`syncMacTrafficLightPosition`/`setWindowZoomLevel`/`adjustWindowZoom`/`resetWindowZoom`/`installMacTrafficLightZoomSync` 无测试（需真实 BrowserWindow）；快捷键拦截分支未覆盖。

`NOT_RUN`：本轮未运行 bun test，断言仅静态阅读，通过状态未知。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全部导出签名、分支、夹取/回退语义、双 API 差异 | 已证实 | `mac-traffic-light.ts:9-69` 全文逐行 |
| 入向接线（index.ts/menu.ts/测试）与零其他调用者 | 已证实 | 全冻结树检索（上述 §4 列表） |
| renderer 侧布局按同倍率放大是换算前提 | 已证实（注释声明） | `:4-6` |
| MacTrafficLights.tsx 与本模块无调用关系 | 已证实 | 全树检索 `mac-traffic-light` 仅类名字符串命中 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `DEFAULT_TRAFFIC_LIGHT_POSITION`/`DEFAULT_MAIN_WINDOW_ZOOM_FACTOR` | §2/§8/§9 | 11,13 | covered |
| `resolveTrafficLightPosition` | §3.1/§9 | 15-21 | covered |
| `syncMacTrafficLightPosition` | §3.2 | 24-27 | covered |
| `setWindowZoomLevel` | §3.3 | 30-34 | covered |
| `adjustWindowZoom` | §3.4 | 36-39 | covered |
| `resetWindowZoom` | §3.5 | 42-46 | covered |
| `installMacTrafficLightZoomSync`（事件+快捷键分支） | §3.6 | 49-69 | covered |
