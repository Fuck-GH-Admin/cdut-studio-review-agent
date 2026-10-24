---
path: apps/electron/src/renderer/components/onboarding/coach-tour/coach-tour-steps.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0744dbca9fa29de4c63598a5219df5ee335b0414
sha256: cdc869bf67798cafec224dfaba9cd45281d1880f3d6408881ecd811831a52d34
lines: 39
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-01-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/onboarding/coach-tour/coach-tour-steps.test.ts

## 1. 测试目标

`coach-tour-steps`（同批深读）的步骤数据合法性不变量：key 唯一、锚点声明完备、等待声明完备、CDUT 子页面归属、版本号下限。框架 `bun:test`；无 mock，对 `COACH_TOUR_STEPS`（23 条目）与 `CURRENT_COACH_TOUR_VERSION` 做结构断言。

## 2. 用例清单

用例计数：`test(` **6**（`:5,10,16,22,30,36`），`it(` 0——与源码计数一致。单一 `describe('COACH_TOUR_STEPS 数据合法性')`（`:4`）。

| # | 用例 | 动作 | 依赖顺序 |
| --- | --- | --- | --- |
| 1 | 步骤 key 唯一（`:5-8`） | `new Set(keys).size === keys.length` | 独立 |
| 2 | 除最后一步外都必须有锚点选择器（`:10-14`） | `slice(0,-1)` 逐项 `selectors.length + (unionSelectors?.length ?? 0) > 0` | 独立 |
| 3 | 等待型步骤必须声明 waitFor（`:16-20`） | `advanceOn==='wait'` 过滤后 `waitFor` defined | 独立 |
| 4 | 选择器等待必须提供 selector（`:22-28`） | `waitFor.kind==='selector'` → `selector.length > 0` | 独立 |
| 5 | CDUT 子页面步骤必须停留在 cdut-zone（`:30-34`） | `cdutSubView` 真值 → `view === 'cdut-zone'` | 独立 |
| 6 | 版本号已升级（`:36-38`） | `CURRENT_COACH_TOUR_VERSION >= 8` | 独立 |

## 3. 真实断言

（逐条引用 expect 行）

1. `expect(new Set(keys).size).toBe(keys.length)`（`:7`）。
2. `expect(step.selectors.length + (step.unionSelectors?.length ?? 0)).toBeGreaterThan(0)`（`:12`，forEach 展开至 22 条目）。
3. `expect(step.waitFor).toBeDefined()`（`:18`，forEach 覆盖 5 个 wait 步骤：calculus/cdut-login/ai-class-q1/ai-class-q2/yanhu/science-gate/digitize-extract 中 `advanceOn==='wait'` 者）。
4. `expect(step.waitFor.selector.length).toBeGreaterThan(0)`（`:25`）。
5. `expect(step.view).toBe('cdut-zone')`（`:32`）。
6. `expect(CURRENT_COACH_TOUR_VERSION).toBeGreaterThanOrEqual(8)`（`:37`）。

## 4. 未覆盖与脆弱点

- 未覆盖：选择器与真实 DOM 匹配、文案正确性、trigger 集合、`placement` 合法性、`readySelector` 存在性、演示资产文件名与主进程一致性。
- 脆弱点：用例 6 的 `>= 8` 是下限断言——版本 +1 后仍绿（不会强制提醒升级，仅防回退）；用例 2 依赖「最后一步=outro 无锚点」的约定（`:410` `selectors: []`）。
- 结构断言不等于行为验证：23 条目实际播放需 GUI（NOT_RUN）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 test/0 it 计数 | 已证实 | 全文件 `test(`/`it(` 机械计数 |
| 断言逐条如 §3 | 已证实 | `coach-tour-steps.test.ts:5-38` |
| 无 mock/纯结构断言 | 已证实 | 全文仅 import `bun:test` 与被测符号（`:1-2`） |
| 测试通过与否 | 未知 | NOT_RUN（本轮未执行 bun test） |
| 步骤实际播放/选择器命中 | 未知 | NOT_RUN（§4） |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| key 唯一 | §2/§3 | 5-8 | covered |
| 锚点完备（除末步） | §2/§3 | 10-14 | covered |
| waitFor 声明 | §2/§3 | 16-20 | covered |
| selector 非空 | §2/§3 | 22-28 | covered |
| cdutSubView→view 归属 | §2/§3 | 30-34 | covered |
| 版本下限 | §2/§3 | 36-38 | covered |
| 文案/选择器/播放行为 | §4 | — | unknown（NOT_RUN） |
