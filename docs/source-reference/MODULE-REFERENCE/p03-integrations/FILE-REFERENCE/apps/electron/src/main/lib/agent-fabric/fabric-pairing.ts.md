---
path: apps/electron/src/main/lib/agent-fabric/fabric-pairing.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a045cdf7dad9820c61fb7dfc5bcc632d23912a3c
sha256: f8160fab425437c06c288a650894540de49a860d5f2aa5cc7b9cf51f0e9d7ea2
lines: 113
kind: source
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-fabric/fabric-pairing.ts

## 1. 结论与边界

**本地调用方配对存储**（设计文档 §8.1）：首次接入需用户批准配对生成可撤销身份；token 只存 sha256 哈希、明文仅创建时返回一次；撤销后立即拒绝；存储为配置文件不用数据库；Phase 1「用户批准」=终端显式执行配对脚本（`scripts/agent-fabric-pair.mjs`），应用内审批 UI 属 Phase 4（`apps/electron/src/main/lib/agent-fabric/fabric-pairing.ts:1-12`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名 | 说明 |
| --- | --- | --- | --- | --- |
| `PairedClientRecord` | 接口 | 21-29 | | clientId/clientName/**tokenHash**/grants/createdAt/lastSeenAt/revokedAt? |
| `AuthenticatedClient` | 接口 | 35-39 | | |
| `getPairingFilePath` | 函数 | 41-43 | | `<configDir>/agent-fabric-clients.json` |
| `pairClient` | 函数 | 68-86 | `(name, grants?, path?): {clientId, token}` | 创建配对（token=双 UUID 拼接 `:75`；grants 默认 DEFAULT_PAIRED_AGENT_GRANTS） |
| `authenticateToken` | 函数 | 89-99 | `(token, path?): AuthenticatedClient \| null` | Bearer 认证；撤销/未知→null |
| `revokeClient` | 函数 | 102-109 | `(clientId, path?): boolean` | 撤销立即生效（revokedAt 戳） |
| `listPairedClients` | 函数 | 111-113 | | |

内部：`hashToken`（`:45-47`）、`readPairingFile/writePairingFile`（解析失败→空列表，`:49-62`）。

## 3. 内部逻辑与关键流程

`authenticateToken`：哈希查找→`revokedAt` 校验（`:94`）→刷新 lastSeenAt 写回（`:96-97`）→返回 grants。

## 4. 调用者与调用链

入向：`agent-fabric-service.ts:21`（authenticate 注入 fabric-server）、`fabric-server.test.ts:20`。出向：node:crypto/fs、`../config-paths`、`@profer/agent-fabric`。

## 5. 数据 I/O 与副作用

读写 `agent-fabric-clients.json`。

## 6. 分支、失败、取消与恢复

无 throw；读失败兜底空；撤销幂等（`:105`）。

## 7. 权限与权威状态

安全红线：token 仅哈希落盘（`:5`）、明文一次性（`:66`）、撤销即时拒绝（`:88`）。

## 8. 修改影响面

grants 语义与 Gateway 权限校验同步；配对脚本写同一文件（跨入口并发写无锁——照实记录）。

## 9. 测试证据

`fabric-server.test.ts`（认证 5 用例经真实 HTTP，另篇）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 导出+红线 | 已证实 | `:1-113` 逐行 |
| 并发写一致性 | 未知 | 无锁（如实登记） |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部导出/分支 | §2/§3 | covered |
| 测试/运行 | §9/§10 | unknown（NOT_RUN） |
