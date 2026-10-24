---
path: apps/electron/src/renderer/atoms/overlay-atoms.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0dfd633cc1f3dfe0b23c2a72351348234b2af3bd
sha256: 1b3cb4d70bef93afa12fdba437ccb3bd89280214b2c336eba466ea4919cf1e61
lines: 41
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/overlay-atoms.test.ts

## 1. 测试目标

全局模态叠加态（Overlay Coordinator）的计数派生契约（41 行，bun:test，describe `:11`）：①0/正计数的遮挡判定；②嵌套关闭归零解除+多重回退不为负（保证原生视图不被永久隐藏，头注释 `:3-4`）。mock 边界：**无 mock**——用 `jotai` 的 `createStore()` 直接驱动真实 atom（不挂 React）。

## 2. 用例清单

依赖顺序：无（2 用例各自新 store）。

| # | 用例 | 行 | 设置 | 动作 | 断言 |
| --- | --- | --- | --- | --- | --- |
| 1 | 计数为 0 时无遮挡；> 0 时判定遮挡中 | 12-22 | `createStore()` | 读初始 → +1 → 再 +1 | 初始 count 0/isActive false；+1 后 isActive true；再 +1 后 count toBe(2) |
| 2 | 嵌套模态逐个关闭，计数归零后遮挡解除 | 24-40 | `createStore()`；+1 ×2 | 读 → `Math.max(0,c-1)` → 再 -1 → 第三次 -1 | 嵌套中 isActive true；归零后 count 0/isActive false；多重回退后 count 仍 toBe(0)（不为负） |

声明合计 **2 test / 0 it**（机械计数 grep `test(`/`it(`）。

## 3. 真实断言

- `:14-15` `expect(store.get(globalOverlayCountAtom)).toBe(0)`、`expect(store.get(isGlobalOverlayActiveAtom)).toBe(false)`。
- `:17-18` `store.set(globalOverlayCountAtom, (count) => count + 1)` 后 `isActive` toBe(true)。
- `:21` 二次 +1 后 count toBe(2)。
- `:28`/`:31` 嵌套期间 isActive toBe(true)（两次）。
- `:34-35` 归零后 count toBe(0)、isActive toBe(false)。
- `:39` 第三次回退后 count toBe(0)（`Math.max(0,…)` 防负，注释 `:37`）。

## 4. 未覆盖与脆弱点

- **未覆盖**：`useGlobalOverlay` hook（effect 注册/卸载/cleanup）——需 React 测试环境；并发 set 交错。
- **脆弱点**：用例 2 直接 `store.set` 模拟 hook 的 +1/-1 语义（与 `overlay-atoms.ts:34-35` 的 updater 同构），不是对 hook 的端到端验证。
- 断言≠运行：本轮 `NOT_RUN`，bun test 未执行，通过状态未知。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 用例设置/动作/断言如上 | 已证实 | `:1-41` 全文逐行 |
| 声明计数 2 test/0 it | 已证实（机械计数） | grep `test(`/`it(` |
| hook 运行面 | 未知 | 未覆盖（§4） |
| 真实运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 计数/派生判定 | §2.1/§3 | 12-22 | covered |
| 归零解除+防负回退 | §2.2/§3 | 24-40 | covered |
| `useGlobalOverlay` hook | §4 | - | unknown（未覆盖） |
