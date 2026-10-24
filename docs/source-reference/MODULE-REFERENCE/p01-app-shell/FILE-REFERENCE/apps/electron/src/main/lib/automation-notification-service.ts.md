---
path: apps/electron/src/main/lib/automation-notification-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6d63985593b456595632d67f939103c92965d4dd
sha256: d9ef5bd5beb8066311144a5c312c8cf713baa6dc111f103d049b075ff99222e8
lines: 46
kind: source
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/automation-notification-service.ts

## 1. 结论与边界

**定时任务完成通知投递服务**（46 行）："当前仅实现飞书目标；钉钉/微信后续接入时复用同一入口"（`:1`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `notifyAutomationRunFinished` | `:24-46` | 逐 target 过滤（`shouldNotifyAutomationTarget`）→feishu 分支：success→`extractAssistantText(getAgentSessionSDKMessages(run.sessionId))`、error→`run.error ?? '未知错误'`→`feishuBridgeManager.sendCardToChat`→**单目标失败仅 console.error 不中断**（`:41-43`） |

内部：`AutomationNotificationPayload:19-22`。

## 3. 内部逻辑与关键流程

targets 空 return→过滤→卡片投递（fire-and-forget 由 scheduler 调用 `void …catch`）。

## 4. 调用者与调用链

`apps/electron/src/main/lib/automation-scheduler.ts`（`apps/electron/src/main/lib/automation-scheduler.ts:216`/`apps/electron/src/main/lib/automation-scheduler.ts:279` 两路径）；出向 automation-notification-format、agent-session-manager、feishu-bridge-manager。

## 5. 数据 I/O、读写与副作用

读会话消息、发飞书卡片。

## 6. 分支、失败、取消与恢复

发送失败单目标吞错（不影响其他目标/任务状态）。

## 7. 权限与权威状态

通知=旁路（失败不阻断任务主流程——fire-and-forget 契约）。

## 8. 修改影响面

改投递影响通知到达率；多目标扩展（钉钉/微信）走同一入口。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（照实记录）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件/旁路契约 | 已证实 | 46 行全读 |
| **照实**：非 feishu target 静默忽略（未来扩展留白）；run.error 空串→format 层 fallback 不可达链 | 已证实 | `:31`/`:35` |
| feishuBridgeManager 实现 | 未知 | 不在本批 |
| 实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered（零测试照实）；依赖/实效 unknown。
