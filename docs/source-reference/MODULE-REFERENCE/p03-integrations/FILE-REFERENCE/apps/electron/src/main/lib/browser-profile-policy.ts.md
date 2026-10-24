---
path: apps/electron/src/main/lib/browser-profile-policy.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fe875aea51e05c4af880462f09d1490cfed625dc
sha256: 6fa3ce38757f712fc1ad77fe4fd30db2de99812d57188736e1468af2fe5fe9a0
lines: 25
kind: source
package: p03-integrations
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/browser-profile-policy.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

浏览器 profile 策略（25 行）：**全局单一 profile**（头注 :1-15）——所有工作区/会话/入口共用同一身份，登录状态只落一份；历史 per-workspace/session 分层因「不同入口配置时机不一致导致每会话重登（典型 bilibili）」被用户确认废除；partition 仅存本机 userData、**绝不外发**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `resolveBrowserProfileKey` | fn | 19-21 | 恒返 `global-browser-profile`（入参忽略，保留签名兼容） |
| `buildPersistentBrowserPartition` | fn | 24-25 | `persist:proma-browser-{sha256(key)[:32]}`（不可反推工作区 ID） |

内部：`GLOBAL_BROWSER_PROFILE_KEY`（:17）。

## 3. 内部逻辑与关键流程

`buildPersistentBrowserPartition`：sha256(profileKey) 截 32 位 hex 作 partition 名。

## 4. 调用者与调用链

入向（生产）：`browser-controller.ts`（createSession/configuration）。出向：`node:crypto`（:1）。

## 5. 数据 I/O、读写与副作用

无（partition 名生成；实际持久化由 Electron session 管理）。

## 6. 分支、失败、取消与恢复

无分支；不抛。

## 7. 权限与权威状态

- 身份权威：全局单一 key（注释 :5-15 说明历史设计废除原因）；partition 不可反推工作区。
- 隐私权威：仅本机 userData、绝不外发（:14）。

## 8. 修改影响面

- `buildPersistentBrowserPartition` 产出的 partition 名进入 `electronSession.fromPartition`，决定 Cookie/登录态的持久化边界（全局唯一一份）。
- `resolveBrowserProfileKey` 忽略入参的历史兼容签名意味着任何新调用方也无法启用分层 profile——如需多身份须整体改设计（历史废除原因见 §1）。
- 影响浏览器面板、Agent 浏览工具、IPC 直开三条入口的登录态一致性。
- 无专属测试文件（全树检索 browser-profile-policy.test=0）；partition 命名变更会使既有登录态丢失，属破坏性变更口径。

## 9. 测试证据

直接测试：无（全树检索 browser-profile-policy.test = 0）。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出/行号 | 已证实 | 逐行核对 |
| 全局单一 key 语义 | 已证实 | :17-21 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `resolveBrowserProfileKey` | §3 | 19-21 | covered（未测） |
| `buildPersistentBrowserPartition` | §3 | 24-25 | covered（未测） |
