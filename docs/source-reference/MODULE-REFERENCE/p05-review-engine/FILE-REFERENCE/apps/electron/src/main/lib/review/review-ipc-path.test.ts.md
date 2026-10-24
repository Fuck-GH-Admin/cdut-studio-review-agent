---
path: apps/electron/src/main/lib/review/review-ipc-path.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 85412bbc401dbbde04b8f684532deceb62505542
sha256: 10bda1c5dc79d9060f7a828bca75f2dfe550ac426bcdb249bccf6cb5cd8830ff
lines: 45
kind: test
package: p05-review-engine
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-ipc-path.test.ts

## 1. 测试目标

「20 号 QA：真实 renderer V2 IPC 路径穿越拒绝」（`apps/electron/src/main/lib/review/review-ipc-path.test.ts:21`）：经**真实 `registerReviewIpc()` 注册的 handler**（不是直接调服务层）验证 `CREATE_CASE_V2`/读取/批次创建对恶意 caseId/runId 的拒绝，且配置目录外不新增文件。

## 2. 用例清单

1 describe / 1 test。夹具：`globalThis.__proferElectronTestHooks.ipcMainHandlers` 拿注册表（`:11-13`）；`invoke(channel,input)` 直接调 handler（`:15-19`）；`PROFER_CONFIG_DIR` 指向临时目录（`:7-9`）。

| # | 动作 | 断言要点 | 行 |
| --- | --- | --- | --- |
| 1 | `handlers.clear()` + `registerReviewIpc()`；以 `caseId='../../path-poc'` 逐通道调用 | `CREATE_CASE_V2`/`GET_AGGREGATE_V2`/`LIST_RUNS_V2` 抛「非法 caseId」；`GET_RUN_V2` 恶意 runId 抛「非法 runId」、恶意 caseId 抛「非法 caseId」；`CREATE_BATCH_V2` 成员含恶意 ID 抛；`RUN_REVIEW_V2` rejects「非法 caseId」；`path-poc` 目录与 `review-batches/safe-batch` 目录均不存在 | `:22-44` |

## 3. 真实断言

- `expect(() => invoke(REVIEW_IPC_CHANNELS.CREATE_CASE_V2, {...})).toThrow('非法 caseId')`（`:26-30`）。
- `expect(() => invoke(REVIEW_IPC_CHANNELS.GET_RUN_V2, { caseId: 'safe-case', runId: '../../run-poc' })).toThrow('非法 runId')`（`:33-34`）。
- `expect(existsSync(join(dirname(root), 'path-poc'))).toBeFalse()`（`:42`）。

## 4. 未覆盖与脆弱点

- 未覆盖：其余 100+ 通道的路径校验（只抽 6 个代表通道）；`nodeId` 维度。
- 脆弱点：依赖测试钩子 `__proferElectronTestHooks` 暴露 handler 注册表；handler 直调绕过 Electron sender，`assertC0ReviewMainSender` 在无窗口环境的行为不在此验证。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 通道恶意输入拒绝+无幽灵目录 | 已证实 | `:22-44` 只读核对 |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测通道 | 行 | 状态 |
| --- | --- | --- |
| `CREATE_CASE_V2`/`GET_AGGREGATE_V2`/`LIST_RUNS_V2`/`GET_RUN_V2`/`CREATE_BATCH_V2`/`RUN_REVIEW_V2` | `:26-41` | covered |
| 幽灵目录 | `:42-43` | covered |
