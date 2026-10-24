---
path: apps/electron/src/main/lib/agent-fabric/fabric-server.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0d24b6fc5dc509e37c013fb7dc9ae02a0b729322
sha256: 03df8492f1d06b38fa4ec0c9eb4496de2c6eed546f1571f7c76d540bdbf64a5e
lines: 297
kind: test
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-fabric/fabric-server.test.ts

## 1. 测试目标

Loopback HTTP/SSE 传输端到端测试（头注释 `apps/electron/src/main/lib/agent-fabric/fabric-server.test.ts:1-6`）：Phase 1 验收——本地客户端提交任务/订阅事件/查结果与产物；断线重连（同 requestId/SSE 游标）不重复执行；**全程假执行器+临时目录，不启动真实 Agent**。

mock 边界：`FakeExecutor`（`:24-58`，autoCompleteMs 延迟完成模拟异步）；临时目录+独立 pairingPath（`:117-121`）；真实 `startFabricServer` 起随机端口（`:147-152`）。`makeEnvelope` 故意填 `actor:'spoofed-attacker'`（`:76`，验防冒充）。

## 2. 用例清单

2 describe、10 it：

- `认证与发现`（`:162`）5：`:163` health 免认证、`:168` 未配对 403 CALLER_NOT_PAIRED、`:175` 错误 token 403、`:180` 撤销后立即拒绝、`:188` 配对客户端发现节点。
- `任务生命周期（Phase 1 验收主路径）`（`:196`）5：`:197` 提交→SSE 进度→结果+产物+actor 伪造被覆盖、`:239` 同 requestId 重发 deduplicated 不重复执行、`:255` SSE after 游标恢复不丢事件、`:270` 取消运行中任务（终态重复取消 409）、`:293` 幽灵任务 404。

## 3. 真实断言

- `:205-236` 201/running、SSE 事件序列（task.created→started→progress→artifact_created→completed，`:216-220`）、**序列单调递增**（`:222-224`）、结果 summary 含 smoke test、exitCode 0、产物 ID。
- `:246-252` 二次 200+deduplicated true+同一 taskId+executor.started 长度 1（**不重复执行**）。
- `:264-267` after=2 重放全为 >2 且终态 task.completed。
- `:281-290` cancelled 状态+executor.cancelled 记录+重复取消 409。

## 4. 未覆盖与脆弱点

未覆盖：artifact content=1 内容端点、错误码全映射表、并发提交、真实 executor。SSE 测试用 `res.text()` 等待终态（依赖服务端终态主动结束流）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 10 用例锚点与断言文本 | 已证实 | `:162-297` |
| 运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| 认证/发现/生命周期/幂等/游标/取消 | §3 | covered |
| artifact 内容端点/错误映射全表 | §4 | partial |
| 实际运行 | §5 | unknown（NOT_RUN） |
