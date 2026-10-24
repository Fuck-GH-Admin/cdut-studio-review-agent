---
path: apps/electron/src/main/lib/cslab/cslab-ai-review.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9e7cdb35c4e2a296bd8542aa29b10ffe23d1eac5
sha256: 6aacd911fa24938f826abb49f7febe0cd4ab171f98fbc6b55561f96e297d1842
lines: 247
kind: source
package: p03-integrations
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-ai-review.ts

## 1. 结论与边界

CSLab **稿件 AI 评审**（`apps/electron/src/main/lib/cslab/cslab-ai-review.ts`，247 行）：按 persona（审稿人视角）构造 prompt、调模型、宽松解析建议 JSON。`isReviewerPersona` 明确排除 `'human'`（`:63`）——人不是模型 persona。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `isReviewerPersona` | 函数 | `:63-70` | `value is Exclude<CsLabSuggestionPersona,'human'>` |
| `personaTitle` | 函数 | `:72-76` | persona→中文标题 |
| `buildReviewPrompt` | 函数 | `:78-102` | 构造评审 prompt |
| `parseReviewSuggestions` | 函数 | `:131-183` | 宽松解析模型输出→建议数组 |
| `reviewManuscript` | 函数 | `:185-247` | `(input: CsLabReviewRequest) => Promise<CsLabReviewResult>` 主流程（async） |

内部：`stripFences`（`:104-110`，去代码围栏）、`lenientJson`（`:112-129`，容错 JSON 提取）。

## 3. 内部逻辑与关键流程

- `buildReviewPrompt`（`:78-102`）：persona 视角+稿件内容→prompt（各 persona 差异化标题/要求）。
- `parseReviewSuggestions`（`:131-183`）：`stripFences`→`lenientJson`→校验形状（非数组/字段缺失过滤）。
- `reviewManuscript`（`:185-247`）：校验 persona/稿件→`buildReviewPrompt`→模型调用→`parseReviewSuggestions`→结果（失败按结果语义返回，不伪造建议）。

## 4. 调用者与调用链

- 消费方：CSLab 评审入口（IPC/稿件面板）。
- 出向：模型网关（AI 调用）、`CsLabReviewRequest/Result` 类型。

## 5. 数据 I/O、读写与副作用

**模型网络请求**（`reviewManuscript`）；无文件/DB 写。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| persona='human'/非法 | `:63-70` | `isReviewerPersona` false（调用方拒） |
| 模型输出围栏/非纯 JSON | `:104-129` | `stripFences`/`lenientJson` 容错 |
| 输出非数组/形状非法 | `:131-183` | 过滤/空结果 |

## 7. 权限与权威状态

persona 是评审视角标签（非权限）；`'human'` 排除是人机边界（`:63`）。

## 8. 修改影响面

- 宽松解析口径（`lenientJson`）与模型输出格式耦合。
- prompt 构造变更影响评审质量（无测试断言 prompt 全文）。

## 9. 测试证据

本批 7 个 cslab 测试文件不含 ai-review 专属用例（全树检索 `reviewManuscript` 测试命中 0）。**NOT_RUN**（模型调用天然 NOT_RUN）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出、human 排除、宽松解析 | 已证实 | `:63-183` |
| 主流程 | 已证实 | `:185-247` |
| 模型实际输出质量 | 未知 | 未运行 |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 5 个导出 | `:63-247` | covered |
| 宽松解析 | `:104-183` | covered |
| 测试证据 | 9 | covered（无） |
