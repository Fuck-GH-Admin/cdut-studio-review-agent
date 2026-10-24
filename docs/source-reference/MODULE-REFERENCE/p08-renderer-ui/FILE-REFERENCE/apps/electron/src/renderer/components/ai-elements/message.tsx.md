---
path: apps/electron/src/renderer/components/ai-elements/message.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2d773edd7ef7ef3f369c2d2a87286e7924631a26
sha256: 6dc16d2304937b165f481f88787b259107dcf364624ce63dca00b134075384f2
lines: 1768
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/ai-elements/message.tsx

## 1. 结论与边界

**消息组件原语**（1768 行，本批最大件）：Message 族 10+ 组件 + Markdown 渲染器（react-markdown+KaTeX）+ 块级复制系统 + mention/wikilink 插件 + 附件渲染（`:2-17` 头注释，简化迁移自 profer-frontend）。双渲染路径：整段单 Markdown vs `enableBlockCopy` 分块复制。

## 2. 导出与关键符号（23 个 export，子agent 字节核对）

**容器族**：`Message:72`（from=user/assistant/system，is-user 类）、`MessageHeader:97`、`MessageContent:137`、`MessageActions:162`、`MessageAction:190`（sr-only label+Tooltip）。
**remark 插件**：`remarkMentions:317`（@file:/skill:/#mcp:/&session:→`mention://` 链接；独立正则防 /g 串扰 `:321`）、`remarkPreserveBreaks:359`、`RemarkPluginFn:380`、`remarkWikilinks:391`（`[[名称|显示]]`→`wikilink://`）、`remarkTableSource:432`（表格原始源写 data-table-source 供"复制为 Markdown 源码"）。
**Context**：`WikilinkClickProvider:462`、`BasePathsProvider:467`、`TurnFileMapProvider:479`（本轮文件名→绝对路径映射）。
**工具函数**：`localFileUrlToPath:509`（仅本机 file://，拒绝远程 hostname `:512`——测试 4 用例锁定）、`parseTableChildren:909`/`rowsToTsv:931`/`rowsToMarkdown:938`（表格复制降级，测试锁定）。
**渲染器**：`MessageResponse:1243`（主 Markdown，组件映射 a/img/pre/code/table `:1306-1312`）、`UserMessageContent:1492`（>4 行折叠 `:1499-1508`）、`MessageLoading:1563`、`MessageStopped:1581`、`MessageAttachments:1601`、`StreamingIndicator:1758`。

## 3. 内部逻辑与关键流程

- **预处理管线**（`:1245`）：剥离 PROMA_AUTOMATION 注释→`normalizeHtmlMediaTags`（video/audio→Markdown 媒体 `:979-986`）→LaTeX 归一→强调空格归一。
- **MarkdownLink 四分派**（`:550-667`）：mention 芯片/wikilink 双链/学术溯源胶囊（`DOCUMENT_ANCHOR_RE`→pdfHighlightTarget+openPreview `:582-666`）/普通链接（http→openExternal、file/路径→openPreview，**无 sessionId fail closed** `:695`）。
- **MarkdownPre 五裁决**（`:852-903`）：```mindmap→MindMapBlock（失败静默回退）→mermaid（防 mindmap 误包 `:870-874`）→HTML 沙箱预览（`SelfSizingFrame` iframe `sandbox` **无 allow-same-origin** `:801`，postMessage 高度上报 clamp 120-820 `:741-783`）→detectLanguage 自动高亮→CodeBlock 兜底。
- **块复制系统**（`enableBlockCopy`，`:1247-1465`）：分块渲染+块选（4px 位移区分点击/拖拽 `:1357-1362`）+浮条工具条（Markdown/纯文本/表格 MD/TSV 切换）+多选序列化（混选强制 markdown `:1347-1351`）+`agentBlockMargin` 纵向节奏。
- **附件**：Image（readAttachment→dataURL、openPreview 优先/无会话回退 Lightbox `:1663-1670`、hover 保存）/File（teal chip）。

## 4. 调用者与调用链

会话消息渲染（AssistantTurnRenderer 等）；出向 react-markdown 族、`./agent-block-copy`（6 函数）、`./MindMapBlock`、`./file-path-chip`、preview 链、`window.electronAPI`（resolveDocumentAnchor/resolveFilePath/readAttachment/saveImageAs/openExternal）。

## 5. 数据 I/O、读写与副作用

附件读取/保存、文件解析、预览打开、外部链接打开、剪贴板（块复制）；iframe 沙箱渲染。

## 6. 分支、失败、取消与恢复

图片解析失败→`role="img"` 占位（`:1021`）；溯源解析失败静默/warn（`:603`/`:626`）；mindmap 失败回退；块复制失败 console.error。

## 7. 权限与权威状态

- **链接分派安全**（`:694-703`）：无 sessionId fail closed；file:// 仅本机（`:512`）。
- **iframe 沙箱红线**（`:786-801`）：allow-scripts 无 allow-same-origin。
- 图片 no-referrer 防 CDN 盗链 403（`:1029-1030`）。

## 8. 修改影响面

改渲染管线影响全部消息展示；块复制契约联动 agent-block-copy；`MessageResponse` 比较器不比 className（矛盾⑩）。

## 9. 测试证据

`message.test.ts`（同批，11 个 `test(`）：localFileUrlToPath 4（含远程拒绝安全断言）、parseTableChildren 2、rowsToTsv 2、rowsToMarkdown 3。渲染面未测。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（矛盾照实记录，子agent 4 段精读+字节核对）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 23 导出/双渲染路径/四分派/五裁决/块复制 | 已证实 | 1768 行全读（字节核对） |
| **①** `:71`"user 自动右对齐"无实现（仅 is-user 类）；**②** `:15`"3 个弹跳点"过期（实为 LoadingIndicator）；**③** 头注释清单漏列 13 导出；**④** `:8` vs MessageRole 含 'system' | 已证实 | `:71`/`:76-77`、`:1566-1570`、`:64` |
| **⑤** `:1154` Shiki 注释错位悬于接口头；**⑦** `showElapsed={startedAt\|\|true}` 恒 true（疑似笔误）；**⑧** 正则 /g 策略两处不对称 | 已证实 | `:1154`/`:1569`/`:321` vs `:385-396` |
| **⑨** `:988-993` Lightbox 注释过期（本组件裸 img）；**⑩** 两比较器不比 className | 已证实 | `:1032`、`:1468`/`:1552-1555` |
| 依赖实现（agent-block-copy/@profer/ui/主进程 IPC） | 未知 | 见 UNVERIFIED |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 23 导出全量 | §2 | covered |
| 管线/分派/裁决/块复制 | §3 | covered |
| 安全红线 | §7 | covered |
| 10 矛盾+测试 | §9/§10 | covered |
