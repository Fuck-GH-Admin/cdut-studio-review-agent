---
path: apps/electron/src/renderer/components/settings/BotHubSettings.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: bbf852fb281ca03841fa50ebbc58cc850a6c2ef9
sha256: 47775dbe13e6e4e6051daa59578cc1576d33d8c91dbd07b2368bd1e52a68d92e
lines: 197
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/settings/BotHubSettings.tsx

## 1. 结论与边界

**多平台机器人 Hub**（`:1-6`）：平台选择条（飞书/微信/钉钉/用法）+右侧配置面板；平台状态点由各 bridge atom 推导。纯 UI 组合。

## 2. 导出与关键符号

1 导出：`BotHubSettings`（`:170`）。内部：`BotPlatformId`/`BotPlatformDef`（`:25-36`）、`PLATFORMS` 4 项（`:40-66`）、`BRIDGE_STATUS_COLORS` 4 态（`:69-74`）、`PlatformStatusDot`（`:79`）、`getPlatformStatus`（`:98`）、`PlatformSidebarItem`（`:108`）、`renderPlatformPanel`（`:155`）。

## 3. 内部逻辑与关键流程

- 平台级状态推导（`:98-105`）：任一 connected→connected，否则 error>connecting>disconnected 优先级；defaults 无状态点（`:84`）。
- 面板分派（`:155-166`）：feishu→FeishuSettings、dingtalk→DingTalkSettings、wechat→WeChatSettings（**域外**）、defaults→BotDefaultSettings（本批）。
- 主组件（`:170-197`）：选中态 `'feishu'` 缺省（`:171`）；顶部横向导航（注释：避免远程连接页一整列空白 `:175`）+ScrollArea 内容区。

## 4. 调用者与调用链

- 入向：`SettingsPanel.tsx`（bots 标签，本批）。
- 出向：feishu/dingtalk/wechat atoms、三个平台设置组件+BotDefaultSettings、logo 资源。

## 5. 数据 I/O、读写与副作用

无（纯组合；状态读 atoms）。

## 6. 分支、失败、取消与恢复

状态映射 fallback（未知→disconnected，`:91-92`）；无抛错。

## 7. 权限与权威状态

无权限分支，依据：纯 UI。

## 8. 修改影响面

远程连接入口结构：上游=SettingsPanel bots 标签（本批）；修改本文件波及三平台设置组件挂载（Feishu/DingTalk/WeChat）与 BotDefaultSettings（用法）入口；回归面=平台状态点推导优先级（connected>error>connecting>disconnected，`:98-105`）与状态色映射。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无 test 文件）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 平台定义/状态推导/面板分派 | 已证实 | `:1-197` 全文 |
| WeChatSettings 实现 | 边界 | 域外 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+4 内部 | §2/§3 | 25-197 | covered |
