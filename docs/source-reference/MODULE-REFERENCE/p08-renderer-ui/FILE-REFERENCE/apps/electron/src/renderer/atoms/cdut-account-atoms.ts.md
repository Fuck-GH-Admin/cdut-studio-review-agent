---
path: apps/electron/src/renderer/atoms/cdut-account-atoms.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1df9ba22c4441d90a94c0ce3bb11366d7ecdb483
sha256: a41ff243ba0da6a0fde6ae479811dfa4563a4f36dfb09fb3ee1089aba81f696d
lines: 35
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/cdut-account-atoms.ts

## 1. 结论与边界

CDUT 特区账户展示状态（头注释 :2-7）：仅本地展示（学号/姓名/连接状态）；**真实认证与凭证加密全在主进程，渲染端绝不接触明文密码**（:5-7）。

## 2. 导出与关键符号

导出 4 条（`export` :13/:23/:29/:35）：`cdutAccountAtom`（默认 disconnected :13-17）、`cdutSubViewAtom`（子页标识，null=专区首页 :23）、`cdutSidebarRestoreAtom`（沉浸式折叠暂存 :29）、`cdutAiClassLockPromptAtom`（未登录点锁定项触发 :35）。

## 3-7. 不适用

纯原子+安全契约（无逻辑分支）——依据：35 行全文。

## 8. 修改影响面

- 消费面：CDUT 专区全链。
- 依赖面：window.electronAPI.cdutZone 推送。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 4 条；凭证不进渲染端 | 已证实 | :2-7 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出 | §2 | :13-35 | covered |
