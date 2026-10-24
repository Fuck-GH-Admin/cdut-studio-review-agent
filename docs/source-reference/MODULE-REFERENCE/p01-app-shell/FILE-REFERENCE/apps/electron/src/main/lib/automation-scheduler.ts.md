---
path: apps/electron/src/main/lib/automation-scheduler.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e1557e253bcbd411b51e7f038808c4fedfe4bad1
sha256: 6046f1b362f68c71a0f900e849f499fb2fa4b1218ee349e41a256317c25fed96
lines: 341
kind: source
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/automation-scheduler.ts

## 1. 结论与边界

**定时任务调度器**（341 行，核心设计见 `.context/plan/automation-feature.md` `:4`）：短 tick 轮询抗休眠漂移（`:5`）；子会话归属按 sessionMode（daily 同日复用+上下文 70% 安全阀切新/reuse 永远复用，`:6-10`）；**强制 bypassPermissions**（无人值守防权限弹窗阻塞 `:11`）；忙时跳过不堆积（`:12`）；连续失败自动暂停（`:13`）；启动顺延防重启雪崩（`:14`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `broadcastChanged` | `:104-111` | 向所有窗口广播任务/推荐变更 |
| `runAutomation` | `:119-285` | 执行一次：重入保护→会话归属裁决→headless 运行→结果落盘→失败退避 |
| `runAutomationNow` | `:288-296` | 手动触发（草稿态拒绝 `:291-293` 兜底前端 disabled） |
| `startScheduler`/`stopScheduler` | `:322-332`/`:335-341` | 启动（**过期 nextRunAt 顺延**防雪崩 `:319-321`）/停止 |

内部：`TICK_INTERVAL_MS=30s:45`、`RUN_TIMEOUT_MS=2h:48`、`DAILY_CONTEXT_ROLLOVER_THRESHOLD=0.7:55`（与 SDK 自动压缩 77.5% 留余量 `:53`）、`isSameLocalDay:61-69`（本地时区年月日）、`formatScheduleLabel:71-97`（调度描述，给 automationContext）、`runningAutomations:101`（重入 Set）。

## 3. 内部逻辑与关键流程

- **会话归属**（`:136-180`）：`automationGraduated`（用户接管）强制新会话（`:145-148` 防注入私人会话）；reuse→lastSessionId；daily→同日+占用率<0.7 复用（占用率未知保守复用 `:158`）；否则新建+预设解析链。
- **运行链**（`:201-267`）：Promise 包裹；finish 幂等（settled 旗）；**超时先 stopAgent+3s 再标错**（`:233-243` 防遗留进程）；`runAgentHeadless`（prompt+`<!--PROMA_SCHEDULED_RUN-->` 标记+automationContext 英文指令 `:249`）；失败退避（`AUTOMATION_MAX_CONSECUTIVE_FAILURES` 达限自动 active=false `:219-229`）。
- **tick**（`:299-314`）：active+完整（有 channelId/workspaceId）+到期+未重入+来源会话空闲→并行触发（不 await `:311`）。

## 4. 调用者与调用链

app 启动/退出钩子（startScheduler/stopScheduler）+IPC 手动触发；出向 automation-manager/agent-session-manager/agent-workspace-manager/agent-preset-manager/agent-session-usage/agent-service/automation-notification-service。

## 5. 数据 I/O、读写与副作用

会话创建/元数据更新、run 记录追加、定时器、窗口广播、通知发送。

## 6. 分支、失败、取消与恢复

重入跳过（记 skipped run）；执行异常 catch 落 error run+通知；超时强制终止；连续失败自动暂停。

## 7. 权限与权威状态

- **bypassPermissions 强制**（`:11`/`:254`）：无人值守红线。
- **不注入私人会话**（`:145`）：graduated 会话隔离。
- 草稿态拒绝运行（`:291-293`）。

## 8. 修改影响面

改归属/阈值影响自动化成本与连续性；通知链联动 automation-notification-service。

## 9. 测试证据

无直接测试（automation-manager.test 测的是 manager 非本文件）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（矛盾照实记录）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件调度链/安全阀 | 已证实 | 341 行全读（主根自读兜底——原定子agent 失败，见 UNVERIFIED） |
| **照实**：`:117` 注释"不影响调度计时由 appendRun 统一推进"表述略绕；`:249` automationContext 为英文硬编码 | 已证实 | `:117`/`:249` |
| agent-service/preset/usage 实现 | 未知 | 不在本批 |
| 调度实效 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 4 导出/归属/运行链/tick | §2/§3 | covered |
| 三红线 | §7 | covered |
