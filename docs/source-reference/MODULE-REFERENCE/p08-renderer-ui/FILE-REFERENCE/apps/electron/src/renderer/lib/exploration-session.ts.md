---
path: apps/electron/src/renderer/lib/exploration-session.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2b8f6348b68436e075dfdfc7a1c86935cf2d3307
sha256: 2b4a6b179601ab8c1a36d59c7794d6a2b17b12cd3f6a2365c27d353b1fe50543
lines: 108
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/exploration-session.ts

## 1. 结论与边界

**探索分支会话工具**（108 行）：fork/explore 动作可用性、探索锚点选择、消息合并、结论提取、带回引用草稿构造。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `ExplorationReferenceDraft` | `:3-6` | `{markdown, html}` |
| `resolveForkActionAvailability` | `:15-23` | fork（所有 runtime）vs explore（仅 Pi）语义不同不能合并（`:11-13`）；**分支不提供二级分叉**（`:20-21`） |
| `resolveLatestExplorationSourceMessageId` | `:29-40` | 时间线倒序找最近绑定的主线 assistant；缓存不全回退 metadata 最后 binding（`:27`） |
| `mergeExplorationMessages` | `:42-63` | uuid 去重合并（**后来版本胜出**——更新帧语义 `:57`） |
| `getLatestExplorationConclusion` | `:79-97` | 锚点后最新有正文 assistant 文本（fork 前历史不误当结论 `:77`；sidechain 排除 `:85`） |
| `buildExplorationReferenceDraft` | `:100-108` | 受控 session mention 草稿（**不复制探索正文进主会话** `:99`；escapeHtml 转义） |

内部：`escapeHtml:65-73`。

## 3. 内部逻辑与关键流程

五函数纯逻辑：可用性闸→锚点选择（倒序+binding 交集）→合并（uuid 索引覆盖）→结论提取（倒序+文本块拼接）→mention 草稿（双格式）。

## 4. 调用者与调用链

回复操作栏 fork/explore 动作；被 `exploration-session.test.ts`（12 个 `test(`）覆盖（含与 agent-message-queue 联动断言）。出向 `@profer/shared`（类型）。

## 5. 数据 I/O、读写与副作用

纯函数（消息数组/binding 记录）。

## 6. 分支、失败、取消与恢复

锚点缺失/无新增→''；uuid 缺失消息保序插入；binding 空→undefined。

## 7. 权限与权威状态

- **"受控 mention 不复制正文"**（`:99`）：探索结论不自动进主会话。
- fork/explore 语义边界（`:11-13`）：fork=独立顶层会话（救援/换模型），explore=Pi `/tree` 血缘分支。

## 8. 修改影响面

改锚点/合并语义影响探索分支内容正确性；测试 12 用例锁定。

## 9. 测试证据

`exploration-session.test.ts`（同批，12 个 `test(`）：可用性 4、锚点 2、合并/结论 4、mention 草稿 2（含 parseQueuedMessageMentions 联动）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（照实记录）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件五函数/语义边界 | 已证实 | 108 行全读 |
| 行为锁定 | 已证实 | 测试 12 用例 |
| **照实**：测试 `:16-19` 与 `:21-24` 为**重复用例**（同名同体，疑似复制残留） | 已证实 | 测试文件 `:16`/`:21` |
| 实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；测试 §9（重复用例照实）。
