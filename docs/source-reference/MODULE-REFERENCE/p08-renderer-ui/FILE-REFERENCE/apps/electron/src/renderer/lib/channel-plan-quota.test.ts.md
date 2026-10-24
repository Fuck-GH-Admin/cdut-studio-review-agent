---
path: apps/electron/src/renderer/lib/channel-plan-quota.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3c44e100a1e86c701938d6d459bdd46afff3da64
sha256: 94bc5dec44df5e507e14aa41f5cfbc51d9ca50eb13c19ad54c3118cd2bb6a920
lines: 142
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/channel-plan-quota.test.ts

## 1. 测试目标

验证渲染层渠道订阅额度模块 `apps/electron/src/renderer/lib/channel-plan-quota.ts` 的三组契约：能力判定（`supportsChannelPlanQuota`：普通 zhipu 不查、GLM Coding Plan 可查、CDUT Studio 代管不查第三方）、数据层手动刷新/缓存 TTL/in-flight 锁（强制刷新跳缓存、并发复用同一请求、TTL 内命中、>5min 过期重请求）、PR2 定时后台刷新调度（退订幂等、引用计数归零清理定时器且多余注销安全）。IPC 经 `window.electronAPI.getChannelPlanQuota` mock 注入（`apps/electron/src/renderer/lib/channel-plan-quota.test.ts:35-48`），记录真实请求次数。

## 2. 用例清单

机械计数：`test(` = 10、`it(` = 0、`describe(` = 3（grep `^\s*(it|test|describe)\(` 于 `apps/electron/src/renderer/lib/channel-plan-quota.test.ts`），与下表一致（行号 = `apps/electron/src/renderer/lib/channel-plan-quota.test.ts:<行>`）：

- describe「渲染层渠道订阅额度能力」（`:12`）：`:13` Given 普通 zhipu 渠道 When 判断 Then 不触发订阅额度查询；`:17` Given GLM Coding Plan 渠道 When 判断 Then 允许查询订阅额度；`:21` Given CDUT Studio 代管的支持类型渠道 When 判断 Then 不查询第三方订阅额度。
- describe「数据层：手动刷新、缓存 TTL 与 in-flight 锁定」（`:30`）：`:54` 有有效缓存时手动刷新跳过缓存强制请求一次；`:70` 刷新进行中并发重复调用复用同一请求（in-flight 锁）；`:82` 手动刷新与被动 fetch 并发共享同一请求；`:92` 缓存未过期 fetch 命中缓存不请求；`:101` 成功缓存已过期（>5min）fetch 重新请求。
- describe「数据层：PR2 定时后台刷新调度」（`:121`）：`:122` 订阅刷新事件后退订幂等、不抛错；`:130` 注册注销交错、引用计数归零定时器被清理、多余注销安全。

## 3. 真实断言

- `apps/electron/src/renderer/lib/channel-plan-quota.test.ts:14`：`expect(supportsChannelPlanQuota({ provider: 'zhipu', baseUrl: 'https://open.bigmodel.cn/api/paas/v4/' })).toBe(false)`；`:18`：zhipu-coding + `/api/coding/` 路径 `toBe(true)`；`:22-26`：`kimi-coding` + `serverManaged: true` `toBe(false)`（多行 expect，断言收于 `:26`）。
- `:59`：`expect(calls).toContain(channelId)`（fetch 先写缓存）；`:63`：手动刷新后 `expect(calls.filter(...)).toHaveLength(2)`；`:67`：后续 fetch 命中新缓存仍 `toHaveLength(2)`。
- `:78`：`expect(r1).toBe(r2)`（同一 in-flight Promise → 同一结果对象）；`:79`：`toHaveLength(1)`（只发一次 IPC）。
- `:89`：fetch+refresh 并发 `toHaveLength(1)`。
- `:98`：TTL 内二次 fetch `expect(calls.filter(...)).toHaveLength(before)`。
- `:114`：推进 5 分 1 秒（`:112` `now += 5 * 60 * 1000 + 1_000`，`Date.now` monkeypatch `:102-104`，`finally` 恢复 `:115-117`）后 `toHaveLength(before + 1)`。
- `:122-128`、`:130-141` 两个用例无 expect 行：断言即"两次 `unsubscribe()` 不抛错"与"ensure/release 交错 + 多余 release 不抛错"（隐式断言，抛错则失败）。
- 基建：`installMock`（`:35-48`）安装 `globalThis.window.electronAPI.getChannelPlanQuota`（`:45-47`），延迟 `delayMs` 后 resolve supported 结果并记录 `calls`（`:36-44`）；`beforeEach` 清空 `calls`（`:50-52`）。

## 4. 未覆盖与脆弱点

- 未覆盖（检索范围：本文件全文）：`getCachedPlanQuota` 无直接 import/断言（仅经 fetch 间接）；IPC reject 兜底路径（mock 只 resolve，`:36-44`）与非对象返回兜底（源码 `channel-plan-quota.ts:50-58`）未测；失败缓存 60s TTL（`channel-plan-quota.ts:15`）未测；`channelUpdatedAt` 版本严格校验（`channel-plan-quota.ts:36`）未测；`subscribeChannelQuotaRefresh` 的监听器回调触发从未被断言（`:124` 传 `() => {}`，PR2 刷新事件 start/done 不验证）；`ensurePeriodicRefresh` 的 5min 定时器实际触发未测（仅注册/注销不抛错）。
- 脆弱点：模块级缓存跨用例残留（`beforeEach` 只清 `calls` 不清缓存，`:50-52`），用例以 `-${Date.now()}` 频道 ID 隔离（`:56,:72,:84,:94,:107,:123,:131`），同毫秒并发执行的用例存在撞键可能；`:104` 对全局 `Date.now` 的 monkeypatch 依赖 `:115-117` 的 finally 恢复，异常中断会污染同进程其他测试；`:111` 注释把"成功 TTL=5min（PR2 调整后）"锁为契约；`:70-79` 的 30ms mock 延迟（`:71`）须短于测试超时且足以产生并发窗口。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 10 用例、断言行如 §3 所列 | 已证实 | 机械计数 + `apps/electron/src/renderer/lib/channel-plan-quota.test.ts:12-141` |
| 能力判定三分支、in-flight 锁、TTL 过期重请求 | 已证实 | `:14-26,:78-79,:89,:114`（断言文本） |
| mock 的 IPC 形状与真实 preload 契约一致 | 间接 | mock 定义 `:36-47` 对照 `ChannelPlanQuotaResult` 类型（`@profer/shared`，域外） |
| 退订/引用计数两用例的实际效果 | 间接 | 无 expect 行，仅不抛错语义 |
| 测试实际运行结果 | 未知 | NOT_RUN（本轮未运行测试，纯静态阅读） |

## 6. 覆盖表

| 符号/分支 | 章节 | 行 | 覆盖 |
| --- | --- | --- | --- |
| `supportsChannelPlanQuota` 三分支 | §2,§3 | `channel-plan-quota.test.ts:12-27` | covered |
| `fetchChannelPlanQuota` 缓存命中/过期 | §2,§3 | `channel-plan-quota.test.ts:92-118` | covered |
| `requestPlanQuotaRefresh` 强制刷新 | §2,§3 | `channel-plan-quota.test.ts:54-68` | covered |
| in-flight 锁（refresh×refresh / fetch×refresh） | §2,§3 | `channel-plan-quota.test.ts:70-90` | covered |
| `subscribeChannelQuotaRefresh` 退订幂等 | §2,§3 | `channel-plan-quota.test.ts:122-128` | partial（隐式断言） |
| `ensurePeriodicRefresh`/`releasePeriodicRefresh` 引用计数 | §2,§3 | `channel-plan-quota.test.ts:130-141` | partial（隐式断言，定时器触发未验证） |
| `getCachedPlanQuota` / 失败 TTL / 版本校验 / IPC 兜底 | §4 | — | unknown |
| 运行结果 | §5 | — | unknown（NOT_RUN） |
