---
path: apps/electron/src/main/lib/agent-session-deletion.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e8b53aeab43d1549d164b2cb7513d3072f2da56a
sha256: 8d96d4e314cff9f5dddbb45e96fb395153661f377cb81faa3814b12d7844a650
lines: 53
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-session-deletion.ts

## 1. 结论与边界

**会话删除协调器**：合并同一根会话的并发删除；级联删除先锁定并停止整棵委派树，**所有 stop-and-wait 成功前绝不清理任何持久化数据**；成功后才按叶子到根删除，防孤儿子会话（`agent-session-deletion.ts:11-14`）。纯编排（deps 注入），无直接 I/O。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `AgentSessionDeletionDependencies` | 类型 | `:1` | getDeletionOrder?（缺省仅目标）/beginDeletion/endDeletion/stopAndWait/clearState/deleteSession |
| `AgentSessionDeletionCoordinator` | 类类 | `:15` | `delete(id, deps): Promise<void>`；状态 `inFlight: Map<string,Promise>`（`:16`） |

## 3. 内部逻辑与关键流程

`delete`（`:18-52`）：①同 id 在途→返回同一 Promise（`:19-20`）；②order 去重，**空数组防御至少含目标**（`:22-24`）；③lockedIds=order∪{id} 去重（`:25`）；④**任一 lockedId 已在别的删除事务→合并返回**（防双重清理，`:26-30`）；⑤异步事务：全部 `beginDeletion`（`:33`）→ **逐个 `stopAndWait` 全部成功才进入清理**（`:35-36`）→ 按 order（叶子→根）`clearState`+`deleteSession`（`:37-40`）→ finally 全部 `endDeletion`（`:41-43`）；⑥inFlight 登记+完成后仅移除自己的条目（`:45-50`）。

## 4. 调用者与调用链

- 入向：ipc.ts 删除链（域外；依赖函数如 `getAgentSessionDeletionOrder`/`stopAgentAndWait` 来自 session-manager/agent-service）；测试 `agent-session-deletion.test.ts` 6 用例。
- 出向：无模块 import（纯 deps 注入）。

## 5. 数据 I/O、读写与副作用

副作用全部经 deps（begin/end 锁、stop、clear、delete）；本文件只管编排与合并。

## 6. 分支、失败、取消与恢复

- 失败：任一 stopAndWait 抛→**整个事务不清理不删除**，但 endDeletion 全部释放（finally，`:41-43`）。
- 合并：请求 id/任一树内 id 在途→并入既有事务（`:19-30`）。
- 取消：无显式取消（删除事务不可中断）。

## 7. 权限与权威状态

删除权威=deps（调用方提供）；不变量：先停整树再删、叶子到根、失败零清理（注释 `:11-14`）。

## 8. 修改影响面

删除链正确性（防孤儿/防双重清理）；测试 6 断言锁定时序（calls 序列）。

## 9. 测试证据

`NOT_RUN`。直接测试 `agent-session-deletion.test.ts`（109 行/**6 个 `test(`**）：运行中等待后才清理删除（`:15-25`，`['begin','stop']`→释放→`[..., 'clear','delete','end']`）；并发删除合并（`first===second`，`:27-36`）；stopAndWait 失败→不清理但释放锁（`:38-43`，`['begin','stop','end']`）；多级委派叶子到根全序（`:45-66`，14 步序列断言）；子会话停止失败→树内零删除（`:68-84`）；级联进行中删子会话合并同事务（`:86-108`，delete:child 仅 1 次）。mock 边界：deps 记录替身+手动 release 门。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 合并/顺序/失败零清理语义 | 已证实 | `:1-53` 全文 + 6 测试互证 |
| deps 实现（真实 stop/delete） | 边界 | 域外 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出+事务流程 | §2/§3 | 1-52 | covered |
| 测试 6 用例 | §9 | test 文件 | covered（NOT_RUN） |
