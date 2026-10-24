---
path: apps/electron/src/renderer/components/content-review/review-workspace-write-fence.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b64ab9c311110eea8b0a5067ad86978b2d964acd
sha256: 6fc8e9bd6e4411315592453c11fd1f063793f133edc5399c303a11683d4d82b8
lines: 34
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-workspace-write-fence.ts

## 1. 结论与边界

**写围栏（P06-FIX-02）**（`apps/electron/src/renderer/components/content-review/review-workspace-write-fence.ts:1-7`）：每 `(Jotai store, caseId)` 一个写代次，Controller 与 Workspace Hook **共享**。渲染是 Main-owned 最终一致投影；**旧 IPC 请求返回不得覆盖更新的本地投影**。**门是 VIEW-ONLY——永不用来取消/批准/授权 Pi 运行**（`:6`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `beginWorkspaceCaseWrite` | 函数 | `:23-28` | `(store, caseId) => () => boolean`；**发送前调用**（`:22`） |
| `invalidateWorkspaceCaseWrites` | 函数 | `:31-34` | 代次 +1；**页面离开只使待定请求失效，不动 Main 后台运行**（`:30`） |

内部：`generations` WeakMap（`:11`）、`forStore`（`:13-20`）。

## 3. 内部逻辑与关键流程

- `beginWorkspaceCaseWrite`（`:23-28`）：代次 +1 并返回校验闭包（`byCase.get(caseId) === generation`——请求返回时旧代次返 false）。
- `invalidateWorkspaceCaseWrites`（`:31-34`）：代次 +1（使全部待定失效）。

## 4. 调用者与调用链

- 消费方：`review-actions-controller` + `use-review-workspace-actions`（共享围栏）。
- 出向：Jotai store（WeakMap 键）。

## 5. 数据 I/O、读写与副作用

纯内存代次计数（WeakMap）；无 I/O。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 旧代次返回 | `:27` | 校验闭包返 false（不写） |
| 页面离开 | `:31-34` | 待定失效（Main 运行不受影响） |

## 7. 权限与权威状态

**VIEW-ONLY**（`:6`）——不触碰 Pi 运行生命周期；Main-owned 投影权威（`:3-4`）。

## 8. 修改影响面

- 代次语义（每 store+caseId）是 P06-FIX-02 修复核心。
- 跨控制器/双 Hook 共享（test 真实 store 复现）。

## 9. 测试证据

`review-workspace-write-fence.p06-fix02.test.ts`（195 行）直接覆盖。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 个导出、代次围栏 | 已证实 | `:11-34` |
| VIEW-ONLY 红线 | 已证实 | `:6` |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 2 个导出 | `:23-34` | covered |
