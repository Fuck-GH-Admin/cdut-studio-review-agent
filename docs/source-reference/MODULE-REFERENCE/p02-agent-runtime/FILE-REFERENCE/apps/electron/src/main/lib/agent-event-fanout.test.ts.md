---
path: apps/electron/src/main/lib/agent-event-fanout.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a8b299734f3faf575d0441cc47fec9c8b4c5a70d
sha256: 177bcd6b8fc3a7ed57dee35d77afa288293b23ec70fce04eaa4439739fa40e6b
lines: 150
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-event-fanout.test.ts

## 1. 测试目标

回归验证 `apps/electron/src/main/lib/agent-event-fanout.ts` 的 `fanoutSessionEvent`：桌面端 resolved 事件不得重复投递。测试把 `emitToBus` 建模为「向 bound（未销毁时）投递一次」模拟 agent-service 的 EventBus IPC 中间件（注释 :7-9），以 `sendToSender` 计数判定是否产生第二份。不运行测试（`NOT_RUN`）。

## 2. 用例清单

用例数 7（`test(` 计数：:59/:72/:91/:105/:117/:129/:141），1 个 describe（:58）。公共装置：`sender(name, destroyed)` fake（:23-25）、`harness(bound)` 构造 fanout 适配口与 deliveries 记录（:34-56）；常量 `SESSION_ID`（:12）、`PAYLOAD`（permission_resolved 事件，:14-17）。

| # | 用例（行） | 设置 | 动作 | 断言 |
| --- | --- | --- | --- | --- |
| 1 | 发起方即绑定（:59） | bound=main | 扇出 | `{deliveredToBus:true, fallbackSent:false}`、direct 0、`deliveredTo(main)` 1、总 1 条（:65-69） |
| 2 | 未绑定（:72） | bound=undefined | 扇出，fallback=main | 双 true、bus 1 + direct 1、末条 toEqual direct 目标/载荷、payload `toBe(PAYLOAD)` 引用透传（:78-88） |
| 3 | 过期 request（:91） | bound=main | sessionId ∈ [undefined,null,''] 循环 | 双 false、零投递（:98-101） |
| 4 | 绑定已销毁（:105） | bound=sender(…,true) | fallback=main | 双 true、direct 1、总 2、deliveredTo(main) 1（:111-114） |
| 5 | 绑定非发起方（:117） | bound=otherWindow | fallback=main | 双 true、direct 1、末条 target=main（:124-126） |
| 6 | 无绑定无发起方（:129） | bound=undefined | fallback ∈ [undefined,null] 循环 | `{deliveredToBus:true, fallbackSent:false}`、bus 1、direct 0（:135-137） |
| 7 | 发起方已销毁未绑定（:141） | bound=undefined | fallback=sender(main,true) | 双 true 中仅 bus、`fallbackSent:false`、direct 0（:147-148） |

依赖顺序：独立（每循环迭代新 harness）。

## 3. 真实断言

- `:65-69`：`expect(result).toEqual({ deliveredToBus: true, fallbackSent: false })`、`expect(h.count('direct')).toBe(0)`、`expect(h.deliveredTo(main.name)).toBe(1)`、`expect(h.deliveries).toHaveLength(1)`。
- `:78-88`：`expect(result).toEqual({ deliveredToBus: true, fallbackSent: true })`、`expect(h.count('bus')).toBe(1)`、`expect(h.count('direct')).toBe(1)`、`expect(h.deliveries.at(-1)).toEqual({channel:'direct', target:…, sessionId:…, payload:…})`、`expect(h.deliveries.at(-1)?.payload).toBe(PAYLOAD)`。
- `:98-101`：`expect(result).toEqual({ deliveredToBus: false, fallbackSent: false })`、`expect(h.count('bus')).toBe(0)`、`expect(h.count('direct')).toBe(0)`、`expect(h.deliveries).toHaveLength(0)`。
- `:111-114`：双 true、`expect(h.count('direct')).toBe(1)`、`toHaveLength(2)`、`deliveredTo(main.name)` 1。
- `:124-126`：双 true、direct 1、`expect(h.deliveries.at(-1)?.target).toBe(main.name)`。
- `:135-137`：`{deliveredToBus:true, fallbackSent:false}`、bus 1、direct 0。
- `:147-148`：`{deliveredToBus:true, fallbackSent:false}`、`expect(h.count('direct')).toBe(0)`。

## 4. 未覆盖与脆弱点

- 未覆盖：`emitToBus`/`sendToSender` 抛错路径（fake 不抛）、`bound === fallbackSender` 但中间件跳过转发（review 会话）等真实边界、真实 WebContents 语义。
- 脆弱点：核心模型假设「emitToBus = 向 bound 发一份」（harness :37-45）是对 agent-service 中间件的简化——真实中间件还区分 review 会话/session_projection 广播；若真实转发规则变化，本测试仍绿而行为已偏。`deliveredTo` 计数把 bus 与 direct 合并计数（:53），#4 靠 total(2)+deliveredTo(1) 区分。
- mock/真实边界：全部适配口 fake（无 electron）；被测 `fanoutSessionEvent` 为真身直调。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 用例计数与 `test(` 一致 | 已证实 | :59-141 |
| 断言行如 §3 | 已证实 | 逐行读 :63-148 |
| 全 5 分支 + 2 负例被断言 | 已证实 | #1-#7 |
| payload 引用透传被断言 | 已证实 | :88 `toBe(PAYLOAD)` |
| harness 模型与真实中间件一致 | 推断 | 注释 :7-9 声明；未集成验证 |
| 测试通过与否 | 未知（NOT_RUN） | 本轮未执行 |

## 6. 覆盖表

| 被测分支 | 用例 | 状态 |
| --- | --- | --- |
| 发起方=绑定（不兜底） | #1 | covered |
| 未绑定→兜底 | #2 | covered |
| !sessionId 短路 | #3 | covered |
| 绑定销毁→兜底 | #4 | covered |
| 绑定≠发起方→兜底 | #5 | covered |
| 无绑定无发起方 | #6 | covered |
| 发起方销毁不直发 | #7 | covered |
| 适配口抛错/真实中间件差异 | — | unknown |
