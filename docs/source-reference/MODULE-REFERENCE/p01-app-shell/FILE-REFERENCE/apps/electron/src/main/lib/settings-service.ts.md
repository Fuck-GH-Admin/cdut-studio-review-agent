---
path: apps/electron/src/main/lib/settings-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0a42875cbb4c79dd63e36120edd9c767d5651568
sha256: 0132b4b643fae57275ffde3ab428747c1a3382f0dd005ec56d3e2d6d9b09958c
lines: 131
kind: source
package: p01-app-shell
author: docs-r07-author-extra-01-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/settings-service.ts

## 1. 结论与边界

**应用设置读写服务**（131 行）：`settings.json`（`getSettingsPath()`）读写 + 进程内缓存 + 2026-09 旧键归一（`Tablet*→Pocket*`、`pluginSystemEnabled→developerModeEnabled`）；AI 代批（`reviewAgentAutoApproval`）严格布尔归一。

边界：只管 settings.json 单文件（非 safe-file 三层容错，直写）；不校验调用方；字段语义由 `AppSettings`（`../../types`）定义。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `getSettings` | 导出函数 | 45-86 | `(): AppSettings` | 读（缓存优先） |
| `updateSettings` | 导出函数 | 93-126 | `(updates: Partial<AppSettings>) => AppSettings` | 合并写+缓存 |
| `clearSettingsCache` | 导出函数 | 129-131 | `(): void` | 清缓存（测试用） |
| `_settingsCache` | 内部变量 | 15 | `AppSettings \| null` | 内存缓存 |
| `LegacyTabletModeSettings` | 内部接口 | 18-22 | 旧键形状 | 只读归一 |
| `getDefaultSettings` | 内部函数 | 24-37 | 默认值 | |

导出计数：`export` 3 条（`:45`、`:93`、`:129`），与源码一致。

## 3. 内部逻辑与关键流程

- **getSettings**（`:45-86`）：缓存命中直接返回（`:46`）；文件不存在 → 默认值缓存（`:50-53`）；`JSON.parse` 后：
  - 解构剔除旧键 `tabletModeEnabled/tabletModePort/pluginSystemEnabled`（`:60`）——**旧键不进内存对象**（防写回再落盘）。
  - `pocketModeEnabled = data.pocketModeEnabled ?? tabletModeEnabled`（新键优先，`:64`），端口同理（`:65`）。
  - `developerModeEnabled = data.developerModeEnabled ?? pluginSystemEnabled ?? false`（`:61`）。
  - `openEpistemicModeEnabled = developerModeEnabled && data.openEpistemicModeEnabled === true`（**开发者模式关闭则一并关**，`:74`）。
  - `reviewAgentAutoApproval === true` 严格归一（非 true 一律关，注释 `:75`：Agent 不能经其他路径改写）；`GrantedAt/By` 仅字符串通过（`:77-78`）。
  - 其余字段逐项兜底（themeMode/interfaceVariant/onboardingCompleted/environmentCheckSkipped/notificationsEnabled/feishuSessionMirror/`normalizeAgentRuntime`，`:66-73`）。
  - 解析失败 → console.error + 默认值（`:81-85`）。
- **updateSettings**（`:93-126`）：确保缓存初始化（`:95`）；`agentRuntime` 经 `normalizeAgentRuntime` 归一（`:97-102`）；`developerModeEnabled`（更新值 ?? 缓存 ?? false）为假且（更新含 openEpistemic 或缓存为 true）→ 强制 `openEpistemicModeEnabled=false`（`:103-108`）；合并写盘（`writeFileSync`，`:117`）+ 更新缓存 + console.log keys；写失败 → console.error + throw「写入应用设置失败」（`:120-123`）。

## 4. 调用者与调用链

- 入向（全冻结树 `grep settings-service`，apps+packages 全类型，**37 个文件**消费）：主进程核心（`ipc.ts` settings 通道、`index.ts`、`executable-open-guard.ts:20`（同批）「不再提醒」持久化、`screenshot`/`storage`/`sync` 等流程读设置）；渲染经 `window.electronAPI.getSettings/updateSettings`（preload 桥）。
  - **直接测试**：`settings-service.test.ts`（145 行，**7 test**，同批）。
- 出向：`./config-paths.getSettingsPath`（`:9`）、`../../types` 常量/类型（`:10-12`）、`@profer/shared.normalizeAgentRuntime`（`:11`）。

## 5. 数据 I/O、读写与副作用

- 磁盘：`<config>/settings.json`（`JSON.stringify(updated, null, 2)` 直写，**无 tmp+rename**——对照 `safe-file` 的原子写，照实记录 §10）。
- 缓存：`_settingsCache` 进程内单例；读一次后全走缓存（写会同步更新）。
- 副作用：console 日志；throw（写失败）。

## 6. 分支、失败、取消与恢复

- 文件缺失/解析失败 → 默认值（不抛，`:50-53`、`:81-85`）。
- 写失败 → throw（调用方决定降级；如 `executable-open-guard.ts:67-70` catch 后仅留痕）。
- 归一链：旧键读时归一、写时不回写；`openEpistemicModeEnabled` 随 `developerModeEnabled` 联动关闭。
- 取消/恢复：同步函数不适用；缓存可 `clearSettingsCache` 重置。

## 7. 权限与权威状态

- 无 sender/role 检查；settings.json 为权威（主进程持久化）；缓存为副本。
- **AI 代批开关**（`reviewAgentAutoApproval`）的权威保护：`ipc.ts:2200` 通用更新通道剥离该字段（改写走专用确认通道），本文件读侧严格 `=== true` 归一（`:76`）——两层防线，照实记录。

## 8. 修改影响面

- 全应用设置面（37 个消费文件）；`AppSettings` 字段增删需同步 `getDefaultSettings`/归一逻辑。
- 旧键归一改动会影响老用户迁移（`Tablet*`/`pluginSystemEnabled`）。
- 测试：`settings-service.test.ts`（7 用例）覆盖归一/联动/写回，改动需同步。

## 9. 测试证据

- 直接测试：`settings-service.test.ts`（145 行，bun:test，**7 test**，NOT_RUN）。mock 边界：真实 fs + `PROFER_CONFIG_DIR` 临时目录 + `clearSettingsCache()` 逐例重置（`:30-34`）；`afterEach` 还原环境变量并清目录（`:36-41`）。
- 断言摘要：①旧 `tabletMode*` 归一 `pocketMode*` 且旧键不进内存（`:54-60`）；②更新后落盘只留新键+端口保留（`:71-75`）；③新旧并存新键优先（`:89-90`）；④空配置 pocketMode 未定义+开发者默认关+notifications 兜底 true（`:99-104`）；⑤`pluginSystemEnabled` 迁移 developerMode 且不写回（`:111-116`）；⑥关开发者模式连带关 openEpistemic（`:130-132`）；⑦端口 0 落盘为 0+`getSettingsPath` 形状（`:142-143`）。
- 未覆盖：写失败 throw 路径、`reviewAgentAutoApproval` 归一、`feishuSessionMirror`/`agentRuntime` 兜底。
- `NOT_RUN`：未运行 bun test/产品测试/typecheck/build/GUI；测试断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出与签名 | 已证实 | `:45-131` |
| 旧键归一链（Tablet*/pluginSystem） | 已证实 | `:57-64` |
| openEpistemic 随 developerMode 联动关 | 已证实 | `:74`、`:103-108` |
| AI 代批严格布尔+通道剥离双防线 | 已证实 | `:75-78`、`ipc.ts:2200` |
| 写失败 throw | 已证实 | `:116-123` |
| 非原子直写（对照 safe-file） | 已证实 | `:117` |
| 7 用例断言 | 已证实 | `settings-service.test.ts:44-143` |
| 并发写行为 | 未知 | 无锁（同步单线程，未实测） |
| 测试通过与否/运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `getSettings` 归一/兜底 | §3/§9 | 45-86 | covered |
| `updateSettings` 联动/写盘 | §3/§9 | 93-126 | covered |
| `clearSettingsCache` | §2/§9 | 129-131 | covered |
| AI 代批归一 | §7 | 75-78 | covered（无专属用例） |
| 写失败路径 | §6/§9 | 116-123 | partial（无用例） |
| 运行验证 | §10 | — | unknown（NOT_RUN） |
