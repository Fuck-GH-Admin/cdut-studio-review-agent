---
path: packages/shared/src/types/proxy.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: dba609d723eacb92ef4347b9b957f84d6614ec5a
sha256: 559b504debd686ce5e49ce6805dfbe5a1e7331626d6c54fc8339624123f4c613
lines: 46
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/types/proxy.ts

## 1. 结论与边界

**全局代理配置类型 + IPC 通道常量**（`packages/shared/src/types/proxy.ts:1-46`）：纯类型/常量文件（零运行逻辑）。注释自述配置存储于 `~/.proma/proxy-settings.json`（`:4`，存储实现在主进程，不在本文件）。

## 2. 导出与关键符号（4 条，逐条核）

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `ProxyMode` | type（export） | `:10` | `'system'\|'manual'` | 代理模式 |
| `ProxyConfig` | interface（export） | `:15-22` | `{ enabled; mode; manualUrl }` | `manualUrl` 仅 `mode='manual'` 用（`:20`） |
| `SystemProxyDetectResult` | interface（export） | `:27-34` | `{ success; proxyUrl?; message }` | 检测结果 |
| `PROXY_IPC_CHANNELS` | const（export） | `:39-46` | `GET_SETTINGS:'proxy:get-settings'`、`UPDATE_SETTINGS:'proxy:update-settings'`、`DETECT_SYSTEM:'proxy:detect-system'` | `as const` |

## 3. 内部逻辑与关键流程

无逻辑（纯声明）。不适用，依据：全文无函数/分支。

## 4. 调用者与调用链

类型经 `packages/shared/src/types/index.ts` barrel 再导出（`@profer/shared`）；真实消费方为代理设置 UI 与主进程 proxy IPC 注册（具体 file:line 属跨批，未逐一核——负向检索口径见 §10）。

## 5. 数据 I/O、读写与副作用

无（声明文件）；数据面（`~/.proma/proxy-settings.json`）由主进程读写。

## 6. 分支、失败、取消与恢复

不适用，依据：纯类型/常量。

## 7. 权限与权威状态

无权限分支；权威在主进程设置存储（本文件只声明形状与通道名）。

## 8. 修改影响面

改形状/通道名 → 主进程 proxy handler、preload 桥、设置 UI 同步（跨批）。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `PROXY_IPC_CHANNELS|ProxyConfig` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出形状与行号 | 已证实 | 逐行读 `:1-46` |
| 存储路径注释 `~/.proma/proxy-settings.json` | 推断（注释） | `:4`；主进程实现未读 |
| 具体消费者 | 未知 | 跨批未逐一核 |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出 | §2 | `:10-46` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
