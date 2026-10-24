---
path: apps/electron/src/main/lib/cdut/yanhu/yanhu-cookie-utils.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ab5cd05fc7fb16667abd7ce1fee5cd36a1ab8880
sha256: 5d121f0ac5a0103fa18194294c87a37fe1a3312d921f04fe01facf2105b73620
lines: 79
kind: source
package: p03-integrations
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/yanhu/yanhu-cookie-utils.ts

## 1. 结论与边界

智联万站·瑞数（RuiShu）动态签名 Cookie 清洗工具（文件头 `:1-17`，根因诊断引 AGENTS.md 3.6）：青果教务等系统部署瑞数 WAF，「服务端会话 Cookie（*O 结尾）+ 页面级动态签名 Cookie（*P 结尾）」双轨校验；持久化分区留存的陈旧 *P 随新导航发出 → 网关判签名篡改返回 400 空响应 → 白屏死锁。解法：导航前剔除成对陈旧 *P、仅留会话 O 与 JSESSIONID，由瑞数 JS 重新签发。**纯 Cookie 操作，不加载页面、不持窗口、无其它副作用**。

不做的事：不改普通业务 Cookie；不抛异常（静默兜底）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `DEFAULT_RUISHU_DOMAIN` | const | `:22` | `'jw.cdut.edu.cn'`（青果教务） |
| `stripStaleRuiShuCookies` | function | `:34-79` | `(ses: Session, domain=DEFAULT) => Promise<number>`（剔除数；异常返回 0 绝不抛） |

## 3. 内部逻辑与关键流程

1. `ses.cookies.get({domain})` 取全部 Cookie 名集合（`:39-40`）。
2. **成对识别**（`:43-44`）：仅当 `name` 以 `P` 结尾且存在同前缀 `O` 结尾 Cookie 才剔除（独立 P/普通 Cookie 不动）。
3. **删除 URL 构造**（`:46-51`）：cookieDomain（去前导点）、路径规范化；候选路径集 `{cookiePath, '/jsxsd/', '/jsxsd'}`（青果网关三种作用域写法兜底去重）。
4. 逐路径 × 协议（https 先）`cookies.remove`，成功即停（`:54-65`）；全部失败 `console.warn`（`:70-72`）。
5. 外层 try-catch：任何异常返回 0（`:76-78`）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（排除测试）：智联万站导航/会话层（`persist:cdut-auth-zone` 分区）在导航前调用；直接测试 `yanhu-cookie-utils.test.ts`。出向：`electron.Session`（类型）、`console.warn`。

## 5. 数据 I/O、读写与副作用

读写 Electron Session Cookie 存储（get/remove）；`console.warn` 删除失败时输出。无网络/文件。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 非成对/普通 Cookie | `:44` | 跳过 |
| 删除失败（全路径） | `:69-72` | warn 留痕、不计数 |
| 任何异常 | `:76-78` | 返回 0（绝不抛） |
| 取消/恢复 | 无 | 无 AbortSignal |

## 7. 权限与权威状态

无权限分支；范围声明即边界（纯 Cookie 操作）；“成对才剔除”是防误删的保守口径（`:27-28`）。

## 8. 修改影响面

改识别/删除规则 → 影响青果教务刷新死锁修复链路；`Session` 契约联动 Electron。

## 9. 测试证据

本轮 `NOT_RUN`。直接测试 `yanhu-cookie-utils.test.ts`（详见其手册）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 成对识别、保守剔除 | 已证实 | `:43-44` |
| 三路径×双协议兜底 | 已证实 | `:51-65` |
| 异常静默返回 0 | 已证实 | `:76-78` |
| 根因/解法口径 | 已证实 | 文件头 |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `DEFAULT_RUISHU_DOMAIN` | 2 | `:22` | covered |
| `stripStaleRuiShuCookies` 全分支 | 3 | `:34-79` | covered |
