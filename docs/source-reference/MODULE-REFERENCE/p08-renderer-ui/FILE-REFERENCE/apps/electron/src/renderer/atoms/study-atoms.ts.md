---
path: apps/electron/src/renderer/atoms/study-atoms.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e9f0bfd5deb271843c35fa7f23a5daf26d35ca8e
sha256: f07ad732e9d2bedd21eb789f2a96ccf4208b966ab5cbb3027d4b7e394dfc53a2
lines: 200
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/study-atoms.ts

## 1. 结论与边界

**AI 速课堂状态 Atoms**（`apps/electron/src/renderer/atoms/study-atoms.ts:1-8`）：资料列表/选中资料/右栏折叠/解析中标记。**右栏多 Tab 拓扑、生成中标记、工件摘要均按 sessionId 隔离（Map 键控缓存）**——多课堂并行生成不串扰（A 生成中切 B，B 空闲可用，`:7-8`）。

## 2. 导出与关键符号

`export` 共 **25 个**（按真实行号）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `studyDocumentsAtom` | const | `:27` | — |
| `studyActiveDocumentIdAtom` | const | `:30` | — |
| `studyRightPanelCollapsedAtom` | const | `:33` | — |
| `studyRightPanelWidthAtom` | const | `:36` | — |
| `studyIngestingAtom` | const | `:39` | — |
| `studyLeftPanelCollapsedAtom` | const | `:42` | — |
| `studyKnowledgeGraphAtom` | const | `:45` | — |
| `studyGraphUpdatingAtom` | const | `:48` | — |
| `studyGraphModalOpenAtom` | const | `:51` | — |
| `studyGraphCostEstimateAtom` | const | `:54` | — |
| `studyGraphModeAtom` | const | `:57` | — |
| `studyGraphProgressAtom` | const | `:60` | — |
| `createAiClassHomeTab` | function | `:65` | — |
| `aiClassTabsMapAtom` | const | `:73` | — |
| `aiClassActiveTabIdMapAtom` | const | `:76` | — |
| `aiClassGeneratingMapAtom` | const | `:79` | — |
| `aiClassArtifactsMapAtom` | const | `:82` | — |
| `aiClassPendingArtifactAtom` | const | `:85` | — |
| `useAiClassTabs` | function | `:96` | — |
| `useAiClassActiveTabId` | function | `:115` | — |
| `useAiClassGenerating` | function | `:133` | — |
| `useAiClassArtifacts` | function | `:155` | — |
| `studyDataRevisionMapAtom` | const | `:183` | — |
| `useBumpStudyRevision` | function | `:186` | — |
| `useStudyDataRevision` | function | `:198` | — |

## 3. 内部逻辑与关键流程

UI 状态 atom 集；**sessionId Map 键控隔离**（`:7-8`）。

## 4. 调用者与调用链

- 消费方：速课堂 UI。
- 出向：Jotai。

## 5. 数据 I/O、读写与副作用

纯内存状态（或经注明的持久化）；无 I/O。

## 6. 分支、失败、取消与恢复

N/A（纯状态 atom，无分支逻辑）。

## 7. 权限与权威状态

**会话隔离是多课堂并行正确性契约**（`:7-8`，test 锁定）。

## 8. 修改影响面

atom 形状与消费组件耦合。

## 9. 测试证据

`study-atoms.test.ts`（82 行）直接覆盖会话隔离。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

导出集、会话隔离契约已证实（`:27-200`）；测试实际通过未知（NOT_RUN）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 导出集 | `:27-200` | covered |
