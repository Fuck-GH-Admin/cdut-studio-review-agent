---
path: apps/electron/src/renderer/lib/shortcut-registry.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4e5360d48fd15a272fe32271a9116a991ffcc4c7
sha256: 12b3e0571e95e986aeb00f78c1a8df32d6ae714ae643231be534371ec30e9ac2
lines: 97
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/shortcut-registry.test.ts

## 1. 测试目标

验证 `shortcut-registry.ts` 两个纯函数导出的功能键识别与分发决策：macOS F1–F12 判定、`resolveShortcutDispatch` 对 `none/handled/no-handler` × 平台 × 组合态的 `runHandlers/swallow` 矩阵（shortcut-registry.test.ts:2、:26-29 注释：功能键拦截全部收敛在渲染层）。工厂 `keyEvent(key, isComposing)` 构造事件（:7-11）。框架 `bun:test`（:1）。本轮 `NOT_RUN`，纯静态阅读。

## 2. 用例清单

机械计数 `test(`=10、`it(`=0、`test.each(`=0，共 10 个用例（顶层 test，无 describe）：

1. `识别 macOS 的 F1–F12 功能键`（shortcut-registry.test.ts:15-18）
2. `不把普通键、F13 或非 macOS 按键当成功能键`（:20-24）
3. `Given macOS 且未绑定任何功能键 When 按下整套 F1–F12 Then 一律阻止默认行为`（:31-38）
4. `Given macOS 且用户改绑到其它功能键 When 按下该键 Then 正常分发并阻止默认行为`（:40-47）
5. `Given macOS 且命中定义但当前无 handler When 按下功能键 Then 不执行但仍阻止默认行为`（:49-56）
6. `Given macOS When 按下未绑定的普通键 Then 不干预`（:58-63）
7. `Given Windows When 按下未绑定的功能键或普通键 Then 不阻止默认行为`（:65-74）
8. `Given Windows 且命中 handler When 按下对应按键 Then 照常执行并阻止默认行为`（:76-81）
9. `Given 输入法组合中 When 命中快捷键 Then 不执行 handler 也不吞掉普通键`（:83-88）
10. `Given 输入法组合中 When 按下 macOS 功能键 Then 仍阻止默认行为，避免漏出焦点框`（:90-97）

## 3. 真实断言

shortcut-registry.test.ts:16-17（key/code 双通道识别 `toBe(true)`）、:21-23（F13/普通键/非 mac `toBe(false)`）；:33-36 逐键 `toEqual({ runHandlers: false, swallow: true })`（F1–F12 循环 :32）；:42-45 handled → `{true, true}`；:51-54 no-handler → `{false, true}`；:59-62 mac 普通键 → `{false, false}`；:66-73 Windows → `{false, false}`；:77-80 Windows handled → `{true, true}`；:84-87 组合态普通键 → `{false, false}`；:92-95 组合态 F 键 → `{false, true}`。

## 4. 未覆盖与脆弱点

未覆盖 `dispatchShortcut`/独占 handler/注册注销（在 shortcut-dispatch.test.ts）；未覆盖 `parseAccelerator`/`matchesParsed`/`getActiveAccelerator`/`checkConflict`/`getAcceleratorDisplay`/`initShortcutRegistry`（无直接用例）；未覆盖 `code` 通道的 F13（:22 仅 key+code 同值）。脆弱点：F1–F12 全量循环（:32、:41、:50、:91）绑定 `/^F(?:[1-9]|1[0-2])$/i` 边界。均为纯函数调用，无动态 import。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 10 用例与断言行真实存在 | 已证实 | shortcut-registry.test.ts:15-97 机械计数 |
| 测试运行结果 | 未知 | NOT_RUN（断言≠运行） |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| isMacFunctionKeyEvent 正/反例 | §2/§3 | shortcut-registry.test.ts:15-24 | covered |
| resolveShortcutDispatch mac 全矩阵 | §3 | :31-63 | covered |
| resolveShortcutDispatch Windows | §3 | :65-81 | covered |
| 组合态两规则 | §3 | :83-97 | covered |
| 注册表状态 API | §4 | — | unknown |
