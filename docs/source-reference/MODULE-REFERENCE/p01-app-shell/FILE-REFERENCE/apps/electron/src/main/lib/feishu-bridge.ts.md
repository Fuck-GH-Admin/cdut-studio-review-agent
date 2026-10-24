---
path: apps/electron/src/main/lib/feishu-bridge.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8b32abd1d3a41fd0544ff0ac6379b59f4ff2891d
sha256: 90ade16daf4fb2b1317eed9f492b299e457598b209fd70fc86608e31bf9b501d
lines: 2522
kind: source
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/feishu-bridge.ts

## 1. 结论与边界

**飞书 Bridge 服务**（2522 行，全树最大件之一）：WebSocket 长连接收消息→命令路由/转发 Agent→AgentEventBus 监听流式卡即时呈现→chatId↔sessionId 绑定管理→Session 镜像（桌面会话同步为飞书群流式卡片）（`:1-10`）。

## 2. 导出与关键符号

**唯一导出**（`:2522` `export { FeishuBridge }`，字节核对全文件仅 1 条 module export）：`class FeishuBridge`（`:136`）。公开 API：`constructor:204`/`start:215`（createLarkChannel+eventBus 注册+loadBindings）/`stop:305`（lastInteractedUserOpenId 故意保留 `:340-341`）/`restart:348`/`getStatus:440`/`listBindings:444`（**过滤僵尸绑定** `:445`）/`updateBinding:452`/`removeBinding:472`/`ensureSessionMirror:490`/`startSessionMirrorRun:541`/`stopSessionMirrorRun:571`/`testConnection:578`/`sendCardToChat:2422`。

内部要点：双向索引（chatBindings/sessionToChat `:152-154`）、`ScopedQueue` 600ms 防抖（`:131`）、`RunCoordinator` 全局 3 并发（`:132`）、DEDUP_MAX=200、命令路由（`/help /new /list /stop /switch /workspace /now /model` `:972-1026`）、流式卡链（`handleAgentPayload:1760` reduceRunState+renderCard）、镜像群链、群辅助（isBotMentioned/getGroupInfo 1h TTL/fetchChatHistory）。

## 3. 内部逻辑与关键流程

- **入站**（`:660-915`）：event_id/message_id 双去重→sender_type 过滤→群访问策略→text/post/image/file（**50MB 文件上限** `:812`）→附件暂存协议→ScopedQueue 合并（parentMessageId 取最新）→runCoordinator 串行。
- **运行链**（`:1554-1755`）：createNewSession（workspaceId 优先级显式>botConfig>appSettings `:1039`）→CardStream 骨架卡→`runAgentHeadless`（**permissionModeOverride:'bypassPermissions'** `:1725`，await 到 finally 消除并发守卫竞态 `:1728-1733`）。
- **出站**：流式卡即时更新/终态；降级 sendAgentReply（群 @Name→at 标签、splitLongContent 分片+toolSummaries）；发出 id 回灌去重防回环（`:2393-2395`）。

## 4. 调用者与调用链

`feishu-bridge-manager`（创建实例，同批）；出向 feishu-config（getDecryptedBotAppSecret）/agent-service/agent-session-manager/feishu-message/feishu/*（card-stream/run-coordinator 等）。

## 5. 数据 I/O、读写与副作用

飞书 API（消息/群/资源）、bindings/metadata 持久化、Agent 启停、窗口广播。

## 6. 分支、失败、取消与恢复

失败族全清单照实（缺凭证 throw `:217-219` 在 try 外；下载失败错误卡；命令未命中提示；镜像失败 warn 跳过；send* 静默吞错）。

## 7. 权限与权威状态

- **review-owned 越权防护 19 处闸口**（`:368`/`:1571`/`:1761`/`:2424` 等）：防伪造绑定把 run/附件路由到隐藏 owner。
- **bypassPermissions**（`:1725`）：飞书链路 Agent 运行绕过权限确认（照实）。
- 权限位声明（im:chat/im:message.group_msg 等）；botOpenId 取不到即拒 @ 检测（防误触发 `:2067-2069`）。

## 8. 修改影响面

改绑定/命令影响飞书使用面；与 feishu-message/card-* 模块强耦合。

## 9. 测试证据

**有直接测试（owner 边界安全面）**：`apps/electron/src/main/lib/review/review-feishu-owner-boundary.p05.test.ts`（159 行，7 个 `test(`，fixture 无真实飞书网络 `:2`）直接 import FeishuBridge 验证 review-owned 闸口族——loadBindings 恢复过滤/live owner 跳过（`:53`/`:66`）、updateBinding 拒绝隐藏 owner（`:76`）、镜像建立/流式拒绝 owner（`:88`）、隐藏 chat 不得 stop/run//now//model（`:107`）、EventBus 拒绝私有与 tombstone owner（`:124`）。命令路由完整矩阵/卡片渲染/群辅助/发送链仍无测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（矛盾照实记录，子agent 4 段精读+字节核对）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 唯一导出/五职责/19 闸口 | 已证实 | 2522 行全读（export 字节核对） |
| **①** cardAction 注释拉扯（`:228-230` 称关键收益 vs `:270-272` 明说不接）；**②** `:701-703` 行号 stale（实锁在 `:884-909`）；**③** `:1712` fire-and-forget 注释与 `:1728-1733` await 相悖（孤儿遗留） | 已证实 | 字节核对 |
| **④** `:1873`"终止按钮"孤儿指涉；**⑤** 文案漏 post 富文本（`:749` vs `:752`）；**⑥** 产品名混用（Profer/CDUT Studio）；**⑦** 头注释"累积完整回复"偏旧（现主流式卡） | 已证实 | `:749-754`/`:1047-1054`/`:7` |
| **⑨** 清理路径不一致（removeBinding 删 TTL 条目 vs switch/workspace 不删靠 5min TTL）；**⑩** activeBindings 双记账；**死 import** `finalizeIfRunning`（`:74` 零使用） | 已证实 | 字节 count=1 |
| 依赖 20 模块/lark SDK 实现 | 未知 | 见 UNVERIFIED |
| 网络/长连接实效 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 唯一导出/架构/命令/链路 | §2/§3 | covered |
| 越权防护/bypass | §7 | covered |
| 11 矛盾+死 import | §10 | covered |
