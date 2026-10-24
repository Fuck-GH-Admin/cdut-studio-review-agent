---
path: apps/electron/src/main/lib/browser-key-policy.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6b0221141f5870680ccda1c8c15ff2c966a234d6
sha256: 775454281b4895a6c3beaac401dcdc521a054dd9f06adf77de370cbdfe512a7a
lines: 36
kind: source
package: p03-integrations
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/browser-key-policy.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

BrowserPress 输入策略（36 行）：导航键走 key 事件；其余文本整体 `Input.insertText`（头注 :18-22——一次输入完整消息、避开 CDP 空格/标点/Unicode 平台差异）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `BrowserPressAction` | type | 13-15 | `{kind:'key'}｜{kind:'text'}` |
| `parseBrowserPressAction` | fn | 27-36 | 输入分类+校验 |

内部：`NAVIGATION_KEYS`（:1-14，13 键）、`MAX_BROWSER_TEXT_LENGTH=10000`（:16）。

## 3. 内部逻辑与关键流程

导航键集命中→`{kind:'key'}`；`Space`→`{kind:'text',text:' '}`；空→throw `需要导航键或非空文本`；>10000→throw；控制字符（除 \n \r \t）→throw `输入文本包含不支持的控制字符`（:34）。

## 4. 调用者与调用链

入向（生产）：`browser-controller.ts`（press 操作）。出向：纯函数。

## 5. 数据 I/O、读写与副作用

无。

## 6. 分支、失败、取消与恢复

三类 throw（空/超长/控制字符）；无重试。

## 7. 权限与权威状态

- 输入安全权威：控制字符不进页面输入控件（:34）；文本不拼代码（insertText 语义）。
- 无 sender/role 检查。

## 8. 修改影响面

Agent BrowserPress/面板粘贴链。无专属测试文件。

## 9. 测试证据

直接测试：无（全树检索 browser-key-policy.test = 0）。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出/内部符号/行号 | 已证实 | 逐行核对 |
| 三拒语义 | 已证实（代码） | :27-36 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `parseBrowserPressAction` | §3 | 27-36 | covered（未测） |
