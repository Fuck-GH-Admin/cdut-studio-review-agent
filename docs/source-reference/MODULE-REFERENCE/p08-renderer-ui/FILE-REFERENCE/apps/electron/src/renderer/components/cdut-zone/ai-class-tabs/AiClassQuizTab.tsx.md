---
path: apps/electron/src/renderer/components/cdut-zone/ai-class-tabs/AiClassQuizTab.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b0d63fc7bfcf9c26beaac56e49eb9ea995bb869e
sha256: b04b7322892c40e1a711b6b50eeae62eb1ad394d879a0b32173d149d1aed45bf
lines: 249
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/ai-class-tabs/AiClassQuizTab.tsx

## 1. 结论与边界

AI 速课堂自测练习视图（文件头 `apps/electron/src/renderer/components/cdut-zone/ai-class-tabs/AiClassQuizTab.tsx:1-7`）：单选/多选/是非交互；提交后即时判错溯源+考点解析+原文依据；**每题作答后主进程以连续 Fisher 信息矩阵更新潜伏认知能力 θ∈[-3,+3]**；完整作答结算页展示得分/能力评级/薄弱环节诊断。

## 2. 导出与关键符号

`export` 逐条核对：1 个组件 = 1 个导出。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `AiClassQuizTab` | 组件（导出） | 22-249 | `{sessionId,quizId}`（`:17-20`） |

内部分段：加载（`:30-54`，alive 旗标+**恢复既有 userSelection** `:43-47`）；`toggleOption`（`:56-65`，multiple 多选/其它单选；**已判分禁改** `:57`）；`submit`（`:67-92`，空选 toast 拦截+`submitQuizAnswer`+`bumpStudyRevision` 通知速览卡）；`handleResetQuiz`（`:94-106` 落盘重置回首题）。

## 3. 内部逻辑与关键流程

结算区（`:131-170`）：得分+**FIM θ 高对比条**（`:137` 注释：历史反馈原小字看不清）+`describeTheta` 评级+薄弱清单（错题截 40 字）+「再练一次」。题目区（`:172-246`）：选项三态样式（正确绿/错选红/未答）；判分后展示「判错溯源」`explanation`+「原文依据」`StudySourceTrace`（`:236-241`）。

## 4. 调用者与调用链

入向：AI 速课堂右栏测验 Tab；测试：本批**无专属测试**（scope 无 `.test.ts`）。出向：`@profer/shared`（`describeTheta`/类型）、`@/atoms/study-atoms`（bumpStudyRevision）、`./StudySourceTrace`、`window.electronAPI.study`（getQuiz/submitQuizAnswer/resetQuiz）。

## 5. 数据 I/O、读写与副作用

IPC 三调用；学习版本号 bump；Toast；本地 selections 状态。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| 空选提交 | toast 拦截 | 70-73 |
| 已判分 | 禁改/禁重提 | 57,68 |
| 提交/重置失败 | toast | 87-88,103-104 |
| 无题 | 空态 | 115-117 |

## 7. 权限与权威状态

判分/θ 权威=主进程（FIM 更新）；UI 仅呈现与交互。

## 8. 修改影响面

改交互影响练习体验；改结算呈现影响诊断。

## 9. 测试证据

本批**无专属测试**（scope 事实）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| FIM θ 契约/结算页 | 已证实 | `:1-7,131-170` |
| 判错溯源+原文依据 | 已证实 | `:229-243` |
| 真实判分流 | 未知 | 未运行 |
| 测试覆盖 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 单组件 | §2,§3 | 22-249 | covered |
| 断言 | §9,§10 | — | unknown |
