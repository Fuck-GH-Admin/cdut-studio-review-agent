---
path: apps/electron/src/renderer/atoms/feishu-atoms.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a42b0456a79798283df3e2cad8990cd72edf4330
sha256: e21271871eaf5844a04b97cabbe40441805acf0d5345abb85c678ed55dd68994
lines: 33
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/feishu-atoms.ts

## 1. 结论与边界

飞书多 Bot Bridge 连接状态与聊天绑定的 Jotai 状态层（33 行，头注释 `:1-5`）：Bot 状态映射 + 派生 + 绑定列表。纯状态声明，无 I/O。

**边界**：桥接通信/绑定管理在别处（跨批）；不持久化。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `feishuBotStatesAtom` | atom（导出） | 15 | `Record<string, FeishuBotBridgeState>` 初值 `{}` | 全部 Bot 状态 |
| `feishuAnyConnectedAtom` | 派生 atom（导出） | 18-20 | `some((b) => b.status === 'connected')` | 任一已连接 |
| `feishuBridgeStateAtom` | 派生 atom（导出） | 23-27 | `FeishuBridgeState` | 向后兼容：取第一个，空→`{status:'disconnected', activeBindings:0}` |
| `feishuConnectedAtom` | 常量（导出） | 30 | `= feishuAnyConnectedAtom` | 别名 |
| `feishuBindingsAtom` | atom（导出） | 33 | `FeishuChatBinding[]` 初值 `[]` | 聊天绑定列表（含 botId） |

导出合计 5。类型来自 `@profer/shared`（`:8-12`）。

## 3. 内部逻辑与关键流程

1. `feishuAnyConnectedAtom`（`:18-20`）：任一 `status==='connected'`。
2. `feishuBridgeStateAtom`（`:23-27`）：取 `Object.values(states)[0]`，空回退 `{status:'disconnected', activeBindings:0}`（注意回退带 `activeBindings:0`，与 dingtalk 版差异）。

## 4. 调用者与调用链

入向（全冻结树检索 `feishu-atoms`，3 文件）：`renderer/main.tsx:100`（`feishuBotStatesAtom`）、`components/settings/BotHubSettings.tsx:12`、`components/settings/FeishuSettings.tsx:45`（`feishuBotStatesAtom`+`feishuBindingsAtom`）。派生/别名无独立 import（检索范围=baseline/source 全树）。
出向：`jotai`、`@profer/shared` 类型。

## 5. 数据 I/O、读写与副作用

无（不适用，依据：纯 Jotai atom 声明）。

## 6. 分支、失败、取消与恢复

分支：空映射回退（`:26`）；无 throw（不适用，依据：全文无 throw）。

## 7. 权限与权威状态

无权限分支，依据：无 sender/role 检查。权威状态=Bridge 上报（写入方跨批）。

## 8. 修改影响面

3 个消费方（主入口/BotHub/飞书设置）的连接与绑定 UI；回退形状 `{status, activeBindings}` 是旧单 Bot 契约。

## 9. 测试证据

直接测试：**无**（全冻结树检索 `feishu-atoms` 无测试命中；检索范围=baseline/source 全树）。

`NOT_RUN`：本轮未运行任何测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出/派生/回退形状 | 已证实 | `:1-33` 全文逐行 |
| 3 个调用方 | 已证实 | 全树检索（§4） |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 5 个导出 | §2/§3 | 15-33 | covered |
