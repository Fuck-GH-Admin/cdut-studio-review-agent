---
path: apps/electron/src/main/lib/cdut/yanhu/yanhu-devtools-hub.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5a60484ffdb3ebdb3e71797f7e9b90b30e770594
sha256: 7b1396e967ed80fc43ac0641e5d345ce56156ce261a6e2e6ce8ec499b8763a7c
lines: 675
kind: source
package: p03-integrations
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/yanhu/yanhu-devtools-hub.ts

## 1. 结论与边界

智联万站工业级 CDP 静默总线（文件头 `:1-11`，规格书 4.5）：前端 100% 不暴露调试 UI；主进程建标准 Chrome DevTools Protocol 数据总线，开 DOM/CSS、Page、Network、Log/Runtime 域，环形缓冲区留存采集结果，为二期 AI 自动化预留高可用 IPC 通道。设计要点：Network 环形缓冲（1000 条）+Console 广播池（500）；全部能力 `YanhuCdpResult` 语义安全降级、**任一 CDP 命令失败不抛出到 IPC 层**；与主题服务共享调试器连接（附加前判 `isAttached` 防重复 attach）。运行时模块（Electron WebContents.debugger）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `YANHU_INFLIGHT_EVICT_MS` | const | `:32` | 10_000（在途请求强制逐出阈值——长轮询/SSE 永不结束据此剪除） |
| `resolveCdpExceptionMessage` | function | `:124-132` | 纯函数：**优先 `exception.description` 首行**（真实异常如 TypeError: Illegal invocation），回退 `text`；全无 → null（`:115-122` 注释） |
| `YanhuDevToolsHub` | class | `:137-673` | CDP 采集总线（每标签一个 `TabCdpBuffer`） |
| `yanhuDevToolsHub` | const | `:675` | 全局单例 |

内部常量：`MAX_NETWORK_ENTRIES=1000`/`MAX_CONSOLE_ENTRIES=500`/`CDP_TIMEOUT_MS=6000`（防页面进程卡死拖垮主进程）/`MAX_SCRIPT_CHARS=64_000`/`MAX_CONSOLE_TEXT_CHARS=4000`/`NON_INFLIGHT_TYPES={WebSocket,EventSource,Ping}`（`:22-34`）；工具函数 `asString/asRecord/normalizeHeaders/normalizeConsoleType/normalizeLogLevel/truncateText/formatStackTrace`（`:61-113/:496`）。

## 3. 内部逻辑与关键流程

### 3.1 `attach`（`:167-247`，幂等）

已建/销毁 → return；`debugger.isAttached()` 否则 `attach('1.3')`（失败 warn 返回）。挂 `message`（`consumeCdpEvent`，异常 warn）与 `detach`（`disposeBuffer`）监听。**三层关键防御**：①最优先 `Debugger.enable`+`setSkipAllPauses(skip:true)`+`setBreakpointsActive(false)` 三命令全成才置 `breakpointImmune=true`（解除瑞数反调试 `debugger;` 的 V8 挂起/事件循环饥饿，`:214-223`）；②再开 Network/Runtime/Log/Page/DOM/Accessibility 六域（单域失败不影响其余）；③`Target.setDiscoverTargets` 感知 OOPIF/Worker（部分环境不支持忽略）。

### 3.2 事件消费（`:266-508`）

`consumeCdpEvent` 分发：Frame attached/detached/navigated（跨 Frame 框架集）、Target info/destroyed（关联目标）、Network 四事件（`requestWillBeSent`/`responseReceived`/`loadingFinished`/`loadingFailed`——networkIndex 回填、inflight 在途集、`lastNetworkActivityAt` 刷新）、consoleAPICalled/exceptionThrown/logEntryAdded（normalizeLogLevel 映射+truncateText）。`pushNetwork` 环形裁剪 1000；`recordResource` 去重登记资源。

### 3.3 命令与消费 API（`:513-673`）

`sendCommand`：硬超时 6s、失败安全降级（私有）；`send`（`:153`）公开命令入口（同语义）。消费面：`getDomTree(depth?)`、`getFullAXTree`（全框架无障碍树）、`getPageSource`、`getLoadedResources`、`getNetworkLogs(filterRegex?)`、`getConsoleLogs`、`getInflightCount`（**先逐出陈旧在途**——长轮询不阻塞稳态判定，`:616-618`）、`getNetworkActivityAt`、`getFrameCount`、`getRelatedTargetCount`、`isBreakpointImmune`、`executeScript`（≤64k，二期预留）。`release/disposeBuffer`：移除监听+清缓冲，**不主动 detach**（交视图销毁回收，`:249`）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（排除测试）：`yanhu-browser-tools.ts`（工具层驱动 send/采集消费）与智联万站会话/稳态判定；直接测试 `yanhu-devtools-hub.test.ts`（仅 `resolveCdpExceptionMessage`）。出向：`electron.WebContents`、`console`。

## 5. 数据 I/O、读写与副作用

CDP 调试器连接（attach/命令/事件）；内存环形缓冲（Map/Set）；warn 日志。无磁盘/网络（CDP 走 IPC）。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| attach 失败 | `:174-177` | warn、CDP 采集不可用 |
| 命令失败/超时 | `:513` 族 | 安全降级不抛 IPC |
| 断点免疫三命令 | `:215-223` | 全成才置位 |
| detach 事件 | `:186-188` | disposeBuffer |
| 取消 | 无 | 6s 硬超时是唯一时限 |

## 7. 权限与权威状态

- **断点免疫**是可信性权威（`isBreakpointImmune` 供稳态算法判定交互可信）。
- 前端零调试 UI；异常提取诚实口径（description 优先）。
- 在途逐出+非在途类型集是稳态判定的保守口径。

## 8. 修改影响面

改采集/命令语义 → 影响 browser-tools 全部工具与稳态判定；与主题服务共享连接（0 调试器红线在 theme 侧，本 hub 是 AI/调试总线正主）。

## 9. 测试证据

本轮 `NOT_RUN`。直接测试 `yanhu-devtools-hub.test.ts`（仅异常提取函数，详见其手册）；总线主体无直接测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三层防御/断点免疫 | 已证实 | `:214-246` |
| 命令失败不抛 IPC | 已证实 | 文件头、sendCommand 契约 |
| 异常 description 优先 | 已证实 | `:115-132` |
| 在途逐出/环形缓冲 | 已证实 | `:32/:362-370/:616-627` |
| 总线运行行为 | 未知 | NOT_RUN（Electron/CDP） |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 常量/工具函数/异常提取 | 2 | `:22-132` | covered |
| `attach`/`release` | 3.1 | `:167-264` | covered |
| 事件消费族 | 3.2 | `:266-508` | covered |
| 命令/消费 API | 3.3 | `:513-673` | covered |
