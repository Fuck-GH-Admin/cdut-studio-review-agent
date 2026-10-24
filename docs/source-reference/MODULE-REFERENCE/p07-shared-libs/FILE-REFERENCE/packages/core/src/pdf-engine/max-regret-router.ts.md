---
path: packages/core/src/pdf-engine/max-regret-router.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ce74f086e2d998ee34c00d0859f9c786c6f405f8
sha256: 0893ed7f6388f1356ef98e52fc243f653a0301fedc54dc8b281b118ef1dca688
lines: 335
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-05-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---

# packages/core/src/pdf-engine/max-regret-router.ts

## 1. 结论与边界

Category B **最大悔标图拓扑排序**：解决双栏/多栏学术排版阅读顺序。对节点全对构造亲和度边，迭代锁定"最优-次优得分差（悔标）最大"的边再剪枝（`max-regret-router.ts:1-10`）。纯函数、无 I/O。仅支持 1/2 栏（无多栏 boundaries，见 §10）。

## 2. 导出与关键符号

`export` 逐条核：12 个导出（2 接口 + 8 函数 + 2 评分/上下文）——逐条：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `ColumnLayout` | 导出接口 | `:16` | `{boundaries:number[], columnCount}` | 单栏 boundaries=[] |
| `RouterContext` | 导出接口 | `:22` | columns/lineHeight/columnWidth/terminalByColumn | 路由上下文 |
| `looksLikeSectionHeading` | 导出函数 | `:44` | `(text): boolean` | `SECTION_HEADING_PATTERN`（`:33`）：数字编号 ≤4 级或 Abstract/Introduction/Conclusion(s)/References/Acknowledg/Appendix 前缀 |
| `detectColumnLayout` | 导出函数 | `:58` | `(nodes): ColumnLayout` | 分栏探测 |
| `columnIndexOf` | 导出函数 | `:81` | `(node,layout): number` | 栏序号（0 起，单栏恒 0，`:82`） |
| `buildRouterContext` | 导出函数 | `:123` | `(nodes): RouterContext` | 行高/栏宽中位（fallback 0.03/0.4，下限 0.005/0.05，`:125-131`） |
| `scoreColumn` | 导出函数 | `:139` | `(u,v,ctx): [-1,1]` | 分栏一致性 |
| `scoreGeometry` | 导出函数 | `:174` | `(u,v,ctx): [0,1]` | 几何连续性 |
| `scoreLinguistic` | 导出函数 | `:183` | `(u,v): [-1,1]` | 语言学先验 |
| `computeAffinity` | 导出函数 | `:211` | `(u,v,ctx): number` | `0.40*col+0.35*geo+0.25*ling`（`:213`）；自环 -1（`:212`） |
| `reconstructChainsToOrderedList` | 导出函数 | `:243` | `(nodes,chosenSuccessor): LayoutNode[]` | 链还原 |
| `solveMaxRegretReadingOrder` | 导出函数 | `:278` | `(nodes): LayoutNode[]` | 主求解（原地写 readingOrderIndex） |

内部：`isSpanning`（`:39`，宽 ≥0.7 跨栏，`:36`）、`computeColumnTerminals`（`:91`）、`median`（`:112`）、`wouldCreateCycle`（`:219`）、`compareNodes`（`:236`，页→y→x）。

## 3. 内部逻辑与关键流程

- `detectColumnLayout`（`:58-78`）：剔跨栏块（`:59`）；<2 块→单栏（`:60`）；左区 `x0<0.45&&x1<=0.55`、右区 `x0>=0.45&&x1>0.55`（`:63-64`）；中轴穿越 `x0<0.47&&x1>0.53`（`:67`）；判据=**左右各 ≥1 块 且 穿越比 <0.2 → 双栏 boundaries=[0.5]**（`:72-75`）。**注释（`:53-56`）写"左半区 ≥2 且右半区 ≥2"、注释区界 `[0.05,0.48]/[0.52,0.95]` 与代码不符**（照实记录，§10）。
- `scoreColumn`（`:139-171`）：单栏 down→±1（`:142-144`）；u 跨栏→v 须在 `u.bbox[3]` 下方（否则 -1，`:153`）、后继左栏 1.0/右 0.7（`:154`）；v 跨栏须在下方（`:157-159`）；同栏 down→±1（`:161-163`）；跨栏仅左→右（`:166`）且 u 在栏底（`terminalByColumn` 或 y1≥0.85，`:167`）+ v 在栏顶（y0≤0.25，`:168`）→0.95（`:169`），否则 -1（`:170`）。
- `scoreGeometry`（`:174-180`）：`exp(-gap/(3*lineHeight)) × clamp01(1-|Δx|/columnWidth)`。
- `scoreLinguistic`（`:183-205`）：未完句尾 `[,\-;(\[]$` + 小写/收尾标点起→1.0（`:188,193-195`）；句末标点 + 大写/CJK/标题起→0.5（`:197-199`）；未完句跳标题→-0.8（`:201-203`）；其余 0。
- `solveMaxRegretReadingOrder`（`:278-335`）：≤1 节点直接写序号返回（`:279-284`）；迭代（`:292-328`）对每个可选源算候选（跳自环/成环，`:303-304`，`wouldCreateCycle` 步限 `nodes.length`，`:219-233`），`regret=top1-top2`（无次优记 **-1.0**，`:313-314`），锁最大悔标边（`:316-320`），源/目标集合收缩（`:326-327`）；无候选 break（`:323`）；`reconstructChainsToOrderedList` 链头（无入边）按页→y→x 拼链（`:248-261`），**兜底循环保证不丢节点**（`:262-268`）；原地写回 `readingOrderIndex`（`:331-333`）。

## 4. 调用者与调用链

- 入向：`pdf-engine.ts:21,121,125,127`（排序+栏归属回填）；`native-segmenter.ts:13`（`looksLikeSectionHeading` 用于分类）。
- 出向：类型 `./types`（`:12`）。
- 测试：无直接单测（检索=全树 `*.test.ts`）；域外 `pdf-engine/__tests__/max-regret-router.test.ts` 3 用例（双栏不交叉穿插/分栏探测识别双栏/单栏自上而下，断言体未逐行核）。

## 5. 数据 I/O、读写与副作用

无 I/O；**原地写** `node.readingOrderIndex`（`:281,332`）——副作用限于入参节点对象。`pdf-engine` 随后会以全局序再次覆盖主流节点（见 pdf-engine 手册）。

## 6. 分支、失败、取消与恢复

无抛错路径；防环（`wouldCreateCycle`）+ 步限防死循环；无候选即 break 兜底（`:323`）+ 链还原兜底循环（`:262-268`）。无取消机制。

## 7. 权限与权威状态

无权限分支，依据：纯函数。

## 8. 修改影响面

排序/栏归属直接影响 `readingOrderIndex`/栏序号与序列化顺序（文档正文顺序）；`native-segmenter` 依赖 `looksLikeSectionHeading` 的分类结果；`detectColumnLayout` 也供 `pdf-engine.ts:125` 回填栏归属。

## 9. 测试证据

`NOT_RUN`。直接测试：无。域外 3 用例（§4）。缺口：三维打分各分支、悔标选择、防环、兜底拼接无直接断言。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| §3 全部判据/权重/阈值/防环/兜底 | 已证实 | `:33-335` 逐行 |
| 注释"左右各 ≥2"与代码 ≥1 不符；注释区界与代码判据不符 | 已证实（矛盾存在） | `:53-56` vs `:63-64,73` |
| 仅支持 1/2 栏（scoreColumn 注释提"多栏"但无 boundaries 生成路径） | 已证实 | `:74,77` 仅 [0.5] 或 [] |
| 原地写 readingOrderIndex | 已证实 | `:280-282,331-333` |
| 对真实双栏论文的排序正确性 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 12 导出 + 5 内部 | §2 | 16-240 | covered |
| 探测/打分/求解全流程 | §3 | 58-335 | covered |
| 注释≠实现 2 处 | §10 | — | covered（照实记录） |
| 测试 | §9 | — | covered（缺口如实） |
