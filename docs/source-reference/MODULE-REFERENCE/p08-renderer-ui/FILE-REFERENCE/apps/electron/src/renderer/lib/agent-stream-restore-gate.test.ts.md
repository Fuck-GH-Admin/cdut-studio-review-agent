---
path: apps/electron/src/renderer/lib/agent-stream-restore-gate.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b5c41a797addccdb1b2694e0e995bf681b16e341
sha256: 4ab70c417fe19777ca5167f2459a4c31465fd55a273f8a4c9602015f1a0e2b40
lines: 77
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/agent-stream-restore-gate.test.ts

## 1. 测试目标

验证 `AgentStreamRestoreGate`（`agent-stream-restore-gate.ts`，同批收录）在刷新恢复窗口内的终态时序控制：无流式状态时暂存、有状态时立即派发、settle 后按序放行且不再暂存、重复 settle 幂等、run 归属由调用方竞态保护裁决。测试框架 `bun:test`（`agent-stream-restore-gate.test.ts:1`）。

## 2. 用例清单

grep `test(` 机械计数=5、`describe(`=1、`it(`=0：`:11` 暂存不派发；`:20` 已回放状态立即派发；`:33` settle 按原顺序派发且之后不再暂存；`:54` 重复 settle 不重复执行；`:64` settle 时机与 run 归属交由调用方裁决。计数与标签一致（describe 'AgentStreamRestoreGate' 下 5 个 test）。

## 3. 真实断言

- `:15-17`：expect(defer(...)).toBe(true)、expect(dispatched).toEqual([])、expect(gate.pendingCount).toBe(1)。
- `:28-30`：expect(deferred).toBe(false)、expect(dispatched).toEqual(['complete'])、expect(gate.pendingCount).toBe(0)。
- `:42-51`：settle 前 expect([])；settle 后 expect(['complete:s1','error:s2'])（顺序保留）、pendingCount 0；settle 后再投递 expect 追加 'complete:s1:again' 且不堆积。
- `:61`：两次 settle 后 expect(dispatched).toEqual(['complete'])（不重复）。
- `:74-75`：expect(['stale-complete'])、pendingCount 0。

## 4. 未覆盖与脆弱点

未覆盖：`hasStreamState` 抛异常行为（构造器注入函数无错误处理断言）；defer/settle 并发交错的微任务时序（全部同步调用）；`pendingCount` 多会话用例仅在 `:46`/`:51` 断言 settle 后为 0；暂存期间的精确计数未断言。脆弱点：用例 `:64-76` 的「stale-complete」语义依赖注释解释（`:65-66`），断言本身只验证派发一次，不验证 run 归属——归属保护在 `isCurrentAgentStreamCompletion`（域外裁决）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 用例清单与断言文本 | 已证实 | `agent-stream-restore-gate.test.ts:11-76` 逐行 |
| 测试实际通过 | 未知 | `NOT_RUN`（本轮未运行测试，纯静态阅读） |
| 生产调用点时序 | 间接 | `useGlobalAgentListeners.ts:1379-1410,1634,1668`（未运行） |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| defer（暂存分支） | §2/§3 | 11-18 | covered |
| defer（立即派发分支） | §2/§3 | 20-31, 64-76 | covered |
| settle（按序放行/幂等） | §2/§3 | 33-52, 54-62 | covered |
| pendingCount | §3 | 17, 30, 46, 51, 75 | covered |
