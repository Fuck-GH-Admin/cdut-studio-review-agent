---
path: apps/electron/src/renderer/components/onboarding/coach-tour/coach-tour-position.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 600f79d079367b1e65f96caefdc69efce37b6173
sha256: 3d3ed6e18356f79a793831ef4d2c27f89e695ae08dc81fd3be226924749e8ca9
lines: 105
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-01-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/onboarding/coach-tour/coach-tour-position.test.ts

## 1. 测试目标

`coach-tour-position`（同批深读）的气泡定位纯几何规则：方位回退、视口钳制、缺失/近全屏/极小视口降级、`unionRects` 外接。框架 `bun:test`；无 mock、无 DOM（注释 `:3-5`：固化规则，改 UI 布局/常量先红）。

## 2. 用例清单

用例计数：`test(` **12**（computeCardPosition describe 8：`:18,26,34,41,49,56,64,72`；unionRects describe 4：`:86,90,94,100`），`it(` 0——与源码计数一致。

公共装置：`VIEWPORT=1440×900`、`CARD=320×190`、`RAIL_RECT={left:8,top:200,width:56,height:40}`（`:11-15`）。

| # | 用例 | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- |
| 1 | 锚点缺失→视口居中（`:18-24`） | — | `computeCardPosition(null, CARD, 'auto', VIEWPORT)` | 独立 |
| 2 | 偏好右侧且空间足→右侧垂直居中（`:26-32`） | RAIL_RECT | `'right'` | 独立 |
| 3 | 底部空间足→auto 优先下方（`:34-39`） | {500,200,200,60} | `'auto'` | 独立 |
| 4 | 贴底→回退上方（`:41-47`） | {500,800,200,40} | `'auto'` | 独立 |
| 5 | 贴右缘→左缘钳制进视口（`:49-54`） | {1300,100,120,40} | `'auto'` | 独立 |
| 6 | 贴右缘偏好 right→回退非 right（`:56-62`） | {1360,200,56,40} | `'right'` | 独立 |
| 7 | 近全屏锚点→下缘居中（`:64-70`） | {0,0,1440,900} | `'auto'` | 独立 |
| 8 | 极小视口→留在安全边距（`:72-82`） | 360×400 三种锚点循环 | `'auto'` | 独立 |
| 9 | `unionRects([])`→null（`:86-88`） | — | 空数组 | 独立 |
| 10 | 单矩形→原样（`:90-92`） | RAIL_RECT | 单元素 | 独立 |
| 11 | 上下分离→外接（`:94-98`） | header+content | 两元素 | 独立 |
| 12 | 横向错位→左右取极值（`:100-104`） | a+b | 两元素 | 独立 |

## 3. 真实断言

（逐条引用 expect 行）

1. `pos.left` `toBeCloseTo((VIEWPORT.width-CARD.width)/2)`；`pos.top` 同式；`toBeGreaterThanOrEqual(12)` 双向（`:20-23`）。
2. `pos.left` `toBeCloseTo(86)`（padded.right=72+gap14）；`pos.top` `toBeCloseTo(paddedCenterY - CARD.height/2)`（`:29-31`）。
3. `pos.top` `toBeCloseTo(282)`（padded.bottom=268+14，`:38`）。
4. `pos.top` `toBeCloseTo(588)`（padded.top=792-14-190，`:46`）。
5. `pos.left + CARD.width` `toBeLessThanOrEqual(1428)`；`pos.left` `toBeGreaterThanOrEqual(12)`（`:52-53`）。
6. `pos.top` `toBeCloseTo(262)`（right 放不下回退 bottom，`:61`）。
7. `pos.left` 居中式；`pos.top` `toBeCloseTo(900-190-24)`；`≥12`（`:67-69`）。
8. 循环三种锚点：`left/top ≥ 12`、`left+CARD.width ≤ 361`、`top+CARD.height ≤ 400-12+190`、`top ≤ max(12, 400-190-12)`（`:76-80`）。
9. `expect(unionRects([])).toBeNull()`（`:87`）。
10. `expect(unionRects([RAIL_RECT])).toEqual(RAIL_RECT)`（`:91`）。
11. `toEqual({left:200, top:80, width:1152, height:1090})`（`:97`）。
12. `toEqual({left:100, top:50, width:600, height:150})`（`:103`）。

## 4. 未覆盖与脆弱点

- 未覆盖：显式 `left`/`top` 偏好、`unionRects` 3+ 矩形、非 `auto` 全回退链（用例 2/6 只测 right）。
- 脆弱点：用例 2/3/4/6/7 期望值**硬编码**依赖常量 8/14/12 与 CARD 尺寸（改常量需同改）；用例 8 断言含恒真式 `top+CARD.height ≤ 400-12+CARD.height`（`:79`，等价 top≤388，紧随其后的 `:80` 才是实际钳制断言）——照实记录。
- 无 DOM 依赖，故不测 `CoachTourOverlay` 的测量/跟踪链路。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 12 test/0 it 计数 | 已证实 | 全文件 `test(`/`it(` 机械计数 |
| 断言逐条如 §3 | 已证实 | `coach-tour-position.test.ts:20-103` |
| 无 mock/纯数值 | 已证实 | 全文仅 import `bun:test` 与被测模块（`:8-9`） |
| 测试通过与否 | 未知 | NOT_RUN（本轮未执行 bun test） |
| left/top 显式偏好行为 | 未知 | 无用例（§4） |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 锚点缺失/近全屏降级 | §2/§3 | 18-24,64-70 | covered |
| 方位回退（right 两向） | §2/§3 | 26-32,56-62 | covered |
| auto 优先下方/贴底回退 | §2/§3 | 34-47 | covered |
| 视口钳制/极小视口 | §2/§3 | 49-54,72-82 | covered |
| `unionRects` 四态 | §2/§3 | 86-104 | covered |
| left/top 显式偏好 | §4 | — | unknown |
| 运行结果 | §5 | — | unknown（NOT_RUN） |
