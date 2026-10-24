---
path: apps/electron/src/main/lib/local-file-protocol.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: cd0d44a31cb9e056f08f8575787ff75152da0b67
sha256: eacddfffe9bb4aeb8d1748c493ee9c05e3fe6bab44e85b44db2581d6a84020f3
lines: 113
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/local-file-protocol.ts

## 1. 结论与边界

内联预览的 **Token 门控本地文件协议**：渲染层永远拿不到裸 `cdut-file://` 绝对路径；主进程注册已授权文件/目录后得到不透明 URL，协议处理器再解析（文件头 `apps/electron/src/main/lib/local-file-protocol.ts:1-7`）。

## 2. 导出与关键符号

`export` 逐条核对：3 个函数 = 3 个导出（类/接口/常量导出 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `registerProferFilePath` | 函数（导出） | 72-74 | `(path)=>string`（`cdut-file://<uuid>`） | 文件注册 |
| `registerProferDirectoryPath` | 函数（导出） | 76-78 | 同上 | 目录注册 |
| `handleProferFileRequest` | 函数（导出） | 80-113 | `(request:Request)=>Response\|Promise<Response>` | 协议处理器 |
| `RegisteredEntry`/`registeredEntries` | 内部 | 16-22 | `{root,isDirectory,createdAt}` Map | |
| `ENTRY_TTL_MS`/`MAX_ENTRIES` | 内部 | 23-24 | 1h / 500 | |
| `pruneEntries`/`realpathExisting`/`isInsideDirectory`/`registerEntry` | 内部 | 26-70 | TTL+容量修剪；realpath 校验；目录包含判定；注册核心 | |

## 3. 内部逻辑与关键流程

- `registerEntry`（`:53-70`）：`pruneEntries` → `realpathExisting`（`realpathSync(resolve(path))`+`existsSync`，缺失抛 `文件不存在`，`:41-47`）→ **审核私有桌面路径拒注册**（`isReviewPrivateDesktopPath` 原路径与 realpath 双检，抛 `审核内部会话路径不可注册`，`:56-58`）→ 类型校验（目录/文件各抛 `不是目录`/`不是文件`）→ `randomUUID` token + `cdut-file://<token>`。
- `handleProferFileRequest`（`:80-113`）：URL 解析失败 400；token 无注册 404；目录条目把 `url.pathname` 相对解析进 `entry.root` 并 realpath（失败 404），`isInsideDirectory`（`:49-51`，`target===root || startsWith(root+sep)`）越界 403；文件条目带非根 pathname 404；**最终目标每次都重查** `isReviewPrivateDesktopPath`（含审核会话删除后，`:109-111` 注释）→ 403；否则 `net.fetch(pathToFileURL(target))`。

## 4. 调用者与调用链

入向：内联预览主进程侧（注册）+ Electron protocol 注册（`handleProferFileRequest`）；测试：本批无专属测试（scope 无 `.test.ts`；`preview-inspection-service.test.ts`/`preview-path-policy.test.ts` 间接）。出向：`node:crypto/fs/path/url`、`electron.net`、`./review-private-file-access.ts:14`。

## 5. 数据 I/O、读写与副作用

读：`existsSync/realpathSync/statSync`；返回：`net.fetch(file://)` 流式响应。内存：单 Map（TTL 1h/容量 500，FIFO 淘汰最旧 `:34-38`）。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| URL 非法 | 400 | 83-86 |
| token 未注册/过期 | 404 | 90-92 |
| 路径不存在 | 抛 `文件不存在`（注册时） | 43-45 |
| 审核私有路径 | 注册抛/请求 403 | 56-58,111 |
| 类型不符 | `不是目录`/`不是文件` | 60-65 |
| 目录逃逸 | 403 | 102-104 |
| 文件条目带路径 | 404 | 105-107 |
| 目标 realpath 失败 | 404 | 97-101 |

无取消概念；恢复=重新注册新 token。

## 7. 权限与权威状态

- 授权在**注册时**（主进程已验证），token 即能力凭证（TTL+容量限制暴露面）。
- 审核私有桌面路径双重拒绝（注册+每次请求），权威为 `isReviewPrivateDesktopPath`。

## 8. 修改影响面

改解析/包含判定影响预览安全边界；改 TTL/容量影响内存与失效行为；影响 `preview-*` 测试与预览 UI。

## 9. 测试证据

本批**无专属测试**；间接：`preview-inspection-service.test.ts`/`preview-path-policy.test.ts`（各自手册）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

缺口（静态判断）：目录逃逸/审核路径拒绝/token 失效分支无专属断言证据。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 渲染层无裸绝对路径 | 已证实 | `:1-7`（设计）+token 化 |
| 审核路径注册/请求双拒 | 已证实 | `:56-58,109-111` |
| 目录逃逸 403 | 已证实 | `:97-104` |
| TTL 1h/容量 500 FIFO | 已证实 | `:23-38` |
| 生产接线/测试 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 注册族 | §3 | 41-78 | covered |
| 请求处理 | §3 | 80-113 | covered |
| 修剪/包含判定 | §3 | 26-51 | covered |
| 接线/断言 | §9,§10 | — | unknown |
