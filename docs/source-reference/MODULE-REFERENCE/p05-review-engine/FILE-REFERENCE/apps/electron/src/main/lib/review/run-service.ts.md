---
path: apps/electron/src/main/lib/review/run-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: cd042263e1ad210df5262f81939d003a1f168f6b
sha256: 056d9a6e2398427d5d7eb3bf97b8ee483899dc4abbadf15d12ad85f0ab08dd46
lines: 172
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/run-service.ts

## 1. 结论与边界

V1 审核运行服务（deterministic 编排层，头注 :1-11）：`startReviewRun` 先落 `running` 初值（崩溃留痕）再执行引擎，成功 `completed`/失败 `failed`；**失败路径绝不向上抛**（引擎异常吞成 failed run 的 error 字段，D6 降级叙事）。纯 Node+FS，不依赖 Electron。

边界：运行记录存 V1 `case-store`（runs/{runId}.json）；引擎在 `mock-review-engine`/`ai-review-service`；V2 编排在 `run-service-v2`。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ReviewEngineChoice` | type | 19 | `'mock-engine'\|'ai'` |
| `startReviewRun` | async fn | 61-129 | 发起一次运行（同步等待） |
| `getRun` | fn | 136-140 | 按 runId 读 |
| `latestRun` | fn | 147-151 | 最近一次（字典序末尾） |
| `isRunInputStale` | fn | 157-159 | 输入指纹比对（M0/H06/H09） |
| `getLatestRunStatus` | fn | 165-172 | 最近运行+过期标记（M0/H09） |

内部：`emptyCoverage`（:22-29）、`newRunId`（:32-35，`run-{毫秒}-{36 进制 6 位}` 字典序==时间序）、`inputVersionOf`（:42-44，= `computeCaseInputHash`）。

## 3. 内部逻辑与关键流程

`startReviewRun(caseId, engine='mock-engine')`（:61-129）：
1. `assertSafeId` + `getCase`，不存在 throw `案卷不存在: …`（调用方 bug，:65-69）。
2. 落 `running` 初值（空 findings/空 coverage/inputHash=指纹，:75-86）。
3. 引擎前置检查（try 内，:91-94）：无 rulePacks → `案卷没有审核依据…`；无 application 文档 → `案卷没有待审文件…`；无 items → `尚未识别可审核条目…`；`mock-engine` 且非 demo → `无可用模型出口，真实案卷不能使用演示模拟审核`。
4. 执行：`ai` → `runAiReview`（内部网关不可用降级 mock），否则 `runMockReview`（:95-98）。
5. 异常 → 就地吞掉，落 `failed` run（error=中文 message、空 findings/coverage），`console.warn`，返回 failedRun（:99-112）。
6. 成功 → `completed` run：mock 路径补 `computeUnprocessedMaterials` 覆盖账（AI 路径 outcome 自带，:114-123），`console.log`（:125-127）。

`getRun`/`latestRun`（:136-151）：经 `listRuns`（文件名字典序），`latestRun` 取末元素。
`isRunInputStale`（:157-159）：`run.inputHash !== computeCaseInputHash(currentCase)`；缺 inputHash 旧格式一律过期（注释 :154-156）。
`getLatestRunStatus`（:165-172）：无运行 → `{run:null, inputStale:false}`；案卷读不到 → `inputStale:true`（:170）。

## 4. 调用者与调用链

入向（生产）：`review-ipc.ts:55`（import），调用点 `:1457`（`RUN_REVIEW` → `startReviewRun`）、`:556-557`（`GET_LATEST_RUN_STATUS` → `getLatestRunStatus`）、`:1530-1531`（`startReviewRunLookup` 复用查询）。测试：`review-multi-rule.test.ts:15`（5 次调用，:114-144）。出向：`./case-store`（:14）、`./mock-review-engine runMockReview`（:15）、`./ai-review-service` `runAiReview/computeUnprocessedMaterials`（:16）。

## 5. 数据 I/O、读写与副作用

- 写：V1 `runs/{runId}.json`（经 `saveRun`，case-store 篇）；读案卷。
- 副作用：`console.warn`/`console.log`（:110/:125）；无网络直接调用（在 ai-review-service 内部）。

## 6. 分支、失败、取消与恢复

- 案卷不存在 throw（:68）；`assertSafeId` 失败 throw（case-store 行为）。
- 引擎异常全吞（:99-112）：failed run 保留 running 初值字段 + error 文案——`running` 初值保证崩溃也有痕迹（注释 :51）。
- 无取消/重试；同步等待（demo 规模毫秒级，注释 :47）。
- 过期语义：缺 inputHash 一律 stale（fail-closed）。

## 7. 权限与权威状态

- 引擎权威边界：真实案卷禁用 mock 演示引擎（:94）；`ai` 网关不可用时内部降级 mock（注释 :18/:52-53，降级发生在 ai-review-service 内）。
- 输入指纹权威：`computeCaseInputHash`（M0/H06）；`isRunInputStale` 供 selectCase 恢复/RightPanel 过期标记/导出守门共用（注释 :162-164）。
- 无 sender/role 检查（IPC 层负责）。

## 8. 修改影响面

- `startReviewRun` 影响 `RUN_REVIEW` 通道与 `review-multi-rule.test.ts`；`getLatestRunStatus` 影响右侧面板/导出守门。
- `newRunId` 格式被 `case-store.readLastRunStatus` 的字典序假设依赖（case-store 篇 §3.4）。
- 同步测试：`review-multi-rule.test.ts`（间接）。

## 9. 测试证据

间接测试：`review-multi-rule.test.ts`（5 用例经 `startReviewRun`：正常发现、失败落 failed run「无模型先产生真实失败记录」:141、demo 路径 findings[0] :144）。**无专属测试文件**（全树检索 `run-service` 无 `run-service.test.ts`）。
未覆盖：`getRun/latestRun/isRunInputStale/getLatestRunStatus`、前置检查四分支、`ai` 降级路径均无直接用例。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 导出/内部符号行号如 §2 | 已证实 | 逐条 |
| 失败绝不向上抛、先落 running | 已证实 | :74-112 |
| mock 禁用于真实案卷 | 已证实 | :94 |
| 缺 inputHash 一律过期 | 已证实 | :154-159 |
| 调用者 review-ipc:1457/:556 | 已证实 | grep |
| `ai` 降级 mock 的内部行为 | 推断 | 注释 :18/:52（实现在 ai-review-service，未逐行核） |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `startReviewRun` 全流程 | §3 | 61-129 | covered |
| 前置检查四分支 | §3.3 | 91-94 | partial（未测） |
| `getRun`/`latestRun` | §3 | 136-151 | covered（未测） |
| `isRunInputStale`/`getLatestRunStatus` | §3 | 157-172 | covered（未测） |
