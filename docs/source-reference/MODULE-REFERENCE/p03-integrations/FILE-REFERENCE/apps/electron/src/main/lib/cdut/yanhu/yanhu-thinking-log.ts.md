---
path: apps/electron/src/main/lib/cdut/yanhu/yanhu-thinking-log.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c682b160e5abd29502fb18f92260c5f5867e5f1d
sha256: 47e2a78658ce1c9f13de4db19e1478bcea76c4cafdb271c68e298f0b0175b43f
lines: 96
kind: source
package: p03-integrations
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/yanhu/yanhu-thinking-log.ts

## 1. 结论与边界

砚小龙·思考链落盘（文件头 `:1-12`，append-only JSONL）：单独落文件而非塞会话存储的三条理由——单轮可达数万字符、追加式无竞态不受记忆裁剪影响、一行一轮便于 grep 排查。输出 `~/.cdutai/yanhu-thinking.jsonl`（开发版 `~/.cdutai-dev/`）；每行 `{at, messageId, userText, reasoning, tools[]}`，tools 是当轮工具时间线（标签+状态+已瘦身结果）。

不做的事：不读回放（无读取 API）；不改会话存储。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `MAX_THINKING_REASONING_CHARS` | const | `:19` | 200_000（单轮思考正文上限） |
| `MAX_THINKING_TOOL_RESULT_CHARS` | const | `:21` | 400（单条工具结果上限） |
| `YanhuThinkingToolStep` | interface | `:24-28` | `{label; status; result}` |
| `YanhuThinkingRecord` | interface | `:31-37` | `{at; messageId; userText; reasoning; tools[]}` |
| `getYanhuThinkingLogPath` | function | `:40-42` | `join(getConfigDir(), 'yanhu-thinking.jsonl')` |
| `buildYanhuThinkingRecord` | function | `:56-75` | 纯组装（tools 多余字段丢弃，结构与实现解耦，`:53-54`） |
| `serializeYanhuThinkingRecord` | function | `:78-80` | 恰一行 JSON + `\n` |
| `appendYanhuThinkingRecord` | function | `:87-96` | 异步追加；失败仅 `console.warn` 绝不影响对话 |

内部：`clipText`（`:45-48`，超限截断并附“…[已截断：原始 N 字符，超出上限 L]”标记——**绝不静默丢内容**）。

## 3. 内部逻辑与关键流程

- `buildYanhuThinkingRecord`：tools 映射三字段、`result` 非字符串转 `String(?? '')`；`reasoning`/`result` 分别按 200k/400 截断；`at` 默认 `Date.now()`。
- `serializeYanhuThinkingRecord`：`JSON.stringify`+`\n`（单行契约）。
- `appendYanhuThinkingRecord`：`appendFile(..., 'utf8')`；try-catch → warn（`:91-95`）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（排除测试）：砚小龙对话主链（每轮思考后追加）；直接测试：无（本批未含 thinking-log 测试；纯函数注释表明可单测）。出向：`node:fs/promises.appendFile`、`config-paths.getConfigDir`。

## 5. 数据 I/O、读写与副作用

**append-only 写** `~/.cdutai/yanhu-thinking.jsonl`；失败 `console.warn`。无读/网络。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 超限文本 | `:45-48` | 截断+明确计数标记 |
| 追加失败 | `:93-95` | warn、不影响对话 |
| 取消/恢复 | 无 | 异步追加无 AbortSignal |

## 7. 权限与权威状态

无权限分支；诚实边界：截断显式标记不静默丢；append-only 天然无竞态（文件头）。

## 8. 修改影响面

改记录结构/上限 → 影响排查时间线与磁盘占用；`getConfigDir` 联动 config-paths。

## 9. 测试证据

本轮 `NOT_RUN`。本批无直接测试文件（纯函数注释自述可单测）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| append-only JSONL 单行契约 | 已证实 | `:78-80` |
| 截断显式标记 | 已证实 | `:45-48` |
| 失败不影响对话 | 已证实 | `:85/:91-95` |
| tools 三字段解耦 | 已证实 | `:53-54/:63-67` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 两上限/两接口 | 2 | `:19-37` | covered |
| `getYanhuThinkingLogPath`/`clipText` | 2/3 | `:40-48` | covered |
| build/serialize/append | 3 | `:56-96` | covered |
