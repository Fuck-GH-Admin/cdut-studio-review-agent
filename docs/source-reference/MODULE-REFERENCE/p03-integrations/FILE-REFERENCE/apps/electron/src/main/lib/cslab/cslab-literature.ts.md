---
path: apps/electron/src/main/lib/cslab/cslab-literature.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: db7d692f50d78bb548400ee880139d5ffe137588
sha256: f74f5743f274731cd043f76b1dcdff739eb0cae0ca603f1cd323168ff1e16dcf
lines: 235
kind: source
package: p03-integrations
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-literature.ts

## 1. 结论与边界

CSLab 文献资产统一读取层（文件头 `apps/electron/src/main/lib/cslab/cslab-literature.ts:1-10`）：①`entities(layer_type='lit')` 与 `literature_sources` 合并为渲染进程文献模型；②解析 vault 相对路径与 Zotero 零拷贝绝对路径；③输出 Zotero 批注（坐标 JSON 解析供 PDF 图层）。**红线：外部绝对路径必须来自已登记的 `literature_sources`，绝不接受渲染进程任意路径。**

## 2. 导出与关键符号

`export` 逐条核对：2 个接口 + 10 个函数 = 12 个导出（类/常量 0）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `getLiteratureFilePathFromSource` | 函数（导出） | 96-113 | 从已登记记录解析真实路径（**不做 IPC 暴露**，`:95`）；relPath 走 `resolveLabRelativePath`，absPath 直取，均 `existsSync` |
| `listLiterature` | 函数（导出） | 116-126 | 全部文献按 `updatedAt` 倒序 |
| `getLiteratureItem` | 函数（导出） | 128-137 | 单条（labId 双检 `:135`） |
| `getLiteratureSourceRecord` | 函数（导出） | 139-145 | 原始记录 |
| `LiteratureFilePathResult` | 接口（导出） | 147-150 | `{path?,reason?}` |
| `getLiteratureFilePath` | 函数（导出） | 153-166 | 带可读原因（未登记/Zotero 无附件/文件移动） |
| `LiteratureAnnotationItem` | 接口（导出） | 168-171 | 批注+已解析 position |
| `listLiteratureAnnotations` | 函数（导出） | 174-201 | 按 sortIndex（position 解析失败跳过 `:182-183`） |
| `upsertLiteratureRecord` | 函数（导出） | 204-209 | Zotero 同步与 vault 导入共用 |
| `readLiteratureBuffer` | 函数（导出） | 212-222 | PDF 字节（默认 ≤128MB，供文本索引/GraphRAG） |
| `literatureEntityExists`/`listLiteratureEntities` | 函数（导出） | 225-235 | 实体存在性/列表（GraphRAG） |
| `labDb`/`parseMetadata`/`toStringArray`/`toLiteratureItem` | 内部 | 46-93 | `central_meta.sqlite`；metadata JSON 容错解析；字符串数组过滤；合并模型（非 lit 实体→null） |

## 3. 内部逻辑与关键流程

- 合并（`toLiteratureItem`，`:65-93`）：`getEntityByUri` 须 `layerType==='lit'` 否则 null；metadata 解析（坏 JSON→`{}`，`:50-58`）；`annotationCount`/`hasFile` 派生。
- 路径红线（`:95-113`）：relPath 经 `resolveLabRelativePath`（lab 内）；absPath 仅来自已登记记录；均验证存在。
- 批注（`:174-201`）：`parseZoteroAnnotationPosition` 失败即跳过该条（坐标不可用不输出）。

## 4. 调用者与调用链

入向：文献 IPC/渲染进程（列表/详情/批注/路径）+ GraphRAG/文本索引（`readLiteratureBuffer`/`listLiteratureEntities`）；测试：本批**无专属测试**（scope 无 `.test.ts`）。出向：`node:fs/path`、`@profer/shared`（类型+`countAnnotationsForItem` 等经 `./cslab-db.ts:19-29`）、`./cslab-paths.ts:30`、`./cslab-zotero-format.ts:31-34`。

## 5. 数据 I/O、读写与副作用

读：`central_meta.sqlite`（entities/sources/annotations）+ 文献文件（`existsSync/stat/readFile`）；写：`upsertLiteratureRecord`。无副作用。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| 非 lit 实体 | null/过滤 | 71,227,232-234 |
| metadata 坏 JSON | `{}` 容错 | 50-58 |
| 文件缺失/移动 | `{reason:'文献文件不存在或已移动，请重新同步 Zotero'}` | 163-164 |
| Zotero 无附件 | `{reason:'该 Zotero 条目没有可用的 PDF 附件'}` | 160-162 |
| 未登记 | `{reason:'文献未登记或不属于当前实验室'}` | 159 |
| 超 128MB | `null` | 220 |
| 坐标解析失败 | 跳过该批注 | 182-183 |

## 7. 权限与权威状态

- 红线权威：absPath 仅来自已登记 `literature_sources`（`:9,95-113`）——渲染进程零任意路径。
- labId 双检（item/record 路径）。

## 8. 修改影响面

改路径红线影响安全；改合并模型影响文献 UI；影响 GraphRAG 索引。

## 9. 测试证据

本批**无专属测试**（scope 事实）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| absPath 仅已登记来源 | 已证实 | `:9,95-113` |
| metadata 容错 | 已证实 | `:50-58` |
| 原因可读三分支 | 已证实 | `:159-164` |
| 坐标失败跳过 | 已证实 | `:182-183` |
| Zotero 同步行为 | 未知 | 文件外 |
| 测试覆盖 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 合并/路径 | §2,§3 | 46-166 | covered |
| 批注 | §3 | 168-201 | covered |
| 写入/字节/实体 | §2 | 204-235 | covered |
| 断言 | §9,§10 | — | unknown |
