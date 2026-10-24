---
path: apps/electron/src/main/lib/cslab/cslab-security.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4f805262e9091df432a3b312349d8376f0839a97
sha256: 37a2cd1b3a714a155193a2ee007b959791198fd634d81287f85e7026a84ab17c
lines: 226
kind: source
package: p03-integrations
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-security.ts

## 1. 结论与边界

**CSLab 本机访问密码与门禁会话**（`cslab-security.ts:1-10` 五条安全红线）：①密码仅 **PBKDF2-SHA256 单向摘要**落盘，绝不存可逆密文/明文；②验证态仅主进程内存、**重启必须重新验密**；③**timingSafeEqual**+比对前长度校验（防时序侧信道/崩溃）；④PBKDF2 **异步**不阻塞事件循环；⑤连续错误**失败退避+临时锁定**防暴力猜测。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CsLabSecurityConfig` | interface（export） | `:34-48` | v1 可逆密文/v2 单向摘要（v1 仅迁移兼容 `:35/:44`） |
| `getCsLabAuthStatus` | function（export） | `:102-108` | `{isInitialized, isVerified}` |
| `assertCsLabUnlocked` | function（export） | `:114-118` | **主进程硬门禁**：所有敏感 IPC 必先过此断言；**前端门禁只是体验层**（`:111-112`） |
| `initCsLabPassword` | function（export） | `:121-142` | 首次设置（6-128 位 `:22-23`；已设拒绝 `:126`） |
| `verifyCsLabPassword` | function（export） | `:145-204` | 验密（§3） |
| `lockCsLabSession` | function（export） | `:207-209` | 会话锁定 |
| `__resetCsLabSecurityForTest` | function（export） | `:212-226` | 测试清理（含 .tmp/.bak） |

内部：`pbkdf2Async`（`:20`）、常量（SALT 16B/KEY 32B/**310_000 迭代**/sha256/5 次失败/30s 锁 `:22-29`）、`failedAttempts/lockoutUntil/sessionVerified`（`:31-32/:51`）、`readConfig/hasPassword`（`:53-63`）、`constantTimeEqual`（两侧 sha256 等长后 timingSafeEqual `:65-70`）、`derivePasswordHash`（`:72-76`）、`hashesMatch`（hex 解码+长度不等直接 false **绝不抛 RangeError** `:78-84`）、`writePasswordHash`（`:86-99`）。

## 3. 内部逻辑与关键流程

`verifyCsLabPassword`（`:145-204`）：锁定期直接拒（带剩余秒 `:146-149`）→ 空参拒 → 未设拒 → **recordFailure**（计数+达 5 次锁 30s `:161-169`）；**v2**：PBKDF2 异步派生+`hashesMatch`（`:172-181`）；**v1**：decryptToken 解密比对（损坏→提示重设 `:188`），成功后**立即迁移 v2**（迁移失败仅 warn 不影响本次登录 `:195-199`）。成功清计数+`sessionVerified=true`。

## 4. 调用者与调用链

入向：CSLab 敏感 IPC handler（`assertCsLabUnlocked` 硬门禁）、门禁 UI；测试 `cslab-security.test.ts`（同批）。出向：`node:crypto`（pbkdf2/timingSafeEqual/randomBytes/createHash）、`../config-paths`/`../token-crypto`/`../safe-file`。

## 5. 数据 I/O、读写与副作用

写：凭据 JSON（原子写，仅摘要+盐）；内存态：sessionVerified/failedAttempts/lockoutUntil。无网络。

## 6. 分支、失败、取消与恢复

v1→v2 迁移链（`:183-199`）；写盘失败返回结构化错误（`:136-138`）；锁定退避（`:163-167`）。不适用取消/恢复（异步函数）。

## 7. 权限与权威状态

**本文件即 CSLab 门禁权威**：五红线（`:4-9`）、硬门禁断言（`:111-118`）、前端门禁不可作授权依据（`:112`）。

## 8. 修改影响面

改摘要/比对/退避 → 本机门禁全链与暴力猜测防护；v1 迁移牵动历史凭据兼容；189 行测试（同批）锁定矩阵。

## 9. 测试证据

**直接测试 `cslab-security.test.ts`（189 行，同批，NOT_RUN）**，断言见测试手册。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 导出+8 内部+五红线+v1/v2 双路 | 已证实 | 逐行读 `:1-226` |
| token-crypto v1 密文强度 | 未知 | 跨文件 |
| 真实暴力猜测防护效果 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 7 导出 | §2 | `:34-226` | covered |
| 验密双路/退避/迁移 | §3 | `:145-204` | covered |
| 测试 | §9 | 测试文件 | covered（NOT_RUN） |
