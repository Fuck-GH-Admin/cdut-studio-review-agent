---
path: apps/electron/src/main/lib/cdut/yanhu/yanhu-context-pruning.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: dcc2004fa47d09ccbd74cca4f886a86d7adbda1a
sha256: 445cdc781a9f8a2726b2f5203107234f62b231f10a4318fc2f54fc222bdab9ed
lines: 182
kind: test
package: p03-integrations
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/yanhu/yanhu-context-pruning.test.ts

## 1. 测试目标

多步上下文剪枝单测（文件头 `:1-7`）：步骤不足原样返回、超限仅压缩旧步骤、旧 read_page 巨型结果换占位、最近观测（read_page/capture_visual）逐字保留、通用截断、toolCallId/isError 完整、keepSteps 可配；及历史瘦身（PageDigest 摘要/错误回执不套模板/更大错误上限）。被测：`pruneYanhuContinuationMessages`/`slimYanhuToolResultForHistory`/三常量。夹具：`buildStep`（`:20-35`，assistant+tool 对）。本轮 `NOT_RUN`。

## 2. 用例清单

2 describe、**15 test**：

### 2.1 剪枝（8，`:37-138`）
| # | test 行 | 断言要点 |
| --- | --- | --- |
| 1 | `:38-43` | 步骤≤keepSteps：4 条消息原样、content `'A'` |
| 2 | `:45-67` | 4 步：步1 read_page→“较早的页面观察记录已压缩”（toolCallId `call-1` 保留）、步2→`[前序日志已压缩]`、步3/4 原样 |
| 3 | `:69-81` | 全场唯一 read_page 台账（远离窗口）**逐字保留**（`toBe(ledger)`——杜绝失去 [BID] 台账） |
| 4 | `:83-93` | capture_visual 标定表同样逐字保留 |
| 5 | `:95-105` | 通用 200 字符 → 80 X + `…` |
| 6 | `:107-117` | 压缩后 `isError` 仍 true |
| 7 | `:119-133` | `keepSteps:1`：步1 压缩、**最新台账（步2）超窗仍逐字**、步3 原样 |
| 8 | `:135-137` | `PRUNE_KEEP_STEPS===2` |

### 2.2 历史瘦身（7，`:140-182`）
| # | test 行 | 断言要点 |
| --- | --- | --- |
| 9 | `:141-144` | 巨型 PageDigest（800 行 BID）→ `[已读取页面: 砚湖易办]` |
| 10 | `:146-149` | “页面无变化” → `[已读取页面: 无变化]` |
| 11 | `:151-153` | 无标题 → `[已读取页面]` |
| 12 | `:155-158` | 网络/控制台日志 → 两句折叠摘要 |
| 13 | `:160-167` | **错误回执（熔断提示）原样返回**（不套成功模板）；成功态仍走模板 |
| 14 | `:169-174` | 错误截断于 `HISTORY_ERROR_MAX_CHARS+1`（600+省略号）、保留诊断前缀“选择失败：” |
| 15 | `:176-181` | 通用 250 → 200+`…`；短结果原样 |

## 3. 真实断言

- #3/#4/#7 是“观测台账不变式”的实证（`toBe` 原文）。
- #13 用真实熔断文案断言错误原样保留（历史事故回归）。
- #14 精确长度断言（600+1）。
- #2 断言 toolCallId 保留（`call-1`）。

## 4. 未覆盖与脆弱点

**未覆盖**：`PRUNED_ERROR_CHARS=60` 剪枝内错误前缀分支；`PRUNED_GENERIC` 空内容回退；`extractPageDigestTitle` trim 边界；多 toolCalls 同消息。

**脆弱点**：`buildStep` 单 call/步；`as {results:…}` 断言转型。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 describe、15 test、纯内存 | 已证实 | `:37/:140`；`grep -c test(`=15 |
| 旧压新留/观测不变式 | 已证实 | `:45-93`、`:119-133` |
| toolCallId/isError 完整 | 已证实 | `:58/:107-117` |
| 错误回执保守保留 | 已证实 | `:160-174` |
| 60 字符前缀/空回退 | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 不足原样/旧压新留 | #1/#2 | `:38-67` | covered |
| 观测保留 | #3/#4/#7 | `:69-93`、`:119-133` | covered |
| 截断/isError/keepSteps | #5/#6/#8 | `:95-137` | covered |
| slim 全族 | #9-#15 | `:141-181` | covered |
