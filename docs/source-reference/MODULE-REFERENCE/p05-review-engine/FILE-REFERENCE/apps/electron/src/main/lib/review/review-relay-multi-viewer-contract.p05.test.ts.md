---
path: apps/electron/src/main/lib/review/review-relay-multi-viewer-contract.p05.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 019a1bd8f8f9eda018863f26f364128a2a6d5f9e
sha256: c7be56c99432e564393bf955f7c5684ccf6268fb96df366bf45d48e8df0fa72e
lines: 289
kind: test
package: p05-review-engine
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-relay-multi-viewer-contract.p05.test.ts

## 1. 测试目标

P05-S06：桌面 → **真实 loopback** Relay 适配器合同与深度事件 ID 守卫（`apps/electron/src/main/lib/review/review-relay-multi-viewer-contract.p05.test.ts:1-3`）。合成 hub **不是**生产中心路由（其中心服务端代码缺失，`:3`）；合同核心（`:64` 注释）：**viewer 本地 ID 永不作全局 map key**——中心必须生成全局唯一不透明 correlationId，回程还原各 viewer 的 `_cmdId`（`:131-135`）。

## 2. 用例清单

2 describe / 8 test。夹具：真实 `ws` WebSocketServer + `http` server（loopback）；`beforeAll` 起 `startRemoteService()`（`PROFER_REMOTE=1`、relay 模式、mock ticket，`:18-23`、`:89-154`）；`connectViewer`（`:164-172`）；`routeDesktopResponse`（`:65-85`，含 `pauseRepliesFor`/`heldResponses`/`droppedLateReplies`）；`protocolErrors` 收集（`:87`）。

**desktop Relay routing contract（`:174-262`）**

| # | 名称 | 断言要点 | 行 |
| --- | --- | --- | --- |
| 1 | 两 viewer 同业务 requestId 保留各自 `_cmdId` 结果 | a→normal（ok）、b→hidden（denied）；`requestId` 还原各自 `_cmdId`；互不见对方结果 | `:175-190` |
| 2 | 独立 viewer 不能继承旧文件预览会话；重连 viewer 仍需快照 | 未绑定 `resolve_and_read_file` 报「缺少 filePath 或 sessionId」；`resume_agent_events` 返回 `requiresSnapshot:true`；`protocolErrors` 空 | `:191-208` |
| 3 | 两 viewer 可复用同 `_cmdId`；中心关联唯一且还原 | 各 1 条 `command_result`；`centerIds` 2 个互异且不等于原 `_cmdId` | `:210-229` |
| 4 | 断连后旧回包不能结算复用同 `_cmdId` 的新 viewer | 挂起旧回包→断连→新 viewer 同 ID 成功 1 条；重放旧回包 `droppedLateReplies+1`、新 viewer 仍 1 条 | `:231-250` |
| 5 | owner 删除后 Relay 命令保持拒绝，普通命令可见 | hidden→`ok:false`；normal→`ok:true` | `:251-261` |

**structured AgentStreamPayload integrity（`:264-289`）**

| # | 名称 | 断言要点 | 行 |
| --- | --- | --- | --- |
| 6 | 深层嵌套 owner 引用被抑制（含已删 ID） | 18 层嵌套 `targetSessionId:hidden`→false；`related_session_ids:[hidden]`→false；`text:hidden`→true | `:265-271` |
| 7 | 内嵌 session.id 与投影 upsert 不泄露隐藏元数据 | `session:{id:hidden}`（event/upsert）→false；`session:{id:normal}`→true；`sdk_message.text:hidden`→true | `:272-277` |
| 8 | 非法控制事件深度 fail closed；replay 滤旧记录 | 40 层嵌套→false；`selectOrdinaryRemoteReplayRecords` 只留中间条 | `:278-288` |

## 3. 真实断言

- `expect(denied.ok).toBe(false)`（`:183`）。
- `expect(centerIds[0]).not.toBe(centerIds[1])`（`:224`）。
- `expect(droppedLateReplies).toBe(beforeDropped + 1)`（`:246`）。
- `expect(selectOrdinaryRemoteReplayRecords(records)).toEqual(records.slice(1, 2))`（`:287`）。

## 4. 未覆盖与脆弱点

- 未覆盖：生产中心路由（明确缺失，`:3`）；真实 Relay 服务器；ticket 过期重协商（mock 恒有效，`:151`）。
- 脆弱点：`until` 8s 超时（`:28-36`）；合成 hub 的 `routeDesktopResponse` 是测试内合同实现（`:65-85`）——生产实现另行验证。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 用例覆盖路由合同+事件守卫 | 已证实 | `:175-288` |
| 真实 WS loopback（非纯 mock） | 已证实 | `ws`/`http` 真实监听（`:89-153`） |
| 生产中心路由行为 | 未知 | 明确不在本测试 |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| `_cmdId` 隔离/还原 | 1、3 | `:175-229` | covered |
| 会话绑定/快照 | 2 | `:191-208` | covered |
| 迟到回包 | 4 | `:231-250` | covered |
| owner 删除 | 5 | `:251-261` | covered |
| 事件 ID 深守卫 | 6-8 | `:265-288` | covered |
