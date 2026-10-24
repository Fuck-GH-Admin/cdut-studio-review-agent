---
path: apps/electron/src/main/lib/review/review-remote-websocket-relay.p05.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f0e9590eeeb64d7b1306a5e33174718d8f30b1b3
sha256: fb5e30775baeda5004554a7c366ca909c6164aa2a2213e6cf9070d5b36f768b0
lines: 237
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-remote-websocket-relay.p05.test.ts

## 1. 测试目标

P05-S05 **真实 loopback WS 集成**（头注 :1-3「本地 socket 测试≠真实 Pocket/飞书设备或生产 Relay E2E」）：握手鉴权、双查看者独立重放门、重连续序、tombstone/嵌套 ID 抑制、非法 cursor 强制快照、LAN 文件预览回退、Relay 无状态命令边界、RelayClient 重连（仅 mock 票据）。

## 2. 用例清单

8 用例 / 2 describe。真 loopback WS（`ws` 包+`startRemoteService`+reservePort，:58-73）；真实 `agentEventBus` 事件；仅 `authService.getRemoteRelayTicket` mock（票据）。

| describe | # | 用例 | 行 | 核心断言 |
| --- | --- | --- | --- | --- |
| 本地 WS 隔离 | 7 | 握手/坏 token（92-104） | `hello`+`serverInstanceId`；坏 token close code **4001** |
| | | 双查看者独立门（106-126） | b 未订阅前无事件；订阅后收 `visible-multi`；两查看者均无 `hidden-multi` |
| | | 重连续序（128-147） | `requiresSnapshot:false`；续传 `cursor-two` 无 `cursor-private`；eventId 全 > cursor |
| | | tombstone/嵌套抑制（149-165） | 嵌套 `targetSessionId` 事件帧数不变；删除后 tombstone/`relatedSessionIds` 仍抑制；普通事件正常 |
| | | 非法 cursor（167-175） | `requiresSnapshot:true`+无重放 |
| | | LAN 文件预览回退（177-186） | `resolve_and_read_file` ok |
| | | Relay 无状态边界（188-196） | 缺 sessionId → `缺少 filePath 或 sessionId`（不借他人会话）；显式 ok；私有会话拒 |
| RelayClient loopback | 1 | 发送 relay_auth+重连（199-235） | 帧含 `relay_auth`/`synthetic-ticket`/`hello`；服务端关闭后 `connections>=2` 且 auth≥2；`getSink().isOpen()` true；`stop()` 后 null |

## 3. 真实断言

如 §2 表（逐条读自 :92-235）；`until()` 轮询真 socket 状态（:31-38）。

## 4. 未覆盖与脆弱点

- 未覆盖：真实 Pocket/飞书/生产 Relay（头注 :2 明示排除）；票据仅 mock。
- 脆弱点：时序依赖 `sleep(35)`/`until` 6s 上限（慢机理论 flake）；端口用 reservePort 防冲突。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 用例断言如 §2 | 已证实 | 本文件逐行 |
| 真 socket 隔离/续序/抑制被固定 | 已证实 | 用例族 |
| 真实生产 Relay 行为 | 未知 | 排除范围 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| 握手/4001 | §2 | covered |
| 双查看者/续序/抑制 | §2 | covered |
| cursor/预览回退/Relay 边界 | §2 | covered |
| RelayClient 重连 | §2 | covered（票据 mock） |
