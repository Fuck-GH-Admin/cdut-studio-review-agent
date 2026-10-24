---
path: packages/shared/src/utils/mindmap-engine.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 15291e99532c6f0fe847712c0b9bc5e8d33e3c2c
sha256: 30514e2b5955f1caa2e9e6ee4b67733f327e3c15f2ec9caf9baa85789246e193
lines: 209
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/mindmap-engine.test.ts

## 1. 测试目标

BDD：思维导图核心引擎（`packages/shared/src/utils/mindmap-engine.test.ts:1-3`）——贝塞尔连线平滑性、气泡尺寸估算、线性自适应环距布局、光标锚定缩放矩阵。被测 `buildBezierPath`/`estimateMindMapNodeSize`/`layoutMindMap`/`computeAnchorZoomPan`。夹具：`parseBezier`（SVG path 解析控制点，`:9-18`）、`pt()`、`busyRoot`（8 宽标签分支压力树，`:113-122`）。

## 2. 用例清单

共 **15 个 `it(`**（4 个 `describe`）：

### BDD-MINDMAP-01 `buildBezierPath`（6）

| # | 行 | 用例 | 断言要点 |
| --- | --- | --- | --- |
| 1 | 21-28 | 根在圆心+子节点左侧 → 控制点向左无环绕 | `c1[0]<0`、`c2[0]<c1[0]`、`c2[0]>-200`（回归：atan2(0,0) 退化） |
| 2 | 30-36 | 根在圆心+正上方 → 无水平偏移 | `c1[0]`/`c2[0]` toBe 0、`c1[1]<0` |
| 3 | 38-47 | 起终点偏离圆心 → 径向向外不回绕 | `rC1>r0`、`0<rC2<r1` |
| 4 | 49-55 | 无中心 → 水平 S 曲线锚起终点纵坐标 | `c1[1]` 0、`c2[1]` -80、`0<c1[0]`、`c2[0]<300` |
| 5 | 57-61 | 起终点重合 → 退化直线无 NaN | toContain `'L 50 50'`、not.toContain 'NaN' |
| 6 | 63-80 | 完整导图全连线无 NaN 且根在原点 | root 位置 (0,0)、逐线 not.toContain 'NaN' |

### BDD-MINDMAP-SIZE-01 `estimateMindMapNodeSize`（2）

| # | 行 | 用例 | 断言要点 |
| --- | --- | --- | --- |
| 7 | 83-89 | 任意文案宽度夹 [84,160] 且高 ≥30 | 5 文案循环 |
| 8 | 91-97 | 超长文案触发换行高度增加 | `long.height > short.height` |

### BDD-MINDMAP-LAYOUT-01 `layoutMindMap`（4）

| # | 行 | 用例 | 断言要点 |
| --- | --- | --- | --- |
| 9 | 124-134 | 8 宽标签分支 → 环半径严格单调递增 | 父<子且差 >100（杜绝深层贴合） |
| 10 | 136-147 | 同环多节点不重叠 | 弦长 `2r·sin(π/n)` > 气泡全宽 |
| 11 | 150-156 | 圆盘上限 → 全节点半径 ≤limit+1 | limit 400 |
| 12 | 158-163 | 覆盖全部节点且坐标互不重合 | size=25、unique 坐标数=25 |

### BDD-MINDMAP-02 `computeAnchorZoomPan`（3）

| # | 行 | 用例 | 断言要点 |
| --- | --- | --- | --- |
| 13 | 166-186 | 锚点场景点缩放前后投影同一屏幕位置 | 3 组用例投影误差 <1e-9 |
| 14 | 188-197 | 连续两次相反缩放可逆回初始 pan | toBeCloseTo(…, 12)×3 |
| 15 | 199-207 | 非法缩放值原样返回无 NaN 污染 | toEqual(prev)×3（NaN/0/zoom 0） |

## 3. 真实断言

逐条见 §2（关键锚）：`:24-27` 三不等式；`:40-45` 半径双向断言；`:71-78` 全线 NaN 扫描；`:85-88` 夹取循环；`:130-132` 父子差；`:145` 弦长；`:153-154` 上限循环；`:161-162` 唯一性；`:182-185` 1e-9 投影；`:193-195` 12 位可逆；`:201-207` 三 toEqual。

## 4. 未覆盖与脆弱点

- `parseMindMapText`/`stripMermaidNodeLabel`/`mindMapToOpml`/`flattenMindMap`/`buildNodeStudyPrompt` 本文件未测（由批外 `cognition-engine.test.ts` 覆盖部分）。
- 用例 3 的 135°/45° 注释与断言口径（半径）而非角度本身。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 15 it/4 describe | 已证实 | 全文 |
| atan2(0,0) 回归锚 | 已证实 | `:22-28` |
| 布局不重叠/单调/上限三约束 | 已证实 | `:124-163` |
| 缩放矩阵可逆+非法防护 | 已证实 | `:166-207` |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| buildBezierPath 两模式+退化 | §2 | 1-6 | covered |
| 尺寸估算 | §2 | 7-8 | covered |
| 布局三约束 | §2 | 9-12 | covered |
| 锚定缩放 | §2 | 13-15 | covered |
| 解析/OPML 面 | §4 | — | unknown（批外覆盖） |
