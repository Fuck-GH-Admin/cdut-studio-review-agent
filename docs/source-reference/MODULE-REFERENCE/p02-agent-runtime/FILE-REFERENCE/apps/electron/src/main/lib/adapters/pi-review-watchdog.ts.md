---
path: apps/electron/src/main/lib/adapters/pi-review-watchdog.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d25adcbfb6d1496f57a63381e0de1a86ee4164d7
sha256: 6400afa1dd8b4d4383a9800ae1c84bf95da955e01ace95f8bbb61ed39936aecd
lines: 248
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-review-watchdog.ts

## 1. 结论与边界

**Pi 审核轮次看门狗（P0-C：失败可追踪）**（`pi-review-watchdog.ts:1-16` 注释）：自部署 vLLM 首字节延迟实测 90s~>300s，产品侧此前无"无进展"判据。本模块**只判定不改业务状态**（`:8`）：请求级首字节看门狗（N 秒无任何数据→判无望）+ 整轮级无进展看门狗（M 分钟无新输出/工具事件→判停滞）；适配器转成带中文原因的终态失败，**绝不允许 run 无限 running**（`:14`）。阈值环境变量可覆盖，默认刻意高于实测最差延迟（`:15`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/说明 |
| --- | --- | --- | --- |
| `DEFAULT_PI_REVIEW_FIRST_BYTE_TIMEOUT_MS` | const | `:19` | `240_000`（低于传输层 300s 空闲超时，错误原因由我们给出，`:18`） |
| `DEFAULT_PI_REVIEW_TURN_STALL_TIMEOUT_MS` | const | `:21` | `1_200_000`（20 分钟） |
| `PiReviewWatchdogTimeouts` | interface | `:27-30` | 两阈值 |
| `resolvePiReviewWatchdogTimeouts` | function | `:45-62` | env/transport 推导（§3.1） |
| `PiReviewWatchdogState` | interface | `:64-73` | requestStartedAt/requestFirstByteSeen/lastProgressAt/firedReason（一旦设置不再变化 `:71`） |
| `PiReviewWatchdogDecision` | type | `:75-78` | none/first_byte/stalled |
| `createPiReviewWatchdogState` | function | `:80-82` | 初始态 |
| `evaluatePiReviewWatchdog` | function | `:98-124` | 纯函数判定（假时钟可测 `:97`） |
| `PiReviewWatchdog` | interface | `:126-145` | 7 方法（startRequest 返回 true=已触发应立刻中止 `:128`） |
| `createPiReviewWatchdog` | function | `:151-195` | 运行时包装；**不持有计时器**（适配器负责，便于统一 dispose `:149`） |
| `applyWatchdogTerminalReason` | function | `:204-214` | 覆盖终态 result（subtype=error_during_execution+terminal_reason+errors） |
| `isWatchdogReasonRetryable` | function | `:224-229` | 自检：原因不得命中可重试文案特征 |
| `applyWatchdogToAssistantError` | function | `:239-248` | 替换 assistant error 文案（errorType=review_watchdog_timeout） |

内部：`readPositiveIntEnv`（非法忽略不阻断 `:32-38`）、`FIRST_BYTE_SAFETY_MARGIN_MS=15_000`/`MIN_FIRST_BYTE_TIMEOUT_MS=30_000`（`:23-25`）、`formatDuration`（**避开可重试特征**：≥2 分钟按分钟表述防 `500` 被当 5xx，`:84-95`）。

## 3. 内部逻辑与关键流程

1. **阈值解析**（`:45-62`）：`firstByte` = env `PROFER_PI_REVIEW_FIRST_BYTE_TIMEOUT_MS` ?? transport 预算（`max(30_000, transport-15_000)`，仅 transport>0）?? 240_000；`turnStall` = env ?? 1_200_000。首字节预算必须早于传输层空闲超时（防错误被 `fetch failed` 抢走，`:42-43`）。
2. **纯判定**（`:98-124`）：fired 即 none（`:104`）；在途请求未见首字节且 elapsed≥firstByte → `first_byte` 中文原因（`:105-113`）；idle≥turnStall → `stalled` 原因（保留已完成记录、可转人工 `:116-121`）。
3. **包装**（`:151-195`）：`touch` 兼记首字节（`:172-175`）、`noteActivity` 只刷进展（onPayload 发生在 HTTP 前不算首字节，`:135-137`）、`evaluate` 命中写 firedReason+日志（`:183-190`）。
4. **防自动重试闭环**（`:197-248`）：`applyWatchdogTerminalReason` 统一覆盖结果（`:200-203`）；`isWatchdogReasonRetryable` 检测中文瞬时文案/裸 5xx/502|529|overloaded（`:225-227`，特征清单注释 `:220-222`）；`applyWatchdogToAssistantError` 换掉传输层 `terminated` 文案（编排层会当瞬时网络错误自动重试致看门狗失效，`:234-237`）。

## 4. 调用者与调用链

入向：Pi review 适配器（转终态失败/挂 watchdog timer，跨文件）；测试 `pi-review-watchdog.test.ts`（241 行，§9）。出向：无（纯函数+注入时钟）。

## 5. 数据 I/O、读写与副作用

无 I/O；状态在内存对象；副作用=可选 logger（`:188`）。无计时器持有（`:149`）。

## 6. 分支、失败、取消与恢复

失败=判定触发（firedReason 一次性，`:71/:104/:184`）；`startRequest` 在已触发后返回 true（调用方中止）；恢复=重新发起审核（原因文案自述 `:120`）。env 非法值忽略不阻断（`:33-37`）。

## 7. 权限与权威状态

无权限分支；**失败可追踪红线**：错误原因必须可诊断（区分"模型慢"与"链路挂死"，`:5-6`）、不得被编排层自动重试（`:216-223`）。

## 8. 修改影响面

改判定/文案 → Pi 审核轮次终态失败路径与编排层重试交互；`isWatchdogReasonRetryable` 特征与 agent-retry-utils/error-patterns 联动（`:220`）。

## 9. 测试证据

**直接测试 `pi-review-watchdog.test.ts`（241 行，NOT_RUN）**：断言逐条见测试手册（同组）。未覆盖项/脆弱点亦见测试手册。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 12 导出+3 内部+全分支 | 已证实 | 逐行读 `:1-248` |
| 阈值默认值 vs 实测延迟关系 | 推断 | `:4/:15` 注释自述 |
| 编排层重试特征清单 | 推断 | `:220-222` 注释自述（agent-retry-utils 未读） |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 阈值解析 | §3.1 | `:45-62` | covered |
| 判定/包装 | §3.2-3.3 | `:98-195` | covered |
| 防重试闭环 | §3.4 | `:197-248` | covered |
| 测试 | §9 | 测试文件 | covered（NOT_RUN） |
