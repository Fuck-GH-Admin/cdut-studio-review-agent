---
path: apps/electron/src/main/lib/cslab/cslab-literature.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: cf84ff0771688c5dae739fdc491a0635d53e73b1
sha256: bb9866499794e345e9fb19ed83cf546cf446ba034b51d7826e7dd44125ee3908
lines: 85
kind: test
package: p03-integrations
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# apps/electron/src/main/lib/cslab/cslab-literature.test.ts

## 1. 测试目标

PDF 直接导入为文献、路径解析与幂等复用测试（`apps/electron/src/main/lib/cslab/cslab-literature.test.ts:1-3`）。被测 `ingestFiles`（PDF→lit 分支）、`cslab-literature` 的 `getLiteratureItem`/`getLiteratureFilePath`。夹具：tmpdir+`PROFER_CONFIG_DIR`+createLab；合成 `%PDF-1.4` 文件；afterAll 解锁 vault/lit 清理。注：本批内 iron-cage 为被测主对象（cslab-literature 模块在批外）。

## 2. 用例清单

共 **3 个 `test(`**（1 个 `describe`）：

| # | 行 | 用例 | 断言要点 | 依赖顺序 |
| --- | --- | --- | --- | --- |
| 1 | 36-62 | PDF 入 vault/lit+锁+不生成表 | status ok、layerType 'lit'、format 'pdf'、tableUri undefined、item.source 'vault'/hasFile true、resolved.path 真+只读 true、assetPath 与 resolved.path 一致 | 独立 |
| 2 | 64-75 | 相同 PDF 复用既有文献 URI | 二次导入 uri 等于导入前 lit 资产 uri、lit 计数不变 | **依赖用例 1** |
| 3 | 77-83 | 未登记文献返回可读原因 | path undefined、reason 含 '未登记' | 独立 |

## 3. 真实断言

逐条见 §2（关键锚）：`:44-60` 10 断言（含 `toBe(resolved.path ?? null)` 双路一致）；`:71-74`；`:80-81`。

## 4. 未覆盖与脆弱点

- 文献元数据编辑/zotero 链不在本文件。
- 用例 2 依赖 1（顺序敏感）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 test、lit 分支+幂等+失败原因 | 已证实 | 全文 |
| PDF 不生成数据表 | 已证实 | `:48` |
| 路径双路一致 | 已证实 | `:60` |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| PDF→lit 摄取 | §2/§3 | 1 | covered |
| SHA 幂等 | §2/§3 | 2 | covered |
| 未登记原因 | §2/§3 | 3 | covered |
