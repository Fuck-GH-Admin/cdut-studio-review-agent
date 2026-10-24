---
path: apps/electron/src/main/lib/xai-oauth-credentials.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5bb3d2ca0683dffc8117cf9c96b180f09121190c
sha256: 858de05aa96c67a014636eb257e8e703ba1e08623a725e4da35518296851621e
lines: 62
kind: source
package: p01-app-shell
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/xai-oauth-credentials.ts

## 1. 结论与边界

跨 Pi Agent query 的 xAI OAuth refresh 协调器（62 行，头注释 `:1-6`）：Pi 为每次 query 建独立 CredentialStore，xAI 可能轮换 refresh token——按 channelId **串行刷新**，并发调用复用刚换出的凭据。纯内存两 Map。

**边界**：持久化在调用方（Channel.apiKey+safeStorage，跨批）；刷新动作由注入回调执行。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `rememberXaiOAuthCredentials` | 函数（导出） | 17-28 | `(channelId, credentials, force = false) => XaiOAuthCredentials` | 记录最新凭据 |
| `refreshXaiOAuthCredentialsSerial` | 异步函数（导出） | 34-62 | `(channelId, fallback, refresh) => Promise<XaiOAuthCredentials>` | 串行刷新+复用 |

内部：`inflightCredentialRefreshes`（`:10`，channelId→在飞 Promise）、`latestCredentialsByChannel`（`:11`）。导出合计 2。

## 3. 内部逻辑与关键流程

1. **remember**（`:17-28`）：`force || !existing || credentials.expires > existing.expires` 才覆盖并返回新值（`:23-25`）；否则返回现存（`:27`）——防新 query 的旧快照覆盖已被刷新的凭据（`:14-15` 注释）。
2. **refreshSerial**（`:34-62`）：
   - 在飞命中直接复用（`:39-40`）。
   - 现存凭据与 fallback **不同**（access 或 refresh 不等）且未过期（`expires > Date.now()`）→ 直接返回（`:42-47`）。
   - 否则起刷新：以 `latest ?? fallback` 为基（`:50`）调 `refresh(current)`，结果 `remember(force:true)`（`:52`）；`set` in-flight（`:54`）；`finally` 仅当仍是自己的条目才删（`:58-60`，防误删后来者的条目）。

## 4. 调用者与调用链

入向（全冻结树检索 `xai-oauth-credentials`，2 文件）：`lib/channel-manager.ts:34`（`refreshXaiOAuthCredentialsSerial`+`rememberXaiOAuthCredentials`）、`lib/adapters/pi-model-registry.ts:27`（同两者）。出向：`@profer/shared` 类型（`:8`）。

## 5. 数据 I/O、读写与副作用

无磁盘/网络（不适用，依据：纯内存 Map + 注入回调）。副作用=经 `refresh` 回调（跨批实现）产生网络刷新。

## 6. 分支、失败、取消与恢复

- 分支：force/新旧 expires 比较（`:23`）；在飞复用（`:39-40`）；fallback 比较+过期判断（`:43-45`）。
- 失败：`refresh` 抛错时 in-flight Promise reject 传播给全部复用者；`finally` 仍清理（`:57-60`）。
- 恢复：下次调用重新起刷新（in-flight 已清）。

## 7. 权限与权威状态

无权限分支（不适用）。权威=内存内最新凭据（expires 单调为覆盖条件）；OAuth 凭据最小保留语义（仅内存，不落盘——头注释 `:1-6`）。

## 8. 修改影响面

2 个消费方的 token 刷新链（channel-manager 凭据续期、pi-model-registry 请求前校验）；串行/复用语义破坏会导致 refresh token 轮换竞态（头注释问题面）。

## 9. 测试证据

直接测试：**无**（全冻结树检索 `xai-oauth-credentials` 无测试命中；检索范围=baseline/source 全树）。

`NOT_RUN`：本轮未运行任何测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出/覆盖条件/串行复用/finally 清理 | 已证实 | `:1-62` 全文逐行 |
| 2 个消费方 | 已证实 | 全树检索（§4） |
| refresh token 轮换的实际协议 | 边界（远端/xAI） | 头注释 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 两 Map | §2 | 10-11 | covered |
| `rememberXaiOAuthCredentials` | §3.1 | 17-28 | covered |
| `refreshXaiOAuthCredentialsSerial` | §3.2/§6 | 34-62 | covered |
