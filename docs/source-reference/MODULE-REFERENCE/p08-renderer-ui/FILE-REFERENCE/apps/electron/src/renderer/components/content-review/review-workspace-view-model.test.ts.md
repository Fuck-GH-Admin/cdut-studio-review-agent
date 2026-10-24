---
path: apps/electron/src/renderer/components/content-review/review-workspace-view-model.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9908094841916c6444b9ce5ad9280762b12ed220
sha256: dda9e18eb71b9a6ef0ce3d776a5141c8e3ef4d0a8d4f9af355068fbdbef0aa50
lines: 195
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-workspace-view-model.test.ts

## 1. 测试目标

`review-workspace-view-model.ts` 的 `buildReviewWorkspaceViewModel`（跨文件纯函数）：待办/已处理/决定准备度口径。被测逻辑属 review-workspace-view-model（不在本批 18 文件内，跨文件如实）。

## 2. 用例清单

1 个 describe + **15 个 `test()`**：未处置进待办且禁最终决定（`:29`）、**处置按当前 runId+inputHash 生效，旧输入不生效**（`:37`）、整案驳回关待办但保留「未逐条确认」语义（`:52`）、过期运行禁最终驳回（`:70`）、四类待办统一显示（`:75`）、**材料读取以当前运行账本为准不误报未读**（`:86`）、部分读取显示+保留原因（`:99`）、**failed 材料残留 usage=read 占位块仍待处理**（`:117`）、无置信度不显示 0%（`:128`）、审核员忽略→仅已处理（`:138`）、人工核对回执→不待读（`:145`）、决策期材料槽待办（`:152`）、**高置信度不能跳过与规则相关事实的确认**（`:159`）、未认定事项即待办（`:169`）、三类展示分组+优先级+共享决定准备度（`:176`）。

## 3. 真实断言（代表性）

- `:31-34` 待办含 `check:check-1`；canDecide false/canReject true/status 'needs-attention'。
- `:43-49` 当前处置→待办 0 已处理 1 canDecide true；旧 inputHash 处置→待办 1 canDecide false。
- `:63-67` closedActions 含 detail **「不表示该条 AI 发现或材料已被逐项确认」**。
- `:96/:110-114/:122-125` 材料三态（已读不待办/partially-read 显示原因/空占位「空占位内容不能证明读过原件」）。
- `:134` 无置信度文案「尚未人工核对；本次提取未提供置信度」。
- `:166` 规则相关事实仅 `待核实：获奖等级 省级`（非相关 hobby 保持安静）。
- `:189-193` 首项 check+verify 组、三组齐、decisionReadiness 未就绪。

## 4. 未覆盖与脆弱点

被测函数本体跨文件未读；断言含中文文案耦合。**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 15 用例断言如 §3 | 已证实 | 逐行读 `:1-195` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| 待办/处置/材料/事实/决定准备度 | 15 | covered |
| view-model 实现本体 | — | unknown（跨文件） |
