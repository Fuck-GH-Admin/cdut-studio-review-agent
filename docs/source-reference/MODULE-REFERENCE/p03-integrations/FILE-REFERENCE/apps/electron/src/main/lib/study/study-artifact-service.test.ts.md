---
path: apps/electron/src/main/lib/study/study-artifact-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e47546f3117b32ca0771255cc3c6a301ba14a44c
sha256: 07ee7af45082a8c8c2a68c697f90c856e3692b885d7bab56ba51fa3fd6a8476a
lines: 41
kind: test
package: p03-integrations
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/study/study-artifact-service.test.ts

## 1. 测试目标

`study-artifact-service.ts` 的唯一直接测试，只覆盖 `resolveArtifactMaxTokens` 的输出额度分配：验证思维导图固定 8192、抽认卡按模式递增、5 题不低于 8192、10 题线性增加、20 题及以上封顶 16384。目的是防止工件生成复用图谱的 3000 小额度，导致思考模型把预算耗在思维链后正文为空/被截断（文件头 `:2-5`）。

不覆盖：`generateStudyArtifact`、prompt 构造、`extractJsonObject`、三类 normalize、保存/失败/取消/渠道继承。

## 2. 用例清单

1 个 `describe('resolveArtifactMaxTokens 工件输出额度')`（`:16`），**5 个 `it`**。

夹具 `input(overrides)`：`{sessionId:'test-session', kind:'quiz', ...overrides}`（`:12-14`）；`sessionId` 只用于满足类型，函数不读它。

| # | it 行 | 设置 | 动作 | 真实断言 |
| --- | --- | --- | --- | --- |
| 1 | `:17-19` | `{kind:'mindmap'}` | `resolveArtifactMaxTokens` | `toBe(8_192)` |
| 2 | `:21-25` | `{kind:'flashcard', cardMode:'concise'\|'standard'\|'in_depth'}` | 同上 | 依次 `6_144`、`8_192`、`16_384` |
| 3 | `:27-30` | `{kind:'quiz'}` 与 `{kind:'quiz',questionCount:5}` | 同上 | 均 `8_192` |
| 4 | `:32-34` | `{kind:'quiz',questionCount:10}` | 同上 | `10_096` |
| 5 | `:36-40` | `{kind:'quiz',questionCount:20/50/200}` | 同上 | 均 `16_384` |

## 3. 真实断言

- 全部是 `expect(...).toBe(number)` 的精确相等；没有 mock、spy、磁盘、网络、Electron。
- 用例 2 的 `standard` 显式传入，验证“非 concise/in_depth 一律 8192”；没有测 `cardMode` 缺省。
- 用例 3 同时测缺省和显式 5；两者都走 `4096 + 5*600 = 7096 → max(8192,7096)=8192`。
- 用例 4 的 `10_096 = 4096 + 10*600`，验证线性段。
- 用例 5 的 200 验证 `count` 先被 `Math.min(50, …)` 夹到 50，再走 `>=20 → 16384`；没有单独断言 50 与 200 的中间值。
- 没有断言负数/0/NaN 的 `questionCount`；源实现 `Math.max(1, Math.min(50, input.questionCount ?? 5))`（源 `:309`）。

## 4. 未覆盖与脆弱点

**未覆盖**：

- `questionCount` 为 0/负数/NaN/小数：0/负数会被夹到 1，NaN 会让 `Math.min/max` 得到 NaN，最终 `count>=20` 为 false，`4096+NaN*600=NaN`，`Math.min(16384, Math.max(8192, NaN))` 为 NaN（推断，未测）。
- `kind` 非法/缺省：函数走 quiz 分支（源 `:309-311`），无测试。
- `cardMode` 缺省/非法：走 standard 8192，无测试。
- 19 题（`15496`）与 20 题的边界值；只测 20。
- 真实补全是否接受这些额度、截断率、二次扩容（`cdut-ai-class-manager.ts:643-647`）。
- `generateStudyArtifact` 的任何行为。

**脆弱点**：

- 用例 1/2/5 是硬编码数字，若产品调整额度会集中失败；这是有意的契约测试。
- 测试没有说明这些数字与底层 `MAX_ONE_SHOT_OUTPUT_TOKENS` 的关系；若底层上限低于 16384，`maxOutputTokens` 会被二次夹取（源 `:646`），测试不会发现。
- 用例 5 的 200 只证明“先夹到 50”，不证明 50 与 200 行为一致以外的边界。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 个 describe、5 个 it | 已证实 | `:16`；`grep -c "it("`=5 |
| 只测 `resolveArtifactMaxTokens` | 已证实 | import 仅该函数（`:10`）；无其它调用 |
| 纯函数、无 I/O | 已证实 | import `bun:test`、类型、函数（`:8-10`） |
| 额度值与源实现一致 | 已证实 | 源 `:302-312`；测试 `:18-39` |
| 0/负数/NaN/小数未覆盖 | 已证实 | 测试无这些输入 |
| NaN 会返回 NaN | 推断 | 源 `:309-311` 的 `Math.min/max` 传播；未运行 |
| 真实模型接受额度 | 未知 | 未发请求 |

## 6. 覆盖表

| 源分支 | 测试用例 | 行 | 状态 |
| --- | --- | --- | --- |
| `kind==='mindmap'` | #1 | `:17-19` | covered |
| `kind==='flashcard'` concise | #2 | `:22` | covered |
| flashcard standard/其它 | #2 | `:23` | covered |
| flashcard in_depth | #2 | `:24` | covered |
| quiz 缺省/5 题 | #3 | `:27-30` | covered |
| quiz 10 题线性 | #4 | `:32-34` | covered |
| quiz ≥20 封顶 | #5 | `:36-40` | covered |
| questionCount 非法值 | — | — | unknown（未覆盖） |
| 非法 kind | — | — | unknown（未覆盖） |
| 真实补全/截断 | — | — | unknown（NOT_RUN） |
