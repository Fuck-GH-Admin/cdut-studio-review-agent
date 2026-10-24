---
path: apps/electron/src/renderer/components/agent/tool-result-renderers/default-result.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 75b5923936b78fa7ffdf49ff0ee87e79e70bfff2
sha256: 13790a0c42c38791b53d5ec38885a9d5ecee0091ed26482cd7556e63c959a232
lines: 131
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/tool-result-renderers/default-result.tsx

## 1. 结论与边界

默认工具结果渲染器（131 行）：未匹配专属渲染器的工具（含 MCP）——Key-Value 表格/纯文本/通用图片三形态（`:2-5`）。图片来源三路：结构化附件+历史 marker+文本内嵌（data URL/图片地址）。

## 2. 导出与关键符号

| 符号 | 行 | 行为 |
| --- | --- | --- |
| `DefaultResultRenderer` | `:42-131` | `(result, isError, imageAttachments=[])`：错误红底 pre→marker 解析→内嵌图解析→`dedupeImages` 三路合并→无图：KV 表（`tryParseKeyValue`）或纯文本折叠（`foldByLines=false`）；有图：缩略图网格+剩余文本折叠 |

内部：`tryParseKeyValue:26-40`（JSON 对象→条目数组；数组/非对象→null）。

## 3. 内部逻辑与关键流程

`parseAgentImageAttachmentMarkers:52`（历史 marker，仅 PNG/JPEG/GIF/WebP `:51`）→`parseInlineImageCandidates:55-58`→`dedupeImages:60-67`→分支。纯文本 `<pre>` 自带 max-h 400 滚动，故 `foldByLines={false}` 防双重滚动（`:97-99`/`:120-121` 注释）。

## 4. 调用者与调用链

`index.tsx` default 分支（`:55`）；出向 `./collapsible-result`、`../image-attachment-marker`、`../agent-renderable-image`（AgentImageThumb/dedupeImages/toRenderableFromAttachment）、`../inline-image-sources`。

## 5. 数据 I/O、读写与副作用

纯渲染（图片缩略图由 AgentImageThumb 承担加载）。

## 6. 分支、失败、取消与恢复

isError→红底；JSON 解析 try/catch；marker/内嵌解析失败静默为文本。

## 7. 权限与权威状态

- 图片受控加载（仅 PNG/JPEG/GIF/WebP `:51`）。
- `foldByLines=false` 单一限高契约（`:97-99`）。

## 8. 修改影响面

改三路图片合并影响 MCP 工具图片展示；KV 表影响结构化输出可读性。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件三形态分支/图片三路 | 已证实 | 131 行全读 |
| 附件 marker 解析行为 | 未知 | `../image-attachment-marker` 不在本批 |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；依赖解析/实效 unknown。
