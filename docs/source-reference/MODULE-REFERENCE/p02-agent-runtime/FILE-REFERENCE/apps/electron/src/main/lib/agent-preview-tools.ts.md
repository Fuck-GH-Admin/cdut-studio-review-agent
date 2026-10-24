---
path: apps/electron/src/main/lib/agent-preview-tools.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6bdca9d3b6e2d64fab20fbd2877b87373a201efe
sha256: 5a06ae3398c6f9fdcae4978a3b5bafc3d2145460d6ae21cf2c7f0984cea68e56
lines: 157
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-preview-tools.ts

## 1. 结论与边界

文件预览工具适配层（Claude in-process MCP 注册、Pi 复用 executeAgentPreviewTool，:157 注释）：`open_file_preview` 仅 PPTX 且复用主窗口人类预览（:59 注释：不建 Preview.html/不开浏览器/不返截图）；`inspect_preview` 其他格式；PPTX 不得旁路截图（:146-150）。

## 2. 导出与关键符号

导出 8 条（`export` :19/:20/:24/:26/:60/:103/:113/:143）：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `AGENT_INSPECT_PREVIEW_TOOL_NAME='inspect_preview'` | `:19` | |
| `AGENT_INSPECT_PREVIEW_DESCRIPTION` | `:20` | 工具描述（mode/scope/revision 契约、不收任意路径） |
| `AgentPreviewToolResult` | `:24` | `{content: 文本\|图片块[], details}` |
| `OpenFilePreviewContext` | `:26-30` | 扩展 PreviewInspectionContext + sessionId + onRequest/onInspectRequest 回调 |
| `executeOpenFilePreviewTool(input, context)` | `:60-83` | PPTX 预览请求（见 §3） |
| `formatAgentPreviewToolResult(result)` | `:103-111` | 文本 JSON+图片块；`modelSafeSummary`（:85-100）仅暴露图片 bytes 不带 data |
| `executeInspectFilePreviewTool(input, context)` | `:113-141` | PPTX 观察（scope overview/page/all） |
| `executeAgentPreviewTool(input, context)` | `:143-155` | 非 PPTX 走 inspectPreview；PPTX 直接返回 unsupported_file_type |

内部：`isInside`（:32-35）、`resolveAuthorizedPptx`（:37-57，realpath+扩展名 .pptx 限定（:40）+普通文件+授权根 isInside）。

## 3. 内部逻辑与关键流程

- `executeOpenFilePreviewTool`（:60-83）：onRequest 缺失抛（:61）；revision=`sha256:<内容哈希>`（:65）；readOnly 默认 true（:73）；返回页数/缩放提示（:75-81）。
- `executeInspectFilePreviewTool`（:113-141）：scope=page 时 page 必须正整数（:123）；图片文件名 `<名>-slide-N.png`（:137）。
- `executeAgentPreviewTool`（:143-155）：PPTX 拒绝并引导 open_file_preview（:144-152，retryable:false）；否则 `inspectPreview(input, context, {render: renderAuthorizedPreview})`（:153）。

## 4. 调用者与调用链

入向（子agent 交叉核）：生产 `lib/adapters/pi-builtin-tools.ts:104-109`（5 符号，调用 :786/:804/:812/:814/:827）、`lib/review/review-strict-pi-tools.ts:10`（type :26、inspectOriginal 默认参 :92）。**否定**：无 agent-preview-tools.test.ts（glob 仅源文件）。出向：`node:crypto`/`node:path`/`node:fs/promises`、`@profer/shared` 类型、`./preview-inspection-service`（inspectPreview/renderAuthorizedPreview :12-17）。

## 5. 数据 I/O、读写与副作用

读文件内容/元数据（readFile/stat/realpath）；回调 onRequest/onInspectRequest（渲染进程预览链）。无写盘。

## 6. 分支、失败、取消与恢复

扩展名/授权/存在性/页码校验 throw（:39-55/:123）；PPTX 旁路拒绝（:144-152）。不适用取消/恢复。

## 7. 权限与权威状态

授权边界：realpath+授权根 isInside（:37-57）+工具描述明言「不收工作区外路径」（:20）；PPTX 必须走正式预览工作流（:40/:148）。

## 8. 修改影响面

pi-builtin-tools 注册面+review-strict-pi-tools；preview-inspection-service 契约。无直接测试（否定已证）。

## 9. 测试证据

无直接测试（glob `agent-preview-tools*.ts` 仅源文件；docs/plans 曾计划但树内不存在）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 8 条；PPTX 限定+授权边界 | 已证实 | :37-57/:60-155 |
| 无直接测试 | 已证实（否定） | 全树 glob（§4） |
| preview-inspection-service 内部 | 未知（批外） | :12-17 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 8 导出+三执行函数 | §2/§3 | :19-155 | covered |
| 测试 | §9 | — | unknown |
