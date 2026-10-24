---
path: packages/shared/src/types/study.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 96fec3c3239ff1c03a42fe882f62e679a49acadd
sha256: 38900b91abe41f0b528adb1bc4524d4703303d769495a5ca705c9309e2bc56ac
lines: 488
kind: source
package: p07-shared-libs
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/types/study.ts

## 1. 结论与边界

学习助手（Study/AI 课堂）**类型与常量模块**（`packages/shared/src/types/study.ts`，488 行）：文档大纲/认知画像/知识图谱/记忆卡/测验/AI 课堂 tab/IPC 通道。纯声明，无逻辑。

## 2. 导出与关键符号

`export` 共 **45 个**，按语义分 8 组：

**A. 文档与大纲（`:12-56`）**：`StudyDocumentType`（`:12`）、`StudyDocumentSection`（`:22-41`，含 `pageRange?/slideIndex?/sheetName?`）、`StudyDocumentOutline`（`:45-56`，含 `navigationMarkdown`）。

**B. 认知画像（`:65-79`）**：`StudentCognitionProfile`（`mastered/unlearned/fragile` 三清单 + `subject/targetGoal?/examDate?/lastUpdated`）。

**C. 段落检视（`:83-103`）**：`StudyInspectSectionParams`/`StudyInspectSectionResult`（`queryFocus?` 聚焦查询）。

**D. 限制与知识图谱（`:112-148`）**：`MAX_STUDY_DOCUMENTS_PER_SESSION = +∞`（`:112`）、`MAX_STUDY_DOCUMENT_SIZE_BYTES = +∞`（`:117`）、`ALLOWED_STUDY_EXTENSIONS`（`:119`）、`KnowledgeGraphGenerationMode`（`local_fast|ai_smart|ai_full`，`:133`）、`StudyGraphCostTier`/`StudyGraphCostEstimate`（`:136-148`，tokens/costCny/estimatedSeconds 双档估算）。

**E. 输入 DTO（`:154-183`）**：`StudyIngestDocumentsInput`/`StudyGraphGenerateInput`/`StudyDocumentQueryInput`/`StudyToggleDocumentActiveInput`/`StudySetDocumentsActiveInput`。

**F. IPC 通道（`:185-235`）**：`STUDY_IPC_CHANNELS`（学习侧通道集）。

**G. AI 课堂/记忆卡/测验（`:237-385`）**：`AiClassTabType`（home/mindmap/preview/flashcard/quiz，`:237`）、`AiClassRightTabItem`/`AiClassTabsState`（`:240-261`）、`AI_CLASS_HOME_TAB_ID='tab-home'`（`:264`）、`MindMapNode`/`MindMapData`（`:269-290`）、`FlashcardFsrsState`（`new/learning/review/relearning`，`:293`）、`FlashcardFsrs`（`:296-310`）、`FlashcardItem`/`FlashcardDeck`（`:313-335`）、`FlashcardRating`（`again/hard/good/easy`，`:338`）、`QuizQuestionType`（`single/multiple/boolean`，`:343`）、`QuizOption`/`QuizQuestion`/`QuizSession`（`:346-385`）。

**H. 学件与图谱（`:388-488`）**：`StudyArtifactKind`（mindmap/flashcard/quiz，`:388`）、`StudyGenerateArtifactInput`/`StudyGenerateArtifactResult`（联合结果，`:391-414`）、`StudyArtifactSummary`（`:417`）、`StudyCardRatingInput`/`StudyQuizAnswerInput`（`:428-445`）、`KnowledgeRelationType`（prerequisite/exercise/extension/reference，`:448`）、`KnowledgeGraphEdge`/`KnowledgeGraphData`（`:451-468`）、`AiClassSessionSummary`（`:471`）、`StudyTeachingMode`（`fast/balanced/strict`，`:488`）。

## 3. 内部逻辑与关键流程

无逻辑。值得注意的值语义：两个 `MAX_*` 限制为 `Number.POSITIVE_INFINITY`（`:112`、`:117`）——**当前不限数量/体积**（历史限额被放开，调用方不应据此做截断）。

## 4. 调用者与调用链

- 消费方：Study 服务/IPC 注册/preload/渲染层学习界面；`STUDY_IPC_CHANNELS` 是跨进程契约。
- 出向：无（纯类型）。

## 5. 数据 I/O、读写与副作用

无运行时行为。

## 6. 分支、失败、取消与恢复

不适用（无逻辑）。状态语义见各 enum 注释（如 `FlashcardFsrsState` 的 FSRS 四态，`:293`）。

## 7. 权限与权威状态

无身份语义。

## 8. 修改影响面

- `STUDY_IPC_CHANNELS`/DTO 字段变更需同步 Study 服务与渲染层。
- FSRS/测验/图谱形状与学习功能实现耦合。

## 9. 测试证据

- 纯类型无专属测试（全树检索本文件名测试命中 0）；行为在 Study 服务测试（不在本批）。
- **NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 45 个导出、8 组语义 | 已证实 | `grep -n "^export"` 全表 |
| `MAX_*` 为 +∞ | 已证实 | `:112`、`:117` |
| 无逻辑 | 已证实 | 全文声明 |
| Study 服务行为 | 未知 | 不在本批 |

## 11. 覆盖表

| 组 | 行 | 状态 |
| --- | --- | --- |
| A 文档/大纲 | `:12-56` | covered |
| B 认知画像 | `:65-79` | covered |
| C 段落检视 | `:83-103` | covered |
| D 限制/图谱成本 | `:112-148` | covered |
| E 输入 DTO | `:154-183` | covered |
| F IPC | `:185-235` | covered |
| G 课堂/卡/测验 | `:237-385` | covered |
| H 学件/图谱 | `:388-488` | covered |
