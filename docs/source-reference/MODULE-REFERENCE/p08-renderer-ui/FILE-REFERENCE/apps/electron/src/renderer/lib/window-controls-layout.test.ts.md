---
path: apps/electron/src/renderer/lib/window-controls-layout.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 88b6b1cb4b70f06a46adb39d47d3c6bbc12f02d1
sha256: 4f5a6502468dc3055629466428783d57d917c7f21749d0481afa82dc894a5d63
lines: 61
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/window-controls-layout.test.ts

## 1. 测试目标

窗口按钮布局单测：宿主选择规则（active 竞争/priority 高者胜/平局保先/无宿主 null/顺序无关）与安全宽度（实际控件宽 ≤ 常量/隐藏不预留/负值不产生负偏移）。被测：`selectActiveWindowControlsHost`/`resolveWindowControlsRightInset`/`WINDOWS_WINDOW_CONTROLS_SAFE_WIDTH`。纯内存。本轮 `NOT_RUN`。

## 2. 用例清单

2 describe、**8 test**：

### 2.1 宿主选择（5，`:13-44`）
1. `:14-17` inactive 不参与（`tab-bar(false,10)` 败于 `preview-panel(true,20)`）。
2. `:19-23` priority 高者胜（right-side-panel 30 > tab-bar 10，“谁贴窗口右缘谁负责”）。
3. `:25-28` **平局保留先注册者**（防按钮跳动）。
4. `:30-33` 无 active → null（空数组/全 false 两种）。
5. `:35-43` 全 active 时**与注册顺序无关**恒选最高（team-files 40）。

### 2.2 安全宽度（3，`:46-61`）
6. `:47-51` 实际控件宽（36×3+2+2=112）≤126（注释给组成明细）。
7. `:53-56` 隐藏→0、显示→常量。
8. `:58-60` `safeWidth=-40` → 0（无负偏移）。

## 3. 真实断言

- #3/#5 是“平局保先/顺序无关”双口径回归。
- #6 用算式自证 126 的组成（36×3+padding 2+边框 2）。
- #8 负值钳制。

## 4. 未覆盖与脆弱点

**未覆盖**：字面量历史债务处（AppShell 等六文件）与真机命中区行为（属宿主侧）。

**脆弱点**：`host()` 夹具字面量。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 describe、8 test、纯内存 | 已证实 | `:13/:46`；`grep -c test(`=8 |
| 宿主规则五态/宽度三态 | 已证实 | `:14-60` |
| 真机命中区 | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| `selectActiveWindowControlsHost` | #1-#5 | `:14-43` | covered |
| `resolveWindowControlsRightInset`/常量 | #6-#8 | `:47-60` | covered |
