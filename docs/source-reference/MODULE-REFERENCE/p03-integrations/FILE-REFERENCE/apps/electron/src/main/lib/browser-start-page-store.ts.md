---
path: apps/electron/src/main/lib/browser-start-page-store.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e1a37c376525132c54b85d2e83ab3196c304ead1
sha256: 19eedaa51219950137e47419827365313319a62d919fa747a6ecd590dd76e852
lines: 212
kind: source
package: p03-integrations
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/browser-start-page-store.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

新标签页起始页数据存储（头注 :1-9）：书签+最近历史，独立于 settings.json；**全局单一维度**（与浏览器 profile 全局单一身份对齐，不分工作区）；本机 `~/.cdutai/` 持久。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `faviconUrlFor` | fn | 70-78 | `{proto}//{host}/favicon.ico` |
| `listBookmarks` | fn | 81-83 | 全量快照 |
| `addBookmark` | fn | 86-105 | 同 URL 更新 title 前移；后台补 favicon |
| `removeBookmark` | fn | 108-112 | 按 id 删 |
| `recordHistory` | fn | 115-124 | host+path 去重、置顶、截 50 条 |
| `listHistory` | fn | 127-129 | 时间倒序 |
| `clearHistory` | fn | 132-135 | 清空 |
| `patchBookmarkFavicon` | fn | 138-146 | 回填 favicon |
| `fetchFaviconDataUrl` | fn | 168-194 | 站点 `/favicon.ico`→Google 服务回退（64KB/5s 上限） |
| `backfillMissingFavicons` | fn | 197-212 | 启动/新增时后台补齐 |

内部：`MAX_HISTORY_ENTRIES=50`（:17）、`readStore/writeStore`（:33-59，内存缓存+失败回退空）、`normalizeHistoryKey`（:62-68，去 hash/query）、`FAVICON_MAX_BYTES/FAVICON_FETCH_TIMEOUT_MS/FAVICON_MIME`（:148-162）。

## 3. 内部逻辑与关键流程

1. **存储**（:33-59）：读失败→空状态（不抛，`console.error`）；写失败→log 不抛。
2. **历史**（:115-124）：仅 http/https（`normalizeHistoryKey` 非法返回 null 跳过）；同 key 去重置顶；`slice(0,50)`。
3. **favicon**（:168-194）：双目标顺序 fetch（AbortController 5s）；0<大小≤64KB 才收；MIME 按扩展名/Content-Type/兜底 `image/x-icon`；返回 data URL；失败返回空串。

## 4. 调用者与调用链

入向（生产）：`browser-controller.ts:24`（recordHistory）+ 起始页面板 IPC。出向：`./config-paths`（getBrowserStartPagePath）、`node:fs`/`node:crypto`/`node:path`。

## 5. 数据 I/O、读写与副作用

读写 `~/.cdutai/` 起始页 JSON；**网络 fetch favicon**（站点/Google 服务）；console 日志。

## 6. 分支、失败、取消与恢复

读写失败→空状态/log 不抛；favicon 失败→''；无自动重试（backfill 是显式补）。

## 7. 权限与权威状态

- 数据边界：仅本机、全局单一维度（头注 :5-6）；历史 key 去 hash/query（防敏感片段入历史，:61 注释）。
- favicon 外联：仅 `/favicon.ico` 与 Google favicon 服务（64KB/5s 钳制）。
- 无 sender/role 检查。

## 8. 修改影响面

起始页书签/历史/图标。无专属测试文件。

## 9. 测试证据

直接测试：无（全树检索 browser-start-page-store.test = 0）。NOT_RUN（无真实网络）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 10 导出/内部符号/行号 | 已证实 | 逐行核对 |
| 去重/截断/失败回退语义 | 已证实（代码） | :33-59/:115-124 |
| favicon 真实抓取 | 未知 | 无测试、无真实网络 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 书签 CRUD | §2/§3 | 81-146 | covered（未测） |
| 历史记录/列表/清空 | §3.2 | 115-135 | covered（未测） |
| favicon 链 | §3.3 | 168-212 | covered（未测） |
