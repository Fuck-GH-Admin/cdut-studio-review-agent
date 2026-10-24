---
path: apps/electron/src/main/lib/channel-preset-model-updates.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 662a4acd0ff9d7b31a2a45d86b9421260a012f1b
sha256: 304991e63afedfacd4038d95a462cc5220687890504dd176be3eb9d2e67cbe54
lines: 71
kind: test
package: p02-agent-runtime
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/channel-preset-model-updates.test.ts

## 1. 测试目标

直接测试 channel-manager 的 2 个导出：`getUserManagedChannelsForLogout`（登出备份的渠道归属判定）与 `applyPresetModelCandidateUpdates`（GLM-5.3 预设模型一次性迁移）。4 个 `test(`，2 个 describe（`:20` ownership、`:32` migration）。

## 2. 用例清单

夹具 `createChannel()`（`:5-18`，zhipu 渠道 + glm-5.2 模型）。无 mock/无 IO（纯函数）。

| # | 行 | 设置 | 真实断言 |
| --- | --- | --- | --- |
| 1 | `:21-29` | 三渠道：自配/local、serverManaged:true/newapi-gpt、newapi-legacy | `:28` `getUserManagedChannelsForLogout(...).map(id)` `toEqual(['local-channel'])`（serverManaged 与 newapi- 前缀都算官方代管） |
| 2 | `:33-44` | zhipu 渠道 | `:38` `changed` `toBe(true)`；`:39` models `toEqual` 两条（glm-5.2 保留 enabled:true + glm-5.3 新增 enabled:false）；`:43` `appliedPresetModelUpdates` `toContain('glm-5.3-candidates-v1')` |
| 3 | `:46-58` | 已应用过 UPDATE_ID（模拟用户删过候选） | `:55` `changed` `toBe(false)`；`:56` `result.config` `toBe(config)`（同引用）；`:57` models `toHaveLength(1)`（幂等、不恢复被删候选） |
| 4 | `:60-70` | anthropic 无关渠道 | `:68` models 原样 `toEqual`；`:69` UPDATE_ID 仍记录（**不断言 changed**——实现返回 true，见 §4） |

## 3. 真实断言

`toEqual`/`toBe`（含引用相等）/`toContain`/`toHaveLength`。无快照测试。

## 4. 未覆盖

- 用例 4 的 `changed` 行为（实现把"未记录过 UPDATE_ID"计为 changed:true，测试刻意不断言——照实记录）。
- `zhipu-coding`/`zhipu-coding-team`/`doubao`/`opencode-go-openai`/`ark-coding-plan` 各 provider 键的候选注入。
- `getChannelsLogoutBackupPath`/`backupChannelsForAccount`/`restoreChannelsForAccount`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 个 `test(`、断言如 §2 | 已证实 | 文件全读（71 行） |
| 幂等语义（用例 3）锁定 | 已证实 | `:46-58` |
| 实际执行结果 | 未知 | `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 登出归属判定 | §2 用例 1 | `:21-29` | covered |
| 追加禁用候选 | §2 用例 2 | `:33-44` | covered |
| 幂等 | §2 用例 3 | `:46-58` | covered |
| 无关渠道保留 | §2 用例 4 | `:60-70` | covered |
| §4 边缘 | — | — | unknown（未覆盖） |
