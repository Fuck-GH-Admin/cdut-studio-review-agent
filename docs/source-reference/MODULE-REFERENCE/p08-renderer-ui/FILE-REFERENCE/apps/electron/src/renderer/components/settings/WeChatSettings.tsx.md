---
path: apps/electron/src/renderer/components/settings/WeChatSettings.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: aa4348352415bbb873d7b01e77257b5b68d5e18f
sha256: 31e765010c4ccae914bdc67602ac5f8776a6c4ebc672505fb180554bccaace54
lines: 283
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/settings/WeChatSettings.tsx

## 1. 结论与边界

**微信集成设置页**（`:1-6` 注释）：基于微信 iLink Bot API 扫码登录+长轮询消息；流程=点击登录→二维码→扫码→自动连接。说明区明示「**凭证会加密保存，系统级加密存储**」（`:248/:276`）、「iLink Bot API 是微信官方 Bot 接口」（`:275`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `WeChatSettings` | function（export） | `:34-283` | 连接状态/QR/说明三区 |

内部：`openLink`（经 `openExternal` 系统浏览器 `:20-22`）、`STATUS_CONFIG` 6 状态指示（`:25-32`）。

## 3. 内部逻辑与关键流程

1. 加载（`:40-49`）：config+status 并取；`hasCredentials` 记凭证有无（**只记布尔不取密钥**）。
2. 状态订阅（`:52-66`）：connected→记凭证；disconnected→重查凭证（可能是登出）；unsubscribe 清理。
3. 四操作（`:69-106`）：登录（startWeChatLogin）/启动/停止/登出（清凭证态）；失败 toast。
4. 按钮状态机（`:108-166`）：connected→停止+登出；有凭证→启动+登出；无凭证→扫码登录；登录中→QR 区（`:187-219`，scanned 态提示手机确认+刷新二维码）。
5. 错误/成功提示（`:172-183`）；使用说明三步（`:228-262`）。

## 4. 调用者与调用链

入向：设置页。出向：`@/atoms/wechat-atoms`、`window.electronAPI`（微信系列 6 接口+openExternal）、`./primitives`、sonner。

## 5. 数据 I/O、读写与副作用

读配置/状态；启停 Bridge/登录登出（经 Main）；QR 图 data URL。

## 6. 分支、失败、取消与恢复

六状态按钮机（§3）；失败 toast。不适用取消/恢复。

## 7. 权限与权威状态

红线：凭证加密存储（`:248/:276`）；**凭证不在渲染层流转**（只取 `!!config.credentials` `:45`）。

## 8. 修改影响面

- 改状态机/按钮分支 → 登录/启停交互链。
- 改凭证态口径（布尔代理）→ 敏感信息暴露面。
- 改订阅处理（connected/disconnected 回查）→ 凭证态同步正确性。
- 改说明文案（加密存储/官方接口声明）→ 用户信任与合规展示。
- 无测试锁定（§9）：改动需人工验证微信登录流程。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `WeChatSettings` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+2 内部+状态机 | 已证实 | 逐行读 `:1-283` |
| 微信 Bridge/iLink 侧 | 未知 | 跨文件/外部 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 组件+状态机 | §2/§3 | `:34-283` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
