---
path: apps/electron/scripts/plugin-smoke.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6bb586ccf47040af9aa127753ca2b4d7b95b0c22
sha256: 74ae543bd647f0490edb0fd5e23cb92ad3dabf3851e6906855dbdda59664c03e
lines: 92
kind: source
package: p01-app-shell
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/scripts/plugin-smoke.ts

## 1. 结论与边界

真实 Electron 沙箱冒烟脚本（92 行，手工运行，非 bun test；文件头自述"所有配置和模型请求均使用临时数据"，`plugin-smoke.ts:3`）：验证插件沙箱隔离、权限流、模型目录脱敏、私有存储、Agent 工具桥、宿主模型调用、network 域名拒绝、主题上下文推送、运行时工具注册与撤权 9 类能力（成功日志 `plugin-smoke.ts:85`）。

**冻结树重大事实（已证实）**：①本文件 7 个项目内导入中 4 个目标模块在冻结树**不存在**——`../src/main/lib/plugins/plugin-agent-tools`（`:1`）、`plugin-view-manager`（`:10`）、`plugin-manager`（`:11`）、`plugin-permissions`（`:12`）；全冻结树无 `plugins` 目录（find 0 命中）。②fixture `examples/plugins/capability-demo` 在冻结树**不存在**（`plugin-smoke.ts:41`；全树 find `capability-demo` 0 命中，`examples/` 目录本身不存在，全树引用仅本文件 `:40-41` 两处）。③动态导入 `@anthropic-ai/claude-agent-sdk`（`:62`）在 `apps/electron/package.json` 与 `bun.lock` 均 0 命中（无此依赖）。故本脚本在本基线无法编译/运行（推断：模块解析失败 + fixture 缺失必然断言失败）。

边界：不覆盖插件安装/签名/更新链路；不测多插件并发；`@anthropic-ai/claude-agent-sdk` 仅动态导入取 `buildPluginAgentTools` 入参（`:62`），不验证 SDK 自身。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| （导出） | — | — | — | `export` 0 命中；顶层即执行脚本 |
| `openPage` | 函数（内部，main 内） | 42-51 | `() => Promise<WebContents>` | `pluginViewManager.activate(pluginId,'main',null)` 后取 WebContentsView 等 did-finish-load |
| `main` | 函数（内部） | 33-86 | `() => Promise<void>` | 9 能力段主流程 |
| `finish` | 函数（内部） | 88-92 | `(code) => void` | 清理 + `app.exit(code)` |
| `server` | 常量（顶层） | 23-32 | mock OpenAI SSE 服务 | 断言 Authorization/max_tokens 后回中文内容 |

## 3. 内部逻辑与关键流程

1. 顶层环境（`plugin-smoke.ts:16-22`）：`uncaughtException` → `PLUGIN_SMOKE_UNCAUGHT` + exit(1)（`:16`）；`mkdtemp` 根 + `PROFER_CONFIG_DIR=<root>/config`（`:17-19`）；`app.setPath('userData')`（`:20`）；`profer-plugin` privileged scheme（`:21`）；45s deadline → `PLUGIN_SMOKE_TIMEOUT` + exit(1)（`:22`）。
2. mock 模型服务（`:23-32`）：`assert.equal(request.headers.authorization, 'Bearer smoke-secret')`（`:24`）、`assert.equal(JSON.parse(body).max_tokens, 1024)`（`:28`）后回 SSE `宿主模型调用成功`（`:30`）。
3. `main`（`:33-52`）：`app.whenReady` → listen `127.0.0.1:0` → `createChannel`（`channel-manager.ts:530`）造 `冒烟模型`（`:37`）→ 隐藏 BrowserWindow（sandbox+contextIsolation+nodeIntegration:false，`:38`）→ `setMainWindow`/`setOwnerWindow`/`registerPluginHostIpc`（`:39`，`main-window-state.ts:9`）→ **fixture 安装**：`installPluginPackage(resolve(process.cwd(), '../../examples/plugins/capability-demo')).ok === true`（`:41`，路径 cwd 敏感且冻结树缺失）→ `openPage()`（`:42-52`）。
4. 能力段（`plugin-smoke.ts:53-83`，逐条断言见 §6）：无权限 models.list 必拒（`:53`）→ 按 manifest 写权限文件（`:54-55`）→ `closePlugin` 后重开（`:56`）→ 沙箱检查 `require`/`electronAPI` 均 undefined（`:57`）→ models.list 可用且无 secret 泄漏（`:58-59`）→ `storage.set`（`:60`）→ `buildPluginAgentTools(await import('@anthropic-ai/claude-agent-sdk'), servers, () => true)`（`:62`）→ uppercase 工具名 ≤64 且执行返回 `HELLO`（`:64-67`）→ `runTool('summarize')` 走宿主模型得中文结果（`:68-69`）→ network.fetch 未授权域名必拒（`:70`）→ `onContextChanged` 收到 theme:'light'（`:71-73`）→ 二次 activate 携带 context 但 `context.read()` 为 null（`:74-76`，注释性语义："仅交给可见页面"）→ `tools.register` 后 close 页面，pending 工具调用仍 resolve（`:77-80`）→ 撤权后 Agent 工具 execute 必 reject、models.list 必拒（`:81-83`）。
5. 收尾（`:84-92`）：`dispose`+`window.destroy()`（`:84`）；`main().then(finish(0), ...finish(1))`（`:87`）；`finish` 清 deadline/server/view、`rmSync(root)`（try/catch，`:88-91`）。

## 4. 调用者与调用链

- 入向：**无树内调用者**。全树检索 `plugin-smoke|PLUGIN_SMOKE`（排除 .git）仅命中本文件；package.json scripts/CI/文档无引用——推断为人工在特定 cwd 下运行（推断）。
- 出向（项目内，存在）：`channel-manager` `createChannel`（`channel-manager.ts:530`）、`main-window-state` `setMainWindow`（`main-window-state.ts:9`）、`settings-service` `updateSettings`（`settings-service.ts:93`，`:2`）。
- 出向（项目内，**缺失**）：`plugin-agent-tools` `buildPluginAgentTools`（`:1`）、`plugin-view-manager` `pluginViewManager`/`registerPluginHostIpc`（`:10`）、`plugin-manager` `installPluginPackage`/`getInstalledPlugin`（`:11`）、`plugin-permissions` `revokePluginPermissions`（`:12`）。
- 出向（外部动态）：`@anthropic-ai/claude-agent-sdk`（`:62`，依赖表 0 命中）。
- 页面侧：`window.profer.{models,storage,network,onContextChanged,context,tools}`（`:53-83`），preload 实现位于缺失模块链（未知）。

## 5. 数据 I/O、读写与副作用

- 写：`mkdtemp` 根与 `<root>/config`（`:17-19`）、`<root>/config/plugin-permissions.json`（`:55`，按 manifest.permissions/manifest.network.origins 直写）、fixture 插件安装产物（路径在缺失的 plugin-manager 实现内，未知）；删除：`finish` 里 `rmSync(root)`（`:90`）。
- 网络：本地 `127.0.0.1:0` mock（`:23-32`）；`window.profer.network.fetch` 对 `https://unauthorized.example/` 的拒绝验证（`:70`）。
- 环境副作用：`process.env.PROFER_CONFIG_DIR` 覆写（`:18`）、`app.setPath('userData')`（`:20`）、`updateSettings({themeMode:'light'})`（`:72`，指向被覆写的临时配置根）。
- **fixture 路径解析（QA 线索已回源核实）**：`resolve(process.cwd(), '../../examples/plugins/capability-demo')`（`:41`）以**运行时 cwd** 为基准：cwd=`apps/electron` 时解析到仓库根 `examples/plugins/capability-demo`，cwd=`apps/electron/scripts` 时解析到 `apps/examples/...`——两种基准下该目录在冻结树均不存在（全树 find 0 命中）；即便目录存在，cwd 变化也会改变解析结果（cwd 敏感性，已证实于代码形态）。因此断言 `installPluginPackage(...).ok === true`（`:41`）在冻结树内没有成立前提（具体失败形态取决于缺失的 plugin-manager 实现：抛错或返回 ok=false，未知）。

## 6. 分支、失败、取消与恢复

| 能力段 | 行 | 真实断言 |
| --- | --- | --- |
| 无权限拒绝 | :53 | `models.list().then(()=>false,()=>true)` === true |
| 授权写入+重开 | :54-56 | 写 permissions 后 `closePlugin`+`openPage` |
| 沙箱隔离 | :57 | `deepEqual {node:'undefined', host:'undefined'}` |
| 模型目录脱敏 | :58-59 | `models[0].modelId==='smoke-model'` 且序列化不含 `smoke-secret` |
| 私有存储 | :60 | `storage.set('model', {channelId, modelId})` |
| Agent 工具桥 | :62-67 | `servers` 恰 1 项；工具名 ≤64；`HELLO` 结果 |
| 宿主模型调用 | :68-69 | `runTool('summarize')` → `宿主模型调用成功`（mock 断言 auth/max_tokens `:24,:28`） |
| 域名拒绝 | :70 | unauthorized.example 请求必 reject |
| 主题推送 | :71-73 | `onContextChanged` 收到 `'light'` |
| 运行时工具生命周期 | :74-80 | `context.read()`===null；close 后 pending 仍 resolve `{text:'still running'}` |
| 撤权 | :81-83 | `assert.rejects(uppercase.execute(...))`；models.list 必拒 |

失败/恢复：任一 assert 抛错 → `main()` reject → `PLUGIN_SMOKE_FAILED` + `finish(1)`（`:87`）；`uncaughtException`/deadline 直接 `app.exit(1)`（`:16,:22`）不清理临时目录（推断残留）；无重试/恢复路径。`openPage` 的 `did-fail-load` → reject（`:48`）。

## 7. 权限与权威状态

- 权限流：初始无授权 → `models.list` 必拒（`:53`）；随后**直写** `plugin-permissions.json` 注入 `manifest.permissions`+`manifest.network.origins`（`:55`，测试注入，绕过权限服务）；`revokePluginPermissions`（`:81`，缺失模块）撤权后 Agent 工具与 models.list 双双失效（`:82-83`）。
- 权威判定（可调用/可见性）由缺失的 `plugin-view-manager`/`plugin-permissions` 实现（未知）；`context.read()`===null（`:76`）与"仅交给可见页面"（`:74`）表达的是上下文可见性语义，其实现不可回源。
- 窗口侧无 session 权限检查；隔离靠 `webPreferences`（sandbox/contextIsolation/nodeIntegration:false，`:38`）+ 沙箱断言（`:57`）。

## 8. 修改影响面

- 树内无调用方；不被任何编译单元引用。插件子系统（`src/main/lib/plugins/**`）与 fixture 生态重建时，`window.profer` API 形状、`buildPluginAgentTools` 签名、`installPluginPackage` 返回形状、权限文件 schema、`__uppercase` 工具命名（`:64`）变更均须同步本脚本。
- mock 断言耦合 `createChannel` 请求形状（`max_tokens:1024`、Bearer key，`:24,:28`）——channel-manager 请求构造变化会连锁。
- 无测试需同步（§9）。

## 9. 测试证据

- 本文件**即**断言脚本（`node:assert` strict），非 bun test、无 describe/it。无独立测试覆盖：全树检索 `plugin-smoke` 仅命中自身。
- `NOT_RUN`：本轮未执行本脚本、未运行产品测试/typecheck/构建/GUI/真实 Electron；且本基线缺 4 个导入模块 + fixture + 外部依赖（§1），不具备运行前提（推断）。
- 未覆盖：多页面并发、工具超时、`manifest.network.origins` 正向放行、`getInstalledPlugin` 返回结构、安装失败分支。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 9 能力段断言逐行语义（含 mock 边界：mock 仅 HTTP 模型服务，其余走真实 Electron/IPC 链） | 已证实 | `plugin-smoke.ts:23-83` |
| fixture `examples/plugins/capability-demo` 冻结树缺失；全树引用仅 `:40-41`；`examples/` 不存在 | 已证实 | find/grep 全冻结树（排除 .git）0 命中 |
| `:41` 路径以 `process.cwd()` 为基准（cwd 敏感） | 已证实 | `plugin-smoke.ts:41` 代码形态 |
| 4 个 plugin-* 导入模块缺失；`@anthropic-ai/claude-agent-sdk` 无依赖登记 | 已证实 | find/grep 与 `package.json`/`bun.lock` 0 命中 |
| 入向无调用者 | 已证实 | 全树 grep 仅命中自身 |
| 本基线无法编译/运行；`installPluginPackage(...).ok===true` 无成立前提 | 推断 | 模块解析规则 + fixture 缺失 |
| 缺失模块内部实现（权限判定/视图生命周期/tool 桥） | 未知 | 模块不在冻结树 |
| QA 预读线索"缺失时必然失败"的具体失败形态（抛错 vs ok=false） | 未知 | 取决于缺失的 plugin-manager 实现 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 顶层环境/mock server | §3.1-3.2 | 16-32 | covered |
| fixture 安装（cwd 解析+缺失） | §5、§10 | 40-41 | covered |
| `openPage` | §2、§3.4 | 42-52 | covered |
| 9 能力段断言 | §6 | 53-83 | covered |
| `main`/`finish`/失败路径 | §3.5、§6 | 84-92 | covered |
| 权限注入/撤销语义 | §7 | 54-55,81-83 | covered |
| 缺失模块导入链 | §1、§4 | 1,10-12 | covered |
| 缺失模块内部行为 | §7、§10 | — | unknown |
| 实际运行结果 | §9 | — | unknown（NOT_RUN） |
