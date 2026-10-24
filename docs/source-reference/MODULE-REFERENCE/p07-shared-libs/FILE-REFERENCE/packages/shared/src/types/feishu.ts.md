---
path: packages/shared/src/types/feishu.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 537a45ead3b3340ffe38ea77fadcd98c4dc4f276
sha256: 638ff895c7334f202b5f4185563340d39e6b4859181ce02d8bb22f896028df2a
lines: 338
kind: source
package: p07-shared-libs
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# packages/shared/src/types/feishu.ts

## 1. 结论与边界

飞书集成契约全集（`:1-6`）：Bot 配置（旧格式 + 多 Bot v2）+ Session 镜像 + Bridge 状态 + 聊天绑定 + 在场上报 + 群聊类型 + 消息历史 + 扫码注册（v3）+ 26 键 IPC 通道。比 `dingtalk.ts` 多出绑定/群聊/镜像/扫码注册域。

不做的事：消息处理/加密/连接（bridge 服务侧）。

## 2. 导出与关键符号

**配置族**：`FeishuConfig:11-20`（旧格式，`appSecret` safeStorage 加密 base64 `:17`）、`FeishuConfigInput:23-29`（明文输入）、`FeishuBotConfig:34-51`（v2 单 Bot，含 `defaultChannelId?`/`defaultModelId?`）、`FeishuMultiBotConfig:54-57`（`version:2`）、`FeishuBotConfigInput:60-77`（`appSecret` 空串=不修改 `:69`）。

**Session 镜像**：`FeishuSessionSyncMode:82`（`'off'|'stream'`）、`FeishuSessionMirrorSettings:85-90`（多 Bot 只能选一个同步 Bot `:84`）。

**Bridge 状态**：`FeishuBridgeStatus:95`（4 态）、`FeishuBridgeState:98-106`（+`activeBindings` 计数）、`FeishuBotBridgeState:109-114`、`FeishuMultiBridgeState:117-120`。

**绑定/在场**：`FeishuUpdateBindingInput:125-132`、`FeishuChatBinding:135-158`（内存态不持久化 `:134`；`source?: 'feishu'|'session-mirror'` `:151`）、`FeishuTestResult:163-168`、`FeishuPresenceReport:173-178`。

**群聊/消息**：`FeishuMention:183-192`（`id` 可为字符串或对象 `:187`）、`FeishuGroupInfo:195-208`（`userCount` 为免 @ 续聊判定权威 `:204`）、`FeishuGroupMember:211-216`、`FeishuMessageContext:219-232`、`FeishuChatMessage:237-252`（`senderType: 'user'|'app'|'anonymous'|'unknown'` `:243`）。

**IPC**：`FEISHU_IPC_CHANNELS:256-311`（**26 键**）：旧格式 8（`GET_CONFIG`…`REPORT_PRESENCE`）+ 多 Bot 8（`GET_MULTI_CONFIG`…`MULTI_STATUS_CHANGED`）+ 扫码注册 4（`REGISTER_APP_START/QRCODE/STATUS/CANCEL` `:304-310`）+ 绑定 4 + 状态推送 2。

**扫码注册类型**：`FeishuRegisterAppQRCode:315-322`（含 PNG dataUrl `:318`）、`FeishuRegisterAppStatus:324-327`（`'polling'|'slow_down'|'domain_switched'`）、`FeishuRegisterAppResult:329-338`（`appSecret` 明文一次性返回 `:332`；`tenantBrand?: 'feishu'|'lark'` `:335`）。

## 3. 内部逻辑与关键流程

纯声明。三条语义链：①配置双格式（旧→v2 多 Bot）与加密态/明文态分离；②绑定/镜像（`FeishuChatBinding.source` 区分飞书主动绑定 vs 桌面镜像，`:150-151`）；③扫码注册状态机（`:325` polling→slow_down/domain_switched→`FeishuRegisterAppResult`）。

## 4. 调用者与调用链

preload 飞书段（`preload/index.ts:3556-3656`：旧格式 8 + 多 Bot 7 + 扫码注册 4 桥）；main `feishu-bridge-manager`/`feishu-config`（`main/index.ts:235-237`，`registerBridge` `:264-283` 的 `shouldAutoStart/needsRecovery` 用 `FeishuMultiBotConfig`/`FeishuMultiBridgeState`）；设置页飞书面板；消息处理链（`FeishuMessageContext` 贯穿）。出向：无 import。

## 5. 数据 I/O、读写与副作用

纯类型，无 I/O。持久化线索：`~/.proma/feishu.json`（`:10`/`:53` 注释——**旧品牌路径**，实际 `config-paths.ts:1075` 为 `~/.cdutai/feishu.json`）。

## 6. 分支、失败、取消与恢复

不适用。失败/取消语义：`errorMessage?`/`FeishuTestResult`、`REGISTER_APP_CANCEL`（`:310`）、`STATUS_CHANGED` 推送。

## 7. 权限与权威状态

凭证边界同 dingtalk（加密存储/明文输入/`GET_DECRYPTED_SECRET` 出口 `:262`）；`FeishuRegisterAppResult.appSecret` 明文一次性返回（`:332` 注释）——扫码注册链的敏感点；`FeishuGroupInfo.userCount` 是免 @ 续聊判定权威（`:204`）；绑定表内存态（`:134`）。

## 8. 修改影响面

改字段影响飞书面板/bridge/消息链；通道改名需同步 preload `:3556-3656`/main 注册（`feishu:<kebab>` 26 键无例外）；`version:2` 文件格式改动需保旧格式读。

## 9. 测试证据

无直接测试（检索 `FeishuConfig`/`FEISHU_IPC_CHANNELS` 于 `*.test.ts` 为 0 命中）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（含矛盾）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 22 类型 + 1 常量（26 键）全量 | 已证实 | 文件全读 |
| 三条语义链（双格式/绑定镜像/扫码状态机） | 已证实 | §3 |
| `userCount` 免 @ 权威、绑定内存态 | 已证实 | `:204`、`:134` |
| **矛盾**：注释路径 `~/.proma/feishu.json` 为旧品牌残留，实际 `~/.cdutai/feishu.json` | 已证实 | `:10`/`:53` vs `config-paths.ts:1075` |
| **矛盾**：`FeishuMention.id` 联合（字符串或对象 `:187`）未给判别字段 | 已证实 | `:183-192` |
| 扫码注册实际协议 | 未知 | 服务实现不在本批 |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部导出 | §2 | covered |
| 语义链 | §3 | covered |
| 凭证/权威边界 | §7 | covered |
| 消费者/影响面 | §4/§8 | covered |
| 测试/矛盾/未知 | §9/§10 | covered |
