---
path: apps/electron/src/renderer/components/onboarding/coach-tour/coach-tour-position.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9a23e07f7fa83f34f8c44c2025ade7164318e7a9
sha256: bbac996ddaf82644fc4014f6f5f3c5ecbc1ee30233960fa57b1271e0da5e0c54
lines: 110
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-01-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/onboarding/coach-tour/coach-tour-position.ts

## 1. 结论与边界

**CoachTour 气泡定位纯几何模块**（110 行）：从 Overlay 抽出、零 React/DOM 依赖（便于 bun test 固化，注释 `:2-5`）——方位回退、视口钳制、锚点缺失/近全屏降级、多矩形外接。

边界：不做 DOM 测量（调用方给矩形/尺寸）；常量 `SPOTLIGHT_PADDING=8`/`CARD_GAP=14`/`VIEWPORT_MARGIN=12`（`:27-29`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `AnchorRect`/`CardSize`/`ViewportSize` | 导出接口 | 8-23 | `{left,top,width,height}` 等 | 输入形状 |
| `CoachTourPlacement` | 导出类型 | 25 | `'top'\|'bottom'\|'left'\|'right'\|'auto'` | 偏好方位 |
| `computeCardPosition` | 导出函数 | 38-90 | `(rect, card, placement, viewport) => {left, top}` | 主定位 |
| `unionRects` | 导出函数 | 97-110 | `(rects: AnchorRect[]) => AnchorRect \| null` | 外接矩形 |
| `clamp` | 内部函数 | 92-94 | `(value, min, max)` | |

导出计数：`export` 6 条（接口 3：`:8`、`:15`、`:20`；类型 1：`:25`；函数 2：`:38`、`:97`），与源码逐条一致。

## 3. 内部逻辑与关键流程

- **computeCardPosition**（`:38-90`）四层规则（注释 `:31-37`）：
  1. `rect == null` → 视口居中（`:46-51`，min 12 边距）。
  2. `rect 面积 ≥ 80% 视口` → 水平居中、垂直放下缘（`vh - card.height - 24`，`:53-58`）。
  3. 方位回退链（`:66-75`）：`auto` 尝试 `['bottom','top','right','left']`；显式偏好时 `[placement, 'bottom','top','right','left']`；逐个判空间（padded ±8 后 +14 gap + card 尺寸 ≤ 视口-12），首个放得下的即 `chosen`（放不下保持 `candidates[0]`）。
  4. 按 chosen 计算左上角（bottom/top 水平居中、left/right 垂直居中，`:77-84`），最后 `clamp` 进 `[12, 视口-卡片-12]`（`:86-89`，max 取 `Math.max(12, ...)` 防极小视口反转）。
- **unionRects**（`:97-110`）：空数组 → null；否则四向极值外接（`width=right-left` 等）。

## 4. 调用者与调用链

- 入向（全冻结树 `grep coach-tour-position|computeCardPosition|unionRects`，apps+packages 全类型）：
  - `apps/electron/src/renderer/components/onboarding/coach-tour/CoachTourOverlay.tsx:37` import；`:62` `unionRects`（`findStepRect` 的 unionSelectors 联合）、`:356` `computeCardPosition`（渲染期定位）。
  - `coach-tour-position.test.ts:9`（同批专属测试，12 用例）。
  - `coach-tour-steps.ts:19` import 类型 `CoachTourPlacement`（步骤数据形状）。
- 出向：无（纯函数）。

## 5. 数据 I/O、读写与副作用

- 无 I/O、无副作用；纯数值计算。

## 6. 分支、失败、取消与恢复

- 全部分支列于 §3；无 throw 路径；`candidates[0] ?? 'bottom'` 兜底（`:69`）。
- 极小视口：clamp 的 `Math.max(12, ...)` 保证 min≤max（`:87-88`）；测试用 360×400 视口固化（`coach-tour-position.test.ts:72-82`）。
- 不适用：取消/恢复（纯函数）。

## 7. 权限与权威状态

- 无权限分支，依据：纯几何函数，无外部输入边界。

## 8. 修改影响面

- 消费方：`CoachTourOverlay`（定位/联合锚点）、`coach-tour-steps`（类型）。
- 常量（8/14/12、0.8 面积阈值）变化会改变引导视觉行为；`coach-tour-position.test.ts` 12 用例硬编码期望值（如 86/282/588/262），改动常量会先红（注释 `:4-5`）。

## 9. 测试证据

- 直接测试：`coach-tour-position.test.ts`（105 行，`bun:test`，**12 test**，NOT_RUN）——`computeCardPosition` 8 用例（缺失居中 `:18-24`、右侧定位 `:26-32`、auto 优先下方 `:34-39`、底部回退上方 `:41-47`、右缘钳制 `:49-54`、right 回退 bottom `:56-62`、近全屏下缘 `:64-70`、极小视口钳制 `:72-82`）+ `unionRects` 4 用例（空/单/纵向/横向 `:85-104`）。断言逐条引用见同批测试手册。
- 未覆盖：left/top 方位的显式偏好路径、`unionRects` 多元素极值以外的退化。
- `NOT_RUN`：未运行 bun test/产品测试/typecheck/build/GUI；测试断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出+签名 | 已证实 | `:8-110` |
| 四层定位规则与回退链 | 已证实 | `:38-90` |
| 极小视口 clamp 防反转 | 已证实 | `:86-88` |
| 12 用例断言 | 已证实 | `coach-tour-position.test.ts:17-104` |
| 测试通过与否 | 未知 | NOT_RUN |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `computeCardPosition` 四规则 | §3/§9 | 38-90 | covered |
| 方位回退链 | §3/§9 | 66-75 | covered |
| `unionRects` | §3/§9 | 97-110 | covered |
| `clamp` | §3 | 92-94 | covered |
| left/top 显式偏好 | §9 | 70-84 | partial（无专属用例） |
| 运行结果 | §10 | — | unknown（NOT_RUN） |
