---
path: scripts/qa/review-background-p06-contract.mjs
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 43d8fcd2bc1b23328b8d7bb2ba92d95a55fa9250
sha256: ab70f302ded8ea52b33d3106854ee26b68471de83edd39cd99059478810b22b7
lines: 32
kind: source
package: p01-app-shell
author: docs-r07-author-extra-02-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# scripts/qa/review-background-p06-contract.mjs

## 1. 结论与边界

**P06 双轮回放验收的纯函数契约模块**（32 行 ESM）：三个导出分别裁决「本轮 owner 归属」「update/restart 两模式的 owner 迁移合法性」「provider 真实回执见证」。文件头注释（`scripts/qa/review-background-p06-contract.mjs:1`）锁定设计意图：仅用于 P06 本地验收，按实际 run 指派解析 owner，避免把旧记录存在当作复用证明；`providerWitness` 注释（`:25`）锁定「ACK 发生在 provider 调用之前；只接受本轮实际 assistant token/工具回执作为额外运行见证」。边界：无 IO、无副作用（抛错除外），不接触 Electron/CDP/网络；数据形状由调用方（`scripts/qa/review-background-p06.mjs`）从隔离 profile 的 JSON/JSONL 中读出后传入。

## 2. 导出与关键符号

逐条 export 核对（共 3 个导出，与源码 `export function` 计数一致）：
- `roundOwnerId(caseId, runId, owners, assignments)`（导出，`scripts/qa/review-background-p06-contract.mjs:2-10`）：返回本轮唯一有效指派绑定的 owner session id。
- `verifyOwnerTransition(mode, firstId, secondId, beforeIds, afterIds)`（导出，`:12-23`）：校验 update 复用第一轮 owner / restart 绑定唯一新 owner，通过返回 `true`（`:22`）。
- `providerWitness(messages)`（导出，`:25-32`）：返回 `{ assistantReplies, toolCalls }` 统计对象。

内部函数：无（本文件仅 3 个顶层导出函数 + 2 条块注释，`scripts/qa/review-background-p06-contract.mjs:1-32` 全文核对）。

## 3. 内部逻辑与关键流程

按函数分段（真实执行顺序 = 调用方调用顺序，各函数无跨调用状态）：
1. `roundOwnerId`（`scripts/qa/review-background-p06-contract.mjs:3-9`）：`matches = assignments.filter(caseId 匹配 && activeRunId 匹配 && !revokedAt)`（`:3`）→ `matches.length !== 1` 抛「本轮必须有唯一有效审核指派」短路（`:4`）→ `owner = owners.find(s.id === matches[0].sessionId)`（`:5`）→ owner 缺失或 `owner.owner.kind !== 'review-case'` 或跨案（`owner.owner.caseId !== caseId`）抛「本轮指派没有绑定本案审核 owner」短路（`:6-8`）→ 返回 `owner.id`（`:9`）。
2. `verifyOwnerTransition`（`:13-22`）：`before`/`after` 去重 Set（`:13-14`）→ `firstId` 必须在 before、`firstId`/`secondId` 必须在 after，否则抛「审核 owner 记录缺失」（`:15`）→ 计算 `newIds = after 中不在 before 的 id`（`:16`）→ `mode==='update'`：`secondId !== firstId || newIds.length` 非 0 → 抛「update 未实际复用第一轮 owner」（`:17-18`）；`mode==='restart'`：`secondId === firstId || newIds.length !== 1 || newIds[0] !== secondId` → 抛「restart 未实际绑定唯一新 owner」（`:19-20`）；其他 mode → 抛「未知审核模式」（`:21`）→ 返回 `true`。
3. `providerWitness`（`:27-31`）：`replies` 过滤 `type==='assistant'` 且 `message` 存在且 `input_tokens+output_tokens`（`?? 0` 缺省）之和 > 0（`:27-28`）→ 返回 `{ assistantReplies: replies.length, toolCalls: replies.flatMap(content 数组中 type==='tool_use' 的 name) }`（`:29-31`）。短路条件：token 全 0 的 assistant（纯 ACK）不计入回执。

## 4. 调用者与调用链

- 入向（grep 冻结树 `review-background-p06`）：
  - `scripts/qa/review-background-p06.mjs:9` `import { providerWitness, roundOwnerId, verifyOwnerTransition } from './review-background-p06-contract.mjs'`；调用点：`providerWitness`（`scripts/qa/review-background-p06.mjs:141`）、`roundOwnerId`（`:291`、`:314`）、`verifyOwnerTransition`（`:315`）。
  - `apps/electron/src/main/lib/review/review-p06-driver-contract.test.ts:8` 动态 import 契约模块；测试调用点 `apps/electron/src/main/lib/review/review-p06-driver-contract.test.ts:32,34,39,44,48-51,55-57`。
- 出向：无 import/require，依据：`scripts/qa/review-background-p06-contract.mjs:1-32` 无模块加载语句；仅用内建 `Set`/`Array`/`Map`（无）等（`:13-16`）。
- 否定结论检索范围：冻结树全量 grep `review-background-p06`，命中仅 `scripts/qa/review-background-p06.mjs`（自引用）与 `apps/electron/src/main/lib/review/review-p06-driver-contract.test.ts` 两文件。

## 5. 数据 I/O、读写与副作用

无磁盘/网络/JSON 写入点，依据：`scripts/qa/review-background-p06-contract.mjs:1-32` 全文无 `fs`/`fetch`/`process` 引用。纯函数、无状态、幂等（同输入同输出）；唯一副作用是抛 Error（§6）。

## 6. 分支、失败、取消与恢复

抛错分支（均 `throw new Error`，无错误码/exit code）：「本轮必须有唯一有效审核指派」（`:4`）、「本轮指派没有绑定本案审核 owner」（`:7`）、「审核 owner 记录缺失」（`:15`）、「update 未实际复用第一轮 owner」（`:18`）、「restart 未实际绑定唯一新 owner」（`:20`）、「未知审核模式」（`:21`）。失败后无状态残留（纯函数）；调用方 `scripts/qa/review-background-p06.mjs:336-344` 捕获后写 `p06-summary.json` 为 FAIL 并 `process.exitCode=1`。取消/恢复：不适用，依据：无异步与外部资源。

## 7. 权限与权威状态

无权限分支，依据：`scripts/qa/review-background-p06-contract.mjs:1-32` 无 env、凭据、路径读取。权威状态：owner 归属权威是「实际 run 的有效指派」（`!a.revokedAt` 且 `activeRunId` 精确匹配，`:3`）；provider 见证权威是「本轮 assistant token/工具回执」而非 ACK（`:25` 注释、`:27-28` 判据）。

## 8. 修改影响面

- 修改三函数签名/判据 → 影响 `scripts/qa/review-background-p06.mjs` 的双轮断言链（`:141`、`:291`、`:314`、`:315`），进而影响 P06-S02-E01/E02 验收判定（`scripts/qa/review-background-p06.mjs:338-339`）。
- 错误文案变化 → 影响 `apps/electron/src/main/lib/review/review-p06-driver-contract.test.ts:39,44,48-51` 的 `toThrow` 子串断言。
- 具体路径：`scripts/qa/review-background-p06.mjs`、`apps/electron/src/main/lib/review/review-p06-driver-contract.test.ts`。

## 9. 测试证据

`NOT_RUN`（本轮未运行任何脚本/测试，纯静态阅读）。本文件自身无测试文件（`it(`/`test(` 直接计数 0）。间接证据（标「间接」）：`apps/electron/src/main/lib/review/review-p06-driver-contract.test.ts` 6 个用例（grep `test(` 计数 6，`:18,30,37,42,47,54`）覆盖三函数——真实断言如 `:32`/`:34` `expect(contract.verifyOwnerTransition(...)).toBeTrue()`、`:39`/`:44` `toThrow('未实际复用')`/`toThrow('未实际绑定')`、`:48-51` `roundOwnerId` 各失败分支 `toThrow('唯一有效')`/`toThrow('本案审核 owner')`、`:55-57` `providerWitness` 的 `assistantReplies===0` 与 `toEqual({assistantReplies:1, toolCalls:['review_read_documents']})`。测试断言≠运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出函数语义、6 处抛错、返回值 | 已证实 | `scripts/qa/review-background-p06-contract.mjs:1-32` 全文 |
| 入向 2 消费者及调用点 | 已证实 | `scripts/qa/review-background-p06.mjs:9,141,291,314,315`、`review-p06-driver-contract.test.ts:8` |
| 间接测试 6 用例断言存在 | 已证实（间接） | `review-p06-driver-contract.test.ts:18-57` |
| 测试实际通过 | 未知 | NOT_RUN |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `roundOwnerId` 全分支 | §2/§3/§6 | 2-10 | covered |
| `verifyOwnerTransition` 全分支 | §2/§3/§6 | 12-23 | covered |
| `providerWitness` 过滤与统计 | §2/§3 | 25-32 | covered |
| 入向调用链 | §4 | 9/8 | covered |
| 副作用/权限否定结论 | §5/§7 | 1-32 | covered |
| 运行验证 | §10 | - | unknown（NOT_RUN） |
