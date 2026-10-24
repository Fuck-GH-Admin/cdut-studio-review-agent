---
path: apps/electron/src/main/lib/agent-image-generation-records.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 95134e0b6553a5a933db5086065304bbe283b6fa
sha256: fce65f1017b07c5aefe67190c6f2a553d57c66046703df9689f444166006f07c
lines: 213
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-image-generation-records.ts

## 1. 结论与边界

图片生成记录（JSONL 追加式持久化，`image-generations.jsonl` :9）：**参考路径永不持久化**（:15 注释）；状态机 requesting→saving→succeeded/failed；JSONL 重放按 updatedAt 取最新、同毫秒按追加顺序（:146-147 注释：UUID 不代表先后）。

## 2. 导出与关键符号

导出 12 条（`export` :16/:18/:23/:34/:104/:150/:154/:172/:195/:199/:206/:210）：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `AgentImageGenerationRecord` | `:16` | extends Card；reference 路径不落盘 |
| `AgentImageGenerationRecordContext`/`CreateAgentImageGenerationRecordInput`/`ImageGenerationTransition` | `:18-42` | 上下文/创建入参/转换 |
| `getAgentImageGenerationRecordsPath(agentCwd)` | `:104-106` | `<cwd>/.context/image-generations.jsonl` |
| `toAgentImageGenerationCard` | `:150-152` | 恒等转换 |
| `createImageGenerationRecord(input)` | `:154-166` | 校验+UUID+追加 |
| `transitionImageGenerationRecord(context, id, transition)` | `:172-193` | 状态机转换（见 §3） |
| `listImageGenerationCards` | `:195-197` | 重放→卡片列表 |
| `getLatestSuccessfulGeneration` | `:199-203` | 倒序找最近 succeeded |
| `getImageGenerationRecord` | `:206-208` | 按 id 精确取（注释：调用方须再验 status） |
| `getImageGenerationRecordForRetry` | `:210-213` | 仅返 failed 记录 |

内部：`parseRecord`（:69-97，全字段校验+裁剪：prompt 10000/error 500/id 200，succeeded 必须带 image :87）、`replay`（:119-148，见 §3）、`canTransition`（:168-170）。

## 3. 内部逻辑与关键流程

- `replay`（:119-148）：ENOENT→[]（:130）；逐行 parseRecord+会话过滤（:138）；**防篡改**：image.localPath 必须在 output 根内（双根 lexical+canonical 兼容 Windows 8.3 别名 :121-127/:141，注释 :139-140：篡改路径不得成为渲染层文件读取能力）；损坏行 warn 跳过（:144）。
- `canTransition`（:168-170）：requesting→saving|failed；saving→succeeded|failed；其余无效。
- `transitionImageGenerationRecord`（:172-193）：记录不存在/状态转换无效/succeeded 缺图 均抛（:178-180）；completedAt 终态盖章（:189）。
- `createImageGenerationRecord`（:154-166）：参数无效抛（:157）；立即 `requesting` 落盘（失败调用也诚实成卡，配合 gpt-image-service :97-98 注释）。

## 4. 调用者与调用链

入向（子agent 交叉核）：生产仅 `agent-gpt-image-service.ts:9-16`（create :99/getImageGenerationRecord :90/:156/getLatestSuccessfulGeneration :91/toCard :70/transition :122/:125/:136）；测试 `agent-image-generation-records.test.ts:5-11`、`agent-gpt-image-service.test.ts:15`（动态）。出向：`node:crypto`/`node:fs/promises`/`node:path`、`./gpt-image-service`（normalize :90/:161）、`./agent-image-output-service`（type）。

## 5. 数据 I/O、读写与副作用

JSONL 追加写（appendFile :111）+重放读；mkdir `.context`。无网络。

## 6. 分支、失败、取消与恢复

状态机守卫（:168-180）；损坏行容错（:144）；恢复=重放语义（append-only 全历史）。不适用取消。

## 7. 权限与权威状态

防篡改边界（:139-141）；参考路径不持久化（:15）；JSONL 视为不可信持久化输入。

## 8. 修改影响面

gpt-image-service 生命周期；UI 卡片列表。需同步测试 `agent-image-generation-records.test.ts`（6 用例）。

## 9. 测试证据

`agent-image-generation-records.test.ts`（批内，1 describe/6 用例，NOT_RUN）：同毫秒按追加顺序取最新（:35-44）、生命周期重放 3 行 1 卡（:46-52）、坏行/异会话过滤（:54-60）、referencePaths 不落盘（:62-69）、篡改路径不成卡（:71-80）、终态查询/重试/无效转换拒（:82-90）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 12 条；状态机+防篡改 | 已证实 | :119-213 |
| 参考路径永不持久化 | 已证实 | :15；测试 :62-69 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 12 导出+replay+状态机 | §2/§3 | :69-213 | covered |
| 测试 | §9 | — | covered（NOT_RUN） |
