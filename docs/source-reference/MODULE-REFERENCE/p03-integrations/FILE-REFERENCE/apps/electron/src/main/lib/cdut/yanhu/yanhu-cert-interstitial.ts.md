---
path: apps/electron/src/main/lib/cdut/yanhu/yanhu-cert-interstitial.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b622660dca1e98059bfbc5607a07e82b5cbdd61f
sha256: 4bcac26befa588bb5136f05b450e14f581b6d532fe7fdf0223177b596901bcc4
lines: 38
kind: source
package: p03-integrations
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/yanhu/yanhu-cert-interstitial.ts

## 1. 结论与边界

智联万站·证书阻断插页纯逻辑（文件头 `:1-6`，可被 Bun 直接单测）：阻断记录由会话 `verifyProc` 拒绝 eMudhra 泄露链证书时写入（`security/cert-blacklist.ts`）；本模块只做「本次实际请求 URL → 主机 → 阻断登记」纯解析，**不做任何 Electron 运行时调用**。

不做的事：不写阻断登记（verifyProc 负责）；不渲染插页 UI；无 I/O。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `YanhuCertBlockTarget` | interface | `:11-16` | `{hostname（已小写）; record: CertBlockedRecord（含证书主题/签发者供展示）}` |
| `resolveYanhuCertBlockTarget` | function | `:24-38` | `(requestedUrl, lookup) => YanhuCertBlockTarget \| null` |

## 3. 内部逻辑与关键流程

`resolveYanhuCertBlockTarget`：`requestedUrl` 空 → null；`new URL().hostname.toLowerCase()` 解析失败 → null（不抛）；hostname 空 → null；`lookup(hostname)` 命中 → `{hostname, record}`，否则 null（`:28-37`）。

**关键注释**（`:21-22`）：必须传「真实请求目标」（含路径/查询的原始 URL），不能用 verifyProc 登记的 `https://<hostname>/` 伪地址——否则临时放行无法复原原页面。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（排除测试）：智联万站证书插页 UI/会话层调用；直接测试 `yanhu-cert-interstitial.test.ts`。出向：`../../security/cert-blacklist`（仅类型 `CertBlockedRecord`）、`URL`（全局）。

## 5. 数据 I/O、读写与副作用

纯函数；无 I/O/日志。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| URL 空/非法/主机空 | `:28-35` | null（不抛异常） |
| 无阻断登记 | `:36-37` | null（普通网络失败不走证书插页） |
| 取消/恢复 | 无 | 纯函数 |

## 7. 权限与权威状态

无权限分支；权威登记在 `cert-blacklist`（本模块只读查找）；“真实请求 URL”口径见 §3 注释。

## 8. 修改影响面

改解析规则 → 影响证书插页触发/复原；`CertBlockedRecord` 形状联动 `security/cert-blacklist`。

## 9. 测试证据

本轮 `NOT_RUN`。直接测试 `yanhu-cert-interstitial.test.ts`（详见其手册）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 纯解析、零 Electron 依赖 | 已证实 | 文件头、`:24-38` |
| 失败一律 null 不抛 | 已证实 | `:28-35` |
| 真实 URL 口径 | 已证实 | `:21-22` 注释 |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `YanhuCertBlockTarget` | 2 | `:11-16` | covered |
| `resolveYanhuCertBlockTarget` 全分支 | 3 | `:24-38` | covered |
