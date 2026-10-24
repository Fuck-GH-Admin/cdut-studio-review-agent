---
path: apps/electron/src/main/lib/study/statistical-semantic-chunker.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 26e2aabe426e58d6fd02e17b65efc2ab0d1e99aa
sha256: 4b837afeae14e159abb333fe1927547c0b8048ada9e26c9c80dcadf8918fc693
lines: 199
kind: source
package: p03-integrations
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/study/statistical-semantic-chunker.ts

## 1. 结论与边界

**统计语义分块**（`apps/electron/src/main/lib/study/statistical-semantic-chunker.ts`，199 行）：Jaccard 词面相似度 + 滑窗漂移检测切句边界，按章节骨架分块。参数带：`MIN_CHUNK_CHARS=800`/`MAX_CHUNK_CHARS=1500`/`DRIFT_K=0.6`/`WINDOW_RADIUS=2`（`:17-23`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `SemanticChunk` | interface | `:26-31` | 分块结果 |
| `chunkMarkdownSemantically` | 函数 | `:180-199` | `(markdown) => SemanticChunk[]` 唯一逻辑导出 |

内部：`tokenize`（`:33-44`，词集合）、`jaccard`（`:45-52`）、`splitSentences`（`:53-69`）、`isHeadingLine`（`:70-77`）、`splitBySkeleton`（`:78-112`，标题骨架切章）、`chunkSectionBody`（`:113-179`，漂移检测切块）。

## 3. 内部逻辑与关键流程

`chunkMarkdownSemantically`（`:180-199`）：`splitBySkeleton` 切章（`:78-112`）→ 逐章 `chunkSectionBody`（`:113-179`）：`splitSentences` 切句→相邻句 `jaccard` 相似度滑窗（`WINDOW_RADIUS=2`）→相似度低于 `DRIFT_K=0.6` 阈值处断块→按 `MIN/MAX_CHUNK_CHARS` 收拢。

## 4. 调用者与调用链

消费方：study 索引分块（备选策略）。出向：无（纯函数）。

## 5. 数据 I/O、读写与副作用

纯函数；无 I/O。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 语义漂移 | `:113-179` | 断块 |
| 块过短/过长 | `:17-19` | 收拢到 800-1500 带 |
| 标题行 | `:70-77` | 骨架边界 |

## 7. 权限与权威状态

无身份语义；参数带是分块质量契约。

## 8. 修改影响面

- `DRIFT_K`/窗口与分块质量耦合；Jaccard 词面（非语义向量）口径。

## 9. 测试证据

无专属测试（全树检索 `chunkMarkdownSemantically` 测试命中 0）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 个导出、漂移分块 | 已证实 | `:17-199` |
| 参数带语义 | 已证实 | `:17-23` |
| 分块质量效果 | 未知 | 未运行 |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `chunkMarkdownSemantically` | `:180-199` | covered |
| 骨架/漂移 | `:78-179` | covered |
| tokenize/jaccard | `:33-52` | covered |
