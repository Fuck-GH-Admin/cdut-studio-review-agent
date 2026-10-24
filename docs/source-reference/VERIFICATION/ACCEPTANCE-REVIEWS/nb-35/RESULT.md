# nb-35 独立复核（docs-r07-qa-nb-05，MiMo/max，team author-nb-05 第 3 批）

**对象**：`packages/core/src/pdf-engine`（12 文件）+ `packages/core/src/providers`（6 文件）= 18 文件/2734 行 + 18 手册/1474 行｜**冻结** `05fb2565e2…37c2`｜sealId `seal-0f98ffbfa8c54312`（seal v2，ZIP 21 条目）

## 结论

**G0/G1/G2 PASS → batchVerdict = accepted（18 accepted / 0 revision_required / 0 unknown）**，5 条非阻断 minor（N-04~N-08，句首计数笔误，同句/§11 已为正确值）。18 篇可按 exact hash 合入。

## 核验摘要

- **G0**：READY/DONE/MANIFEST/ZIP 交叉一致、18 manualHashes=磁盘、ZIP 0 穿越/符号链接/mismatch、18/18 源绑定==SCOPE==MANIFEST、非返修批。
- **G2（全文件）**：QA 全量逐行读毕 18 源+18 手册（与预读 `reviews/nb-35/SOURCE-CHECKLIST.md` 逐条互核）；行为结论全部回源属实——管道 8 步与全部阈值、TrapDoc 5 熔断（含"检查 1/3 现状不可触发"这一关键限定）、`maxPages` 截断 vs `pageCount` 语义、OCR/ONNX **预留未接线**（全树 grep 否定结论成立）、`enableOcrBridge` 无消费者、markdown 双轨输出、注册表 18/23 缺 5 值、显式状态码压制文本兜底、`language?` 从不传、ort 属性注入 hack 等；native-segmenter（3 处）与 max-regret-router（2 处）注释≠实现**作者已全部主动照实记录**（与 QA 预读独立发现一致）。
- **测试边界**：in-scope 4 测试文件 28 用例断言逐条核；域外 `__tests__` 5 文件只记名不冒充；NOT_RUN。
- **QA 自纠**：预读清单对非主流节点 `readingOrderIndex` 误记"保留初值 0"，正确为"保留 enrich 所赋负值"（手册 pdf-engine.ts.md §5 正确）。

## Findings（均 minor，判定口径见 RESULT.json notes：F=作业性错误结论且重复；N=句首笔误+同句/§11 正确）

| id | 文件 | 摘要 |
| --- | --- | --- |
| N-04 | trapdoc-guard.ts.md | "3 个导出"→4（同句"合计 4 个"、§11 正确） |
| N-05 | source-preserving-aligner.ts.md | "5 个导出"→6（同句"共 6 个"、§11 正确） |
| N-06 | table-decomposer.ts.md | "8 个内部函数"→9（表格 9 行；§11"9 内部"） |
| N-07 | ocr-bridge.ts.md | "5 个导出"→6（同句"=6 个导出对象"） |
| N-08 | document-serializer.ts.md | "4 个导出"→6（同句"共 6 个导出对象"） |

## 绑定

acceptedHashes = 18 篇 exact sha256（RESULT.json/REVIEWED-HASHES.json；SOURCE-EVIDENCE 与 READY.manualHashes 全一致）。本轮 NOT_RUN；未改源码/作者正文/candidate/全局账。
