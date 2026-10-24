---
path: apps/electron/src/main/lib/review/review-ordinary-ipc-pending.p04.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8e80f197b8c19eb2df1b55d75b7d2e081449e935
sha256: 34ad161df8b232946eaa0035289f705a3c9cf637b71909af3cf96ca32b16959a
lines: 41
kind: test
package: p05-review-engine
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-ordinary-ipc-pending.p04.test.ts

## 1. 测试目标

P04-S04：受控 Main pending-request 权限边界（无真实 Electron 窗口，`:1`）——普通（非评审私有）会话的待处理快照过滤与审批路由拒绝内部请求 ID（`filterOrdinaryPendingRequests`/`assertOrdinaryPendingRequestId`，`apps/electron/src/main/lib/review/review-ordinary-ipc-pending.p04.test.ts:17`）。

## 2. 用例清单

1 describe / 2 test。夹具：`createReviewOwnedAgentSession`（评审私有）与 `createAgentSession('ordinary','mock')`（普通）；临时 `PROFER_CONFIG_DIR`（`:13-15`）。

| # | 名称 | 动作 | 断言要点 | 行 |
| --- | --- | --- | --- | --- |
| 1 | 普通快照过滤活跃内部 Owner 与已删 Owner 墓碑 | 构造 `private`/`public` 两条 pending → `filterOrdinaryPendingRequests` → `deleteAgentSession(owner)` 后再过滤 | 两次都只返回 `['public']`（活跃私有被滤；删除后仍被滤） | `:18-28` |
| 2 | 审批路由在响应/改权限前拒绝内部请求 ID | `assertOrdinaryPendingRequestId('internal')`/`('normal')`/`('not-found')` → 删 owner 后再试 internal | internal 抛「内部审核会话」（删除前后都拒）；normal/not-found 不抛 | `:30-40` |

## 3. 真实断言

- `expect(filterOrdinaryPendingRequests(entries).map(item => item.requestId)).toEqual(['public'])`（`:25`、`:27`）。
- `expect(() => assertOrdinaryPendingRequestId('internal', entries)).toThrow('内部审核会话')`（`:35`、`:39`）。
- `expect(() => assertOrdinaryPendingRequestId('not-found', entries)).not.toThrow()`（`:37`）。

## 4. 未覆盖与脆弱点

- 未覆盖：`assertOrdinaryPendingRequestId` 对 `entries` 为空的行为、并发删除。
- 脆弱点：`not-found` 不抛的语义（放行未知 ID 由后续处理）依赖调用方二次判定。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 过滤与拒绝语义（含删除后仍拒） | 已证实 | `:25-39` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测函数 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| `filterOrdinaryPendingRequests` | 1 | `:18-28` | covered |
| `assertOrdinaryPendingRequestId` | 2 | `:30-40` | covered |
