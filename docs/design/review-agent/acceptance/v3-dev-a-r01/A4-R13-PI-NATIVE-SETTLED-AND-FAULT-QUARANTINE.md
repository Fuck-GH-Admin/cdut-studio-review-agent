# Dev-A A4-R13｜Pi 0.86.1 原生事件序列结清、重试拒止与故障隔离

> Dev-A 自有源码/合成测试批次，**不改 C-owned shared DTO、Main IPC、Preload、Case/Run/Decision/Outbox 写口**。协调文档只更新 `STATUS:A`。I2 对 A 的已签来源 `c0132ae06de8ae09ab021ac231ffd34756eb5990` 必须维持独立锁，不随本分支浮动升级。
>
> 本批不是“真 Provider 已通过”的声明，不使用模型输出、assistant.uuid、`agent_end` 单个事件伪造物理回执。

## 1. 上一冻结检查点及真实 upstream 证据

A4-R12 #143 的独立来源 SHA `c0132ae06de8ae09ab021ac231ffd34756eb5990`，PR CI [39293695755](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39293695755)（4139 PASS/5 SKIP/0 FAIL）、D2 [39293695808](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39293695808)、Baseline [39293695753](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39293695753) 全部同 SHA `SUCCESS`。此证明只对 R12 生效。

固定 Pi upstream `@earendil-works/pi-*-0.86.1` tag [13cbf77](https://github.com/earendil-works/pi/tree/v0.86.1) 的源码特征：

1. `packages/agent/src/agent-loop.ts`：`runAgentLoop()` 在物理模型 stream 之前 emit `turn_start`，assistant + tools 处理后 emit `turn_end`，并在结束时 emit `agent_end`；下一轮模型可能由工具或 steering 继续触发新的 `turn_start`。
2. `packages/coding-agent/src/core/agent-session.ts`：SDK `AgentSessionEvent` 对 `agent_end` **额外携带 `willRetry`**；一个 `agent_end` 不能独立证明 SDK 不准备重试。
3. `_runAgentPrompt()` 处理 `agent.prompt()` 之后仍可调用 `_handlePostAgentRun`、`agent.continue()`；finally 执行 `_emitAgentSettled()`，其中 `agent_settled` 是在会话续发尝试/后续流程结束之后发出的观察事件。真实 abort、network timeout 后仍须证明无异常结果被记成 completed。
4. 先前 A4-R10/R12 只用 `turn_end` + `session.prompt()` resolved 判断正向完成，而 `agent_end` 或 `agent_settled` 缺失、`willRetry=true` 都未硬拒止。尽管多次 `streamFunction/fetch` 已被 A4 主栅栏拒止，此先期结清条件仍不足。

## 2. A-only 实际实现

`review-v3-pi-http-provider-engine.ts` 保留已证明的 HTTPS pinned origin、`redirect:'error'`、单 `fetch` + x-request-id、Main AbortSignal、一次性 Pi `dispose()`。增加四状态序列：

```text
single native Pi turn_start
    ↓
streamFunction starts once
    ↓
guarded HTTPS/SSE fetch once, real provider x-request-id
    ↓
native turn_end assistant (valid stopReason)
    ↓
native agent_end with willRetry == false
    ↓
native agent_settled
    ↓
session.prompt returned, no Main abort/corrupted flag
    ↓
V3ANativeProviderWitness.requestFinished (technical receipt only)
```

- 缺 `turn_start` 时不得调用物理 Provider；`turn_end` 早于 HTTP response 身份无效；`agent_end` 提前或声明 `willRetry=true`，以及漏掉 `agent_settled`，都不得写 `completed-turn`。
- 任意重复/乱序的开始、结束或结清事件永久置 `corrupted`；下次 `streamFunction` 和 HTTP fetch 必须检查该标志，拒绝再次物理派发。即使下层 SDK 吞掉异常，前置 A4 durable intent 仍未清账，C/operator 必须明确恢复。
- `agent_settled` 只提供**Pi 会话处理已结清**的观察证据，不能单独证明服务器端副作用、原件校核或正式 C2 Run ACK，真实 Provider 仍要求 Gate E 的物理 trace/log 和受信身份。
- 此包没有激活 C 的 `CR-A-PI-HTTP-WITNESS-R01` 生产 Main factory lease；没有授权的 Provider 不做真实外部请求。

## 3. 合成测试与本轮新门禁

新 `review-v3-pi-http-provider-engine.test.ts::R13-01..06`：
- turn_end 成功但无 agent_settled -> fail closed；
- agent_end 告知 willRetry -> fail closed；
- 未发 turn_start 或提前 agent_end -> Provider fetch **0** 次；
- 重复 turn_end -> fail closed；
- agent_settled 无 agent_end -> fail closed。

原 R10/R12 fixture 及 A4 `review-v3-main-sdk-turn-bridge.test.ts::A4-R10-16` 被更新为 upstream 源码真实的 `turn_start → turn_end → agent_end(willRetry:false) → agent_settled`；原基础业务路径保留。

**R13 Gate O 只能在 R13 最终精确 SHA 的 PR CI + D2 Scoped Pi + Review Baseline 全部 completed/success，且 TypeScript、构建与全量 Bun 真实执行后签收。** R12 4139 PASS 不能拿来抵 R13。Gate E 真 Pi AgentSession/HTTPS/SSE Provider 请求实际 trace 仍 `NOT_RUN`；Gate L `BLOCKED_NO_AUTH`；Gate P `NOT_RUN`；正式 C2 ReviewRun、Check、Decision、写回仍归 C 独占，I2 锁源不自动更新。

## 4. 下一工程顺序

先精确 SHA Gate O → 修第一真实失败并重验 → Dev-C 对 C2 Main factory/Owner at-commit Host receipt + `CR-A-PI-HTTP-WITNESS-R01` 文件级租约正式决议 → 获授权后真实 Electron Pi SDK 0.86.1 / Provider SSE Gate E（物理请求数、x-request-id、代理透明 retry、取消+dispose、PID SIGKILL、late reply 和业务 ACK 隔离）。未获该授权时，可继续 A-owned 故障日志/恢复测试，不应宣称真实网络 Gate E 完成。
