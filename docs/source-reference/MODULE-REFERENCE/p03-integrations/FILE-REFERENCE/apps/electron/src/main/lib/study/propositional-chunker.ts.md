---
path: apps/electron/src/main/lib/study/propositional-chunker.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1f6392e8a476e3e9063d67455935b8adf9f33430
sha256: 8fd87f8b1a9d43a3892dd6f3eb2deec159e897fa74c13aafa740cbfb3971f239
lines: 198
kind: source
package: p03-integrations
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/study/propositional-chunker.ts

## 1. 结论与边界

**命题级分块**（`apps/electron/src/main/lib/study/propositional-chunker.ts`，198 行）：Markdown 按章节→句子（命题）→聚合→短块合并，数学块占位保护不被切断。尺寸带：`MIN_CHUNK_CHARS=300`/`TARGET_MAX_CHARS=1200`/`HARD_MAX_CHARS=1600`（`:22-26`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `PropositionalChunk` | interface | `:32-40` | 分块结果（含面包屑等） |
| `chunkByPropositions` | 函数 | `:170-198` | `(markdown) => PropositionalChunk[]` 唯一逻辑导出 |

内部：`fnv1aHex`（`:41-50`，块 ID 哈希）、`protectMath`/`restoreMath`/`collectMathBlocks`（`:51-79`，`__MATH_BLOCK_n__` 占位）、`buildBreadcrumb`（`:80-85`）、`Section`/`splitSections`（`:86-119`）、`splitPropositions`（`:120-128`）、`aggregatePropositions`（`:129-147`）、`mergeShortBlocks`（`:148-169`）。

## 3. 内部逻辑与关键流程

`chunkByPropositions`（`:170-198`）：

1. `protectMath`：数学块→占位符（`:51-62`）。
2. `splitSections`（`:92-119`）：按标题层级切章节（层级栈→`buildBreadcrumb` 面包屑）。
3. `splitPropositions`（`:120-128`）：正文切句子（命题）。
4. `aggregatePropositions`（`:129-147`）：按目标尺寸聚合。
5. `mergeShortBlocks`（`:148-169`）：< `MIN_CHUNK_CHARS` 并入相邻（除非超 `HARD_MAX`）。
6. `restoreMath` 还原数学块；每块 `fnv1aHex` 生成 ID。

## 4. 调用者与调用链

消费方：study 文档索引分块。出向：无（纯函数）。

## 5. 数据 I/O、读写与副作用

纯函数；无 I/O。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 数学块 | `:51-79` | 占位保护后还原 |
| 过短块 | `:148-169` | 并入相邻（保 HARD_MAX） |
| 章节嵌套 | `:86-119` | 层级栈面包屑 |

## 7. 权限与权威状态

无身份语义；尺寸带（300/1200/1600）是检索质量契约。

## 8. 修改影响面

- 尺寸带与检索效果耦合；数学占位符格式 `__MATH_BLOCK_n__` 与 restore 对偶。

## 9. 测试证据

`propositional-chunker.test.ts`（68 行）直接覆盖（见该测试手册）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 个导出、分块链 | 已证实 | `:22-198` |
| 数学块保护/短块合并 | 已证实 | `:51-79`、`:148-169` |
| 检索质量效果 | 未知 | 未运行 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `chunkByPropositions` | `:170-198` | covered |
| 章节/命题/聚合 | `:86-147` | covered |
| 数学保护 | `:41-79` | covered |
