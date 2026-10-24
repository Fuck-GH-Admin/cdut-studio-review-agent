---
path: apps/electron/src/renderer/components/knowledge-base/knowledge-base-workbench-utils.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: df143b1fe1108602375304d1ab241d1e7abe0f7c
sha256: 41ba5e79c127ebd18accbba1e109709db47b8b0a4a27600b55050dae8ef92929
lines: 26
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/components/knowledge-base/knowledge-base-workbench-utils.ts

## 1. 结论与边界

知识库工作台的薄访问/过滤排序工具（渲染层，纯函数）：`KnowledgeItem` 的取值包装 + 关键词过滤与排序（`knowledge-base-workbench-utils.ts:1-26`）。类型别名 `LibraryItem`/`LibrarySort`/`DisplayLibraryItem` 均等价 `KnowledgeItem`（`:3-5`）。

边界：不拉数据/不渲染；搜索语义为本地子串匹配（无索引）。

## 2. 导出与关键符号

`export` 逐条核对：3 类型 + 6 函数 = 9 个导出。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `LibraryItem` | 类型（导出） | 3 | `= KnowledgeItem` | |
| `LibrarySort` | 类型（导出） | 4 | `'recent' \| 'title'` | |
| `DisplayLibraryItem` | 类型（导出） | 5 | `= KnowledgeItem` | |
| `getItemOrigin` | 函数（导出） | 7 | `(item) => 'local' \| 'arxiv'` | `item.origin` |
| `getItemKind` | 函数（导出） | 8 | `(item) => string` | `item.kind` |
| `getItemAuthors` | 函数（导出） | 9 | `(item) => string[]` | `item.research?.authors \|\| []` |
| `getItemSummary` | 函数（导出） | 10 | `(item) => string` | `item.research?.abstract \|\| ''` |
| `toDisplayItems` | 函数（导出） | 12-14 | `(items) => DisplayLibraryItem[]` | 恒等（透传） |
| `filterAndSortItems` | 函数（导出） | 16-26 | `(items, {query, sort}) => DisplayLibraryItem[]` | 过滤+排序 |

## 3. 内部逻辑与关键流程

`filterAndSortItems`（`:16-26`）：query trim+toLowerCase；过滤域=title+authors 空格拼接+summary+tags 空格拼接+kind（`.join(' ')` 后 includes，`:20`）；排序 title→`localeCompare(…, 'zh-CN')`、recent→`importedAt` 倒序（`:22-25`）。其余函数为单行取值（`:7-14`）。

## 4. 调用者与调用链

入向（全树检索，证实）：**仅 `getItemKind` 被 `KnowledgeReferencePicker.tsx:5,44` 导入使用**。其余 8 个导出（`LibraryItem`/`LibrarySort`/`DisplayLibraryItem`/`getItemOrigin`/`getItemAuthors`/`getItemSummary`/`toDisplayItems`/`filterAndSortItems`）**全树 0 消费**（名字/导入形式检索）。

出向：`@profer/shared` `KnowledgeItem`（`:1`）。无其它依赖。

## 5. 数据 I/O、读写与副作用

纯函数：无 I/O、无状态、无副作用（依据：全文读）。`toDisplayItems` 恒等返回（`:12-14`）。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 |
| --- | --- | --- |
| 空 query 全过 | normalizedQuery 空 | 19 |
| 研究字段缺省 | research 缺失 | 9-10 |
| 双排序 | sort 值 | 22-25 |

无异常/取消/恢复概念，依据：纯函数。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查；数据权威=`KnowledgeItem` 形状（shared 类型）。

## 8. 修改影响面

- 唯一实际消费 `getItemKind`（KnowledgeReferencePicker，其本身无调用方）；其余导出无消费者——改动影响面当前为零（推断：工作台重构遗留 API）。
- 需同步的测试：无（0 test）。

## 9. 测试证据

直接测试：**无**（全树测试检索 `knowledge-base-workbench-utils` 及各函数名 0 命中）。间接证据：无。

NOT_RUN：本轮未运行任何测试/typecheck/构建。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 9 导出 + 过滤排序语义 | 已证实 | `:1-26` 逐行读 |
| 仅 getItemKind 有消费 | 已证实 | 全树检索（§4 范围） |
| 其余 8 导出零消费 | 已证实 | 同上 |
| 工作台遗留 API 定性 | 推断 | 无调用史证据 |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 类型 + 6 函数 | §2 | 1-26 | covered |
| `filterAndSortItems` 语义 | §3 | 16-26 | covered |
| 消费面（1/9） | §4 | - | covered |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |
