---
path: apps/electron/src/main/lib/cdut/cdut-mutation-guard.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5cd33a2c7fc47982e223995011a7bc01dbfc8e25
sha256: 0396c9f25836307b798a4046fcec5f80335016223d16163294f9d2fb9734a9f4
lines: 65
kind: source
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/cdut-mutation-guard.ts

## 1. 结论与边界

CDUT 专区**写操作二次确认守卫**（运行时代码）：高危写操作（选退课/报名/缓考/改密等）先派发 `cdut-zone:on-mutation-request` 等用户确认，回传 `cdut-zone:confirm-mutation` 精准唤醒；红线「未取得用户显式确认前绝不提交任何写操作；超时一律按拒绝」（`apps/electron/src/main/lib/cdut/cdut-mutation-guard.ts:1-10`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名 | 说明 |
| --- | --- | --- | --- | --- |
| `requestCdutMutationConfirm` | 导出函数 | 31-52 | `(request): Promise<boolean>` | 派发确认并等待；确认 true，取消/超时/无窗口 false |
| `resolveCdutMutationConfirm` | 导出函数 | 58-65 | `(result): boolean` | 渲染端回传唤醒（命中 true） |

内部：`PendingConfirm`（`:16-19`）、`pendingConfirms` Map（`:22`）、`CONFIRM_TIMEOUT_MS=30_000`（`:25`）。

## 3. 内部逻辑与关键流程

`requestCdutMutationConfirm`：无可用窗口→warn+`false`（`:32-36`）；否则注册挂起+30s 超时按拒绝（`:39-43`，timer.unref）+向全窗口 `ON_MUTATION_REQUEST` 广播（`:48-50`）。`resolveCdutMutationConfirm`：未命中返 false；命中清定时器、`!!result.confirmed` 唤醒（`:58-65`）。

## 4. 调用者与调用链

入向：Pi 工具层高危写操作拦截诉求（挂载点非本批）。出向：`electron` BrowserWindow、`@profer/shared`（类型+`CDUT_ZONE_IPC_CHANNELS`）。

## 5. 数据 I/O 与副作用

IPC 广播；`console.warn`；内存 Map。无磁盘。

## 6. 分支、失败、取消与恢复

无 throw；三拒绝路径（无窗口/超时/用户取消）统一返 false；超时自动清理 Map（`:40`）。

## 7. 权限与权威状态

红线注释 `:9`（无确认零提交、超时即拒）；确认权威=渲染端用户抉择。

## 8. 修改影响面

改事件名与渲染端确认弹窗契约同步；超时值影响用户抉择窗口。

## 9. 测试证据

无专属测试（冻结树 glob `**/cdut-mutation-guard*test*` 零命中）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出+三拒绝路径 | 已证实 | `:1-65` |
| 工具层挂载点 | 未知 | 非本批 |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部导出/分支 | §2/§3 | covered |
| 测试/运行 | §9/§10 | unknown（NOT_RUN） |
