---
path: apps/electron/src/renderer/lib/channel-plan-quota.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e338ad94e3994ef1923b9ab770580469c4027865
sha256: 9889ba7d156054f2acf013c2ed594d8db1abf42240cea3d81378cd2937298b63
lines: 188
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/channel-plan-quota.ts

## 1. 结论与边界

渲染层渠道订阅额度（plan quota）数据访问模块（188 行）：能力判定、带 TTL 的内存缓存、IPC 请求兜底、in-flight 去重、每渠道定时后台刷新（引用计数调度）与刷新事件订阅。边界：唯一数据出口是 `window.electronAPI.getChannelPlanQuota` IPC（`apps/electron/src/renderer/lib/channel-plan-quota.ts:46`，主进程实现在 `apps/electron/src/main/lib/channel-manager.ts:1484`）；全部状态是渲染进程模块级内存态，无持久化；不含权限逻辑（代管渠道仅按 `serverManaged` 排除，`:8-9`）。注意与 `packages/shared/src/utils/channel-plan-quota.ts`（域外同名文件，导出 `supportsProviderPlanQuota`）区分。

## 2. 导出与关键符号

- 函数导出 7 个：`supportsChannelPlanQuota`（`:7`）、`getCachedPlanQuota`（`:29`）、`fetchChannelPlanQuota`（`:76`）、`requestPlanQuotaRefresh`（`:103`）、`subscribeChannelQuotaRefresh`（`:140`）、`ensurePeriodicRefresh`（`:165`）、`releasePeriodicRefresh`（`:176`）。
- 类型导出 1 个：`PlanQuotaRefreshEvent`（`:120-122`：start/done 判别联合）。常量导出 0 个。
- 合计导出 8 个符号，与源码逐条一致。关键内部符号（标注"内部"）：`PLAN_QUOTA_PROVIDERS` Set（`:3-5`）、`PLAN_QUOTA_CACHE_MS=5min`/`PLAN_QUOTA_ERROR_CACHE_MS=60s`（`:14-15`）、`CachedPlanQuota`（`:17-20`）、`quotaCache` Map（`:22`）、`inflightRequests` Map（`:23`）、`getCacheTtl`（`:25`）、`performPlanQuotaRequest`（`:42`）、`PLAN_QUOTA_REFRESH_INTERVAL_MS=5min`（`:117`）、`RefreshListener`（`:124`）、`refreshListeners` Map（`:127`）、`notifyRefreshListeners`（`:129`）、`periodicTimers` Map（`:153`）、`periodicSubscriberCount` Map（`:155`）、`runPeriodicRefresh`（`:158`）。

## 3. 内部逻辑与关键流程

1. 能力判定 `supportsChannelPlanQuota`（`:7-11`）：空/`serverManaged` 代管渠道 → false（`:9`，代管额度由 CDUT Studio 账户计费，不用其凭据查第三方）；否则 provider ∈ {deepseek, kimi-coding, minimax, zhipu-coding, openai-codex}（`:3-5`）或 `baseUrl` 含 `api.kimi.com/coding`（`:10`）。
2. 缓存读 `getCachedPlanQuota`（`:29-39`）：无缓存或 `result` 为空 → null（`:33`，修历史缺陷：曾写入 undefined 导致二次查询读 `updatedAt` 抛 TypeError）；仅当显式传 `channelUpdatedAt` 时做版本严格校验（`:36`，避免误判失效）；`Date.now() - updatedAt >= TTL` 过期 → null（`:37`），TTL 成功 5min/失败 60s（`:25-27`）。
3. IPC 执行 `performPlanQuotaRequest`（`:42-74`）：调 `window.electronAPI.getChannelPlanQuota(channelId)`（`:46`）；返回非对象 → 合成 `supported:false` 结果兜底（`:50-58`）；成功写 `quotaCache.set(channelId, {result, channelUpdatedAt: result.channelUpdatedAt ?? channelUpdatedAt})`（`:60`，优先用主进程回传版本）；reject → 合成失败结果（错误信息透传，`:64-70`）同样写缓存（`:71`）并 resolve 返回（不向外抛，`:72`）。
4. 被动查询 `fetchChannelPlanQuota`（`:76-95`）：缓存命中即返回（`:80-81`）；`inflightRequests` 有同渠道 Promise 即复用（`:85-86`）；否则发起请求并在 `finally` 删除 in-flight（`:88-91`），登记 in-flight（`:93`）。
5. 强制刷新 `requestPlanQuotaRefresh`（`:103-114`）：跳过缓存，其余与 4 共享同一 in-flight 锁（key=channelId，`:104-105`），并发重复调用物理上只发一次 IPC。
6. 事件订阅 `subscribeChannelQuotaRefresh`（`:140-150`）：按 channelId 建 `Set` 订阅者（`:141-145`），返回退订闭包（`:147-149`，`Set.delete` 幂等）；`notifyRefreshListeners`（`:129-137`）逐个通知，单监听器异常吞掉不影响其他（`:133-135`）。
7. 定时刷新 `ensurePeriodicRefresh`（`:165-173`）：引用计数 +1（`:166-167`），首次登记建 `setInterval(runPeriodicRefresh, 5min)`（`:168-172`）；`runPeriodicRefresh`（`:158-162`）通知 start → `requestPlanQuotaRefresh` → 通知 done；`releasePeriodicRefresh`（`:176-188`）计数 -1，归零删计数并 `clearInterval`（`:178-184`），多余注销安全（`:177` 用 `?? 1` 兜底）。

## 4. 调用者与调用链

- 入向（冻结树全量 grep `@/lib/channel-plan-quota`）：`apps/electron/src/renderer/hooks/use-plan-quota.ts:15-21`（import 六函数；调用 `:42` getCachedPlanQuota、`:50-51` requestPlanQuotaRefresh/fetchChannelPlanQuota、`:77-78` ensurePeriodicRefresh + subscribeChannelQuotaRefresh、`:87` releasePeriodicRefresh）；`apps/electron/src/renderer/components/shared/ChannelPlanQuotaBadge.tsx:5`（supportsChannelPlanQuota）；`apps/electron/src/renderer/components/agent/AgentView.tsx:29`（supportsChannelPlanQuota）。测试 import：`apps/electron/src/renderer/lib/channel-plan-quota.test.ts:3-10`。
- 出向：类型 `Channel`/`ChannelPlanQuotaResult`/`ProviderType`（`@profer/shared`，`:1`）；IPC 边界 `window.electronAPI.getChannelPlanQuota`（`:46` → `apps/electron/src/preload/index.ts:2326` → `apps/electron/src/main/ipc.ts:1735` → `apps/electron/src/main/lib/channel-manager.ts:1484`）。动态调用无。
- 否定结论检索范围：冻结树 `**/*.{ts,tsx,js}`；`packages/shared/src/utils/channel-plan-quota*.ts` 命中为同名不同文件（域外），非本文件调用者。

## 5. 数据 I/O、读写与副作用

有状态模块（与纯函数模块区分）：模块级 `quotaCache`/`inflightRequests`/`refreshListeners`/`periodicTimers`/`periodicSubscriberCount` 五个 Map（`:22,:23,:127,:153,:155`）跨调用持久。副作用：IPC 读额度（`:46`）；`setInterval`/`clearInterval` 定时器（`:169,:182`）；`setTimeout` 无；无 DOM/剪贴板/localStorage/Worker。缓存只在内存，刷新后丢失。

## 6. 分支、失败、取消与恢复

- 空输入/边界：channelId 空串不特判（键空间隔离即可）；`supportsChannelPlanQuota(null|undefined)` → false（`:9`）；`getCachedPlanQuota` 对脏缓存 `result` 为空返回 null（`:33`）。
- 失败恢复：IPC resolve 非对象与 reject 两条路径都合成 `supported:false` 结果写缓存（`:50-58,:63-73`），以 60s 短 TTL 允许尽快重试（`:15`）；异常不向上抛（`performPlanQuotaRequest` catch 后 resolve）。
- 竞态：并发 fetch/refresh 共享 in-flight Promise（`:85-93,:104-112`）；`finally` 必删 in-flight（`:89-91,:108-110`）防止锁死。
- 取消：无 AbortSignal；定时器生命周期由引用计数管理，`releasePeriodicRefresh` 归零即 `clearInterval`（`:181-183`），重复注销走安全分支（`:178`）。监听器异常隔离（`:131-135`）。

## 7. 权限与权威状态

无 sender/role 权限分支，依据：本文件无 sender/role 检查。权威约定：`serverManaged` 代管渠道的额度权威在 CDUT Studio 账户计费，本地禁查第三方（`apps/electron/src/renderer/lib/channel-plan-quota.ts:8-9` 注释 + `:9` 分支）；缓存版本一致性以主进程回传 `channelUpdatedAt` 为准（`:59-60`）。

## 8. 修改影响面

- `apps/electron/src/renderer/hooks/use-plan-quota.ts:42,50-51,77-78,87`（额度徽章数据源、刷新图标转圈、后台刷新生命周期）；`ChannelPlanQuotaBadge.tsx:5`、`AgentView.tsx:29` 的能力门控。
- TTL/合成结果语义改动会影响额度显示与错误提示；in-flight/引用计数改动会引发重复 IPC 或定时器泄漏；`window.electronAPI.getChannelPlanQuota` 契约（preload `apps/electron/src/preload/index.ts:433`）是跨进程依赖。

## 9. 测试证据

`NOT_RUN`（本轮未运行测试，纯静态阅读）。直接测试文件 `apps/electron/src/renderer/lib/channel-plan-quota.test.ts`（本批次内）：机械计数 `test(` = 10、`it(` = 0。真实断言：`apps/electron/src/renderer/lib/channel-plan-quota.test.ts:14,18,22-26`（supportsChannelPlanQuota 三分支）、`:59,63,67`（强制刷新跳缓存、fetch 命中新缓存）、`:78-79`（in-flight 同对象 + 只 1 次 IPC）、`:89`（fetch+refresh 并发共 1 次）、`:98`（TTL 内命中不请求）、`:114`（>5min 过期重请求）；`:122-128,:130-141` 两用例无 expect 行，验证退订/注销不抛错（隐式断言，见该文件手册 §3）。断言引用≠运行，不得写"测试通过"。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 个导出符号、5 个模块级 Map、TTL/兜底语义 | 已证实 | `apps/electron/src/renderer/lib/channel-plan-quota.ts:1-188` 全文 |
| in-flight 锁与引用计数调度逻辑 | 已证实 | `:85-93,104-112,165-188` |
| IPC 端到端链路（preload→ipc→channel-manager） | 已证实 | `apps/electron/src/preload/index.ts:2326`、`apps/electron/src/main/ipc.ts:1735`、`apps/electron/src/main/lib/channel-manager.ts:1484`（域外静态检索） |
| 主进程回传 `channelUpdatedAt` 的实际取值 | 未知 | 主进程实现域外，未逐行核对 |
| 测试实际运行结果 | 未知 | NOT_RUN，本轮未执行任何测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 覆盖 |
| --- | --- | --- | --- |
| `supportsChannelPlanQuota` | §3,§9 | `channel-plan-quota.ts:7-11` | covered |
| `getCachedPlanQuota` 三短路 | §3 | `channel-plan-quota.ts:29-39` | partial（版本校验分支仅经 `:36` 注释+`:60` 回写间接覆盖） |
| `performPlanQuotaRequest`（内部）兜底/写缓存 | §3,§6 | `channel-plan-quota.ts:42-74` | partial（非对象兜底 `:50-58` 未测） |
| `fetchChannelPlanQuota` + in-flight | §3,§9 | `channel-plan-quota.ts:76-95` | covered |
| `requestPlanQuotaRefresh` | §3,§9 | `channel-plan-quota.ts:103-114` | covered |
| `subscribeChannelQuotaRefresh`/`notifyRefreshListeners` | §3,§9 | `channel-plan-quota.ts:129-150` | partial（隐式断言：订阅/退订有断言；`notifyRefreshListeners` 函数体未执行——仅 `runPeriodicRefresh` 调用且定时器未触发） |
| `ensurePeriodicRefresh`/`releasePeriodicRefresh`/`runPeriodicRefresh` | §3,§9 | `channel-plan-quota.ts:158-188` | partial（隐式断言：引用计数路径经 ensure/release 有执行；`runPeriodicRefresh` 函数体未执行（定时器未触发），与姊妹 test 手册 §6 同口径） |
| 运行结果 | §9 | — | unknown（NOT_RUN） |
