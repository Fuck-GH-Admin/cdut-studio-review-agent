---
path: apps/electron/src/renderer/lib/navigation-controller.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3766e0c039712775a88b7b2a5db4c202921c5e56
sha256: b0da1336a91b594d65598f69fc02f095e698a40be1efb1b29c52fdb45aa858cd
lines: 40
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/navigation-controller.test.ts

## 1. 测试目标

`navigation-controller` 的分发与编辑上下文判定契约（40 行，bun:test）：①按优先级降序投递至消费；②首个消费即停+注销生效；③`isEditableTarget` 无需 DOM 实现即可识别原生/富文本编辑器。mock 边界：**无 mock**（纯内存工厂 + `as unknown as EventTarget` 鸭子类型替身）。

## 2. 用例清单

依赖顺序：无（3 用例各自新建 controller/独立输入）。

| # | 用例 | 行 | 设置 | 动作 | 断言 |
| --- | --- | --- | --- | --- | --- |
| 1 | offers actions to consumers by descending priority until one consumes it | 8-16 | `createNavigationController()`；低优先级 1（push `low:` 后 return true）、高优先级 10（push `high:` 后 return false） | `dispatch('next')` | toBe(true)；calls toEqual `['high:next','low:next']` |
| 2 | stops dispatching after a consumer handles the action and supports unregister | 18-29 | 新 controller；p10 消费者（return true）、p1 意外消费者 | `dispatch('confirm')`；`unregister()`；再 `dispatch('confirm')` | 首次 calls toEqual `['confirm']`；注销后 toEqual `['confirm','unexpected']`；两次 dispatch 均 toBe(true) |
| 3 | recognizes native and rich text editors without requiring a DOM implementation | 33-39 | 鸭子类型对象（INPUT/TEXTAREA/isContentEditable/closest 含 .ProseMirror/BUTTON+closest null） | `isEditableTarget` ×5 | 4×toBe(true)、BUTTON 一例 toBe(false) |

声明合计 **3 test / 0 it**（机械计数 grep `test(`/`it(`）。

## 3. 真实断言

- `:14` `expect(controller.dispatch('next')).toBe(true)`；`:15` `expect(calls).toEqual(['high:next', 'low:next'])`——高优先级先被调用但 return false，低优先级随后消费。
- `:24`/`:25` `dispatch('confirm')` toBe(true)、calls toEqual `['confirm']`（p1 未被调用=消费即停）；`:27`/`:28` 注销后 dispatch toBe(true)、calls toEqual `['confirm', 'unexpected']`（注销生效）。
- `:34-38` `isEditableTarget` 五个鸭子对象：INPUT/TEXTAREA/isContentEditable/closest 命中 .ProseMirror → toBe(true)；`{tagName:'BUTTON', closest:()=>null}` → toBe(false)。

## 4. 未覆盖与脆弱点

- **未覆盖**：同优先级注册序倒序（`navigation-controller.ts:45` 的 `b.sequence - a.sequence`）无断言；空 Set 分发返回 false；注销不存在条目；多动作枚举（仅 next/confirm 两值）。
- **脆弱点**：用例 1 依赖 `sort` 稳定语义之外的显式 sequence 排序（行为由实现保证）；鸭子替身与真实 DOM 的 `closest` 差异未验证。
- 断言≠运行：本轮 `NOT_RUN`，bun test 未执行，通过状态未知。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例设置/动作/断言如上 | 已证实 | `:1-40` 全文逐行 |
| 声明计数 3 test/0 it | 已证实（机械计数） | grep `test(`/`it(` |
| 真实运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| dispatch 优先级降序 | §2.1/§3 | 8-16 | covered |
| 消费即停+注销 | §2.2/§3 | 18-29 | covered |
| isEditableTarget 鸭子判定 | §2.3/§3 | 33-39 | covered |
| 同优先级倒序/空 Set | §4 | - | unknown（未覆盖） |
