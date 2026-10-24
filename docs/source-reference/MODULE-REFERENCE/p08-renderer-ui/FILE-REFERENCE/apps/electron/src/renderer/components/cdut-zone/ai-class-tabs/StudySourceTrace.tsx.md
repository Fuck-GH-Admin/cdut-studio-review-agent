---
path: apps/electron/src/renderer/components/cdut-zone/ai-class-tabs/StudySourceTrace.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 19899e9d0bc0898db321e9aca19d532cd33146e4
sha256: af9d4d6ae2ab104f6eb3e719138158b177df728fc2b1664e898db4b4a24fecf9
lines: 108
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/ai-class-tabs/StudySourceTrace.tsx

## 1. 结论与边界

AI 速课堂「原文依据」学术溯源胶囊（文件头 `apps/electron/src/renderer/components/cdut-zone/ai-class-tabs/StudySourceTrace.tsx:1-9`）：把模型输出溯源锚点（`[第3页·核心定理](#f1:p3)` 或裸 `#f1:p3`）渲染为可点击胶囊——点击反查资料树文档页码/坐标，驱动右栏预览定位高亮，**复用对话流同一解析链路**（`resolveDocumentAnchor`+`documentHighlightTargetAtom`）。无可解析锚点（历史数据）**降级纯文本绝不丢信息**（`:8`）。

## 2. 导出与关键符号

`export` 逐条核对：1 个组件 = 1 个导出。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `StudySourceTrace` | 组件（导出） | 53-108 | `{sessionId,trace?,className?}` |
| `parseTrace`/`ParsedTrace`/`StudySourceTraceProps` | 内部 | 20-51 | Markdown 链接锚点或裸锚点解析（`label` 兜底=anchor，`:34`；裸锚点剥离尾标点，`:40`） |
| `DOCUMENT_ANCHOR_IN_TEXT_RE`/`pickAnchorIcon` | 外部 | 16 | `@/lib/document-anchor`（**单一口径来源**注释 `:18`） |

## 3. 内部逻辑与关键流程

`handleOpen`（`:60-84`）：`resolveDocumentAnchor(anchor,{sessionId,label})`→`setHighlight`（requestId=Date.now+随机，`:67`）→`openPreview(previewOnly+readOnly)`；失败 console.warn 不打断；`busy` 防重入。渲染：空→null；解析失败→纯文本（`:87`）；否则胶囊按钮（图标按 label 推断 `:89`）。

## 4. 调用者与调用链

入向：AI 速课堂结果区；测试：本批**无专属测试**（scope 无 `.test.ts`）。出向：jotai（preview-atoms）、`@/components/diff/preview-opener`、`@/lib/document-anchor`、`window.electronAPI.resolveDocumentAnchor`。

## 5. 数据 I/O、读写与副作用

IPC：`resolveDocumentAnchor`；副作用：高亮 atom 写入+预览打开。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| trace 空 | null | 86 |
| 解析失败 | 纯文本降级 | 87 |
| resolve 空/异常 | 静默返回/warn | 65,79-80 |
| busy | 防重入 | 61,94 |

## 7. 权限与权威状态

锚点口径权威=`@/lib/document-anchor`（与对话流统一，`:18`）；预览只读定位。

## 8. 修改影响面

改解析影响溯源定位；影响速课堂与对话流一致性。

## 9. 测试证据

本批**无专属测试**（scope 事实）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 降级不丢信息 | 已证实 | `:8,86-87` |
| 统一锚点口径 | 已证实 | `:18` |
| 真实定位流 | 未知 | 未运行 |
| 测试覆盖 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 单组件+解析 | §2,§3 | 20-108 | covered |
| 断言 | §9,§10 | — | unknown |
