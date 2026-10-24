---
path: apps/electron/src/renderer/components/content-review/use-review-workspace-actions.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 13141a6930a9cdc1c9d191e96421d88b4bed94bb
sha256: af55a6dcca52c99504fa679880e71c38c3d1a1728517d40f39caf72718e72c9b
lines: 189
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/use-review-workspace-actions.ts

## 1. 结论与边界

**工作台动作 Hook**（`apps/electron/src/renderer/components/content-review/use-review-workspace-actions.ts`，189 行）：经 `beginWorkspaceCaseWrite` 写围栏（与 Controller 共享代次）；`resolveT03CorrectionRefs` 解析更正引用。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `useReviewWorkspaceActions` | hook | `:23-189` | 工作台动作集 |

## 3. 内部逻辑与关键流程

- `beginWorkspaceCaseWrite`（`:3`）围栏化写——旧 IPC 返回不覆盖新投影（P06-FIX-02）。
- `resolveT03CorrectionRefs`（`:5`）：T03 更正引用解析。
- atoms（`reviewWorkspace*ByCaseAtom`，`:6-10`）按案缓存。

## 4. 调用者与调用链

- 消费方：工作台组件。
- 出向：`review-workspace-write-fence`、`review-v3-t03-fact-workflow`、Jotai atoms。

## 5. 数据 I/O、读写与副作用

IPC 写（围栏化）；Jotai 状态。

## 6. 分支、失败、取消与恢复

围栏失效（页面离开 `invalidateWorkspaceCaseWrites`）。

## 7. 权限与权威状态

写围栏 VIEW-ONLY（配套 write-fence 红线）。

## 8. 修改影响面

- 围栏合同；T03 更正引用契约。

## 9. 测试证据

`review-workspace-write-fence.p06-fix02.test.ts`（双 Hook 共享 store 重放）直接覆盖。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 个导出、围栏化写 | 已证实 | `:1-189` |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `useReviewWorkspaceActions` | `:23-189` | covered |
