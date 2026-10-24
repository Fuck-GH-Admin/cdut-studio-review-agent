---
path: packages/shared/src/types/wechat.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4127f43d8be65882ca0759512d93478fe2240f6c
sha256: f63f5a540f02d0506632fe473c515414f504ceb6108b62889d145a0d25599407
lines: 129
kind: source
package: p07-shared-libs
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/types/wechat.ts

## 1. 结论与边界

微信集成**类型定义模块**（`packages/shared/src/types/wechat.ts:1-6`）：基于微信 iLink Bot API（官方协议），含 iLink 客户端类型、Bridge 状态、IPC 通道常量。纯类型/常量，无逻辑。

## 2. 导出与关键符号

`export` 共 **11 个**（7 interface/type + 3 const + 1 IPC const）。

| 符号 | 类型 | 行 | 形状 | 说明 |
| --- | --- | --- | --- | --- |
| `WeChatCredentials` | interface | `:11-20` | `{botToken, ilinkBotId, baseUrl, ilinkUserId}` | 扫码登录凭证 |
| `WeChatConfig` | interface | `:25-32` | `{enabled, credentials: WeChatCredentials\|null, defaultWorkspaceId?}` | 持久化 `~/.proma/wechat.json`（`:24`） |
| `WeChatBridgeStatus` | type | `:37-43` | 6 态：`disconnected`/`waiting_scan`/`scanned`/`connecting`/`connected`/`error` | 连接状态 |
| `WeChatBridgeState` | interface | `:46-54` | `{status, connectedAt?, errorMessage?, qrCodeData?}` | 状态详情 |
| `WECHAT_ITEM_TYPE` | const | `:59-65` | `TEXT:1/IMAGE:2/VOICE:3/FILE:4/VIDEO:5` | 消息项类型 |
| `WECHAT_MESSAGE_TYPE` | const | `:68-71` | `USER:1/BOT:2` | 消息类型 |
| `WECHAT_MESSAGE_STATE` | const | `:74-78` | `NEW:0/GENERATING:1/FINISH:2` | 消息状态 |
| `WeChatMessageItem` | interface | `:81-88` | 5 种 item（text/image/voice/file/video） | 消息项 |
| `WeChatMediaInfo` | interface | `:91-96` | CDN 加密引用 4 字段 | 媒体 |
| `WeChatIncomingMessage` | interface | `:99-108` | 收到消息（seq/message_id/from/to/type/state/item_list/context_token） | 入站消息 |
| `WECHAT_IPC_CHANNELS` | const | `:112-129` | 8 通道（`wechat:get-config`…`wechat:status-changed`） | IPC 常量 |

## 3. 内部逻辑与关键流程

无逻辑（类型声明）。`WECHAT_IPC_CHANNELS`（`:112-129`）：`GET_CONFIG`/`SAVE_CONFIG`/`START_LOGIN`/`LOGOUT`/`START_BRIDGE`/`STOP_BRIDGE`/`GET_STATUS`/`STATUS_CHANGED`（最后一项为主进程→渲染进程推送，`:127-128`）。

## 4. 调用者与调用链

- 消费方：微信 Bridge（`wechat-bridge` 系）、IPC 注册/preload、配置存储（`~/.proma/wechat.json`，botToken 走 safeStorage 加密，`:28`）。
- 出向：无。

## 5. 数据 I/O、读写与副作用

纯类型；无运行时行为。（持久化由消费方执行。）

## 6. 分支、失败、取消与恢复

不适用（无逻辑）。状态机语义在 Bridge 实现（`:37-43` 注释：`waiting_scan` 等待扫码、`scanned` 等待确认、`connecting` 建立长轮询、`connected` 长轮询运行中）。

## 7. 权限与权威状态

`WeChatCredentials`（`:11-20`）是凭证形状；注释指明 botToken 用 safeStorage 加密（`:28`）。类型本身不做校验。

## 8. 修改影响面

- 状态枚举/IPC 通道名变更需同步 Bridge 与渲染层；通道名是跨进程契约。
- `WeChatMessageItem` 的 5 分支对应 iLink 协议消息项；协议升级需同步。

## 9. 测试证据

- 纯类型模块无专属测试（全树检索 `WECHAT_IPC_CHANNELS` 测试命中 0）；行为测试在 Bridge 侧（不在本批）。
- **NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 个导出、形状 | 已证实 | `:11-129` |
| 无运行时逻辑 | 已证实 | 全文类型/常量 |
| 持久化位置 `~/.proma/wechat.json` | 已证实（注释） | `:24` |
| Bridge 行为 | 未知 | 不在本批 |
| 测试实际通过 | 未知 | 无测试可跑 |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 11 个导出 | 2 | — | covered |
| IPC 通道 8 个 | 3 | `:112-129` | covered |
| 状态机语义 | 6 | `:37-43` | covered |
| 测试证据 | 9 | — | covered（纯类型） |
