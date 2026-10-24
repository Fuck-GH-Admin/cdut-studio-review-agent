---
path: apps/electron/src/main/lib/proxy-settings-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5c31034a8ead272deda90ae6201d5b89ec7f94b9
sha256: 59a27f00d934c3bfbfa52fcf14ede3bfc88e7e5b7dfc09eb6457a9b48129f736
lines: 95
kind: source
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/main/lib/proxy-settings-service.ts

## 1. 结论与边界

全局代理配置服务（主进程）：读写 `~/.proma/proxy-settings.json`（文件头 `apps/electron/src/main/lib/proxy-settings-service.ts:1-6` 注释声明存储路径；实际路径由 `getProxySettingsPath()` 决定，`:10`），支持系统代理自动检测与手动配置，并给出当前生效代理 URL。

边界：不创建代理 fetch（`proxy-fetch`）；不实现系统代理探测（`system-proxy-detector`）；不做配置 schema 校验（JSON.parse 直转，`:37`）。

## 2. 导出与关键符号

`export` 逐条核对：3 个函数导出。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `getProxySettings` | 函数（导出） | 27-42 | `() => Promise<ProxyConfig>` | 读配置，缺失/坏文件回默认 |
| `saveProxySettings` | 函数（导出） | 49-59 | `(config: ProxyConfig) => Promise<void>` | 写配置，失败抛错 |
| `getEffectiveProxyUrl` | 函数（导出） | 71-95 | `() => Promise<string \| undefined>` | 当前生效代理 URL |

内部符号：`DEFAULT_PROXY_CONFIG`（`:16-20`，`{enabled:false, mode:'system', manualUrl:''}`）。

## 3. 内部逻辑与关键流程

1. `getProxySettings`（`:27-42`）：文件不存在 → 默认（`:30-33`）；读+`JSON.parse` 直转 `ProxyConfig`（`:36-37`）；异常 → 默认 + `console.error`（`:38-41`）。**无字段级校验**。
2. `saveProxySettings`（`:49-59`）：`JSON.stringify(config,null,2)` 写入（`:53`）；失败 `console.error` 后抛 `Error('保存代理配置失败')`（`:56-57`）。
3. `getEffectiveProxyUrl`（`:71-95`）：`!config.enabled` → undefined（`:74-76`）；`mode==='system'` → `detectSystemProxy()`，成功且有 proxyUrl 才返回，失败 warn+undefined（`:78-86`）；手动模式 `manualUrl.trim()` 非空返回 trim 后值，否则 undefined（`:88-94`）。

## 4. 调用者与调用链

入向（全树检索，证实）：

- `getProxySettings`/`saveProxySettings`：`ipc.ts:265`（import）、`:2649`（get handler）、`:2657`（save handler）；渲染侧经 `window.electronAPI.getProxySettings`（`preload/index.ts:712,2675`；消费者 `renderer/atoms/proxy-atoms.ts:22`）。
- `getEffectiveProxyUrl`：`conversation-title-service.ts:16,102`、`lightweight-completion.ts:18,97`、`agent-orchestrator.ts:96,441`、`retrospective-service.ts:294`。

出向：`./config-paths` `getProxySettingsPath`（`:10`）、`./system-proxy-detector` `detectSystemProxy`（`:11`）、`@profer/shared` `ProxyConfig` 类型（`:9`）、`node:fs`（`:8`）。

## 5. 数据 I/O、读写与副作用

- 读写：`getProxySettingsPath()` 指向的 JSON 文件（读 `:36`、写 `:53`，非原子 `writeFileSync` 直写）。
- 副作用：`console.log/error` 诊断（`:31,39,54,57,81,84,90`）。
- 并发/幂等：读幂等；写覆盖式（后写胜）；无锁。失败模式：读失败静默降级默认（`:38-41`）；写失败抛错（`:56-57`）。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 | 结果 |
| --- | --- | --- | --- |
| 默认配置 | 文件缺失/解析失败 | 30-33, 38-41 | `{enabled:false,…}` |
| 保存失败 | writeFileSync 抛错 | 56-57 | 抛 `Error('保存代理配置失败')` |
| 未启用 | `!config.enabled` | 74-76 | undefined |
| 系统代理失败 | detectSystemProxy 失败/无 URL | 84-85 | undefined |
| 手动空 URL | `manualUrl.trim()` 空 | 89-94 | undefined |

无取消/恢复概念，依据：单次读写。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查；配置文件权威=用户设置（写方为 IPC save handler，须有常规 IPC 授权，`ipc.ts:2657` 层）。

## 8. 修改影响面

- IPC 面：`ipc.ts:2649/2657` → preload → `renderer/atoms/proxy-atoms.ts:22`。
- 出网链路：4 个 `getEffectiveProxyUrl` 消费模块（§4）。
- `ProxyConfig` 形状来自 `@profer/shared`；改字段需同步默认值（`:16-20`）与渲染表单。
- 需同步的测试：无（0 test，§9）。

## 9. 测试证据

直接测试：**无**。全树 `*.test.*`/`*.spec.*` 检索 `proxy-settings-service`/`getProxySettings`/`saveProxySettings`/`getEffectiveProxyUrl` 在测试文件 0 命中。间接证据：无。

真实断言：不适用。未覆盖：坏 JSON 降级、保存失败抛错、system/manual 分支。

NOT_RUN：本轮未运行任何测试/typecheck/构建/真实系统代理检测。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出 + 分支行号 | 已证实 | `:27-95` 逐行读 |
| 默认值/降级/抛错路径 | 已证实 | `:30-41, 56-57` |
| 调用链（IPC+4 模块） | 已证实 | §4 行号 |
| 头注释 `~/.proma` 与实际路径一致性 | 未知 | 实际路径在 `config-paths.getProxySettingsPath`（非本批） |
| detectSystemProxy 行为 | 未知 | 非本批文件 |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `getProxySettings` | §2-3 | 27-42 | covered |
| `saveProxySettings` | §2-3, §6 | 49-59 | covered |
| `getEffectiveProxyUrl` 三分支 | §2-3, §6 | 71-95 | covered |
| `DEFAULT_PROXY_CONFIG` | §2 | 16-20 | covered |
| 调用链 | §4 | - | covered |
| 实际配置路径/detector | §10 | - | unknown（非本批） |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |
