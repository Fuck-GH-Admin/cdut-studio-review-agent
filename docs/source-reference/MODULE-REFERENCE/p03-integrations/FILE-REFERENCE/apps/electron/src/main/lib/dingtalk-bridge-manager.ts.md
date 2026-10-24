---
path: apps/electron/src/main/lib/dingtalk-bridge-manager.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b9ef751f16b652f6559e54aaef942ebaadd488cd
sha256: 026fec9c6593a280d5a39502014555a05ff2f50614df3a0604f13de85392a9be
lines: 141
kind: source
package: p03-integrations
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/dingtalk-bridge-manager.ts

## 1. 结论与边界

钉钉 Bridge 管理器（多 Bot 版）（文件头 `apps/electron/src/main/lib/dingtalk-bridge-manager.ts:1-6`）：管理多个 `DingTalkBridge` 实例的生命周期、状态汇总与聚合查询，替代原单例 `dingtalkBridge`。

## 2. 导出与关键符号

`export` 逐条核对：1 个常量 = 1 个导出（类未导出）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `dingtalkBridgeManager` | 常量（导出） | 141 | `new DingTalkBridgeManager()` 单例 | |
| `DingTalkBridgeManager` | 内部类 | 18-139 | `bridges: Map<botId,Bridge>`（`:20`） | 方法见下 |

方法：`startAll:25-40`（启用+有凭证 Bot 逐个启动，单失败不阻塞，`:32-34`）；`stopAll:43-53`（逐停+清 Map）；`startBot:56-77`（不存在/未启用抛；**复用已有实例只重建连接以保留 commandHandler 的 chatBindings**，`:65-72`）；`stopBot:80-86`；`restartBot:89-91`（=startBot，配置变更后调用）；`getStates:96-114`（无实例→`disconnected`）；`getBridge:117`/`getAllBridges:122`；`testConnection:128-138`（**静态临时 bridge 不影响运行实例**，`:126` 注释）。

## 3. 内部逻辑与关键流程

启动过滤=`enabled && clientId && clientSecret`（`:27`）；失败容错（startAll 单 Bot 抛错仅 log，`:30-35`）；实例复用语义（`updateConfig`+`start`）保 chat 绑定；测试连接用 `id:'test'` 临时配置。

## 4. 调用者与调用链

入向：钉钉集成 IPC（启动/停止/状态/测试）；`dingtalkBridgeManager` 全局单例。测试：本批**无专属测试**（scope 无 `.test.ts`）。出向：`./dingtalk-bridge.ts:15`、`./dingtalk-config.ts:16`、`@profer/shared`（状态类型）。

## 5. 数据 I/O、读写与副作用

无直接 IO（配置经 dingtalk-config）；副作用：Bridge 实例生命周期、`console.log/error`。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| Bot 不存在/未启用 | 抛 | 58-63 |
| 启动失败 | log 继续其余 | 30-35 |
| 停止失败 | log 继续 | 47-49 |
| 无实例状态 | `disconnected` | 102-104 |

## 7. 权限与权威状态

管理器权威=实例表；测试连接隔离（临时 bridge）；凭证只在 dingtalk-config 加密域。

## 8. 修改影响面

改生命周期影响多 Bot 供给；改复用语义影响 chatBindings 保持。

## 9. 测试证据

本批**无专属测试**（scope 事实）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 单例导出 | 已证实 | `:141` |
| 复用保 chatBindings | 已证实 | `:65-72` |
| 启动过滤/容错 | 已证实 | `:27-35` |
| 测试连接隔离 | 已证实 | `:126-138` |
| Bridge 内部 | 未知 | dingtalk-bridge |
| 测试覆盖 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 生命周期族 | §2,§3 | 25-91 | covered |
| 状态/测试 | §2 | 96-138 | covered |
| 断言 | §9,§10 | — | unknown |
