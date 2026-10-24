---
path: apps/electron/src/main/lib/study/study-session-store.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: bf4a89f1d33ce555573e72080f35cc0cd0ecc448
sha256: 512fc01fbc595b79fc3f2d78ec0adebaffb01c6cb9b454741fc65cc969dd12de
lines: 362
kind: source
package: p03-integrations
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/study/study-session-store.ts

## 1. 结论与边界

速课堂**会话状态存储**（`apps/electron/src/main/lib/study/study-session-store.ts`，362 行）：多 Tab 拓扑归一化（首页不变量）、思维导图/记忆卡/测验的会话级持久化。`STUDY_SESSION_STORE_VERSION=1`（`:38`）。

## 2. 导出与关键符号

`export` 共 **16**：

| 组 | 符号 | 行 |
| --- | --- | --- |
| 版本/Tab | `STUDY_SESSION_STORE_VERSION`（`:38`）、`createHomeTab`（`:51-55`）、`normalizeTabsState`（`:56-76`）、`getTabs`/`saveTabs`（`:77-111`） | |
| 思维导图 | `getMindmap`/`saveMindmap`/`saveMindmapCoords`（`:112-168`） | |
| 记忆卡 | `getFlashcards`/`saveFlashcardDeck`/`updateCardRating`（`:169-234`，FSRS 评级更新） | |
| 测验 | `getQuiz`/`saveQuiz`/`submitQuizAnswer`（`:235-362`） | |

| `resetQuiz` | 函数 | `:299-331` | 重置 Quiz 会话 |
| `listStudyArtifacts` | 函数 | `:332-…` | 学习工件摘要列表 |
## 3. 内部逻辑与关键流程

- **`normalizeTabsState`**（`:56-76`）：首页恒首位不可关、伪造 home 剔除、`activeTabId` 指向已关标签回退首页（`study-session-store.test` 4 用例锁定）。
- `updateCardRating`（`:193-234`）：FSRS 评级→卡状态更新。
- `submitQuizAnswer`（`:259-362`）：提交判分。

## 4. 调用者与调用链

- 消费方：速课堂面板（Tab/导图/卡/测验）。
- 出向：会话持久化（文件/DB）。

## 5. 数据 I/O、读写与副作用

会话状态读写（持久化）；无网络。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 伪造 home 标签 | `:56-76` | 剔除保唯一 |
| `activeTabId` 失效 | `:56-76` | 回退首页 |

## 7. 权限与权威状态

首页不变量（`:56-76`）是 UI 拓扑契约（BDD-TAB-01）。

## 8. 修改影响面

- Tab 归一化规则变更影响 UI 不变量。
- FSRS/测验评分口径耦合记忆效果。

## 9. 测试证据

`study-session-store.test.ts`（45 行，4 用例）覆盖 Tab 拓扑。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 16 导出、Tab 不变量 | 已证实 | `:38-362` |
| FSRS/判分语义 | 已证实（结构） | `:193-362` |
| 持久化实际行为 | 未知 | 未运行 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| Tab 归一化 | `:38-111` | covered |
| 导图/卡/测验 | `:112-362` | covered |
| 测试证据 | 9 | covered |
