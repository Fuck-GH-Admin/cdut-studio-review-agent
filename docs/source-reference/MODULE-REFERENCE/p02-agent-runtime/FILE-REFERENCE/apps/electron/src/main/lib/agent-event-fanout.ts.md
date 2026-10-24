---
path: apps/electron/src/main/lib/agent-event-fanout.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9742b3a5a5e6b33b3d62d74c6e0e90c600f7e8be
sha256: 0f68933afb317e912ce3de47ac5acda428677512b1afb7b0802fedc3ffb52122
lines: 81
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-event-fanout.ts

## 1. 结论与边界

Agent 会话事件扇出（纯逻辑，模块头 :2-20）：把「emit 事件总线」+「必要时兜底直发发起方 webContents」的判定抽成不依赖 electron 的纯函数，消除同一窗口重复投递 resolved 事件的问题。自身不抛异常（全程守卫）；真正的 I/O 失败由调用方 `sendToSender` 适配层 try/catch（注释 :17-19）。

不做的事：不构造/加工 payload（原样透传，:49）；不持久化、不广播 Pocket（`emitToBus` 适配口的职责）；不做发送（`sendToSender` 适配口）。

## 2. 导出与关键符号

导出 4 条（`export` 逐条核 :23/:28/:37/:52）：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `StreamSenderLike` | interface | `:23-25` | `{isDestroyed(): boolean}` | 最小 send 目标接口（便于 fake 注入） |
| `SessionEventFanout` | interface | `:28-35` | `{emitToBus, getBoundSender, sendToSender}` 三个适配口 | 由调用方绑定真实总线/映射 |
| `FanoutResult` | interface | `:37-42` | `{deliveredToBus: boolean, fallbackSent: boolean}` | 返回形状 |
| `fanoutSessionEvent` | function | `:52-81` | `(fanout, sessionId, payload, fallbackSender?) => FanoutResult` | 主逻辑 |

无内部函数。

## 3. 内部逻辑与关键流程

`fanoutSessionEvent`（:52-81）：
1. `!sessionId`（空串/undefined/null）→ 返回 `{deliveredToBus:false, fallbackSent:false}`，什么都不做（:60-62，注释 :58-59：过期 request 无归属，避免投错会话）。
2. `fanout.emitToBus(sessionId, payload)`（:65）——事件总线是唯一权威出口（注释 :64：Pocket 广播/重放日志/已绑定 renderer 转发都在此发生）。
3. `bound = fanout.getBoundSender(sessionId)`（:67）。
4. `needsFallback = !bound || bound.isDestroyed() || bound !== fallbackSender`（:73；注释 :68-72 列三种情形：无绑定/绑定已销毁/绑定不是发起方）。
5. `needsFallback && fallbackSender && !fallbackSender.isDestroyed()` 时 `sendToSender` 直发兜底，返回 `{deliveredToBus:true, fallbackSent:true}`（:75-78）。
6. 否则返回 `{deliveredToBus:true, fallbackSent:false}`（:80）。

关键比较：`bound !== fallbackSender` 是引用比较（同一 webContents 对象）。

## 4. 调用者与调用链

入向（grep 全冻结树 `*.ts`）：
- 唯一生产调用：`apps/electron/src/main/lib/agent-service.ts:33` 导入；`:234` 定义的 `emitSessionStreamEvent`（:240-259）内调用——适配口绑定：`emitToBus → eventBus.emit`（:243）、`getBoundSender → sessionWebContents.get(sid)`（:244）、`sendToSender → (sender as WebContents).send(AGENT_IPC_CHANNELS.STREAM_EVENT, …)` 带 try/catch `console.error`（:245-258）。`fallbackSender` 传入受 `visibleToDesktop` 控制（review 会话传 null，:237/:257）。
- 直接测试：`apps/electron/src/main/lib/agent-event-fanout.test.ts:2`（本批内）。

出向：无导入（纯模块，:1-20 注释外无 import）。

## 5. 数据 I/O、读写与副作用

- 本文件无 I/O（依据：零 import、零全局状态）。副作用仅经适配口注入（`emitToBus`/`sendToSender`）。
- 幂等：同输入同输出；重复投递防护语义（同一窗口只收到一次）由判定逻辑保证（:73）。

## 6. 分支、失败、取消与恢复

- 分支：`!sessionId` 短路（:60）；`needsFallback` 三条件或（:73）；`fallbackSender` 存在且未销毁才直发（:75）。
- 自身不抛异常（注释 :17-18；全部为 null/undefined 守卫与引用比较）。
- 发送失败：`sendToSender` 内部由调用方 catch（agent-service:250-257 `console.error`）；`WebContents.send` 抛错不影响 `emitToBus` 已完成的投递。
- 不适用「恢复」：纯函数无状态。

## 7. 权限与权威状态

无权限分支（依据：无 sender/role 校验，`fallbackSender` 是参数不是身份凭证）。可见性边界在调用方：`emitSessionStreamEvent` 对 review 会话传 `fallbackSender=null`（agent-service:237/:257，配合 :201-204 中间件不转发），本文件据此不直发（:75 条件）。

## 8. 修改影响面

- 唯一消费者 `emitSessionStreamEvent`（agent-service:234）是全桌面渲染层 resolved/流事件投递口径；改判定会导致重复投递（横幅不消失或双份）或漏投。
- `StreamSenderLike` 改动影响测试 fake 与 WebContents 适配。
- 需同步修改的测试：`agent-event-fanout.test.ts`（本批内，7 用例建模中间件投递）。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/agent-event-fanout.test.ts`（本批内，7 用例）。测试把 `emitToBus` 建模为「向 bound（未销毁时）投递一次」模拟 agent-service 中间件（注释 :7-9），用 `sendToSender` 计数判重复。
- 发起方即绑定：`{deliveredToBus:true, fallbackSent:false}`、direct 计数 0、bound 只收 1 次、总投递 1 条（:63-69）。
- 未绑定：fallbackSent true、bus 1 + direct 1、直发目标/载荷正确且 `payload` 引用相等（`toBe(PAYLOAD)`，:88）。
- 过期 request（undefined/null/'' 三值循环）：双 false、零投递（:91-103）。
- 绑定已销毁：走兜底 1 次、总 2 条（bus 给 none + direct）（:105-115）。
- 绑定非发起方：兜底目标为发起方（:117-127）。
- 无绑定无发起方（undefined/null 循环）：只进总线、不抛（:129-139）。
- 发起方已销毁且未绑定：不直发（:141-149）。
- mock/边界：全部适配口为 fake（无 electron）；模型化假设「中间件向 bound 发」与真实 agent-service 中间件行为一致——该假设由注释声明（:7-9），未做集成验证。
- 未覆盖：`emitToBus`/`sendToSender` 抛错时的行为（测试未抛）、`bound` 与 `fallbackSender` 同一但中间件跳过（review 会话）等真实边界。`NOT_RUN`：本轮未执行测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 4 条；纯函数无 import/无状态 | 已证实 | `:23-52`；文件零 import |
| `!sessionId` 双 false 短路 | 已证实 | `:60-62`；测试 :91-103 |
| needsFallback 三条件；fallback 需未销毁 | 已证实 | `:73-78`；测试 :59-149 |
| payload 引用透传不加工 | 已证实 | `:49`（注释）/:76；测试 :88 |
| 唯一生产调用为 `emitSessionStreamEvent` | 已证实 | agent-service.ts:33/:240 |
| review 会话 fallbackSender=null → 不直发 | 已证实（消费侧） | agent-service:237/:257 |
| 测试的「中间件向 bound 发」模型与真实中间件一致性 | 推断 | 测试注释 :7-9 声明；agent-service:198-217 行为相符但无集成测试 |
| 双窗口（绑定≠发起方）真实场景表现 | 未知 | 仅纯函数层验证 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `fanoutSessionEvent` 全分支 | §3/§9 | :52-81 | covered |
| `StreamSenderLike`/`SessionEventFanout`/`FanoutResult` | §2 | :23-42 | covered |
| 唯一消费调用与适配 | §4 | agent-service:234-259 | covered |
| 适配口抛错行为 | §9 | — | unknown |
| 真实双窗口/重连场景 | §10 | — | unknown |
