---
path: apps/electron/src/main/lib/feishu/card-stream.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e2c12fbea7bb68e61258e6a998e093c9ff9e65b6
sha256: f589894c47edab417ba244cc192c365bfbf60b66aed522dcb0d3b34760f0b071
lines: 174
kind: source
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/feishu/card-stream.ts

## 1. 结论与边界

**CardKit 2.0 流式卡片**：创建一次、按 sequence 增量 update 多次；集成节流（防高频撞飞书限流）与强制 flush（终态立刻发）（设计参考 zara managed.ts，`apps/electron/src/main/lib/feishu/card-stream.ts:1-15`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CardStream` | 类 | 20-174 | 私有构造（持有 cardId/messageId/chatId） |

常量：THROTTLE_MS=400、MAX_UPDATE_RETRIES=2（`:17-18`）。方法：`static open`（`:38-78`，cardkit create+im message create/reply，缺 card_id/message_id 抛错）、`update`（`:84-88` 排队合并）、`flush`（`:93-101` 立刻刷，终态必调）、`close`（`:106-115` 禁 update 等 in-flight）。

## 3. 内部逻辑与关键流程

`scheduleFlush`（`:117-125`）：inFlight 期间不设 timer（drain finally 重触发保「最后一个胜出」不丢消息，`:118-119` 注释）；`drain`（`:127-145`）：串行化 inFlight→pendingCard 出队→seq 递增→sendUpdate；finally 检查新 pending 续轮。`sendUpdate`（`:147-173`）：cardkit update 带 sequence；失败退避 200ms×attempt 重试 ≤2 次，超限 console.error 放弃（`:161-168`）。

## 4. 调用者与调用链

入向：飞书桥接发送层（非本批）。出向：`@larksuiteoapi/node-sdk`（lark.Client——**三方依赖登记**）。

## 5. 数据 I/O 与副作用

飞书 API（cardkit create/update、im message create/reply）；定时器。

## 6. 分支、失败、取消与恢复

closed 后 update/flush 直返（`:85/:94`）；重试退避后放弃（不抛）；close 等 in-flight 吞错（`:113`）。

## 7. 权限与权威状态

不适用（传输封装）。

## 8. 修改影响面

节流/重试参数影响飞书限流合规；sequence 单调是卡片更新顺序契约。

## 9. 测试证据

无专属测试（glob `**/card-stream*test*` 零命中）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出类+节流/重试/flush 语义 | 已证实 | `:1-174` 逐行 |
| 飞书 API 行为 | 未知 | NOT_RUN（网络） |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部方法/分支 | §2/§3 | covered |
| 测试/运行 | §9/§10 | unknown（NOT_RUN） |
