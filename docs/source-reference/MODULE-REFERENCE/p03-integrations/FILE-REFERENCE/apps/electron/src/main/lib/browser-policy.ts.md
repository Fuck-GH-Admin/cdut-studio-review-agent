---
path: apps/electron/src/main/lib/browser-policy.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 289faf8e10524057796e4f3d05e7d0de9447855f
sha256: 5deef627338f1995d97db8f041a383a869d039c3a01549c229e88a5da96b2db4
lines: 133
kind: source
package: p03-integrations
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/browser-policy.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

受管浏览器的**纯 URL 边界**（头注 :1「保持无 Electron 依赖，便于普通 Bun 测试验证」）：地址栏规范化、协议/认证/私网过滤、子资源按顶层信任上下文校验、导航前 DNS 解析防公网域名→私网 IP。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `normalizeBrowserUrl` | fn | 30-52 | 裸域名/协议相对/端口输入规范化（公网 HTTPS、本机/局域网 HTTP 缺省） |
| `assertSafeBrowserUrl` | fn | 54-65 | NUL 硬校验（CVE-2026-105482，:55 注释）+仅 http/https+拒认证信息 |
| `isSafeBrowserSubresourceUrl` | fn | 73-85 | 同步子资源检查（http/https/ws/wss，无重复 DNS） |
| `assertSafeBrowserSubresourceDestination` | fn | 91-99 | 公网顶层拒私网子资源 |
| `assertSafeBrowserDestination` | fn | 111-133 | 导航前 DNS 解析拒绝私网结果 |

内部：`isPrivateAddress`（:8-25，localhost/.local/IPv6 段/IPv4 私网段/组播；IPv4-mapped 一律拒，注释 :14-16 防映射绕过）、`BROWSER_DNS_LOOKUP_TIMEOUT_MS=3000`（:6）、`lookupBrowserAddresses`（:102-110）。

## 3. 内部逻辑与关键流程

1. **`normalizeBrowserUrl`**（:30-52）：`//` 协议相对按私网性选 http/https；`host:port` 形态不误判 scheme（:47 注释）；显式 scheme 原样返回。
2. **`assertSafeBrowserUrl`**（:54-65）：`assertSafeUrlNoNul` 前置（杜绝 `%00/\0` 欺骗 DNS，CVE-2026-105482）→协议白名单→拒 `username/password`。
3. **子资源**（:73-99）：同步协议检查（本地开发页须能加载同源脚本/XHR，注释 :69-72）；`assertSafeBrowserSubresourceDestination` 公网顶层→私网子资源拒。
4. **`assertSafeBrowserDestination`**（:111-133）：本机/局域网输入视为有意开发目标不查 DNS（注释 :113-115）；否则 3s 超时 lookup，任一地址私网→拒；DNS 失败→拒（`无法确认…公网地址`）。

## 4. 调用者与调用链

入向（生产）：`browser-controller.ts:10`（will-navigate/onBeforeRequest/navigate 链）。测试：`browser-policy.test.ts`。出向：`@profer/shared`（`assertSafeUrlNoNul`，:4）、`node:dns/promises`（:2）。

## 5. 数据 I/O、读写与副作用

DNS lookup（3s 超时 Promise.race）；无写盘。

## 6. 分支、失败、取消与恢复

各类 throw 中文文案（协议/认证/NUL/私网/DNS）；DNS 超时→拒；无重试。

## 7. 权限与权威状态

- 网络边界权威：仅 http/https（+子资源 ws/wss）；拒认证信息 URL；公网→私网拒绝（含 IPv4-mapped 防绕过）。
- 防御深度声明：「Chromium 仍是最终网络栈；完整 DNS-rebinding 防护需要受控 egress proxy」（注释 :104-108/87-90 如实记录残余风险）。
- 无 sender/role 检查。

## 8. 修改影响面

全部导航/子资源/弹窗链。同测：`browser-policy.test.ts`（6 用例）。

## 9. 测试证据

直接测试 `browser-policy.test.ts`（6 用例 / 1 describe；纯函数；NOT_RUN）：
1. `:5-9` 地址栏规范化（`example.com/docs`/`//`/`:8443`）。
2. `:11-22` 本机开发地址放行+file:/javascript:/认证信息拒。
3. `:24-29` 本机缺省 HTTP、公网缺省 HTTPS。
4. `:31-37` 本地顶层可本地子资源（含 ws）；公网顶层拒私网子资源（含 wss）。
5. `:39-45` 子资源同步策略（data:/认证/非法 URL 拒）。
6. `:47-53` NUL 截断（CVE-2026-105482）顶层与子资源一律拒。

未覆盖：`assertSafeBrowserDestination` DNS 分支（真实 lookup 未测）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出/内部符号/行号 | 已证实 | 逐行核对 |
| NUL 拒/协议白名单/私网规则 | 已证实 | 测试族逐条 |
| DNS rebinding 防护完整性 | 未知 | 注释自述需 egress proxy（:104-108） |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `normalizeBrowserUrl` | §3.1/§9 | 30-52 | covered |
| `assertSafeBrowserUrl` | §3.2/§9 | 54-65 | covered |
| 子资源双函数 | §3.3/§9 | 73-99 | covered |
| `assertSafeBrowserDestination` | §3.4 | 111-133 | partial（DNS 未测） |
