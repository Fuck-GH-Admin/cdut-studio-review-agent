---
path: packages/shared/src/utils/pi-compaction.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: cb675fb05ffbf55847400ea6e5e4c415d1c766cd
sha256: 9be893c6af42a0fd98bfcf1c349fc035578ea0bad82df887e189c3f009f52941
lines: 43
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/pi-compaction.ts

## 1. 结论与边界

Pi **自动压缩阈值**（SWE-Compressor 32k 封顶，`packages/shared/src/utils/pi-compaction.ts:1-9`）：参考论文口径——未受控 ReAct 上下文 O(N²) 膨胀；弃用「窗口占比 80%」（对 128k 窗口约 10 万 token 才触发，危险），改**绝对红线** 28k~32k 触发滚动压缩。

边界：只算阈值/预留量（实际压缩由 Pi SDK 执行）；小窗口（≤32k）退化 25% 预留（`:27-31`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `PI_AUTO_COMPACTION_MAX_TOKENS` | const | 12 | `32_000` | 绝对上限（无论 128k/200k/1M） |
| `PI_AUTO_COMPACTION_TRIGGER_TOKENS` | const | 15 | `28_000` | 触发点 |
| `PI_AUTO_COMPACTION_THRESHOLD_RATIO` | const | 19-22 | `0.8` | **@deprecated** 仅兼容导出 |
| `calculatePiAutoCompactionReserveTokens` | function | 30-38 | `(contextWindow) => number` | Pi `reserveTokens` 换算 |
| `calculatePiAutoCompactionThresholdTokens` | function | 41-43 | `(contextWindow) => number` | `window - reserve` |

## 3. 内部逻辑与关键流程

- `calculatePiAutoCompactionReserveTokens`（`:30-38`）：contextWindow 非有限/≤0 → **抛 `TypeError`**；>32k → `window - 28k`（触发点稳定 28k）；≤32k → `ceil(window×0.25)`。
- `calculatePiAutoCompactionThresholdTokens`（`:41-43`）：`window - reserve`（大窗口即 28k；小窗口即 75%）。
- 契约注释（`:26-28`）：Pi 在 `contextTokens > contextWindow - reserveTokens` 时自动压缩。

## 4. 调用者与调用链

出向：无 import。入向（检索=符号名+模块名，全冻结树）：`calculatePiAutoCompactionReserveTokens` → `apps/electron/src/main/lib/adapters/pi-agent-adapter.ts:72,1116`（**唯一产品调用**，main）；`PI_AUTO_COMPACTION_MAX_TOKENS`/`TRIGGER_TOKENS`/`THRESHOLD_RATIO`/`calculatePiAutoCompactionThresholdTokens` → **零外部引用**（仅 barrel/模块内自用；deprecated 常量亦无消费者）。无测试。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯函数+常量。

## 6. 分支、失败、取消与恢复

抛 `TypeError` 1 处（非法窗口）；无异步。

## 7. 权限与权威状态

本文件不适用（无权限代码）；绝对红线口径（`:8-9`）是成本/成功率权衡的权威声明（论文参考未给出出处——照实记录）。

## 8. 修改影响面

阈值改动直接影响所有 Pi 会话的压缩时机与成本；deprecated 常量改动会破坏兼容消费者。

## 9. 测试证据

无同名测试文件。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 绝对红线 28k/32k+小窗退化 25% | 已证实 | `:12-38` |
| deprecated 保留语义 | 已证实 | `:19-22` |
| TypeError fail-fast | 已证实 | `:31-33` |
| 论文参考出处 | 未知 | 注释未给引用 |
| 生产 caller | 见 UNVERIFIED 补记 | — |
| 测试通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 常量 + 2 函数 | §2 | 12-43 | covered |
| 大/小窗两分支 | §3 | 30-38 | covered |
