---
path: apps/electron/src/main/lib/cslab/cslab-track-changes.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: dc92ca7ef47ec52feb066345784f3f71f6c99c42
sha256: 7ae62a564ad5d9c6469df8b4ac675e2d4550089a53d1486e21ed0dddb50c3c71
lines: 288
kind: test
package: p03-integrations
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-track-changes.test.ts

## 1. 测试目标

CSLab Track Changes 与 OOXML 双向转换（`:2`）：`suggestionIdToWordId` 稳定映射、导出 w:ins/w:del/comments 三件套、导入回读结构化 inline、跨块切片计划（`planSuggestionApplication` 来自 `@profer/shared`）。被测主体 `cslab-ooxml` **不在本批**（跨文件）；切片计划属 shared。

## 2. 用例清单

4 个 describe + **10 个 `test()`**：

| describe | 用例 | 行 |
| --- | --- | --- |
| suggestion id 稳定映射（1） | 同串稳定/正整数/异串不同 | `:86-92` |
| OOXML 导出（4） | 三件套+作者/删除不入普通 w:t、同 suggestion 共享 id、无评论不生成 parts、assertCommentsParts 缺项抛错 | `:96-206` |
| OOXML 导入（2） | ins/del/commentRange 转 inline、往返文本稳定 | `:210-245` |
| 跨块切片计划（3） | 单块命中/跨块两段/歧义与未命中显式失败 | `:254-287` |

夹具：`TRACKED_DOC`（del+ins+comment 三标记 `:18-73`）、`loadParts`（JSZip 解包 `:75-83`）。

## 3. 真实断言

- `:88-91` id 稳定/正整数/异串异值。
- `:105-126` `document.xml` 含 `<w:ins `/`w:author="方法论审稿人"`/`<w:del `/`<w:delText …>原始结论`；**`not.toContain('<w:t …>原始结论</w:t>')`**（删除内容不入普通文本）；commentRange 三件；comments.xml 文本/作者；rels 与 Content_Types 注册。
- `:155-157` 两段 `<w:ins w:id>` id 相同（共享）。
- `:170-171` 无评论 → 无 `word/comments.xml`、Content_Types 无注册。
- `:175-205` assertCommentsParts 三缺项各 `toThrow`、完整不抛。
- `:222-231` 回读：deletion/insertion track.kind 与 author、comment 文本含 'Nature'、author '文献专家'。
- `:242-244` 往返后三段文本仍在。
- `:258-260` 单块 slices 1 段 from/to 精确；`:267-269` 跨块 2 段+第二段 from=10；`:277-286` `quote-ambiguous`/`quote-not-found`/`quote-empty` 三显式失败码。

## 4. 未覆盖与脆弱点

未覆盖：Worker 线程封装（cslab-track-changes 两函数）、真实 Word 打开兼容。断言含精确 XML 片段（引擎格式变更会碎——正是契约锁定目的）。**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 10 用例断言如 §3 | 已证实 | 逐行读 `:1-288` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| id 映射/导出/导入 | 7 | covered |
| 跨块切片计划 | 3 | covered |
| Worker 封装 | — | unknown |
