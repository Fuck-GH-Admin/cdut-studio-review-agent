---
path: apps/electron/src/main/lib/browser-policy.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4a69dac9df536f12b105c0841d8615b4c171a5a3
sha256: e5ada5e11773f356f0b5d7800f76a801bb0f473eed36b52bec3973ba3b8a098b
lines: 54
kind: test
package: p03-integrations
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/browser-policy.test.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 测试目标

受管浏览器 URL 策略：地址栏规范化、本机开发地址放行/其他私网拒、本地 HTTP 公网 HTTPS 缺省、子资源按顶层信任上下文、NUL 截断（CVE-2026-105482）拒。

## 2. 用例清单

6 用例 / 1 describe（`受管浏览器 URL 策略` :4）。纯函数；无 mock。

| # | 用例 | 行 | 核心断言 |
| --- | --- | --- | --- |
| 1 | 地址栏规范化 | 5-9 | `example.com/docs`/`//`/`:8443` → HTTPS |
| 2 | 本机放行/私网拒 | 11-22 | localhost/127/[::1]/192.168/.local 放行；file:/javascript:/认证信息 throw |
| 3 | 缺省协议 | 24-29 | 本机 HTTP、公网 HTTPS |
| 4 | 子资源信任上下文 | 31-37 | 本地顶层可本地子资源（含 ws）；公网顶层拒私网（含 wss） |
| 5 | 子资源同步策略 | 39-45 | data:/认证/非法 URL false |
| 6 | NUL 截断拒 | 47-53 | `%00`/`\0`/`\u0000` 顶层与子资源一律拒 |

## 3. 真实断言

逐条读自 :5-53，代表性断言：

- `normalizeBrowserUrl('example.com/docs')` 严格等于 `'https://example.com/docs'`（:6）；`'//example.com/docs'` 同（:7）；`'example.com:8443/docs'` 补 https（:8）。
- `assertSafeBrowserUrl('http://127.0.0.1:3000')` 返回带尾斜杠的 `'http://127.0.0.1:3000/'`（:15）；`file:///tmp/index.html` 与 `javascript:alert(1)` 均 `toThrow('不允许此 URL 协议')`（:19-20）；`https://user:pass@example.com` `toThrow('认证信息')`（:21）。
- `normalizeBrowserUrl('127.0.0.1:3000')` 缺省 HTTP（:25）；`'example.com:8443/docs'` 缺省 HTTPS（:27）。
- `assertSafeBrowserSubresourceDestination('http://127.0.0.1:3000/@vite/client', 'http://localhost:5173/')` resolves（本地顶层可本地子资源，:32）；同 URL 对 `'https://example.com/'` 顶层 rejects `'公网页面不得访问'`（:34）；ws/wss 对称（:35-36）。
- `isSafeBrowserSubresourceUrl('data:text/plain,ok')===false`（:42）；认证信息子资源 false（:43）。
- NUL：`'https://example.com%00.evil.net/'` 等三形态 `toThrow('空字符或控制字符')`（:48-50）；子资源 `%00`/`\0` false（:51-52）。

## 4. 未覆盖与脆弱点

- 未覆盖：`assertSafeBrowserDestination` 真实 DNS 分支（mock 不了 lookup）。
- 脆弱点：无。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 用例断言如 §2 | 已证实 | 本文件逐行 |
| NUL/协议/私网规则被固定 | 已证实 | 用例族 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| normalize/assertSafeBrowserUrl | §2 | covered |
| 子资源双函数 | §2 | covered |
| DNS 目的地校验 | §4 | unknown（未测） |
