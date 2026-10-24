---
path: apps/electron/src/main/lib/cdut/yanhu/yanhu-diagnostic-console.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7a34961a783de521039623c04e26f7627036db79
sha256: f69670d419b4fc5ca273dc687e18c2552fd41d37bdb0d1f40b02875bfdae1e80
lines: 581
kind: source
package: p03-integrations
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/yanhu/yanhu-diagnostic-console.ts

## 1. 结论与边界

智联万站·最底层实时运行诊断控制台（文件头 `:3-9`）：聚合①WebContents 原生控制台（log/warn/error）、子框架加载失败（did-fail-load）、渲染进程崩溃（render-process-gone）与导航生命周期；②实时网络报文链路流（webRequest 请求/响应/状态码/请求头/Cookie/报错）+ Chromium NetLog 落盘；③单一新窗口合并流式渲染（过滤/搜索/清空/一键复制）。运行时模块（BrowserWindow/WebContents/Session）。

不做的事：不改被诊断页面行为（只监听）；NetLog 仅诊断开启期间采集（防无界膨胀）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `DiagnosticLogEntry` | interface | `:16-26` | `{id; time; category: console\|network\|frame\|system; level; badge; badgeClass; title; details?; url?}` |
| `yanhuDiagnosticConsole` | const | `:581` | `YanhuDiagnosticConsoleManager` 全局单例 |

内部：`NETLOG_MAX_FILE_SIZE=64MB`（`:31`）；`YanhuDiagnosticConsoleManager`（`:33-579`）：`logs` 环形 3000 条（`MAX_LOGS`，`:36`）、`attachedWebContents/attachedSessions` 去重集、NetLog 三态（active/session/filePath）。

## 3. 内部逻辑与关键流程

### 3.1 状态与写入（`:44-122`）

- `getNetLogPath`：`~/.cdutai/yanhu-express/chromium-netlog.json`（惰性）。
- `open()`：打开/唤起独立诊断窗口（`buildConsoleHtml` 注入 UI）。
- `log(entry)`：时间戳（HH:MM:SS.mmm）、环形裁剪；**终端备份仅 warn/error**（info 含每条网络请求会刷屏拖慢主进程，`:109-110`）；窗口存活时 `executeJavaScript` 推 `__appendDiagnosticLog`（失败静默）。

### 3.2 `attachWebContents`（`:125-227`，方法 2）

幂等（wc.id 去重）；挂原生 console 消息、`did-fail-load`（子框架加载失败）、`render-process-gone`（崩溃）、导航生命周期事件 → 各自 `log()`（category console/frame/system）。

### 3.3 `attachSession`（`:229-308`，方法 4）

webRequest 三监听（`*://*/*`）：`onSendHeaders`（请求头摘要）、`onResponseStarted`（状态码分级：≥400 error/`badge-net-fail`、≥300 warn/redirect、否则 info）、`onErrorOccurred`（`net::ERR_ABORTED` 降 warn 其余 error）。Vite 开发噪声（`/@vite/`、`/__vite_ping`）过滤；窗口未开不采集。异常 warn。

### 3.4 NetLog 与 UI（`:311-579`）

`startNetLog`/`stopNetLog`：仅诊断开启期间抓 Chromium NetLog 到 `chromium-netlog.json`（64MB 上限）；`flushHistoryToWindow` 回灌历史；`buildConsoleHtml`（`:362-580`）自包含控制台窗口（过滤/搜索/清空/复制）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（排除测试）：智联万站会话/视图管理（attachWebContents/attachSession/open）与各服务 `log()` 埋点；本批无直接测试文件。出向：`electron.{BrowserWindow,WebContents,Session}`、`config-paths`、`node:path`。

## 5. 数据 I/O、读写与副作用

写 NetLog 文件（诊断期）；`console.error/warn` 终端备份；窗口 `executeJavaScript` 推送。含请求头/Cookie 明文进诊断流（诊断窗口可见）——照实记录。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 窗口销毁/未开 | `:118/:240` 等 | 不推送/不采集 |
| webRequest 挂载失败 | `:305-307` | warn |
| executeJavaScript 失败 | `:120` | 静默 |
| 日志超 3000 | `:105-107` | shift 裁剪 |
| 取消/恢复 | 无 | 监听随 attach 生命周期 |

## 7. 权限与权威状态

诊断工具口径：仅开发/排障用途；NetLog 64MB 上限与“仅开启期间采集”是防膨胀约束；Vite 噪声过滤是显示口径。

## 8. 修改影响面

改监听/渲染 → 影响排障体验；`buildConsoleHtml` 内嵌 UI 与 `__appendDiagnosticLog` 协议联动。

## 9. 测试证据

本轮 `NOT_RUN`。本批无直接测试文件（Electron 运行时诊断工具）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 四类事件聚合+网络链路流 | 已证实 | 文件头、`:125-308` |
| 环形 3000/终端仅 warn+error | 已证实 | `:105-116` |
| NetLog 64MB+仅开启期 | 已证实 | `:28-31/:311` |
| 状态码分级/ERR_ABORTED 降级 | 已证实 | `:263-297` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `DiagnosticLogEntry`/状态 | 2 | `:16-41` | covered |
| `getNetLogPath`/`open`/`log` | 3.1 | `:44-122` | covered |
| `attachWebContents` | 3.2 | `:125-227` | covered |
| `attachSession` | 3.3 | `:229-308` | covered |
| NetLog/UI | 3.4 | `:311-579` | covered |
