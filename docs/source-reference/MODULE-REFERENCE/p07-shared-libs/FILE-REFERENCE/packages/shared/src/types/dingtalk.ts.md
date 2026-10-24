---
path: packages/shared/src/types/dingtalk.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 11ebe68277f992564d18e02320ce40937cce5e0d
sha256: 117d77264a48c63beb05331723688f387c1e4b4bca04b75bf086bb96145a9744
lines: 153
kind: source
package: p07-shared-libs
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# packages/shared/src/types/dingtalk.ts

## 1. 结论与边界

钉钉集成契约（`:1-6`："第一阶段：凭证存储 + Stream 连接，消息处理后续迭代"）：Bot 配置（旧格式兼容 + 多 Bot v2）+ Bridge 状态 + 测试结果 + 16 键 IPC 通道。与 `feishu.ts` 高度同构。

不做的事：消息处理（注释明示后续迭代）；凭证加密（主进程 safeStorage）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 形状 |
| --- | --- | --- | --- |
| `DingTalkConfig` | interface | `:11-20` | 旧格式：`{enabled; clientId; clientSecret(safeStorage 加密 base64); defaultWorkspaceId?}` |
| `DingTalkConfigInput` | interface | `:23-29` | 旧格式输入（明文 secret，主进程加密） |
| `DingTalkBotConfig` | interface | `:34-51` | v2 单 Bot：`{id(UUID); name; enabled; clientId; clientSecret; defaultWorkspaceId?; defaultChannelId?; defaultModelId?}` |
| `DingTalkMultiBotConfig` | interface | `:54-57` | `{version:2; bots[]}` |
| `DingTalkBotConfigInput` | interface | `:60-77` | v2 输入（`id?` 新建不传；`clientSecret` 空串=不修改 `:69`） |
| `DingTalkBridgeStatus` | type | `:82` | `'disconnected'\|'connecting'\|'connected'\|'error'` |
| `DingTalkBridgeState` | interface | `:85-91` | `{status; connectedAt?; errorMessage?}` |
| `DingTalkBotBridgeState` | interface | `:94-99` | extends + `{botId; botName}` |
| `DingTalkMultiBridgeState` | interface | `:102-105` | `{bots: Record<id, DingTalkBotBridgeState>}` |
| `DingTalkTestResult` | interface | `:110-113` | `{success; message}` |
| `DINGTALK_IPC_CHANNELS` | const `as const` | `:117-153` | 16 键 `dingtalk:*`（旧格式 8 + 多 Bot 8） |

## 3. 内部逻辑与关键流程

纯声明。双格式共存语义：旧格式接口（`DingTalkConfig`/`Input`）标注"向后兼容"（`:10`、`:22`），v2 多 Bot 独立文件格式（`version:2`）；加密态/明文态分离（`clientSecret` 加密 base64 vs 输入明文，`:16`/`:26`/`:69`）。

## 4. 调用者与调用链

preload 钉钉段（`preload/index.ts:3692-3754`：getDingTalkConfig/getDecryptedDingTalkSecret/saveDingTalkConfig/testDingTalkConnection/startDingTalkBridge/stopDingTalkBridge/getDingTalkStatus/onDingTalkStatusChanged + 多 Bot 8 桥）；main `dingtalk-bridge-manager`/`dingtalk-config`（`main/index.ts:238-239`）；设置页钉钉面板。出向：无 import。

## 5. 数据 I/O、读写与副作用

纯类型，无 I/O（持久化 `~/.proma/dingtalk.json` 线索在注释 `:10`/`:53`——注意是**旧品牌路径**，实际配置路径见 config-paths `getDingTalkConfigPath`）。

## 6. 分支、失败、取消与恢复

不适用。失败语义：`DingTalkBridgeState.errorMessage?`、`DingTalkTestResult.success:false`；取消=STOP 通道。

## 7. 权限与权威状态

凭证边界：`clientSecret` 存储态为 safeStorage 加密 base64（`:16`/`:43`），输入态明文由主进程加密（`:22`/`:68`）；`GET_DECRYPTED_SECRET` 通道（`:123`）是明文出口——收口在 main handler。权威：凭证加密/解密在主进程。

## 8. 修改影响面

改字段影响钉钉面板与 bridge 管理器；通道改名需同步 preload `:3692-3754`/main 注册（`dingtalk:<kebab>` 无例外）；双格式改动需保旧格式兼容读。

## 9. 测试证据

无直接测试（检索 `DingTalkConfig`/`DINGTALK_IPC_CHANNELS` 于 `*.test.ts` 为 0 命中）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 导出、16 通道键值无例外 | 已证实 | 文件全读 |
| 双格式兼容/加密态分离语义 | 已证实 | `:10`、`:16`、`:69` 注释 |
| 注释路径 `~/.proma/dingtalk.json` 与现 config-paths 的 `~/.cdutai/dingtalk.json` 不一致（旧品牌注释残留） | 已证实 | `:10`/`:53` vs `config-paths.ts:1066` |
| 消息处理链 | 未知 | 注释明示"后续迭代"（`:5`） |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 11 导出全量 | §2 | covered |
| 双格式/凭证语义 | §3/§7 | covered |
| 消费者/影响面 | §4/§8 | covered |
| 测试/矛盾/未知 | §9/§10 | covered |
