---
path: apps/electron/src/main/lib/study/cognition-engine.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: daa4f1a3b3d38ce61ceb20eaa38f9721e42a04a8
sha256: 3c8118ac45df57ecc81f239b8b0cc2e9c25fe50fab172d99856fd1b5512f71af
lines: 318
kind: test
package: p03-integrations
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# apps/electron/src/main/lib/study/cognition-engine.test.ts

## 1. 测试目标

认知子系统纯算法单元测试（`apps/electron/src/main/lib/study/cognition-engine.test.ts:1-6`）：FSRS-7 记忆动力学（BDD-SRS-01）、FIM 潜伏能力追踪（BDD-QUIZ-01）、思维导图布局/贝塞尔/OPML（BDD-MINDMAP-01）、```mindmap 解析、标题识别正则。**孤儿命名事实（照实记录）**：冻结树**无 cognition-engine.ts**（'cognition-engine' 全树零命中）——本测试跨模块覆盖 `fsrs-scheduler.ts`/`fim-estimator.ts`/`@profer/shared` mindmap 系/`markdown-normalizer.ts`。夹具：内联 MindMap 树（转专业政策树 `:141-156`、根/A/B/C 树 `:241-248`）。

## 2. 用例清单

共 **25 个 `test(`**（6 个 `describe`）：

### FSRS-7（BDD-SRS-01，6）

| # | 行 | 用例 | 断言要点 |
| --- | --- | --- | --- |
| 1 | 31-36 | R(t=S)=0.9 幂律标定 | toBeCloseTo 5 位×2、单调衰减 |
| 2 | 38-45 | 新卡 Again→learning+10 分钟 | nextReview=now+AGAIN_INTERVAL_MS、reps 1/lapses 0 |
| 3 | 47-53 | 新卡 Good→review 天级间隔 | state 'review'、间隔 ≥DAY |
| 4 | 55-73 | 四挡间隔单调 Again<Hard<Good<Easy | 3 不等式 |
| 5 | 75-88 | Again 累加 lapses→relearning | lapses 2、stability ≤ 原值 |
| 6 | 90-103 | 难度均值回归钳 [1,10] | 2 范围断言 |

### FIM（BDD-QUIZ-01，3）

| # | 行 | 用例 | 断言要点 |
| --- | --- | --- | --- |
| 7 | 110-116 | P 随 θ 单调、信息量为正 | 3 断言 |
| 8 | 118-130 | 答对升/答错降/钳 [-3,3] | 100 次循环钳制锚 |
| 9 | 132-142 | 整体估计+等级描述 | theta>0、describeTheta(2.5) 含 '卓越'/(-2.5) 含 '亟需' |

### 思维导图（BDD-MINDMAP-01，5）

| # | 行 | 用例 | 断言要点 |
| --- | --- | --- | --- |
| 10 | 157-165 | 布局覆盖全节点+根居中 | size 5、root (0,0,0)、半径 ≤461 |
| 11 | 167-170 | 前序遍历 | toEqual 5 id |
| 12 | 172-176 | 贝塞尔三次样条 | 正则锚 M…C…100.00 40.00 |
| 13 | 178-190 | OPML 嵌套+XML 转义 | 6 断言（`&lt;政策&gt;`/`_note`/UTC 日期） |
| 14 | 192-196 | 伴学 Prompt 含主题+自测 | toContain×2 |

### mindmap 解析（§7.2，4）

| # | 行 | 用例 | 断言要点 |
| --- | --- | --- | --- |
| 15 | 206-216 | Mermaid 缩进层级树 | label/子层 toEqual×2 |
| 16 | 218-226 | JSON 容错（label/text/name+children/nodes） | flatten toEqual 4 label |
| 17 | 228-233 | 形状包装剥离 | 4 toBe（`((…))`/`[…]`/`{{…}}`/裸） |
| 18 | 235-238 | 空输入 null（回退代码块） | 2 toBeNull |

### 整齐布局与径向连线（4）

| # | 行 | 用例 | 断言要点 |
| --- | --- | --- | --- |
| 19 | 250-255 | 叶子占比扇区坐标互不重合 | unique=total |
| 20 | 257-263 | 同级角度单调递增 | a<b<c |
| 21 | 265-279 | 圆心径向弧线退化直线（禁 S 回绕） | 正则 `C 500.00 …, 500.00 …` |
| 22 | 281-286 | 无圆心自适应退化 | toBe 精确路径 |

### 标题识别正则（3）

| # | 行 | 用例 | 断言要点 |
| --- | --- | --- | --- |
| 23 | 292-297 | 真编号标题升格 | 3 级 toContain |
| 24 | 299-310 | 年份/数量词/陈述句不误升格 | 3 not.toContain+3 toContain |
| 25 | 312-317 | 单空格编号识别+计量行不误升格 | 2 toContain+1 not |

## 3. 真实断言

逐条见 §2（关键锚）：`:33-35`（0.9 标定）；`:72-73`（四挡单调）；`:125-129`（钳制循环）；`:200-201`（'卓越'/'亟需'）；`:208-215`；`:245-247` 正则路径；`:293-316`（防误升格）。

## 4. 未覆盖与脆弱点

- 双曲布局头注与现实现不符（源注释已改线性环距——照实记录：用例 10 名称含「双曲」但断言为半径上限）。
- markdown-normalizer 仅 3 用例（批外模块）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 25 test/6 describe | 已证实 | 全文 |
| 孤儿命名（无 cognition-engine.ts） | 已证实（检索式见 §1，全冻结树） | caller 图 |
| 三子系统断言锚齐 | 已证实 | §2 |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| fsrs-scheduler | §2 | 1-6 | covered |
| fim-estimator | §2 | 7-9 | covered |
| shared mindmap 系 | §2 | 10-22 | covered |
| markdown-normalizer | §2 | 23-25 | covered（批外） |
