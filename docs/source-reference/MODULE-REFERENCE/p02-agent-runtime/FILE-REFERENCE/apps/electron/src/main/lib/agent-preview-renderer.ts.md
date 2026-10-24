---
path: apps/electron/src/main/lib/agent-preview-renderer.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 076d4cb9c0e9cc5f214a20c301616c53010c3b04
sha256: 2ce2080e8b883f96a3db9938668a790152d36c0c29ad41e84a83a3d77ef1d15a
lines: 223
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-preview-renderer.ts

## 1. 结论与边界

受控隐藏 renderer 的 Agent 预览渲染（串行防串台，:207-210 注释）：`sourceUrl` 必须由主进程经 local-file-protocol 签发（opaque `cdut-file://` token），**不能由 Agent 输入直接传入**。隔离分区 `agent-preview-hidden`（:36）+webRequest 白名单（:59-69）+IPC 主框校验。

## 2. 导出与关键符号

导出 6 条（`export` :9/:16/:24/:47/:211/:217）：`AgentPreviewRenderRequest`（:9-14）、`AgentPreviewRenderResult`（:16）、`AgentPreviewRendererError`（:24-33，code: page_out_of_range|renderer_failed、retryable）、`isSafeAgentPreviewSourceUrl(value)`（:47-49，正则 `^cdut-file://[a-z0-9-]+(?:/[^?#]*)?$`）、`renderAgentPreview(request, sourceUrl, text?)`（:211-215，renderChain 串行 :212-213）、`disposeAgentPreviewRenderer`（:217-223）。

内部：`installPreviewSessionPolicy`（:51-70，protocol.handle cdut-file+权限全拒+onBeforeRequest 白名单：cdut-file/data/blob/about+dev localhost:5174+packaged renderer 基址）、`installHandlers`（:91-121，capture/ready/result/error 四 IPC）、`ensureWindow`（:123-163，隐藏 BrowserWindow：contextIsolation/nodeIntegration false/backgroundThrottling false :134-141）、`waitForRenderer`（:165-183，25ms 轮询+30s 超时 :35）、`renderOne`（:185-205）、`isMainPreviewFrame`（:87-89）。

## 3. 内部逻辑与关键流程

- IPC 安全：四 handler 均校验 `isMainPreviewFrame`+sender===previewWindow（:97/:104/:107/:114）；capture 另要求 pending 命中（:97）；错误码映射（:118-119，page_out_of_range 不可重试）。
- 渲染链（:211-215）：Promise 链串行，失败不破坏链（:213 then(_, ()=>undefined)）。
- 导航守卫（:144-149）：window.open 拒绝+will-navigate 仅放行应用入口。
- closed（:150-155）：rejectAll+状态复位；dispose（:217-223）：destroy 窗口。

## 4. 调用者与调用链

入向（子agent 交叉核）：生产 `main/index.ts:166`（disposeAgentPreviewRenderer）、`lib/preview-inspection-service.ts:252`（动态 import）→ 调用 renderAgentPreview :271；测试 `agent-preview-renderer.test.ts:9`。出向：electron（app/BrowserWindow/ipcMain/session）、`./config-paths`（VITE_DEV_SERVER_URL :146/:160）、`./local-file-protocol`（handleProferFileRequest :57）。

## 5. 数据 I/O、读写与副作用

BrowserWindow 生命周期；IPC；截图 capturePage→PNG base64（:100-101）。无磁盘写。

## 6. 分支、失败、取消与恢复

超时/关闭/未就绪三路 reject（:168/:179/:195/:200）；错误码二分（:24-33）；dispose 全拒（:218）。恢复：窗口重建（ensureWindow :124）。

## 7. 权限与权威状态

安全边界：cdut-file opaque URL（:47-49）+webRequest 白名单（:62-68）+权限全拒（:58）+主框限定（:87-89）——iframe 不可请求任务（:94 注释）。

## 8. 修改影响面

预览工具链（preview-tools/orchestrator）；安全边界改动影响不可信渲染面。需同步测试（2 用例）。

## 9. 测试证据

`agent-preview-renderer.test.ts`（批内，1 describe/2 用例，NOT_RUN）：URL 判定（cdut-file true/file/https false :13-15）、结构化错误（code/retryable :19-20）。注释 :3-4：纯契约测试避免构造 BrowserWindow。未覆盖：渲染链/IPC/超时。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 6 条；安全边界四层 | 已证实 | :47-119 |
| 串行渲染链 | 已证实 | :211-215 |
| 入向完整清单（main/index+preview-inspection-service） | 已证实 | §4（子agent 交叉核） |
| 渲染链/IPC 运行行为 | 未知（NOT_RUN，Electron 禁跑） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 6 导出+IPC/策略/渲染链 | §2/§3 | :9-223 | covered |
| 测试 | §9 | — | partial（2 用例） |
