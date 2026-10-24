---
path: apps/electron/scripts/plugin-rpc-smoke.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5fdb24c9a222c5b6996cf32181fb6b94b2ce01cc
sha256: 56c737657cbf48ea6df2e6fcbd902aceaf5712b321ac8cb236b49fba61e24de6
lines: 180
kind: source
package: p01-app-shell
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/scripts/plugin-rpc-smoke.ts

## 1. 结论与边界

真实 Electron 冒烟脚本（180 行，手工运行，非 bun test）：用临时配置 + 本地 mock 模型服务 + 运行时生成的插件 fixture，验证插件宿主 RPC 协议 `plugin-host.rpc.v1` 的 envelope 保真、sender owner 归属、跨页拒绝、同 owner 取消、超时、撤权、页面关闭 abort、上游迟到结果不回写 8 类行为（`plugin-rpc-smoke.ts:128-172`，成功日志 `:172`）。

**冻结树重大事实（已证实）**：本文件 6 个项目内导入中 4 个目标模块在冻结树**不存在**——`../src/main/lib/plugins/plugin-manager`（`:9`）、`../src/main/lib/plugins/plugin-permissions`（`:10`）、`../src/main/lib/plugins/plugin-requests`（`:11`）、`../src/main/lib/plugins/plugin-view-manager`（`:12`）；全冻结树无任何 `plugins` 目录（find `-type d -name '*plugin*'` 0 命中），且除本文件与 `plugin-smoke.ts` 外无任何文件引用这些模块。故本脚本在冻结树内无法编译/运行（推断：模块解析失败），其断言的"应然行为"未在本基线可复验。

边界：不覆盖公开 preload API 的全量能力（只测 `profer.workspace.list`/`profer.models.list` 两入口）；不测安装/升级流程本身；不替代 `plugin-smoke.ts` 的能力面（权限/存储/Agent 工具）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| （导出） | — | — | — | `export` 0 命中；顶层即执行脚本 |
| `RpcFailure` | 接口（内部） | 14-20 | `{protocol:'plugin-host.rpc.v1', ok:false, requestId, operation, error:{code}}` | 失败 envelope 形状 |
| `RpcSuccess` | 接口（内部） | 21-27 | `{protocol, ok:true, requestId, operation, value}` | 成功 envelope 形状 |
| `RpcResponse` | 类型（内部） | 28 | `RpcFailure \| RpcSuccess` | 判别联合 |
| `createFixture` | 函数（内部） | 57-75 | `() => string` | 生成插件源目录（manifest+两页） |
| `grant` | 函数（内部） | 77-81 | `(pluginId) => void` | 直写 `plugin-permissions.json` 授权 |
| `request` | 函数（内部） | 83-85 | `(id, operation, payload, timeoutMs?) => Record` | 构造 RPC 请求对象 |
| `raw` | 函数（内部） | 87-89 | `(contents, value) => Promise<RpcResponse>` | 经 `window.__pluginRpcSmoke.call` 发送 |
| `openPage` | 函数（内部） | 91-102 | `(window, 'one'\|'two') => Promise<WebContents>` | 激活插件页并等 did-finish-load |
| `expectFailure` | 函数（内部） | 104-112 | `(promise, requestId, operation, code) => Promise<RpcFailure>` | 断言失败 envelope 精确形状 |
| `main` | 函数（内部） | 114-173 | `() => Promise<void>` | 8 段用例主流程 |
| `finish` | 函数（内部） | 176-180 | `(code) => void` | 清理 + `app.exit(code)` |

## 3. 内部逻辑与关键流程

1. 顶层环境（`:30-36`）：`uncaughtException` → `PLUGIN_RPC_SMOKE_UNCAUGHT` + `app.exit(1)`（`:30`）；`mkdtemp` 根，`PROFER_CONFIG_DIR` 指向 `<root>/config`（`:31-33`）；`app.setPath('userData', ...)`（`:34`）；`profer-plugin` scheme 注册为 privileged（standard/secure/supportFetchAPI，`:35`）；45s 全局 deadline → `PLUGIN_RPC_SMOKE_TIMEOUT` + exit(1)（`:36`）。
2. mock 模型服务（`:38-55`）：`createServer` 监听 `127.0.0.1:0`；每请求计数 `requestCount`，`aborted`/`close(且 aborted)` 计 `abortedCount`（`:46-47`）；**延迟 250ms** 后若 `!response.destroyed` 才回 SSE `late result`（`:48-54`）——专为"迟到结果不改写已稳定失败"设计（`:166-169`）。
3. fixture（`:57-75`）：`<root>/plugin-source/profer-plugin.json`（schemaVersion 1、id `com.profer.rpc-smoke`、权限 `models.read/models.invoke/workspace.read`、pages one/two → one.html/two.html）+ 两个极简 HTML。
4. `main`（`:114-173`）顺序：`app.whenReady` → server listen → `installPluginPackage(createFixture()).ok === true`（`:119`，callee 缺失）→ `grant`（`:120`）→ `createChannel` 造 `RPC smoke model` 指向 mock baseUrl（`:121`，`channel-manager.ts:530`）→ 隐藏 BrowserWindow（sandbox+contextIsolation+nodeIntegration:false，`:123`）→ `setMainWindow`/`setOwnerWindow`/`registerPluginHostIpc`（`:124`）→ `openPage one/two`（`:125-126`）。
5. 用例段（`§6` 表列全部断言）：公开 API provider 缺失错误（`:129-130`）→ envelope 完整性（`:133`）→ models.list 含 smoke 模型（`:135-136`）→ 跨页取消拒绝（`:141`）→ 同 owner 取消成功（`:142-144`）→ 被取消请求报 `PLUGIN_REQUEST_CANCELLED`（`:145`）→ 超时报 `PLUGIN_REQUEST_TIMEOUT`（`:147-149`）→ 撤权报 `PLUGIN_REVOKED`（`:151-154`）→ 页面关闭 abort 在途请求（`:158-164`）→ 迟到结果不回写（`:166-169`）。
6. 收尾（`:171-180`）：`pluginViewManager.dispose(); window.destroy()`（`:171`）；`main().then(finish(0), ...finish(1))`（`:175`）；`finish` 清 deadline/server/view 并 `rmSync(root)`（try/catch 吞文件句柄错误，`:176-179`）。

## 4. 调用者与调用链

- 入向：**无树内调用者**。全树检索 `plugin-rpc-smoke|PLUGIN_RPC_SMOKE`（排除 .git）仅命中本文件；package.json scripts/CI/文档均无引用——推断为人工 `bunx electron scripts/plugin-rpc-smoke.ts` 一类方式运行（推断，运行方式未登记）。
- 出向（项目内）：`channel-manager` `createChannel`（`channel-manager.ts:530`，存在）；`main-window-state` `setMainWindow`（`main-window-state.ts:9`，存在）；`plugin-manager` `installPluginPackage`（`:9`，**目标缺失**）；`plugin-permissions` `revokePluginPermissions`（`:10`，**缺失**）；`plugin-requests` `pluginRequests`（`:11`，**缺失**）；`plugin-view-manager` `pluginViewManager`/`registerPluginHostIpc`（`:12`，**缺失**）。
- 出向（Electron/Node）：`app`/`BrowserWindow`/`protocol`/`WebContentsView`（`:1`）、`node:assert` strict（`:2`）、`node:http` `createServer`（`:3`）、`node:fs`（`:4`）、`node:os` `tmpdir`（`:5`）、`node:path`（`:6`）。
- 页面侧：`window.profer.workspace.list`/`window.profer.models.list`（生产 preload 公开 API，`:129,135`）与 test-only `window.__pluginRpcSmoke.call`（`:88`）——preload 实现在缺失模块链内，行为细节未知。

## 5. 数据 I/O、读写与副作用

- 写：`mkdtemp` 根（`:31`）、`<root>/config`（`:33`）、`<root>/config/plugin-permissions.json` 直写授权（`:78-80`）、fixture 插件源（`:59-73`）；删除：`finish` 里 `rmSync(root)`（`:178`）。
- 网络：本地 `127.0.0.1:0` SSE mock（`:43-55`）；计数器 `requestCount`/`abortedCount`/`delayedResponseCount` 为内存状态（`:38-40`）。
- 环境副作用：`process.env.PROFER_CONFIG_DIR` 覆写（`:32`）、`app.setPath('userData')`（`:34`）、privileged scheme 注册（`:35`）——均为进程内临时隔离，不影响用户真实配置。
- 原子性/持久化：无（纯临时目录生命周期）。权限文件被 `grant` 直写绕过权限服务（`:77-81`），属测试注入手段。

## 6. 分支、失败、取消与恢复

| 用例/分支 | 行 | 断言（真实 assert） |
| --- | --- | --- |
| 公开 API provider 缺失 | :129-130 | `deepEqual` `{message:'该插件能力尚未配置宿主 provider', name:'ProferPluginError'}` |
| envelope 完整性 | :133 | `expectFailure` → `PLUGIN_OPERATION_NOT_SUPPORTED`（workspace.list） |
| models.list | :135-136 | `channel.some(channelId===smokeChannel.id && modelId==='rpc-smoke-model')` |
| 跨页取消 | :141 | second 页取消 first 的请求 → `PLUGIN_INVALID_ARGUMENT` |
| 同 owner 取消 | :142-144 | `deepEqual` value `{requestId:'owner-request', cancelled:true}` |
| 被取消方 | :145 | `ownerRequest` → `PLUGIN_REQUEST_CANCELLED` |
| 超时（timeoutMs 10） | :147-149 | `PLUGIN_REQUEST_TIMEOUT` |
| 撤权+取消插件请求 | :151-154 | `revokePluginPermissions`+`pluginRequests.cancelPlugin` 后 → `PLUGIN_REVOKED` |
| 页面关闭 abort | :158-164 | `pluginViewManager.close` 后 40ms，`abortedCount > 0`（验证网络 abort 而非 typed response，`:156-157` 注释说明） |
| 迟到结果不回写 | :166-169 | 300ms 后 `requestCount >= 4 && delayedResponseCount >= 4`，已稳定的 typed failure 不被改写 |

失败/恢复：任一 assert 抛错 → `main()` reject → `PLUGIN_RPC_SMOKE_FAILED` + `finish(1)`（`:175`）；`uncaughtException`/45s deadline 各自 exit(1)（`:30,:36`）。无重试；临时目录在 `finish` 清理（`:178`），但 `app.exit(1)` 的两条顶层路径（`:30,:36`）不经过 `finish`，临时目录残留（推断）。

## 7. 权限与权威状态

- 权限注入：直接写 `plugin-permissions.json`（`:77-81`，permissions/origins/revoked:false）；撤权调用 `revokePluginPermissions`（`:153`，缺失模块）。
- 被验证的权威语义：sender owner 归属（同 WebContents owner 才能取消，跨页拒绝 `:141`）、撤权后 `PLUGIN_REVOKED`（`:154`）、页面销毁取消其在途请求（`:156-164`）——这些守卫的实现在缺失的 `plugin-view-manager`/`plugin-requests` 内，**当前基线无法回源核对**（未知）。窗口侧无 Electron session 权限检查（`sandbox:true` 等仅在 `webPreferences`，`:123`）。

## 8. 修改影响面

- 树内无调用方；无编译单元依赖它。若插件子系统（`src/main/lib/plugins/**`）恢复/重建，其 RPC envelope、错误码（`PLUGIN_OPERATION_NOT_SUPPORTED`/`PLUGIN_INVALID_ARGUMENT`/`PLUGIN_REQUEST_CANCELLED`/`PLUGIN_REQUEST_TIMEOUT`/`PLUGIN_REVOKED`）、owner/取消语义变更须同步本脚本断言。
- 与 `plugin-smoke.ts` 共享 `PROFER_CONFIG_DIR` 隔离与 mock server 手法但互不依赖；与生产 preload 的 `window.profer` 契约（`workspace.list`/`models.list`）是断言来源（`:129,135`）。
- 无测试需同步（§9）。

## 9. 测试证据

- 本文件**即**断言脚本（`node:assert` strict），非 bun test、无 describe/it。无独立测试覆盖：全树检索 `plugin-rpc-smoke` 仅命中自身。
- `NOT_RUN`：本轮未执行本脚本、未运行产品测试/typecheck/构建/GUI/真实 Electron；且因 4 个导入目标缺失（§1），本基线不具备运行前提（推断）。
- 未覆盖：`requests.cancel` 对不存在 requestId 的行为、并发多请求、`rebuildAll` 类旁路、fixture 两页以外的页、`__pluginRpcSmoke` bridge 自身实现（test-only，注释 `:132`）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 段用例断言与 envelope 形状（逐行） | 已证实 | `plugin-rpc-smoke.ts:104-173` |
| 4 个导入模块在冻结树不存在；全树无 plugins 目录；仅本文件与 plugin-smoke.ts 引用 | 已证实 | find/grep 全冻结树（排除 .git）0 命中 |
| `channel-manager.ts:530`/`main-window-state.ts:9` 存在 | 已证实 | 冻结树实读 |
| 入向无调用者 | 已证实 | 全树 grep 仅命中自身 |
| 本基线无法编译/运行（模块解析失败） | 推断 | 依 TS/打包模块解析规则，未实跑 |
| `app.exit(1)` 顶层两路径留残余临时目录 | 推断 | `:30,:36` vs `:178` 控制流 |
| 缺失模块内部（owner 判定/取消/撤权）实现行为 | 未知 | 模块不在冻结树 |
| 人工实际运行方式与最近一次结果 | 未知 | 树内无登记 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `RpcFailure`/`RpcSuccess`/`RpcResponse` | §2 | 14-28 | covered |
| `createFixture`/`grant`/`request`/`raw` | §2、§3.3、§5 | 57-89 | covered |
| `openPage`/`expectFailure` | §2、§3.4 | 91-112 | covered |
| `main` 8 用例段 | §6 | 114-173 | covered |
| `finish`/顶层失败路径 | §6 | 30,36,175-180 | covered |
| mock server 延迟/abort 计数 | §3.2、§6 | 38-55 | covered |
| 缺失模块导入链 | §1、§4 | 9-12 | covered |
| 缺失模块内部行为 | §7、§10 | — | unknown |
| 实际运行结果 | §9 | — | unknown（NOT_RUN） |
