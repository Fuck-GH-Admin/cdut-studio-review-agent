---
path: apps/electron/src/renderer/components/cdut-zone/AiClassStudyOverview.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3130dcf811fa7bbb76beb15cba9fcd2cb90e4192
sha256: 1595eec63a6b977c4bb2d08285075d4647cd89015067f9f131f7a31fdcbe938d
lines: 147
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/AiClassStudyOverview.tsx

## 1. 结论与边界

左栏**「学习情况速览」卡**（147 行）：4 指标——学习总进度（复习进度+测验完成度加权）、核心概念（导图节点数）、自测评估（得分+FIM θ）、重点闪卡（复习卡数）；数据 Jotai+study IPC 实时查询**无本地缓存**（`:2-9`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `AiClassStudyOverview` | `:19-132` | 唯一 export：`({sessionId})`：IPC 聚合 4 指标渲染 |

内部：`cnQuiz:134-142`（<60 rose/<70 amber/<90 sky/≥90 emerald）、`cnFlashcard:144-147`；`useAiClassArtifacts`+`useStudyDataRevision`（写操作自增触发刷新）。

## 3. 内部逻辑与关键流程

effect（sessionId/artifacts/revision 依赖 `:28-51`）：`study.getQuiz`+`study.getFlashcards`（`fsrs.reps>0` 计复习数 `:44`，**失败静默**）；派生（`:53-77`）：mindmapNodes、flashcard 实时优先（`:57-63` 注释：历史 Bug"抽认卡对速览毫无影响"）、总进度等权平均（`:66-74`）、thetaLabel 三档（0.5/-0.5，`:76-77`）；渲染（进度条 >0 最小 4% `:92`、三格、FIM 认知条 `:113-129`）。

## 4. 调用者与调用链

`AiClassView.tsx:40/362`；出向 study-atoms、`@profer/shared`（QuizSession）、IPC getQuiz/getFlashcards（preload:2074/2077 对拍）。

## 5. 数据 I/O、读写与副作用

IPC 查询（无缓存）；atoms 读。

## 6. 分支、失败、取消与恢复

IPC 失败静默→0/—/0%；session 切换短暂陈旧（旧值保留至新值返回）。

## 7. 权限与权威状态

闪卡指标以**实时学习数据**为准（`:57-63` 注释明确 itemCount 仅兜底——历史 Bug 修复）；θ 阈值本地三档。

## 8. 修改影响面

改指标口径影响速览可信度；revision 机制联动 study-atoms。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（矛盾照实记录，子agent 精读+字节核对）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件 4 指标/派生/渲染 | 已证实 | 147 行全读（IPC/原子/类型对拍） |
| **(a) 孤儿 import**：`describeTheta`（`:16`）导入未用（字节核对仅现于 import 行）；手写三档标签与共享版 6 档语义不同（疑改版残留） | 已证实 | `:16`/`:76-77` |
| **(b)** 头注释"加权合成"与实现等权平均（`:66` 注释"各占 50%"才准确）；**(c)** "自测得分"vs UI"自测正确率"措辞混用；**(d)** quizRatio 用 questions.length 非 totalQuestions | 已证实 | `:5`/`:66-74`/`:101`/`:68-70` |
| getQuiz"最新一次"选择逻辑 | 未知 | 主进程不在本批 |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 唯一导出/4 指标/派生 | §2/§3 | covered |
| 孤儿 import+3 矛盾 | §10 | covered |
