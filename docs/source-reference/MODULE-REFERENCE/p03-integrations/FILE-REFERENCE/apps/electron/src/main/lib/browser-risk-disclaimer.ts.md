---
path: apps/electron/src/main/lib/browser-risk-disclaimer.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6f1c57cb110e0ffbb77b61ec97be30b7806534ea
sha256: 5d4de7c2357a42945d3e0da6402efe1f3b8a3ef8605e71851157e4eff0363e99
lines: 10
kind: source
package: p03-integrations
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/browser-risk-disclaimer.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

浏览器风险告知的版本化确认（10 行）：`browserRiskDisclaimerVersion >= BROWSER_RISK_DISCLAIMER_VERSION` 即视为已确认；文案实质更新可提升版本再次展示（注释 :6）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `BrowserRiskDisclaimerSettings` | interface | 3-5 | `{browserRiskDisclaimerVersion?}` |
| `hasAcknowledgedBrowserRiskDisclaimer` | fn | 8-10 | 版本比较（缺省 0） |

## 3. 内部逻辑与关键流程

`(settings.browserRiskDisclaimerVersion ?? 0) >= BROWSER_RISK_DISCLAIMER_VERSION`（版本常量来自 `../../types/settings`，:1）。

## 4. 调用者与调用链

入向（生产）：`browser-controller.ts`（`assertRiskDisclaimerAcknowledged` 首次使用门禁）。出向：`../../types/settings`（:1）。

## 5. 数据 I/O、读写与副作用

无（读传入 settings 对象）。

## 6. 分支、失败、取消与恢复

单布尔；不抛。

## 7. 权限与权威状态

- 风险告知权威：首次读取/导航/操作第三方网页前必须确认（browser-controller `assertRiskDisclaimerAcknowledged`）。
- 无 sender/role 检查。

## 8. 修改影响面

浏览器面板首次使用门禁。无专属测试文件（controller 测试族以 mock 绕过）。

## 9. 测试证据

直接测试：无。间接：`browser-controller-screenshot.test.ts:3-5` mock 本函数为 true。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出/行号 | 已证实 | 逐行核对 |
| 版本化语义 | 已证实 | :6-10 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `hasAcknowledgedBrowserRiskDisclaimer` | §3 | 8-10 | covered（未测） |
