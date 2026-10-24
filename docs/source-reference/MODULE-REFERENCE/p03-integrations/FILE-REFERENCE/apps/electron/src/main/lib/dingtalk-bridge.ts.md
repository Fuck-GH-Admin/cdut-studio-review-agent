---
path: apps/electron/src/main/lib/dingtalk-bridge.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ed9d3b6b8db26668cbbcfb6741fd1b06fc720e2a
sha256: dac1340e525b3e4033a7568309a7f0ffa4c883ee91276e987d4fb8230a7dc675
lines: 531
kind: source
package: p03-integrations
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/dingtalk-bridge.ts

## 1. 结论与边界

钉钉 Bridge 服务（多 Bot 版）（文件头 `apps/electron/src/main/lib/dingtalk-bridge.ts:1-10`）：①WebSocket 长连接（Stream 模式）收钉钉消息；②连接生命周期（启动/停止/状态推送）；③消息路由到 Profer Agent、经 `sessionWebhook` 回复。每实例对应一个 Bot，由 `DingTalkBridgeManager` 管理。

## 2. 导出与关键符号

`export` 逐条核对：1 个类 = 1 个导出（`:531` `export { DingTalkBridge }`）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `DingTalkBridge` | 类（导出） | 96-529 | 见下 |
| `DWClientModule`/`DWClientInstance`/`DWClientDownStream`/`DingTalkRobotMessage`/`DingTalkImageAttachment` | 内部接口 | 28-92 | SDK 与消息体形状（text/picture/richText，`:64-86`） |

类成员：`webhookCache`（200 FIFO，`:100-102`）；`messageQueue`（串行化防同 chatId 并发建 session，`:104-105`）；`pendingImages`（TTL 10min/Max 20，`:107-111`）；`accessToken` 缓存（`:113-114`）；`commandHandler`（`BridgeCommandHandler`，`:119-120`）。方法：constructor `:122-165`（sendText 适配 webhook 回复；`onWorkspaceSwitched` 持久化+同步 botConfig，`:152-162`）；`updateConfig:167-170`（复用实例保 chatBindings）；`getStatus:172-175`；`start:177-225`；`stop:227-247`；`testConnection:249-280`；`handleRobotMessage:282-435`；`replyTextViaWebhook:437-451`；`getAccessToken:453-478`；`downloadDingTalkImage:480-503`；`cacheWebhook:505-512`；`updateStatus:514-528`（广播全部窗口）。

## 3. 内部逻辑与关键流程

- `start`（`:177-225`）：凭证校验（抛 `请先配置 Client ID 和 Client Secret`）→ 解密 secret→动态 `import('dingtalk-stream-sdk-nodejs')`→`DWClient{keepAlive:true}`→注册 `TOPIC_ROBOT` 回调（立即 `EventAck.SUCCESS` 再处理）+全事件自动 ACK→`connect()`→`commandHandler.subscribe()`→20min 清理定时器→`connected` 状态。失败→`error` 状态+`client=null`+rethrow。
- `handleRobotMessage`（`:282-435`）：msgtype text/picture/richText 提取文本与 downloadCode（不支持类型跳过 `:330-332`）；图片下载用消息 `robotCode`（**而非 clientId**，`:343-344`）；下载失败回 `⚠️ 一张图片下载失败`；**纯图片→缓冲等文字触发**（`📎 已收到 N 张图片…`，`:366-376`）；文字合并缓冲；命令 `/` 带图→图放回缓冲仅处理命令（`:390-395`）；会话运行中→图片暂存+`❌ 上一条消息仍在处理中`（`:397-402`）；**先预检 workspace 有效防孤儿 binding**（`:404-409` 注释）；`ensureBinding` 无→`请先在 Profer 设置中选择 Agent 渠道`；`saveImageToSession` 落盘为附件→`handleIncomingMessage(…,attachments)`。
- `getAccessToken`（`:453-478`）：缓存过期前 5 分钟刷新（`expireIn ?? expiresIn ?? 7200`、下限 60s）；`oauth2/accessToken` 失败抛含 HTTP/体。
- `downloadDingTalkImage`（`:480-503`）：`messageFiles/download` 换 URL（空 URL 抛）→二进制拉取。
- `updateStatus`（`:514-528`）：合并状态+`BrowserWindow.getAllWindows()` 广播 `STATUS_CHANGED`（跳过 destroyed）。

## 4. 调用者与调用链

入向：`dingtalk-bridge-manager.ts:15`（实例化/生命周期）；测试：本批**无专属测试**（scope 无 `.test.ts`）。出向：`electron.BrowserWindow`、`dingtalk-stream-sdk-nodejs`（动态 import）、`./dingtalk-config.ts:20`（解密/保存）、`./bridge-command-handler.ts:21`、`./bridge-attachment-utils.ts:22`、`./agent-workspace-manager.ts:23`、`./settings-service.ts:24`。

## 5. 数据 I/O、读写与副作用

网络：钉钉 Stream WS + `api.dingtalk.com`（token/图片）；写：会话图片（`saveImageToSession`）；副作用：webhook 缓存/图片缓冲/token 缓存、窗口广播、定时器。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| 凭证缺 | 抛 | 181-183 |
| 连接失败 | error 状态+rethrow | 218-224 |
| 不支持 msgtype | 跳过 | 330-332 |
| 图片下载失败 | warn+回复跳过 | 354-358 |
| 纯图片 | 缓冲等文字 | 366-376 |
| 会话运行中 | 图片暂存+稍候 | 397-402 |
| workspace 无效/无 binding | 提示不落盘 | 404-419 |
| token/下载失败 | 抛 | 469-470,496-501 |
| stop | 全清（client/定时器/缓冲/token）+disconnected | 227-247 |

## 7. 权限与权威状态

- Secret 按需解密（`getDecryptedBotClientSecret`）；workspace 预检防孤儿 binding（`:404-409`）。
- webhook 回复走会话级 URL（`sessionWebhook`/缓存兜底）。

## 8. 修改影响面

改消息路由影响钉钉对话；改图片缓冲影响图文合并；改状态广播影响 UI。

## 9. 测试证据

本批**无专属测试**（scope 事实）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型/网络。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 图文缓冲/合并语义 | 已证实 | `:366-395` |
| 孤儿 binding 预检 | 已证实 | `:404-409` |
| token 缓存 5min 提前量 | 已证实 | `:453-478` |
| robotCode 而非 clientId | 已证实 | `:343-344` |
| 真实钉钉 Stream | 未知 | 未运行 |
| 测试覆盖 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 生命周期 | §3 | 122-280 | covered |
| 消息路由 | §3 | 282-435 | covered |
| 网络族 | §3 | 437-512 | covered |
| 状态广播 | §3 | 514-528 | covered |
| 断言 | §9,§10 | — | unknown |
