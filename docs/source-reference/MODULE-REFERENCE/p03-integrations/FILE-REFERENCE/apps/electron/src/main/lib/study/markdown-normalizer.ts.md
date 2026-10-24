---
path: apps/electron/src/main/lib/study/markdown-normalizer.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 334fa0eff9c7def2d20e0527aec7174668b3b84d
sha256: c61413641e06bdfbc5457f7f9ecb100fac970f287d0007aa86d297f968934a56
lines: 138
kind: source
package: p03-integrations
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/study/markdown-normalizer.ts

## 1. 结论与边界

**Markdown 归一化**（`apps/electron/src/main/lib/study/markdown-normalizer.ts`，138 行）：把 OCR/导入的粗糙文本转规范 Markdown——控制字符清除、中英标题识别（`第X章`/多级数字/单级数字）、表格列归一。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `normalizeToMarkdown` | 函数 | `:112-138` | `(input: string) => string` 唯一导出 |

内部：`CONTROL_CHARS`（`:15`，全量 C0 除 \t\n）、`CN_HEADING`（`:18`，`第X章节讲篇部`）、`MULTI_NUM_HEADING`（`:20`，`1.2.3` 多级数字，负向前瞻防日期/数量）、`SINGLE_NUM_HEADING`（`:27`，单级数字+长尾）、`isMarkdownHeading`（`:30-34`）、`splitColumns`（`:35-47`）、`normalizeTables`（`:48-80`）、`normalizeHeadings`（`:81-111`）。

## 3. 内部逻辑与关键流程

`normalizeToMarkdown`（`:112-138`）：清 `CONTROL_CHARS` → 按行 `normalizeHeadings`（三个正则识别标题→`#` 语法）→ `normalizeTables`（`splitColumns` 切列对齐）→ 拼接。正则负向前瞻（`:20`、`:27`）避免把日期/数量误判为标题。

## 4. 调用者与调用链

消费方：study 文档索引（`study-document-indexer`）导入链。出向：无（纯函数）。

## 5. 数据 I/O、读写与副作用

纯函数；无 I/O。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 已是 Markdown 标题 | `:30-34` | 保留 |
| 日期/数量误判防护 | `:20`、`:27` | 负向前瞻跳过 |
| 表格列不齐 | `:48-80` | 归一对齐 |

## 7. 权限与权威状态

无身份语义；归一口径影响检索分块质量。

## 8. 修改影响面

- 三个标题正则与中文排版耦合；误判会破坏大纲。
- `CONTROL_CHARS` 范围改动影响脏数据清洗。

## 9. 测试证据

无专属测试（`study-document-indexer.test` 间接）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 个导出、三正则/表格归一 | 已证实 | `:15-138` |
| 误判防护（负向前瞻） | 已证实 | `:20`、`:27` |
| 实际归一效果 | 未知 | 未运行 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `normalizeToMarkdown` | `:112-138` | covered |
| 标题识别 | `:18-111` | covered |
| 表格归一 | `:35-80` | covered |
