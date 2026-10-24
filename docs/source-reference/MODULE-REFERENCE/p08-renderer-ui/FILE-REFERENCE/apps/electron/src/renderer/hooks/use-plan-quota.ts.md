---
path: apps/electron/src/renderer/hooks/use-plan-quota.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9262685a58eabc648345ba361d17d3ac5f248982
sha256: 8c7411c1278a04dc5065609d1f52952ad9c05cbb2060dea2236c19cfb625b148
lines: 98
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/hooks/use-plan-quota.ts

## 1. 结论与边界

**渠道订阅 Plan 额度共享查询 hook**（98 行，注释 `:1-9`）：统一「旧值优先+刷新状态」，供模型选择器徽章与上下文 Popover 复用；多入口共享 `planQuotaStateAtomFamily`——一处刷新全部图标转圈。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `UsePlanQuotaResult` | 接口 | `:23` | quota（旧值保持）/refreshing/refresh() |
| `usePlanQuota(channelId?)` | Hook | `:56` | 主入口 |
| `runPlanQuotaLoad`（内部） | 函数 | `:36` | force=跳缓存强制；否则缓存有效不发请求 |
| `EMPTY_CHANNEL_KEY` | 常量 | `:33` | 空渠道占位 key 保 atom 稳定 |

## 3. 内部逻辑与关键流程

- 挂载/渠道变化（`:63-71`）：缓存为初值→无效静默预取（cancelled 守卫；他处 in-flight 时 `fetchChannelPlanQuota` 命中锁复用同一 Promise，注释 `:62`）。
- 定时刷新（`:75-89`）：`ensurePeriodicRefresh`（活跃入口 5 分钟静默刷）+`subscribeChannelQuotaRefresh`（start/complete 事件同步 refreshing/quota）。
- `refresh`（`:91-95`）：不判 refreshing（UI disabled 锁+数据层 in-flight 锁双兜底，注释 `:93`）→force 加载。

## 4. 调用者与调用链

- 入向：模型选择器徽章、上下文 Popover（注释 `:4`，域外）。
- 出向：plan-quota-atoms、`@/lib/channel-plan-quota`（fetch/getCached/requestRefresh/ensure/release/subscribe）。

## 5. 数据 I/O、读写与副作用

IPC 拉取额度；定时器（数据层管理）；写 atom family 状态。

## 6. 分支、失败、取消与恢复

缓存命中/force 双分支；cancelled 守卫；释放定时刷新（release 在 cleanup `:87`）。

## 7. 权限与权威状态

额度数据权威=数据层（in-flight 锁+订阅事件）；UI 刷新态与数据一致由订阅桥保证（`:74`）。

## 8. 修改影响面

额度徽章/Popover 多入口一致性；定时刷新生命周期（活跃入口持有）。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批该文件无 test）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 旧值优先/in-flight 复用/订阅桥 | 已证实 | `:1-98` 全文 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出+内部 | §2/§3 | 23-97 | covered |
