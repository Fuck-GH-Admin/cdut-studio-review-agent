---
path: apps/electron/src/main/lib/review/review-storage-id.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: dafea87a3fdf6f740d2314bd83ddd4911228ec11
sha256: 446cadacc28c5f820400e5fd4c79127dfa7355db206649e7b233db73f61f93b4
lines: 120
kind: test
package: p04-review-case-core
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-storage-id.test.ts

## 1. 测试目标

验证 V2 存储路径安全（「第三轮 QA 阻断修复」，`apps/electron/src/main/lib/review/review-storage-id.test.ts:33`）：`assertSafeReviewStorageId`（`review-storage-id.ts:8-15`）及其在聚合读写、运行/产物、Pi 目录、报告导出、批次创建各入口的**前置拒绝**——非法 ID 不得落盘、不留幽灵目录。

## 2. 用例清单

1 describe / 7 test。夹具：`badIds` 11 个（`../../escaped`、`../outside`、`/tmp/traversal`、`a/b`、`a\b`、`.`、`..`、`bad..id`、`%2e%2e`、空串、`' leading'`、129 字符超长，`:30-31`）；`validCase`/`validRun` 合法样板（`:16-29`）；临时 `PROFER_CONFIG_DIR`（`:11-13`）。

| # | 名称 | 动作 | 断言要点 | 行 |
| --- | --- | --- | --- | --- |
| 1 | 所有路径 ID 统一拒绝 | badIds × 3 kind 调 `assertSafeReviewStorageId` | 抛 `非法 ${kind}`；合法值（`case-1`/`run_2`/`node.auto-check`）不抛 | `:34-43` |
| 2 | CREATE_CASE_V2 服务层先拒 ID 再碰模板/文件 | `createCaseFromTemplate('qa-template',1,…,badId)` | `rejects.toThrow('非法 caseId')`；`escaped` 目录与 `review-cases` 目录**不存在** | `:45-52` |
| 3 | 聚合读写与命令事务在目录生成前校验 | `readAggregate`/`writeAggregate`/`createAggregate`/`submitCommand` 用 badId；`createAggregate('safe-case-1', {...id:'safe-case-other'})` | 全拒；id 不一致拒（「不一致」）；无幽灵目录；`listAggregatesV2()=[]` | `:54-67` |
| 4 | 运行记录与节点产物 ID 前置校验 | `getRunV2/saveRunV2/listRunsV2/saveArtifact/readArtifact/markStaleRunsInterrupted` 用 badId | 分别抛 `非法 caseId/runId/nodeId`；合法读回空值；无幽灵目录 | `:69-89` |
| 5 | Pi 材料目录与报告导出同受约束 | `assertPiReviewDirectory('/tmp',id)`、`exportCaseReport(id)` | 抛 `非法 caseId`；无幽灵目录 | `:91-99` |
| 6 | 批次创建逐项核验成员 caseIds | `createBatchV2({… caseIds:['safe-case-1',badId]})` | 抛 `非法 caseId`；`readBatchStateV2` 空；批次目录不存在 | `:101-109` |
| 7 | 合法 ID 正常完成聚合/运行/产物 | `createAggregate/saveRunV2/getRunV2/listRunsV2/saveArtifact/readArtifact` | 读回一致（`caseV2.id`、run id、artifact `{source:'test'}`） | `:111-119` |

**依赖顺序**：用例 7 依赖自建 `safe-case-1`；其余互不依赖。用例 5 用动态 `import` 拉取 `pi-case-review-service`/`report-export-v2-service`（`:92-93`）。

## 3. 真实断言

- 用例 1：`expect(() => assertSafeReviewStorageId(bad, kind)).toThrow(\`非法 ${kind}\`)`（`:37`）。
- 用例 2：`expect(existsSync(join(dirname(root), 'escaped'))).toBeFalse()`（`:50`）。
- 用例 3：`await expect(createAggregate('safe-case-1', { ...validCase, id: 'safe-case-other' })).rejects.toThrow('不一致')`（`:63`）。
- 用例 6：`expect(existsSync(join(root, 'review-batches', 'safe-batch'))).toBeFalse()`（`:108`）。
- 用例 7：`expect(readArtifact<{ source: string }>(...)).toEqual({ source: 'test' })`（`:118`）。

## 4. 未覆盖与脆弱点

- 未覆盖：合法 ID 的并发写、`nodeId` 在 `saveArtifact` 之外的消费方、`markStaleRunsInterrupted` 的正常路径。
- 脆弱点：`existsSync` 断言依赖 `PROFER_CONFIG_DIR` 隔离（`:11`）；动态 import（`:92-93`）使模块加载失败表现为用例失败而非编译错。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 用例覆盖 6 类入口 + 合法路径 | 已证实 | 只读核对本文件 |
| 「无幽灵目录」断言先于写入 | 已证实 | 用例 2/3/4/5/6 的 `existsSync` 断言 |
| 测试实际通过 | 未知 | NOT_RUN |
| 129 字符超长边界恰在正则上限+1 | 已证实 | `'x'.repeat(129)`（`:31`）vs 正则 `{0,127}`+首字符 |

## 6. 覆盖表

| 被测入口 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| `assertSafeReviewStorageId` 本体 | 1 | `:34-43` | covered |
| `createCaseFromTemplate` | 2 | `:45-52` | covered |
| 聚合/命令事务 | 3 | `:54-67` | covered |
| run/artifact | 4 | `:69-89` | covered |
| Pi 目录/报告导出 | 5 | `:91-99` | covered |
| 批次 | 6 | `:101-109` | covered |
| 合法路径 | 7 | `:111-119` | covered |
