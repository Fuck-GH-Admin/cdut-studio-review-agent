---
path: apps/electron/src/main/lib/browser-identity.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: bd3b19ca768b741fa051a4725dab3eabed98fd5b
sha256: f578d5f283b623e99fba7cf0baa7b1a7ab84be44d0b8dd5066e206f8bfb8560c
lines: 11
kind: source
package: p03-integrations
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/browser-identity.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

受管浏览器 UA 身份（11 行，头注 :1-4）：以 Profer 身份出现但**保留 Chromium 兼容 token**；**不伪造为其他浏览器**、不加跨站识别自定义头。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `buildPromaBrowserUserAgent` | fn | 6-11 | 剥离 `Electron/…`/`Profer/…` token 后追加 `Profer/{version}` |

## 3. 内部逻辑与关键流程

`defaultUserAgent.replace(/\s+Electron\/[^\s]+/gi,'').replace(/\s+Profer\/[^\s]+/gi,'').trim()` + ` Profer/{promaVersion}`。

## 4. 调用者与调用链

入向（生产）：`browser-controller.ts`（createSession 设置 UA）。出向：纯函数。

## 5. 数据 I/O、读写与副作用

无。

## 6. 分支、失败、取消与恢复

无分支；不抛。

## 7. 权限与权威状态

- 身份诚实：不伪装他牌浏览器（头注 :3-4）。
- 无 sender/role 检查。

## 8. 修改影响面

- UA 字符串进入 `browser-controller.createSession`（`browserSession.setUserAgent`），影响所有受管网页看到的浏览器身份与站点能力选择。
- 仅在会话创建时设定一次；后续导航不重写。
- 与 `browser-profile-policy` 的全局单一 profile 共同决定「登录态+身份」的稳定呈现。
- 无专属测试文件（全树检索 browser-identity.test=0）；若 UA 模板变更，需人工核对站点兼容性（Chromium token 保留约束）。

## 9. 测试证据

直接测试：无（全树检索 browser-identity.test = 0）。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出/行号 | 已证实 | 逐行核对 |
| 不伪装语义 | 已证实 | 头注 :3-4 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `buildPromaBrowserUserAgent` | §3 | 6-11 | covered（未测） |
