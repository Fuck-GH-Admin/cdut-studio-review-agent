---
path: apps/electron/src/main/lib/cdut/cdut-gatekeeper.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 42d19dfca4cac87236db1469df36599d10ef18e6
sha256: 33489d4f3da97121dd797db84bb74b63b0478a37b0eb368a10107f01a9236788
lines: 129
kind: source
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/cdut-gatekeeper.ts

## 1. 结论与边界

CDUT 专区**统一门禁拦截器**（运行时代码）：拦截 8 大教务域+第 9 反代工具调用入口；特区账户非 `active` 时派发 `cdut-zone:gatekeeper-blocked` 拉起门禁弹窗、挂起等用户抉择、回传 `cdut-zone:gatekeeper-respond` 精准唤醒；返回结构化阻断（区分「已前往登录」/「用户拒绝」）（`apps/electron/src/main/lib/cdut/cdut-gatekeeper.ts:1-12`）。安全红线：未登录前绝不向青果教务提交请求、超时按拒绝（`:11`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CdutGatekeeperResult` | 导出接口 | 25-28 | `{allowed, rejectionResult?}` |
| `checkCdutGatekeeper` | 导出异步函数 | 77-115 | `(toolName, toolLabel)` 门禁检查（必经切面） |
| `resolveCdutGatekeeper` | 导出函数 | 122-129 | 渲染端回传决策唤醒（命中返 true） |

内部：`PendingDecision`（`:30-33`）、`pendingDecisions` Map（`:36`）、`GATEKEEPER_TIMEOUT_MS=30_000`（`:39`）、`buildRejection`（`:42-68`，三原因双模文案）。

## 3. 内部逻辑与关键流程

`checkCdutGatekeeper`（`:77-115`）：`cdutAuthManager.getProfile().status==='active'` 放行（`:81-84`）；无可用窗口→`no_window` 拦截（`:86-90`）；否则 requestId+`GATEKEEPER_BLOCKED` 事件广播全窗口（`:105-107`）、30s 超时按 `decline`（`:96-100`，timer.unref）；按用户抉择映射 `navigated_to_login`/`user_declined_login` 阻断文案（`:113`）——拒绝文案明确要求模型「尊重用户意图、停止调用、不要重复发起登录请求」（`:65`）。

## 4. 调用者与调用链

入向：CDUT 工具集调用入口（挂载点非本批）。出向：`@profer/shared`（类型+`CDUT_ZONE_IPC_CHANNELS`）、`./cdut-auth-manager`（单例，`:22`）、`electron` BrowserWindow、`node:crypto`。

## 5. 数据 I/O 与副作用

IPC 广播（`GATEKEEPER_BLOCKED`）；`console.log/warn`；内存 Map。

## 6. 分支、失败、取消与恢复

无 throw；超时→decline（`:96-100`）；无窗口→no_window；`resolveCdutGatekeeper` 未命中返 false（`:124`）。

## 7. 权限与权威状态

门禁权威=`cdutAuthManager.getProfile().status`；红线注释 `:11`（未登录零请求、超时即拒）。

## 8. 修改影响面

改文案影响大模型行为引导；改事件名与渲染端弹窗契约（`cdut-zone:*` IPC）同步。

## 9. 测试证据

无专属测试（冻结树 glob `**/cdut-gatekeeper*test*` 零命中）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出+三原因阻断+超时拒绝 | 已证实 | `:25-129` |
| 渲染端弹窗实现 | 未知 | renderer 侧非本批 |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部导出/分支 | §2/§3 | covered |
| 测试/运行 | §9/§10 | unknown（NOT_RUN） |
