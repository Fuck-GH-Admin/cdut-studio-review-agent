---
path: apps/electron/src/main/lib/cslab/cslab-manuscript.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 647c398fc554bb054cf75688c1532f7098cfdc7c
sha256: 7a2392d3de0122f1f8e44608ae7f176b75e1dec53c51be1753ed5e8737b5a103
lines: 190
kind: test
package: p03-integrations
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-manuscript.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

CSLab 文稿 Word 路径分离与导入结构（`:1-3`）：首次导出建立 linked 副本；已存在 linked 时再导出写独立 `.export.docx` 且不覆盖原件；同步写回只作用于 linked 副本；结构化导入保留标题/加粗/胶囊位置/换行；保存文稿持久化 JSON+Markdown；另存为 Markdown 与 Word。

## 2. 用例清单

共 6 个 `test(`（`apps/electron/src/main/lib/cslab/cslab-manuscript.test.ts:46,55,70,79,119,146`；describe `:45` 3 个、`:78` 1 个、`:118` 2 个）。夹具：真实实验室+`createManuscript`（`:16-23`）；afterAll 解锁 docx/关库。

| # | 用例（行） | 真实断言 |
| --- | --- | --- |
| 1 | 首次导出建 linked（`:46`） | `writeExportDocx(Buffer 'FIRST-EXPORT')`：`createdLink` `true`、`linkedPath` truthy、`getLinkedDocxPath` `===result.linkedPath`；文件内容 `'FIRST-EXPORT'` |
| 2 | 再导出不覆盖原件（`:55`） | linked 内容仍 `'FIRST-EXPORT'`；`second.createdLink===false`、`second.path.endsWith('.export.docx')`、`not.toBe(linkedPath)`；linked `'FIRST-EXPORT'`、export `'SECOND-EXPORT'` |
| 3 | 同步只写 linked（`:70`） | `writeLinkedDocx('SYNCED')` 后 linked 内容 `'SYNCED'` |
| 4 | 结构化导入（`:79`） | `blocksToDocJson`：heading level 2；文本节点 `toMatchObject({type:'text',text:'转化率 ',marks:[{type:'bold'}]})`；胶囊节点 `{capsuleId:'cap-1',value:'80',status:'orphan'}`；含 `hardBreak` |
| 5 | 保存持久化（`:119`） | `saved.title` `'论文总标题'`、`saved.docJson` `toEqual(sampleDoc)`；`getManuscript` 重载 title/docJson 一致 |
| 6 | 另存 md/docx（`:146`） | md：`success===true`、`format==='md'`、文件含 `'MD段落内容'`；docx：`success===true`、`format==='docx'`、`existsSync` |

## 3. 真实断言

逐条见上表（`:49-52,59-67,74,99-114,137-143,166-188`）。mock 边界：无 mock；真实文件写读（字节级 `'FIRST-EXPORT'` 等比对）+真实 `runOoxmlTask` docx 导出。

## 4. 未覆盖与脆弱点

未覆盖：`文稿不存在`/`另存为目标路径无效` 抛错、`tipTapToMarkdown` 全分支、Word 占用（EBUSY）报错、胶囊 binds 边重建、docx 导入（`importDocx` 归 ooxml.test）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 个用例 | 已证实 | `grep test(`；`:46-189` |
| linked/export 分离不覆盖 | 已证实 | `:49-67` |
| 导入 marks/胶囊/hardBreak | 已证实 | `:99-114` |
| 持久化/另存双格式 | 已证实 | `:137-188` |
| 拒绝分支 | 未知 | 未覆盖 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 路径分离 | 1-3 | 46-76 | covered |
| 结构化导入 | 4 | 79-116 | covered |
| 保存 | 5 | 119-145 | covered |
| 另存 | 6 | 146-189 | covered |
| 拒绝分支 | 无 | — | unknown |
