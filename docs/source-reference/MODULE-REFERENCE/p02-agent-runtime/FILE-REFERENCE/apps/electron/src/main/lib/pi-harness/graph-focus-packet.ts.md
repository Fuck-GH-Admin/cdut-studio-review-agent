---
path: apps/electron/src/main/lib/pi-harness/graph-focus-packet.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: caaeaa08c346d3cd9a885793643f263e0e76bd79
sha256: dc84fd67ba3d871182111e653ce242e61845542290fb59d3690db5ccd63e225f
lines: 125
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-harness/graph-focus-packet.ts

## 1. 结论与边界

**Graph Focus 包构造**：为单个 Pi 用户级 Turn 构造有界、脱敏的 `<graph_focus>` 提示片段——**瞬时提示追加，绝不替代用户文本或系统提示**（`graph-focus-packet.ts:75-78`）。双硬限（字符+确定性 token 估算）：`GRAPH_FOCUS_MAX_CHARS=1200`/`MAX_TOKENS=300`（`:10-11`）。纯函数，无 I/O。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `GRAPH_FOCUS_MAX_CHARS`/`GRAPH_FOCUS_MAX_TOKENS` | 常量 | `:10,11` | 1200/300 |
| `GraphFocusPacketInput` | 接口 | `:13` | graph/goal?/previousFocusTaskId?/verificationByTask?/lastFactSummary?/resumeSummary?/maxChars?/maxTokens?（入参上限仍被 min 钳制，`:80-81`） |
| `buildGraphFocusPacket` | 函数 | `:79` | `(input): string` |
| `estimateGraphFocusPacketTokens` | 函数 | `:123` | 确定性 token 估算（ASCII 4 字符/字节 + CJK 逐字，`:24-37`） |

内部：`redact`（`:39`，api_key/token/password/secret 授权头与 `sk_/pk_/prelay_` 前缀→`[redacted]`）、`clip`（`:47`，脱敏后按 codepoint 截断加 `…`）、`fitPacket`（`:53`，逐行装入+`truncated: true` 尾标）、`assuranceLabel`（`:71`，缺省 'not_required'）。

## 3. 内部逻辑与关键流程

`buildGraphFocusPacket`（`:79-121`）：goal 行（或 `goal: graphless | mode: shadow`，`:86-90`）→ 无任务时仅 focus 行（`:91-95`）→ active 行（id≤80/subject≤180）→ 验收（explicitCriteria 前 2 条 220 字符，或 artifacts 前 2 个 180，`:98-103`）→ assurance 行（reason≤130，`:104-105`）→ ready 前 2（`:107-111`）→ blocked 前 2 含未满足依赖（`:113-116`）→ last_fact/resume 各 180（`:117-118`）→ `fitPacket` 双限收敛。

## 4. 调用者与调用链

- 入向：`orchestrator-bridge.ts:6`（startPiHarnessRun 组 prompt，`:373-384`）。
- 出向：`@profer/project-core`（selectHarnessFocus/getTaskVerificationContext/getReadyTasks/getHarnessBlockedTasks）、`./types`（域外）。

## 5. 数据 I/O、读写与副作用

无（纯字符串）。

## 6. 分支、失败、取消与恢复

无任务回退/双限截断分支；无抛错。

## 7. 权限与权威状态

脱敏权威=`redact`（密钥正则）；有界权威=双硬限（入参不可放大，`:80-81`）。

## 8. 修改影响面

每次 Turn 的提示注入面；测试 3 断言锁定脱敏/确定性/上限。

## 9. 测试证据

`NOT_RUN`。直接测试 `graph-focus-packet.test.ts`（66 行/**3 个 `test(`**）：单聚焦任务+有界 ready/blocked/验证（`:19-42`，8 断言含 `not.toContain('ready-3')` 上限 2）；确定性+脱敏+双限（`:44-59`，`first===second`/≤1200 chars/≤300 tokens/不含 `sk_super_secret`/含 `[redacted]`）；graphless 回退不读任意图文本（`:61-65`）。无 mock。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 双限/脱敏/各段截断值 | 已证实 | `:1-125` 全文 + 3 测试互证 |
| token 估算与真实 tokenizer 差异 | 推断 | 自述“确定性估算”（`:52`） |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出+4 内部 | §2/§3 | 10-125 | covered |
| 测试 3 用例 | §9 | test 文件 | covered（NOT_RUN） |
