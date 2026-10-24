---
path: apps/electron/src/renderer/components/content-review/review-workspace-write-fence.p06-fix02.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: da066cffe6c736e57743078ae72d026f9b4d4f2d
sha256: 09f03c7da7ccfa1db1cda7164f8c41d7feb61395ece5570139a7d1860a369977
lines: 195
kind: test
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-workspace-write-fence.p06-fix02.test.ts

## 1. 测试目标

**P06-FIX-02 写围栏回归**（`apps/electron/src/renderer/components/content-review/review-workspace-write-fence.p06-fix02.test.ts:1-5`）：在**真实共享 Jotai store** 上重放已确认失败的跨控制器与竞争 React Workspace Hook 写者。**响应是合成可控 IPC 值，不是 Electron E2E**（`:4`）。

## 2. 用例清单

195 行测试（用例组）。夹具：`deferred`/`witness`（`:19-30`，300×1ms 轮询见证）、`setup`（`:32-62`，合成 aggregate/old failed run/next running run/假 API）、`mountHook`（`:65-76`，同 Jotai 上下文内渲染真 Hook）。

| # | 名称 | 行 |
| --- | --- | --- |
| 1 | 同 store token 被另一写者失效且仅其案卷 | `:77` |
| 2 | 双 Controller：卸载旧读不能恢复失败 run | `:91` |
| 3 | 无替换卸载撤销旧待定显示读 | `:113` |
| 4 | 真 Hook 刷新不能提交迟到取消快照 | `:130` |
| 5 | 真 Hook apply 捕获 token 于变更 IPC 前不覆盖新 run | `:158` |

## 3. 真实断言

（断言组——旧 IPC 返回不覆盖新投影、跨控制器/双 Hook 竞态。）

## 4. 未覆盖与脆弱点

- 未覆盖：真实 Electron（合成 IPC）。
- 脆弱点：`witness` 300ms 上限时序。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| P06-FIX-02 重放用例组 | 已证实 | `:1-195` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 跨控制器/双 Hook 竞态 | 组 | 全文 | covered |
