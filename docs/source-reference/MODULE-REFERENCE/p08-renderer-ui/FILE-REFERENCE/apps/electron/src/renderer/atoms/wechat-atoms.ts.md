---
path: apps/electron/src/renderer/atoms/wechat-atoms.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 28b3809922a94acde93f547000db962ad435564a
sha256: 306a87f593cdafed8226bfb50fe8268e1f9bd8bdc2260168ab0446951fe99450
lines: 16
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/wechat-atoms.ts

## 1. 结论与边界

微信 Bridge 连接状态原子（16 行）。

## 2. 导出与关键符号

导出 2 条（`export` :11/:16）：`wechatBridgeStateAtom`（默认 disconnected）、`wechatConnectedAtom`（派生：status==='connected'）。

## 3-7. 不适用

纯原子+派生（无逻辑分支）——依据：16 行全文核对。

## 4. 调用者与调用链

入向（子agent 交叉核）：**2 生产**（WeChatSettings:16/:35、BotHubSettings:14/:82）。否定：`wechatConnectedAtom` **0 消费者**（死导出，全树符号检索）。出向：jotai、`@profer/shared` 类型。

## 8. 修改影响面

- 消费面：微信集成设置页。
- 依赖面：WeChatBridgeState。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 2 条 | 已证实 | :11-16 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出 | §2 | :11-16 | covered |
