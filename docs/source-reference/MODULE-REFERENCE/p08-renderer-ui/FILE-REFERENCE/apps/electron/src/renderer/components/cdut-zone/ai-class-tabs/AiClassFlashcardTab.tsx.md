---
path: apps/electron/src/renderer/components/cdut-zone/ai-class-tabs/AiClassFlashcardTab.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d38d594dd2ebc22fcb007611c66b046cf2525762
sha256: 239f6f6519205fc4987ab3ceeb95fa88c27ad91b6d7f00f68a288cd4967c2fbc
lines: 378
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/ai-class-tabs/AiClassFlashcardTab.tsx

## 1. 结论与边界

AI 速课堂抽认卡视图（FSRS-7 记忆调度）（文件头 `apps/electron/src/renderer/components/cdut-zone/ai-class-tabs/AiClassFlashcardTab.tsx:1-13`）。本轮复习模型（**替代旧版「评分后永远 +1 循环」鸡肋设计**）：①本轮队列一次性 Fisher-Yates 打乱逐张推进，**消费完即结束绝不静默无限循环**（旧版回到第 1 张用户误以为卡片太多）；②结算页（评分分布/掌握率/卡组进度）+「再来一轮」/「只重练薄弱卡」；③题号导航面板按状态着色可跳转。每次评分经主进程 FSRS-7 引擎推进记忆状态并落盘+通知速览刷新。

## 2. 导出与关键符号

`export` 逐条核对：1 个组件 = 1 个导出。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `AiClassFlashcardTab` | 组件（导出） | 76-378 | `{sessionId,deckId}`（`:33-36`） |
| `RATINGS`/`RATING_TONE` | 内部常量 | 41-53 | 四挡（重来 10 分钟后/困难/良好/轻松）+色 |
| `shuffle` | 内部 | 56-65 | Fisher-Yates |
| `historyStateOf`/`CardHistoryState` | 内部 | 68-74 | `new/reviewing/due`（导航着色） |
| `RoundMode` | 内部 type | 39 | `'all'\|'weak'` |

## 3. 内部逻辑与关键流程

- `startRound`（`:91-101`）：weak 模式取 again/hard 卡；**弱卡为空改复习全部并提示**（`:93-95`）；打乱+清评分+复位。
- 加载（`:103-127`）：alive 旗标；进入即打乱队列。
- `rate`（`:134-158`）：`updateCardRating`→FSRS 推进（reps/nextReview）→`bumpStudyRevision`；**顺序推进队列尽头即结束**（`:151-152` 注释杜绝无限循环观感）。
- 结算页（`:211-254`）：掌握率=（良好+轻松）/已评；「只重练薄弱卡」`weakCount===0` 禁用。
- 翻转卡（`:257-275`）：正面问题/背面解析+`sourceAnchor` 出处；**评分需先翻面**（未翻转 `pointer-events-none opacity-40`+disabled，`:278-283`）。
- 题号导航（`:324-375`）：网格 10 列按状态着色（本轮已评用 `RATING_TONE`/已复习绿/待复习琥珀/未学灰）+当前卡 ring 高亮。

## 4. 调用者与调用链

入向：AI 速课堂右栏抽认卡 Tab；测试：本批**无专属测试**（scope 无 `.test.ts`）。出向：`@profer/shared`（类型）、`@/atoms/study-atoms`、`window.electronAPI.study`（getFlashcards/updateCardRating）。

## 5. 数据 I/O、读写与副作用

IPC：getFlashcards/updateCardRating；学习版本号 bump；Toast；本地队列/评分/翻转状态。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| 弱卡为空 | 改全部+提示 | 93-95 |
| 评分失败 | toast | 153-154 |
| 队列尽头 | 结束不循环 | 151-152,131 |
| 未翻面 | 评分禁用 | 278-283 |
| 空卡组 | 空态 | 173-175 |

## 7. 权限与权威状态

记忆状态权威=主进程 FSRS-7（评分落盘）；本轮队列仅 UI 状态。

## 8. 修改影响面

改复习模型影响记忆体验；改导航影响定位。

## 9. 测试证据

本批**无专属测试**（scope 事实）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 一次性队列/不循环 | 已证实 | `:4-6,151-152` |
| 结算/薄弱重练 | 已证实 | `:211-254` |
| 导航着色状态机 | 已证实 | `:68-74,324-375` |
| 真实 FSRS 推进 | 未知 | 未运行 |
| 测试覆盖 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 单组件+helpers | §2,§3 | 33-378 | covered |
| 断言 | §9,§10 | — | unknown |
