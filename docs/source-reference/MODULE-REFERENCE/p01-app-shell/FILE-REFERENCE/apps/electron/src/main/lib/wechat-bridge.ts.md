---
path: apps/electron/src/main/lib/wechat-bridge.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: bfcff56c26a25de73e9c863b494794fba0f0bcd7
sha256: f3c3e910fc5af66ab3f52a9464003ca4cd67081ac49c30297512288f87b5afc5
lines: 922
kind: source
package: p01-app-shell
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/wechat-bridge.ts

## 1. 结论与边界

微信 Bridge 服务（922 行，头注释 `:1-10`，两段全读）：基于微信 iLink Bot API（官方协议）——QR 扫码登录 / HTTP 长轮询收消息 / 发消息与输入状态；消息路由到 Agent，回复经 iLink 发送。单例 `wechatBridge`（`:922`）。

**边界**：命令路由/附件落盘在 `bridge-command-handler`/`bridge-attachment-utils`（跨批）；凭证存取在 `wechat-config`（本批手册）；iLink 真实 API 行为 NOT_RUN。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `wechatBridge` | 常量（导出） | 922 | `new WeChatBridge()` | 单例 |

内部：`ILinkClient` 接口/类（getUpdates/sendMessage/sendText/getConfig/sendTyping/downloadImage/downloadFile/post）、`WeChatBridge` 类（startLogin/start/stop/logout/handleMessage/pollLoop/…）；常量 `DEFAULT_BASE_URL='https://ilinkai.weixin.qq.com'`（`:31`）、`LONG_POLL_TIMEOUT_MS=40s`（`:34`）、`SEND_TIMEOUT_MS=15s`（`:35`）、`MAX_CONSECUTIVE_FAILURES=5`（`:36`）、`INITIAL_BACKOFF_MS=3s`（`:37`）、`MAX_BACKOFF_MS=60s`（`:38`）、`SESSION_EXPIRED_CODE=-14`（`:39`）、`DOWNLOAD_MEDIA_TIMEOUT_MS=30s`（`:40`）、`MAX_MEDIA_DOWNLOAD_SIZE/MAX_FILE_SIZE=20MB`（`:41-42`）、`HANDLE_MESSAGE_TIMEOUT_MS=90s`（`:43`）、`PENDING_IMAGES_CLEANUP_INTERVAL=7min`（`:44`）、`ALLOWED_CDN_HOSTS` 4 后缀（`.weixin.qq.com/.wechat.com/.qpic.cn/.qlogo.cn`，`:46-51`）、`PENDING_IMAGES_TTL=10min`、`PENDING_IMAGES_MAX/PENDING_FILES_MAX=15`；`isAllowedCdnUrl`（`:53-61`）、`fetchMediaWithSizeGuard`（`:63-79`）、`generateWechatUIN`（`:117` 附近）。导出合计 1。

## 3. 内部逻辑与关键流程

1. **登录 startLogin**（`:430-459`）：`fetchQRCode`（`:500-504`）→ `QRCode.toDataURL`（qrcode 库）→ `pollQRStatus`（`:506-562`，每轮 40s abort 超时重试；`confirmed`→凭证+`connecting`、`scaned`→`scanned`、`expired`→throw、`wait`→继续；abort→throw `'登录已取消'`）→ `saveWeChatCredentials(creds)`（**:447 未传 defaultWorkspaceId**，见 wechat-config 手册 §3.2 重写语义）→ `startPolling`。登录失败→`error` 态；abort 中断则静默（`:453`）。
2. **startPolling**（`:564` 起）：防并发（`polling` 则先 stop，`:566-568`）→ `new ILinkClient(creds)` → `loadSyncBuf`（`get_updates_buf` 游标持久化到 `getWeChatSyncPath()`，`:884-908`）→ `commandHandler.subscribe()`（EventBus）→ 7min 清理定时器 → 状态 `connected` → 后台 `pollLoop`。
3. **pollLoop**（`:584` 后段）：`getUpdates`（45s 长轮询超时）；**`errcode -14` 双分支**：有游标→清游标重试，无→`error` '会话已过期请重新扫码'；其他错误 warn 继续；每条消息 `handleMessage` 串行 + **90s 单条超时保护**；连续失败指数退避（3s×2^n 封顶 60s），**≥5 次→error 态暂停**（注释：交自愈守护/手动重连）。
4. **handleMessage**：仅 USER+FINISH 处理；文本拼接 text_item；图片/文件下载（**CDN 白名单 https 限定**（`:53-61`）、**20MB 双重 guard**：Content-Length 与实际大小（`:69-77`）、**AES-128-ECB 解密**、`parseAesKey` 三路 base64-16B/base64-hex-16B/hex-16B）；纯媒体→按 chatId 缓冲（**15 张/15 个封顶、10min TTL**）等文字触发；文字+媒体→会话活跃则暂存并提示、否则 `ensureBinding`/`saveImageToSession|saveFileToSession` 生成 BridgeAttachment 交 `commandHandler.handleIncomingMessage`；命令（/开头）携带媒体→媒体放回缓冲只处理命令。
5. **sendText**：超 **4000 字分段**发送（`SEND_TIMEOUT_MS` 15s/段）；`sendTyping` 输入状态。
6. **stop**（`:471-487`）：abort 双控制器、`commandHandler.unsubscribe()`、清定时器与图片/文件缓冲、状态 `disconnected`。**logout**（`:490-496`）：stop + `clearWeChatCredentials()` + 清游标并 saveSyncBuf。
7. **updateStatus**（`:912-919`）：状态合并后广播所有未销毁 BrowserWindow（`WECHAT_IPC_CHANNELS.STATUS_CHANGED`）。

## 4. 调用者与调用链

入向（全冻结树检索 `wechat-bridge`，2 文件）：`main/index.ts:240`（`wechatBridge`，启动装配）、`main/ipc.ts:454`（`wechatBridge`，IPC 暴露）。出向：`./wechat-config`（5 符号，`:20`）、`./config-paths`（`getWeChatSyncPath`）、`./bridge-command-handler`/`./bridge-attachment-utils`/`./agent-workspace-manager`（跨批）、`@profer/shared`（类型+IPC 常量）、`qrcode` 库、`node:fs`/`node:crypto`、`electron.BrowserWindow`。

## 5. 数据 I/O、读写与副作用

- 网络：iLink API（QR/长轮询/发消息）+ CDN 媒体下载（白名单）。
- 盘：同步游标 JSON（`getWeChatSyncPath()`）、经 bridge-attachment-utils 存会话目录（图片/文件）。
- crypto：UIN 随机（`:117` 附近）、媒体 AES-128-ECB 解密。
- Electron：BrowserWindow 广播（状态推送）。

## 6. 分支、失败、取消与恢复

- 会话过期 `-14` 双分支（清游标重试/报错提示）；指数退避 3s×2^n≤60s、≥5 次暂停（§3.3）。
- 90s 单条消息超时保护；45s 长轮询超时视为正常续轮。
- 媒体下载失败逐条跳过并回执；20MB 双重 guard 防超大载荷。
- stop/logout 全量清理（abort/unsubscribe/清定时器与缓冲）；游标持久化防丢消息。

## 7. 权限与权威状态

- **CDN 域名白名单 + https 限定**（`:53-61`）：媒体下载安全边界。
- 大小上限（20MB 双 guard）；凭证经 wechat-config 加密存储（botToken）。
- 无 sender/role 检查（消息面：仅 USER+FINISH 进路由）。

## 8. 修改影响面

- 微信收发全链（main/index 启动、ipc 暴露）；`WECHAT_IPC_CHANNELS.STATUS_CHANGED` 是 UI 状态契约。
- 常量群（退避/超时/上限/白名单）是行为契约；`get_updates_buf` 游标格式（`{get_updates_buf}` JSON）是持久化契约。
- 需同步关注：`bridge-command-handler`/`bridge-attachment-utils`/`wechat-config`（跨批/本批）。

## 9. 测试证据

直接测试：**无**（全冻结树检索 `wechat-bridge` 无测试命中；检索范围=baseline/source 全树）。

`NOT_RUN`：本轮未运行任何测试；iLink 真实 API/长轮询/扫码未验证。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 单导出/登录流/pollLoop 退避与 -14 双分支/90s 超时/白名单/20MB 双 guard/AES 解密三路/缓冲 15/15/10min/4000 分段/stop·logout 清理 | 已证实 | `:1-922` 全文两段逐行 |
| 2 个消费方 | 已证实 | 全树检索（§4） |
| saveWeChatCredentials 未传 defaultWorkspaceId 的重写语义 | 已证实（代码事实） | `:447` + wechat-config `:47` |
| iLink API 真实行为/QR 有效期/AES 密钥下发协议 | 未知 | NOT_RUN |
| bridge-command-handler/attachment-utils 内部 | 未知 | 跨批未深读 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 常量群/白名单/大小 guard | §2/§7 | 29-79 | covered |
| 登录（QR/轮询/保存） | §3.1 | 430-562 | covered |
| startPolling/pollLoop（退避/-14/90s） | §3.2-3.3 | 564-700 | covered |
| handleMessage（媒体/缓冲/命令） | §3.4 | 700-860 | covered |
| sendText 分段/stop/logout/游标/状态推送 | §3.5-3.7 | 471-919 | covered |
