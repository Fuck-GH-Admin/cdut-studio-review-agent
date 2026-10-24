---
path: apps/electron/src/renderer/components/settings/ReleaseNotesViewer.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 74bd64a2349b7a83dff787732e3b79dce1a15fc6
sha256: 61b8b7c313d389f4bd7c69094a2744ec048ff4b51275b07d30d92d7837eaf818
lines: 131
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/settings/ReleaseNotesViewer.tsx

## 1. 结论与边界

GitHub Release **说明渲染器**（`:1-5`）：Markdown（react-markdown+remarkGfm）渲染 release.body；外链一律走 `openExternal`。纯展示。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ReleaseNotesViewer` | 组件 | `:50` | `({release, showHeader=true, compact=false})` |
| `formatReleaseDate`（内部） | 函数 | `:28` | 今天/昨天/N 天/N 周/完整中文日期（`:34-44`） |

## 3. 内部逻辑与关键流程

头部（`:60-90`）：name||tag_name、prerelease 徽章（`:67-71`）、GitHub 外链（`rel="noopener noreferrer"` `:82`）。正文（`:93-128`）：`pre`→CodeBlock（`:105`）；**`a` 拦截默认行为，仅 `http(s)://` 前缀走 `window.electronAPI.openExternal`**（`:106-115`，防 `javascript:` 等伪协议）；无 body→占位（`:126`）。

## 4. 调用者与调用链

- 入向：**无（孤儿件）**——全树 grep `ReleaseNotesViewer`（检索范围：`apps/electron/src` 全 `*.ts/*.tsx`，排除本文件）= **0 命中**；AboutSettings.tsx 导入清单无本组件；无 @deprecated 标注，照实记录孤儿状态。
- 出向：react-markdown/remark-gfm、`@profer/ui` CodeBlock、`window.electronAPI.openExternal`。

## 5. 数据 I/O、读写与副作用

无（渲染）；外链经主进程打开系统浏览器。

## 6. 分支、失败、取消与恢复

compact/showHeader/空 body 分支；无抛错。

## 7. 权限与权威状态

外链安全边界=仅 http/https 白名单判定（`:112`）。

## 8. 修改影响面

更新说明展示；XSS 边界依赖 react-markdown 默认转义+外链拦截。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无 test 文件）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 日期格式化/外链拦截/组件分支 | 已证实 | `:1-131` 全文 |
| react-markdown 转义行为 | 边界 | 第三方域外 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+内部 | §2/§3 | 28-128 | covered |
