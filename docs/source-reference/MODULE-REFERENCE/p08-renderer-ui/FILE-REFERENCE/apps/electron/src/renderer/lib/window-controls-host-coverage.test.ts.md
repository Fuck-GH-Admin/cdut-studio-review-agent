---
path: apps/electron/src/renderer/lib/window-controls-host-coverage.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 420c65783ec177979e15146d92bb418c42c94b36
sha256: 5b6969e3739dedf97018791c029107e1b1d10b2da15546f926b12dc478eeb0f5
lines: 79
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/window-controls-host-coverage.test.ts

## 1. 测试目标

**源码级守卫**（文件头 `:5-15`）：全屏视图整块取代 TabBar 时必须自声明窗口按钮宿主，否则 Windows 上按钮整组消失。约定**至少被破坏过一次**（AgentSkillsView 宿主被重构移除；macOS 类型检查/单测不发现、Windows 打包 smoke 只验进程存活）——故固化进 CI。注意：只保证“声明了宿主”，不替代 Windows 真机对位置/优先级/命中区的验收。被测：各全屏视图源文件 + MainArea 兜底宿主（源文件文本断言）。本轮 `NOT_RUN`。

## 2. 用例清单

2 describe、**2 test 调用点 / 5 用例**（`grep -c '^\s*test('`=2 真值口径：表驱动循环 `:47-63` 内 1 个 `test(` 按 `FULLSCREEN_VIEWS` 4 视图展开 4 用例 + 兜底 1 用例）：

| # | 用例 | 断言要点 |
| --- | --- | --- |
| 1 | `:48` 循环 | PlanningView.tsx（规划中心，minHosts 1）：import `WindowControlsHost`（正则兼容单双引号）+ `<WindowControlsHost` 出现数 ≥1 |
| 2 | `:48` 循环 | AgentSkillsView.tsx（minHosts **2**——正常页与“未选工作区”空态两互斥分支各需按钮） |
| 3 | `:48` 循环 | CdutZoneView.tsx（minHosts 1；注释口径：专区首页靠 MainArea 兜底、子页面自声明 priority 20 接管、ContentReviewView 不再自管防同级争抢） |
| 4 | `:48` 循环 | CdutScienceView.tsx（minHosts 1，自声明隔离顶栏） |
| 5 | `:65-78` | MainArea.tsx 兜底：active 条件含 `automationFormOpen \|\| tabs.length===0 \|\| activeView!=='conversations'` 三分支全；`id="main-content"` 的 priority **<10**（低于 TabBar 防双 active 争抢） |

## 3. 真实断言

- 源文件文本级断言（import 正则+JSX 出现计数+条件字面量+priority 数值）。
- #5 同时锁兜底条件完整性与优先级序（两处争抢根因）。
- 注释自证动机（历史破坏案例+为何 macOS CI 不发现）。

## 4. 未覆盖与脆弱点

**未覆盖**：真机命中区/宿主位置/优先级行为（明示不替代 Windows 验收）；非全屏视图。

**脆弱点**：文本断言与源码写法耦合（引号风格已兼容；priority 解析用 240 字符窗口正则）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 describe、2 test 调用点/5 用例 | 已证实 | `:47/:65`；`grep -c test(`=2（循环展开后 5 用例） |
| 四视图+兜底双锁 | 已证实 | `:16-78` |
| 真机行为 | 未知 | 未覆盖（明示） |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 四全屏视图宿主声明 | #1-#4 | `:46-63` | covered |
| MainArea 兜底（条件+优先级） | #5 | `:65-78` | covered |
