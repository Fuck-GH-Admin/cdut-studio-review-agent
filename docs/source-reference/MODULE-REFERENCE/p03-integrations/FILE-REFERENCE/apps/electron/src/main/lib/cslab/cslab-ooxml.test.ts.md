---
path: apps/electron/src/main/lib/cslab/cslab-ooxml.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3e615156b70e76f9cb39c3c6caeeac9f145db3bf
sha256: ec3e01c1bd82d62ec42787d3405709828bfa9ba8e3edabfad0be3b80e1438b29
lines: 200
kind: test
package: p03-integrations
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-ooxml.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

CSLab Word OOXML 无损引擎测试（`:1-3`）：①导出骨架合法（部件齐全/sdt 数据绑定/格式/rels 分布）；②外科手术同步只改 customXml、document.xml 解压字节完全一致；③新增/删除/缺失绑定统计、非 item1 部件更新、缺 customXml 明确报错；④导入保留胶囊位置不重复文本、未引用胶囊进 orphan 段落。

## 2. 用例清单

共 7 个 `test(`（`apps/electron/src/main/lib/cslab/cslab-ooxml.test.ts:71,102,123,139,154,163,185`；describe `:70` 1 个、`:101` 4 个、`:162` 2 个）。夹具：`CAPSULE`/`EXPORT_INPUT`（TipTap 含 bold+scienceCapsule，`:14-55`）；`buildMinimalDocx`（JSZip 手工组包，`:57-68`）。

| # | 用例（行） | 真实断言 |
| --- | --- | --- |
| 1 | 导出骨架（`:71`） | 7 个 zip 部件 `toBeTruthy`（Content_Types/.rels/document/document.rels/customXml item1+rels+itemProps）；document.xml 含 `<w:sdt>`/`<w:dataBinding`/`'urn:cdut:science:capsules'`/`<w:b/>`/`'转化率'`；rootRels `not.toContain('customXml')`、documentRels 含之；`inspectDocx`：`capsuleIds:['cap-1']`、`hasDataBinding===true` |
| 2 | 字节级无损（`:102`） | sync 后 `updatedCapsuleIds:['cap-1']`、`documentXmlUnchanged===true`、added/removed/missing 均 `[]`；`Buffer.from(after).equals(before)` `true`；customXml 含 `'80.0'` 不含 `'72.5'` |
| 3 | 增删统计（`:123`） | 加 cap-2：`added:['cap-2']`、`updated:['cap-1']`、`missing:['cap-2']`；再移除 cap-1：`removed:['cap-1']`、`missing:['cap-2']` |
| 4 | 非 item1 部件（`:139`） | `customXml/item2.xml` 更新含 `'9.9'`、`updated:['cap-1']` |
| 5 | 缺 customXml 明确报错（`:154`） | `rejects.toThrow('CSLab customXml')`（非静默写入） |
| 6 | 胶囊位置+不重复（`:163`） | capsules `cap-1/72.5`、`unreferencedCapsuleIds:[]`；段落 inlines kinds `['text','capsule','text']`；sdt 内部值不重复——text 拼接 `'转化率  达到峰值。'`（`:178` 注释） |
| 7 | orphan 段落（`:185`） | `unreferencedCapsuleIds:['cap-orphan']`；末块含 capsule inline `cap-orphan` |

## 3. 真实断言

逐条见上表（`:75-97,108-120,130-136,150-151,158,167-182,196-198`）。mock 边界：无 mock；JSZip 手工构造 docx+真实引擎（export/sync/import/inspect 全真实实现）。

## 4. 未覆盖与脆弱点

未覆盖：`assertCommentsParts` 三件套抛错、修订（ins/del）导入/导出、`word/comments.xml` 损坏容错、Worker 路径（`runOoxmlTask`/超时）、`suggestionIdToWordId`。用例 4/7 的 document.xml 为手工最小 XML。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 个用例 | 已证实 | `grep test(`；`:71-199` |
| 骨架/绑定合法 | 已证实 | `:75-97` |
| 字节级无损 | 已证实 | `:108-120` |
| 统计/非 item1/明确报错 | 已证实 | `:130-158` |
| 导入位置/orphan | 已证实 | `:167-198` |
| 批注/修订/Worker | 未知 | 未覆盖 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 导出骨架 | 1 | 71-99 | covered |
| 同步无损 | 2 | 102-121 | covered |
| 增删/部件/报错 | 3-5 | 123-159 | covered |
| 导入/orphan | 6,7 | 163-199 | covered |
| 批注/修订/Worker | 无 | — | unknown |
