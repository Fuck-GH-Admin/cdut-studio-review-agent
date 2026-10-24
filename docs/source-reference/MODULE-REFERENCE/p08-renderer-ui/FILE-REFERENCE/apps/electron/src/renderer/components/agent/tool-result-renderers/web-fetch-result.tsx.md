---
path: apps/electron/src/renderer/components/agent/tool-result-renderers/web-fetch-result.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e625856b6264e10976d868fb20b0b79751f69fbc
sha256: 876d36bb07b251ec10eb3a6b12d50960481b2586a7bbdbac474bdae007bd4eac
lines: 37
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/tool-result-renderers/web-fetch-result.tsx

## 1. 结论与边界

WebFetch 工具结果渲染器（37 行）：抓取网页内容以 Markdown 渲染，复用 `MessageResponse`（`:3-5`）。错误态红底 pre。

## 2. 导出与关键符号

| 符号 | 行 | 行为 |
| --- | --- | --- |
| `WebFetchResultRenderer` | `:16-37` | `(result, isError)`：`CollapsibleResult`（`threshold={5000}`、`previewLines={30}` `:28-29`）+ `renderContent` 包 `MessageResponse`（圆角容器） |

## 3. 内部逻辑与关键流程

错误→pre；否则折叠包装+Markdown 渲染。阈值 5000（比默认 3000 宽松——网页内容通常较长，照实记录）。

## 4. 调用者与调用链

`apps/electron/src/renderer/components/agent/tool-result-renderers/index.tsx`（WebFetch 分支 `apps/electron/src/renderer/components/agent/tool-result-renderers/index.tsx:48-49`）；出向 `@/components/ai-elements/message`（MessageResponse）、`./collapsible-result`。

## 5. 数据 I/O、读写与副作用

纯渲染（MessageResponse 内部 Markdown 渲染）。

## 6. 分支、失败、取消与恢复

isError→pre。

## 7. 权限与权威状态

Markdown 渲染信任边界在 MessageResponse（本层不校验内容）。

## 8. 修改影响面

改阈值/previewLines 影响长网页折叠行为与首屏渲染量；MessageResponse 的 Markdown 渲染与 XSS 面变化会直接影响本渲染器输出。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件 | 已证实 | 37 行全读 |
| MessageResponse 的 XSS 面 | 未知 | 组件不在本批 |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；依赖/实效 unknown。
