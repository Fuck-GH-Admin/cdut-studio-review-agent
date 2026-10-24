---
path: apps/electron/src/main/lib/auth-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fea53c20ceb4b8824617ffd0d1b5bdbe287c6cf1
sha256: f92a4d94c010dade5ef9a282120cf5d1d98886807d32a59211ec0f012e8a6552
lines: 1057
kind: source
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/auth-service.ts

## 1. 结论与边界

**认证服务**（1057 行，本批最大件）：团队账户登录/注册/注销/JWT 管理；**令牌 Electron safeStorage 加密存储**（`:5`），三格式迁移链（旧 raw Buffer→新 base64→AES-GCM `:107-141`）；路由 nginx 反代 `/proma/`（`:7-9`）。

## 2. 导出与关键符号（22 个 export）

**服务器配置**：`DEFAULT_TEAM_SERVER_URL:21`（`https://profer.cn/proma`，商业内置不暴露 `:20`）、`listTeamServers:54`、`addTeamServer:59`、`removeTeamServer:69`。
**认证操作**：`login:198-341`（自动注册服务器配置→10s 超时→409 device_limit 结构化返回 `:238-252`→令牌落盘→`scheduleAutoRefresh`→渠道备份恢复→商业模式渠道同步）、`RegistrationOptions/RegistrationOtpResult:343-352`、`getRegistrationOptions:371`、`sendRegistrationOtp:380`、`verifyRegistrationOtp:390`、`register:400-520`（邀请码/激活码/OTP 多路注册，HTTP 状态码→中文错误映射 `:434-438`）、`hasStoredRefreshToken:523`、`tryRestoreSession:532-555`（恢复成功广播 `team:auth-restored`）。
**状态查询**：`getAuthStatus:558-582`（首个未过期令牌）、`LogoutResult:587-594`、`getCommercialMode:842-851`（**不依赖 token 过期** `:846-847`）、`getIsAdmin:854`、`getAccessToken:868`、`getServerInfoList:889`、`getTeamAuth:903-931`、`getMembershipTier:1041`、`isSelfConfigAllowed:1029-1038`（服务端权威→tier 兜底）。
**注销**：`logout:597-675`（世代失效防竞态+渠道备份成功才清空——**历史 bug 注释** `:631-632`）。
**续期**：`scheduleAutoRefresh:685-720`（过期前 5min+指数退避 1→60min `:681-682`）、`refreshAuthToken:809-815`（**并发合并**共享单请求 `:722`）、`recoverCommercialProxyAuth:823-839`（relay 失效恢复）。
**远程设备**：`getRemoteRelayTicket:956-976`、`listRemoteDevices:978-1006`（401 刷新重试）、`revokeRemoteDevice:1009`、`getTeamAuthWithRefresh:1050`。

## 3. 内部逻辑与关键流程

- **令牌存储**（`:100-159`）：三格式读迁移+`encryptToken` 写；`AuthTokenStore:76-92`（relayToken/membershipTier/canSelfConfigApi 等）。
- **登出竞态防护**（`:164-167`/`:598-605`）：`authSessionGeneration` 世代+`logoutInProgress`——refresh 响应世代校验后才写回（`:762-765`）。
- **refresh 链**（`:726-803`）：世代快照→逐服务器刷新→401 清除失效凭据防重试循环（`:788-794`）→成功重排续期。
- **proxy 口径契约**（`:914-918`）：`isCommercial = commercialMode || isCommercialBuild()` 必须与 chat-service/agent-orchestrator 的 `shouldUseCommercialProxy` 一致，否则 OSS 构建+服务端 commercial 时 proxyToken 空回退 1h token 致长任务 60 分钟 401。

## 4. 调用者与调用链

认证 IPC/启动恢复/渠道同步；出向 config-paths/build-target/identity-service/token-crypto/channel-manager/undici。

## 5. 数据 I/O、读写与副作用

网络请求（login/refresh/logout/devices）、加密文件读写、定时器、窗口广播。

## 6. 分支、失败、取消与恢复

全链 try/catch 中文化错误；渠道备份失败**不清空**（`:646-658`）；refresh 401 清 token；退避防打点风暴。

## 7. 权限与权威状态

- **凭据安全红线**（`:5`/`:122-141`）：safeStorage/AES-GCM 加密，明文旧格式自动迁移。
- **备份先于清空**（`:627-632` 历史 bug 注释）：备份失败保留活跃渠道。
- **canSelfConfigApi 服务端权威**（`:84`/`:1026-1027`）。
- **proxy 口径跨层一致契约**（`:914-918`）。

## 8. 修改影响面

改令牌/续期影响登录持久性；口径变动必须联动 chat-service/agent-orchestrator。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（矛盾照实记录，主根自读兜底——原定子agent 失败）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 22 导出/三格式迁移/竞态防护/退避 | 已证实 | 1057 行全读（两段） |
| **照实**：`:884-887` 注释（getTeamAuth 说明）悬于 `getServerInfoList` 上方错位；大量 `require()` 内联导入（`:60`/`:95` 等）与顶部 import 混用 | 已证实 | `:884-888`、`:60` |
| token-crypto/identity-service/channel-manager 实现 | 未知 | 不在本批 |
| 网络/加密实效 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 22 导出全量 | §2 | covered |
| 令牌/竞态/refresh 链 | §3 | covered |
| 四红线 | §7 | covered |
