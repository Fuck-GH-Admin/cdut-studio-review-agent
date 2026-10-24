---
path: packages/project-core/src/project-core.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0b3f5792a120aee4f9b6698f6dc43d89a85191ba
sha256: 4ae6c6707910a814d0e2334c0473f00e99ad1881443a495387a7151a823687ef
lines: 864
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-47-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/project-core/src/project-core.test.ts

## 1. 测试目标

project-core 聚合面集成测试（经 `../src/index` 引 33 符号，:8-42）：graph-parser 元标记、graph-state 事件重放（含 abandon/deleted）、graph-query 查询/布局/deriveGraph、project-meta 生命周期。不运行（`NOT_RUN`）。

## 2. 用例清单

用例数 70（`test(` 计数），7 个顶层 describe：`graph-parser`（:46，17 用例：parseDependsOn 4/parseArtifact 2/stripMetaTags 2（含 :118）/parseUsage 2/parseForkFrom 3/abandon 4——含大小写不敏感）、`graph-state`（:147，12 用例：空图/重放/created 元数据一致/fork 边替换/updated 合并/重放一致/独立任务/derive 不变/ready/拓扑/序列化往返/JSONL 多行）、`graph-state·task_abandon_annotated`（:353，6 用例：写入+cancelled/completed 保留/幂等/不存在 no-op/序列化/source=agent）、`graph-state·task_deleted`（:417，6 用例：删除清理/不存在 no-op/幂等/重放/与枯枝共存/序列化）、`graph-query`（:488，18 用例：summary/preamble/find/completion/layout 2/deriveGraph 10（forkFrom×2/dependsOn/abandon×2/description 优先/artifact usage/subject 兜底/悬空 fork/持久化 fork）/formatTaskContext 2）、`project-meta`（:688，6 用例：create/updateCounts/progress/生命周期/标签/ID 安全）、`computeForceLayout`（:744，5 用例：空图/单节点/线性链/菱形/分叉边）。

## 3. 真实断言

代表行：`expect(selectHarnessFocus(...)).toMatchObject` 不在本文件；本文件断言形态为 `toEqual`/`toBe`/`toContain`（如 :383 幂等两次结果相同、:428 删除后节点/边/引用清理、:731 ID 拒路径片段、:773 线性链从左到右、:795 菱形布局）。全部为纯函数字面量 fixture 直断言。

## 4. 未覆盖与脆弱点

未覆盖：`deserializeEvent` 坏行分支细节、ForceLayout 参数敏感性、并发/异步（无异步代码）。mock 边界：纯函数+字面量 fixture（无 mock 框架）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 70 用例计数 | 已证实 | grep `test(` |
| 断言要点如 §2-3 | 已证实 | 逐行读分组清单 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 被测模块 | 用例组 | 状态 |
| --- | --- | --- |
| graph-parser | :46-145 | covered |
| graph-state（重放/abandon/deleted） | :147-486 | covered |
| graph-query | :488-687 | covered |
| project-meta | :688-743 | covered |
| computeForceLayout | :744-864 | covered |
