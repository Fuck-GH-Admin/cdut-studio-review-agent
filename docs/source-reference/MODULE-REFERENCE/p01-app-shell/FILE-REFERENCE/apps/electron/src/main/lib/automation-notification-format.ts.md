---
path: apps/electron/src/main/lib/automation-notification-format.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b8a309d8e0e2090f96542856d0c1efc1f70e4592
sha256: 4fd59f0d6b7eca56ff5f584e04a1208b2f3fce876bc261cf55bc1d7f2dbfcdf4
lines: 86
kind: source
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/automation-notification-format.ts

## 1. 结论与边界

**定时任务通知纯格式化逻辑**（86 行，`:1`）：通知判定/摘要提取/飞书卡片构造（纯函数无副作用）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `shouldNotifyAutomationTarget` | `:19-26` | !enabled→false；**skipped 永不通知**（`:24`）；trigger 'always'→true；否则 trigger===status |
| `extractAssistantText` | `:29-42` | assistant 消息 text 块拼接（`\n\n` join+trim） |
| `buildAutomationFeishuCard` | `:56-85` | 飞书互动卡片：success 绿/失败红；lines（任务/状态/耗时/会话 ID/摘要或 fallback）；summary 12000 字截断 |

内部：`formatDuration:45-49`（`!ms` 含 0→'未知' 照实）、`truncate:51-54`（slice+后缀）。

## 3. 内部逻辑与关键流程

三纯函数：通知闸→文本提取→卡片组装。

## 4. 调用者与调用链

`automation-notification-service.ts`（同批）；纯类型出向 `@profer/shared`。

## 5. 数据 I/O、读写与副作用

纯函数。

## 6. 分支、失败、取消与恢复

skipped/disabled/trigger 不匹配不发；summary 空→fallback 文案。

## 7. 权限与权威状态

通知触发矩阵（always/success/error × skipped 永不）即产品契约。

## 8. 修改影响面

改卡片影响飞书通知呈现；trigger 矩阵联动 target 配置。

## 9. 测试证据

无直接测试（格式化族零测试）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（矛盾照实记录）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件三导出 | 已证实 | 86 行全读 |
| **照实**：卡片二值假设（skipped 上游已滤）；'没有错误详情' fallback 几乎不可达（service 已补'未知错误'）；formatDuration 0ms→'未知'；truncate 可截断代理对 | 已证实 | `:58-62`/`:46`/`:52` |
| 实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered（测试零覆盖照实）；实效 unknown。
