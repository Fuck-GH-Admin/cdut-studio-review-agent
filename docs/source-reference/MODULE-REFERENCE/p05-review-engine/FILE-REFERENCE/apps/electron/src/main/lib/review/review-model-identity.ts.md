---
path: apps/electron/src/main/lib/review/review-model-identity.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7118245c27fc57373badb51d0f624cfbd9d0da27
sha256: 2d60acbd4ea4014aa7c59c433fb02dc31df59600b1221420af0b6726cdfb3e34
lines: 38
kind: source
package: p05-review-engine
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-model-identity.ts

## 1. 结论与边界

审核模型请求身份的**纯逻辑**（不依赖 Electron/渠道存储/设置单例，`apps/electron/src/main/lib/review/review-model-identity.ts:1-6`）：让网关真实请求、T01 回执、状态展示共用同一 `modelId` 解析与退避等待口径，避免「请求 B、回执写 A」身份错配（MHI-01/02）与退避吞掉总超时（MHI-10）。

## 2. 导出与关键符号

`export` 共 **2 个**。

| 符号 | 类型 | 行 | 签名 | 说明 |
| --- | --- | --- | --- | --- |
| `pickChannelModelId` | 导出函数 | `:9-19` | `(channel, selection) => string \| undefined` | 解析本次请求的 modelId |
| `waitForRetry` | 导出函数 | `:22-38` | `(backoffMs, signal: AbortSignal) => Promise<void>` | 可中断退避等待 |

## 3. 内部逻辑与关键流程

### 3.1 `pickChannelModelId`（`:9-19`）

1. 显式选择优先（`:13-16`）：`selection.channelId === channel.id` 且 `channel.models` 含 `selection.modelId` 且 `enabled !== false` → 返回 `selection.modelId`。
2. 否则取**第一个启用模型**（`:17`）；无启用模型则回落 `channel.models[0].id`（`:18`）——注意：这会取到禁用的首个模型（`??` 兜底），无模型则 `undefined`。

### 3.2 `waitForRetry`（`:22-38`）

`Promise` 包装 `setTimeout(backoffMs)`；`signal.aborted` 已置位则立即 reject「模型请求已取消」（`:24-27`）；等待期间 `abort` → `clearTimeout` + reject 同文案（`:28-31`）；`{once:true}` 监听（`:36`）；超时 resolve 并移除监听（`:32-35`）。**取消或超时都不会等满 `backoffMs`**（`:21` 注释，MHI-10）。

## 4. 调用者与调用链

- 目的（`:3-5`）供网关真实请求、T01 回执、状态展示三处共用；具体消费方在审核网关（`review-model-gateway`）与 T01 链路（`review-v3-t01-*`）。
- `review-model-identity.run.test.ts`（35 行，`run` 类型测试）直接覆盖（见第 9 节）。
- 出向：`AbortSignal`/`setTimeout`（语言级）。

## 5. 数据 I/O、读写与副作用

纯逻辑 + 定时器；无持久化/网络。`waitForRetry` 有 `setTimeout` 副作用（自清理）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 显式选择命中启用模型 | `:13-16` | 返回所选 |
| 无显式选择/未启用 | `:17-18` | 首个启用→首模型→`undefined` |
| `signal` 已 aborted | `:24-27` | 立即 reject |
| 等待中 abort | `:28-31` | 清定时器 + reject |
| 正常到时 | `:32-35` | resolve |

## 7. 权限与权威状态

无身份语义；`pickChannelModelId` 的结果就是「本次请求实际提交的 modelId」，用于回执/展示对齐（MHI-01/02）。

## 8. 修改影响面

- 三处共用口径（请求/回执/展示）；改解析顺序会造成身份错配回归。
- `waitForRetry` 的立即拒绝语义是 MHI-10 的修复点；改回「等满 backoff」会吞总超时。

## 9. 测试证据

- `review-model-identity.run.test.ts`（35 行）直接测试本模块（类型 `run`，需运行标记；断言内容未在本批逐行读——见第 10 节未知）。
- **NOT_RUN**：未运行测试/构建/GUI。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 个导出 | 已证实 | `:9`、`:22` |
| 显式选择优先/首启用/首模型回落 | 已证实 | `:13-18` |
| abort 立即结束不等满 backoff | 已证实 | `:24-35` |
| 消费方三处共用 | 已证实（注释意图） | `:3-5`；具体调用点未逐一列 |
| run 测试断言细节 | 未知 | 该测试 35 行未逐行读 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `pickChannelModelId` | 3.1 | `:9-19` | covered |
| `waitForRetry` | 3.2 | `:22-38` | covered |
| 失败/取消分支 | 6 | — | covered |
| 测试证据 | 9 | — | covered（间接） |
