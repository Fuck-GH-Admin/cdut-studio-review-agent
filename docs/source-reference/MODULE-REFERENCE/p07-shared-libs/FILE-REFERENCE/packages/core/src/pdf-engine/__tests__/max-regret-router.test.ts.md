---
path: packages/core/src/pdf-engine/__tests__/max-regret-router.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5cd5a69a75fd5c9b1eb0900f0f916d20cd1ace72
sha256: a77db8d268478b13ad9157b8043a8973dc5757670d38e683f7d9d9a95f592a08
lines: 64
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/core/src/pdf-engine/__tests__/max-regret-router.test.ts

## 1. 测试目标

Max-Regret 阅读顺序推理（`packages/core/src/pdf-engine/__tests__/max-regret-router.test.ts:18`）：学术双栏「读完左栏再右栏、严禁交叉穿插」、分栏探测、单栏自上而下。被测 `solveMaxRegretReadingOrder`/`detectColumnLayout`（../max-regret-router）。夹具 `node()` 工厂（`:11-22`，LayoutNode 满字段+NormalizedBBox 归一坐标）。

**同名碰撞记录**：`wouldCreateCycle` 在 max-regret-router.ts:219 为私有函数（未导出）；shared `cslab-dag.ts:130` 导出版才是被 electron 引用的版本（cslab-canvas.test/CsLabDagCanvas）——两处语义无关。

## 2. 用例清单

共 **3 个 `test(`**（1 个 `describe`）：

| # | 行 | 用例 | 断言要点 | 依赖顺序 |
| --- | --- | --- | --- | --- |
| 1 | 23-39 | 学术双栏：左栏完再右栏，禁交叉 | 3 左+2 右 → `['L1','L2','L3','R1','R2']`、index `[0,1,2,3,4]` | 独立 |
| 2 | 41-54 | 分栏探测识别双栏结构 | `columnCount` 2、`boundaries` toEqual `[0.5]` | 独立 |
| 3 | 56-65 | 单栏自上而下 | 打乱输入（P3,P1,P2）→ `['P1','P2','P3']` | 独立 |

## 3. 真实断言

- `:35-36` id 序 toEqual、readingOrderIndex toEqual（双断言锚）。
- `:51-52` columnCount toBe 2、boundaries toEqual `[0.5]`。
- `:64` 单栏序 toEqual `['P1','P2','P3']`。

## 4. 未覆盖与脆弱点

- 三栏/跨栏通栏标题/栏数探测失败路径未测。
- `wouldCreateCycle`（私有）无独立锚。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 test、双栏禁交叉核心语义 | 已证实 | `:35-36` |
| 分栏边界 0.5 探测 | 已证实 | `:51-52` |
| wouldCreateCycle 碰撞已核实（electron 用 shared 版） | 已证实 | 子 agent 检索 |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| 双栏顺序 | §2/§3 | 1 | covered |
| 分栏探测 | §2/§3 | 2 | covered |
| 单栏排序 | §2/§3 | 3 | covered |
| 多栏/失败路径 | §4 | — | unknown |
