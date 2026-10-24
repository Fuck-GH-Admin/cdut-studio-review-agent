---
path: apps/electron/src/renderer/components/cdut-zone/AiClassView.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0120b262a561960cf656e3f123c5fa02324aa20f
sha256: 6f40b970dbf727eca70c827082c7de8fb05017c30f2adaf309dcd62e91a98af7
lines: 467
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/AiClassView.tsx

## 1. 结论与边界

「AI速课堂」**专属业务界面**（467 行）：视口约束三栏布局（禁全局滚动条 `:4`）——左栏资料上传/列表/资料树（w-80）、中栏专属对话（AiClassChatPanel `:6`）、右栏学习工作台（默认展开）。状态全量走 Jotai atoms（`:9`）。

## 2. 导出与关键符号

| 符号 | 行 | 行为 |
| --- | --- | --- |
| `AiClassView` | `:48` | **唯一 export**、无 props 容器：三栏编排+数据自取 |

内部：`ACCEPT_EXTENSIONS:45-46`（ALLOWED_STUDY_EXTENSIONS join）、`startRightPanelResize:60-75`（右栏拖宽 320px~60vw）、`activeDocument:80-83`（find→兜底 documents[0]）、挂载加载 effect（`study.listDocuments` `:89-90`，alive 竞态旗）、`ingestPaths:103-123`（`study.ingestDocuments`，按 documentId 去重追加）、`validateIncomingFiles:130-147`（白名单大小写不敏感+toast 过滤提示 `:142`）、`handleDrop:149`/`handleFilePick:156`/`handleRemove:162-171`/`handleToggleActive:178-197`。

## 3. 内部逻辑与关键流程

**子组件编排**：左栏 `AiClassStudyOverview`+资料列表（勾选框/文件名预览按钮/删除）+`AiClassKnowledgeTree`；中栏 `AiClassCognitionButton`+`AiClassCognitionModal`+`AiClassChatPanel`；右栏 `AiClassRightTabs`（sessionId 门控+空态）。**IPC**：`study.listDocuments/ingestDocuments/removeDocument/toggleDocumentActive`、`getPathForFile`（拖拽取路径 `:145`）、`useOpenPreview`（资料预览 `:332`，previewOnly+readOnly）。**文档契约**（`:173-177`）：enabled 激活态持久化，未勾选资料静默排除出 RAG/提示词。

## 4. 调用者与调用链

`CdutZoneView`（`:51`/`:326`，子agent 对拍）；出向 atoms（study-*/tab-atoms）、6 个子组件、preview-opener、sonner。

## 5. 数据 I/O、读写与副作用

IPC（资料 CRUD/预览）+atoms 读写；拖拽/文件选择输入。

## 6. 分支、失败、取消与恢复

listDocuments 失败仅 warn（`:96`）；ingest 失败仅 error（`:117`）；remove 失败 warn **不回滚**（`:166-170`）；toggle 失败 warn+**回滚**（`:193-196`）——失败策略不一致（矛盾②）。

## 7. 权限与权威状态

- **激活态=RAG 边界**（`:173-177`）：勾选决定资料是否进入检索与提示词（主进程持久化）。
- 上传白名单（`ALLOWED_STUDY_EXTENSIONS`）；"资料份数与体积限制已全量解除"（`:128`）。

## 8. 修改影响面

改编排影响速课堂全界面；atom/IPC 契约联动 study 族；资料勾选影响 RAG 行为。

## 9. 测试证据

无直接测试（目录仅 CdutZoneErrorBoundary.test.ts）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（矛盾照实记录，子agent 精读+字节核对）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件编排/IPC/atom 流 | 已证实 | 467 行全读（跨行调用拼接字节确认） |
| **①** 头注释 `:7`"右栏 w-72 预留扩展区"与实现不符（rightWidth 动态+已挂 RightTabs） | 已证实 | `:7` vs `:405-452` |
| **②** 失败策略不一致（remove 不回滚 vs toggle 回滚）；**③** activeDocument 兜底与置 null 语义轻微矛盾；**⑤** 删除无二次确认 | 已证实 | `:166-170`/`:193-196`/`:81`/`:170` |
| study-atoms/IPC 实现、RAG 级联清理 | 未知 | 不在本批 |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 唯一导出/三栏编排/IPC | §2/§3 | covered |
| RAG 边界契约 | §7 | covered |
| 3 矛盾 | §10 | covered |
