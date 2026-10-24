---
path: apps/electron/src/main/lib/agent-catalog-invalidation.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d63cec8d376de0464c87433df0a836b96a61c4da
sha256: 704339d380fd5cf65ebf8afd9df6e4dc920451c2ab1496297f3533b973784a52
lines: 64
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-catalog-invalidation.test.ts

## 1. 测试目标

验证 `apps/electron/src/main/lib/agent-catalog-invalidation.ts` 的 `AgentCatalogInvalidationPublisher`：revision 按 catalog/scope 独立单调递增、通知不含目录正文/敏感配置、空 workspaceSlug 使用保留 scope key `catalog:*`。不运行测试（`NOT_RUN`）。

## 2. 用例清单

用例数 3（`test(` 计数：:6/:30/:49），1 个 describe（:5）。每个用例自建真实 `AgentEventBus`（非 mock）。逐条：

| # | 用例（行） | 设置 | 动作 | 断言 |
| --- | --- | --- | --- | --- |
| 1 | revision 单调递增、scope 独立（:6） | 真实 bus + publisher + `bus.on` 记录 seen | `invalidate('presets','demo')` ×2、`invalidate('presets','other')` | `first/second/other.revision` 为 1/2/1（:20-22）；`seen` toEqual 三条含 sessionId 路由键（:23-27） |
| 2 | 通知不含正文/敏感配置（:30） | bus + publisher + 记录 raw JSON | `invalidate('workspace_capabilities','workspace-a')` | raw 与 5 字段 JSON 全等（changedAt 自引用 :36-42）；`not.toContain('mcpServers')`、`('skillContent')`（:43-44） |
| 3 | 空 workspaceSlug → `catalog:*`（:49） | bus + publisher + 记录 scopeKeys | `invalidate('channels')` ×2 | `toMatchObject({catalog:'channels', workspaceSlug:null, revision:1})`、`second.revision===2`、scopeKeys toEqual `['catalog:channels:*','catalog:channels:*']`（:60-62） |

依赖顺序：独立（每用例新实例）。

## 3. 真实断言

- `:20-22`：`expect(first.revision).toBe(1)`、`expect(second.revision).toBe(2)`、`expect(other.revision).toBe(1)`。
- `:23-27`：`expect(seen).toEqual([...])` 三条精确对象（含 `sessionId: 'catalog:presets:demo'/'catalog:presets:other'`）。
- `:36-42`：`expect(raw).toBe(JSON.stringify({...5 字段, changedAt: JSON.parse(raw).changedAt}))`（changedAt 以自身回填）。
- `:43-44`：`expect(raw).not.toContain('mcpServers')`、`expect(raw).not.toContain('skillContent')`。
- `:60-62`：`expect(first).toMatchObject({ catalog: 'channels', workspaceSlug: null, revision: 1 })`、`expect(second.revision).toBe(2)`、`expect(scopeKeys).toEqual([...])`。

## 4. 未覆盖与脆弱点

- 未覆盖：`workspaces` catalog 值、`changedAt` 单调性、多 publisher 实例并发、事件总线中间件交互、进程重启 revision 归零。
- 脆弱点：用例 2 用 `JSON.parse(raw).changedAt` 自引用比较，只锁字段集与时序（changedAt 是同一次 Date.now 结果），不锁时间语义；用例 1 依赖 `bus.on` 同步分发顺序（AgentEventBus 同步语义变更会使 seen 顺序断言假红）。
- mock/真实边界：真实 `AgentEventBus`（本批 `agent-event-bus.ts`）+ 真实 publisher，无 mock/无文件系统。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例计数与 `test(` 一致 | 已证实 | :6/:30/:49 |
| 断言行如 §3 | 已证实 | 逐行读 :16-62 |
| revision 语义/路由键/无正文均被断言 | 已证实 | :20-27/:36-44/:60-62 |
| 测试通过与否 | 未知（NOT_RUN） | 本轮未执行 |

## 6. 覆盖表

| 被测分支 | 用例 | 状态 |
| --- | --- | --- |
| revision 单调/独立 | #1 | covered |
| payload 形状/无正文 | #2 | covered |
| `*` scope key | #3 | covered |
| `workspaces` catalog/重启语义 | — | unknown |
