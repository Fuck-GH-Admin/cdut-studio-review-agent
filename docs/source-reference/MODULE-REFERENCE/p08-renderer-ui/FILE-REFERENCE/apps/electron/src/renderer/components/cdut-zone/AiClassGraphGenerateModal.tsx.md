---
path: apps/electron/src/renderer/components/cdut-zone/AiClassGraphGenerateModal.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5a2930455c2c16582127c768582126de49771ad9
sha256: edf6c1d26b9595dac3a0f03f802fbe2c7796f48c9b72ecfb6a3099a3a65d719b
lines: 289
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/AiClassGraphGenerateModal.tsx

## 1. 结论与边界

资料树「开始生成」**方案选择弹窗**（289 行）：面向非技术用户三档方案（一 纯本地极速 0 Token/二 云端 AI 智能精炼推荐/三 云端 AI 全量深度精读，`:2-8`）；顶部看板（资料份数/纯文本字数/知识切块数）+成本测算；状态全量 Jotai。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `AiClassGraphGenerateModal` | `:62-289` | 唯一 export：`({sessionId, onConfirm(mode), updating})`：估算 IPC→三卡选择→确认触发 |

内部：props `:28-34`、`formatTokens:36-40`（≥1 万"X.X 万"）、`formatChars:42-46`、`ModeCard:48-60`；三卡数据 `cardData:93-142`（local_fast/ai_smart/ai_full，estimate 缺失回退 '—'/'¥0.00'/时长区间）。

## 3. 内部逻辑与关键流程

open&&sessionId→`cdutAiClass.estimateGraphCost`（`:78`，失败静默 warn `:82`，alive 防竞态）；关窗重置 mode='ai_smart'（`:89-91`）；`boardSummary:147-150`（≤1 份文案分支）；卡片选中 ring-2+「已选择」；updating 进度看板（phase/percent/批次 `:245-264`）；`handleConfirm:152-155`（关窗→onConfirm(mode)）；开始生成 disabled=`updating||documents.length===0`（`:279`）。

## 4. 调用者与调用链

`apps/electron/src/renderer/components/cdut-zone/AiClassKnowledgeTree.tsx:50/967-970`（onConfirm→generate `apps/electron/src/renderer/components/cdut-zone/AiClassKnowledgeTree.tsx:811-829`→`cdutAiClass.generateGraphRelations`）；出向 study-atoms（5 原子）、`@profer/ui` Dialog、`@profer/shared`（KnowledgeGraphGenerationMode）。

## 5. 数据 I/O、读写与副作用

IPC 估算+atoms 读写；进度经 `studyGraphProgressAtom`（`apps/electron/src/renderer/components/cdut-zone/AiClassKnowledgeTree.tsx:793` onGraphProgress）。

## 6. 分支、失败、取消与恢复

估算失败静默+卡片回退文案；无错误横幅/重试；docs 空禁用确认。

## 7. 权限与权威状态

三档模式即 `KnowledgeGraphGenerationMode`（'local_fast'|'ai_smart'|'ai_full'，shared/study.ts:133 对拍一致）；成本展示为估算非承诺。

## 8. 修改影响面

改三卡影响生成入口；`estimateGraphCost` 契约联动主进程。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（矛盾照实记录，子agent 精读+字节核对）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件三卡/估算/进度看板 | 已证实 | 289 行全读（IPC/原子/类型实存对拍） |
| **(a)** `:188` 看板字数用 estimate??0 与 `:146` boardSummary 用 Σdoc 兜底不一致；**(b)** estimate 缺失 tokens'—' vs cost'¥0.00' 回退口径不一；**(c)** 0 份资料 boardSummary 说"1 份长篇资料"vs 看板"0 份" | 已证实 | `:95-99`/`:146-150`/`:182-188` |
| **(d)** 「后台运行」实为关弹窗无中止语义（生成在父组件继续）；**(e)** 估算原子不按 session 键控（跨课堂残留风险） | 已证实 | `:274`、原子定义 study-atoms.ts:54 |
| estimateGraphCost/generateGraphRelations 实现 | 未知 | 主进程不在本批 |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 唯一导出/三卡/估算链 | §2/§3 | covered |
| 5 矛盾 | §10 | covered |
