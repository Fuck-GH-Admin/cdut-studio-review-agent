---
path: packages/shared/src/types/agent-preview.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8f75e708b6ee15521687bb885ee6b3ed27e86982
sha256: b05f19b62b65554090b3eff0ec33ec8adb2a03fddf2a4cfe69364ed8c165d5e3
lines: 161
kind: source
package: p07-shared-libs
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/types/agent-preview.ts

## 1. 结论与边界

Agent 文件预览工具的 **runtime-neutral 契约**（`packages/shared/src/types/agent-preview.ts:1`）：内容/视觉检视、PPTX viewer 任务载荷、错误结构与预算常量。纯声明。

## 2. 导出与关键符号

`export` 共 **20 个**（4 type + 12 interface + 2 const + 2 表）。

| 组 | 符号 | 行 | 说明 |
| --- | --- | --- | --- |
| 模式 | `InspectPreviewMode` | `:3` | `content`/`visual`/`both` |
| | `InspectPreviewScope` | `:4` | `overview`/`page`/`all` |
| | `AgentPreviewFileKind` | `:6-15` | 8 类（text…unknown） |
| | `AgentPreviewImageMediaType` | `:17` | 4 MIME |
| 输入/图 | `InspectPreviewInput` | `:19-25` | `filePath/mode?/scope?/page?/previousRevision?` |
| | `AgentPreviewImage` | `:27-32` | `{data, mediaType, filename?, page?}` |
| PPTX viewer | `AgentFilePreviewReport` | `:35-45` | viewer 加载状态回传（`status: 'ready'\|'error'`） |
| | `AgentFilePreviewInspectRequest` | `:48-55` | 页级观察请求 |
| | `AgentFilePreviewPageImage` | `:57-59` | `AgentPreviewImage + {page}` |
| | `AgentFilePreviewInspectResult` | `:62-73` | 页级观察结果（`images`+`warnings?`） |
| 受控渲染 | `AgentPreviewRenderTask` | `:76-85` | 主进程↔隐藏 renderer 载荷（**不直接暴露给模型**，`:75`）；`fileName` 仅扩展名选择、不含本机路径（`:78`） |
| | `AgentPreviewRenderOutput` | `:87-90` | 渲染产物 |
| 检视结果 | `InspectPreviewContent`/`Visual`/`File` | `:92-110` | 内容/视觉/文件元数据 |
| | `InspectPreviewResult` | `:112-118` | 组合结果 |
| 错误 | `InspectPreviewErrorCode` | `:120-130` | 结构化错误码 |
| | `InspectPreviewError` | `:132-140` | `{error:{code,message,retryable}}` |
| 常量 | `AGENT_PREVIEW_LIMITS` | `:142-149` | 预算（`maxPages`/`maxFileBytes`/`maxPayloadBytes` 等） |
| | `AGENT_PREVIEW_DEFAULT_MODE_BY_KIND` | `:151-160` | 8 类默认模式表（text→content、presentation→both…） |

## 3. 内部逻辑与关键流程

无逻辑（纯类型/常量）。`AgentPreviewRenderTask` 注释（`:75`、`:78`）强调受控载荷与路径脱敏边界。

## 4. 调用者与调用链

消费方：Agent 文件预览工具（runtime/隐藏 renderer/PPTX viewer 桥）。出向：无。

## 5. 数据 I/O、读写与副作用

无运行时行为（纯类型/常量）。

## 6. 分支、失败、取消与恢复

不适用（无逻辑）；校验在执行方。

## 7. 权限与权威状态

权限边界在注释（`:75` 渲染载荷不直接暴露给模型；`:78` 不含本机路径）；强制在执行方。

## 8. 修改影响面

- `AGENT_PREVIEW_LIMITS`/默认模式表被工具实现直接消费。
- PPTX viewer 三载荷是主进程↔renderer 契约。

## 9. 测试证据

- `agent-preview.test.ts`（38 行，3 用例）直接覆盖（见该测试手册）。
- **NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 20 个导出 | 已证实 | `grep -n "^export"` 全表 |
| 渲染任务不含本机路径/不暴露模型 | 已证实 | `:75`、`:78` |
| 工具实现行为 | 未知 | 不在本批 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 组 | 行 | 状态 |
| --- | --- | --- |
| 模式/输入/图 | `:3-32` | covered |
| PPTX viewer 载荷 | `:35-73` | covered |
| 受控渲染 | `:76-90` | covered |
| 检视结果/错误 | `:92-140` | covered |
| 常量/默认表 | `:142-160` | covered |
